import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthUser } from './auth.decorator';
import type { AuthPayload } from './jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthenticatedController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@AuthUser() user: AuthPayload | null) {
    if (!user) {
      return { user: null };
    }
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
    });
    return { user: dbUser };
  }
}
