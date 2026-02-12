import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import type { User } from '../../generated/prisma/client';

export type AuthUser = User;

@Injectable()
export class AuthService {
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

    const user = await this.prisma.user.upsert({
      where: { email },
      update: {
        googleSub,
        name: payload.name || undefined,
        picture: payload.picture || undefined,
      },
      create: {
        email,
        googleSub,
        name: payload.name || undefined,
        picture: payload.picture || undefined,
      },
    });

    return user;
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
