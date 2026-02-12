import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthenticatedController } from './authenticated.controller';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const raw = config.get<string>('JWT_EXPIRES_IN', '1h');
        const expiresIn: number | StringValue = /^\d+$/.test(raw)
          ? Number(raw)
          : (raw as StringValue);

        return {
          secret: config.get<string>('JWT_SECRET', ''),
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController, AuthenticatedController],
  providers: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
