import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

export type AuthUser = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
};

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;
  private readonly googleClientId: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.googleClientId = this.config.get<string>('GOOGLE_CLIENT_ID', '');
    this.googleClient = new OAuth2Client(this.googleClientId || undefined);
  }

  async verifyGoogleToken(credential: string): Promise<AuthUser> {
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

    return this.mapGooglePayload(payload);
  }

  async issueJwt(user: AuthUser): Promise<string> {
    if (!this.config.get<string>('JWT_SECRET')) {
      throw new UnauthorizedException('JWT secret not configured');
    }
    return this.jwtService.signAsync({
      sub: user.sub,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });
  }

  private mapGooglePayload(payload: TokenPayload): AuthUser {
    return {
      sub: payload.sub || '',
      email: payload.email || undefined,
      name: payload.name || undefined,
      picture: payload.picture || undefined,
    };
  }
}
