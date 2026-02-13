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
