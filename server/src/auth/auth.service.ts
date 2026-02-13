import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '@prisma/client';

export type AuthUser = User;

@Injectable()
export class AuthService {
  private static readonly NICKNAME_REGEX = /^[A-Za-z0-9]+$/;
  private static readonly MAP_KEY_REGEX = /^([1-9]\d*)-([1-9]\d*)$/;
  private readonly googleClient: OAuth2Client;
  private readonly googleClientId: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.googleClientId = this.config.get<string>('GOOGLE_CLIENT_ID', '');
    this.googleClient = new OAuth2Client(this.googleClientId || undefined);
  }

  async verifyGoogleToken(credential: string): Promise<TokenPayload> {
    if (!credential) {
      throw new UnauthorizedException('Missing Google credential');
    }
    if (!this.googleClientId) {
      throw new UnauthorizedException('Google client id not configured');
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken: credential,
      audience: this.googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new UnauthorizedException('Invalid Google token');
    }

    return payload;
  }

  async upsertUser(payload: TokenPayload): Promise<AuthUser> {
    const email = payload.email;
    if (!email) {
      throw new UnauthorizedException('Email not provided by Google');
    }
    const googleSub = payload.sub || '';
    if (!googleSub) {
      throw new UnauthorizedException('Google subject missing');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    const user = existingUser
      ? await this.prisma.user.update({
          where: { email },
          data: {
            googleSub,
            name: payload.name || undefined,
            picture: payload.picture || undefined,
          },
        })
      : await this.prisma.user.create({
          data: {
            email,
            googleSub,
            nickname: await this.generateUniqueGuestNickname(),
            name: payload.name || undefined,
            picture: payload.picture || undefined,
          },
        });

    return user;
  }

  validateNicknameOrThrow(rawNickname: unknown): string {
    if (typeof rawNickname !== 'string') {
      throw new BadRequestException('Nickname must be a string');
    }
    const nickname = rawNickname.trim();
    if (!nickname) {
      throw new BadRequestException('Nickname must not be empty');
    }
    if (!AuthService.NICKNAME_REGEX.test(nickname)) {
      throw new BadRequestException(
        'Nickname must contain only letters and numbers',
      );
    }
    return nickname;
  }

  async updateNicknameForUser(userId: string, rawNickname: unknown) {
    const nickname = this.validateNicknameOrThrow(rawNickname);

    const existingWithNickname = await this.prisma.user.findUnique({
      where: { nickname },
      select: { id: true },
    });
    if (existingWithNickname && existingWithNickname.id !== userId) {
      throw new ConflictException('Nickname is already taken');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { nickname },
    });
  }

  async syncInfiniteModesForUser(
    userId: string,
    rawCompletedMaps: unknown,
  ): Promise<string[]> {
    if (!Array.isArray(rawCompletedMaps)) {
      throw new BadRequestException('completedMaps must be an array');
    }

    const parsedPairs = rawCompletedMaps.map((value) =>
      this.parseMapKeyOrThrow(value),
    );
    const uniquePairs = new Map<string, { worldId: number; mapId: number }>();
    for (const pair of parsedPairs) {
      uniquePairs.set(`${pair.worldId}-${pair.mapId}`, pair);
    }

    if (uniquePairs.size > 0) {
      await this.prisma.infiniteModeUnlock.createMany({
        data: Array.from(uniquePairs.values()).map((pair) => ({
          userId,
          worldId: pair.worldId,
          mapId: pair.mapId,
        })),
        skipDuplicates: true,
      });
    }

    const fromDb = await this.prisma.infiniteModeUnlock.findMany({
      where: { userId },
      orderBy: [{ worldId: 'asc' }, { mapId: 'asc' }],
      select: {
        worldId: true,
        mapId: true,
      },
    });

    return fromDb.map((entry) => `${entry.worldId}-${entry.mapId}`);
  }

  private parseMapKeyOrThrow(value: unknown): { worldId: number; mapId: number } {
    if (typeof value !== 'string') {
      throw new BadRequestException(
        'Each completedMaps entry must be a string key like "1-2"',
      );
    }
    const match = value.match(AuthService.MAP_KEY_REGEX);
    if (!match) {
      throw new BadRequestException(
        `Invalid completedMaps entry "${value}", expected "worldId-mapId"`,
      );
    }

    const worldId = Number(match[1]);
    const mapId = Number(match[2]);
    return { worldId, mapId };
  }

  private async generateUniqueGuestNickname(): Promise<string> {
    const maxAttempts = 20;
    for (let i = 0; i < maxAttempts; i += 1) {
      const randomNumber = Math.floor(Math.random() * 1_000_000);
      const nickname = `Guest${randomNumber}`;
      const existing = await this.prisma.user.findUnique({
        where: { nickname },
        select: { id: true },
      });
      if (!existing) {
        return nickname;
      }
    }

    throw new ConflictException('Could not generate unique guest nickname');
  }

  async issueJwt(user: AuthUser): Promise<string> {
    if (!this.config.get<string>('JWT_SECRET')) {
      throw new UnauthorizedException('JWT secret not configured');
    }
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });
  }
}
