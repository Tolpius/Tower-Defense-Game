import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export type AuthPayload = {
  sub: string; // internal user id
  email?: string;
  name?: string;
  picture?: string;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header = request.headers?.authorization ?? '';
    const token = this.extractBearerToken(header);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException('JWT secret not configured');
    }

    try {
      const payload = (await this.jwtService.verifyAsync(token, {
        secret,
      })) as AuthPayload;

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractBearerToken(header: string): string | null {
    const [type, value] = header.split(' ');
    if (type !== 'Bearer' || !value) {
      return null;
    }
    return value;
  }
}
