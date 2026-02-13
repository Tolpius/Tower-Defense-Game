import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthUser } from './auth.decorator';
import type { AuthPayload } from './jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { UpdateNicknameDto } from './dto/update-nickname.dto';
import { SyncInfiniteModesDto } from './dto/sync-infinite-modes.dto';

@Controller('auth')
export class AuthenticatedController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

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

  @UseGuards(JwtAuthGuard)
  @Patch('nickname')
  async updateNickname(
    @AuthUser() user: AuthPayload | null,
    @Body() body: UpdateNicknameDto,
  ) {
    if (!user) {
      return { user: null };
    }
    const updatedUser = await this.authService.updateNicknameForUser(
      user.sub,
      body.nickname,
    );
    return { user: updatedUser };
  }

  @UseGuards(JwtAuthGuard)
  @Post('infinite-modes/sync')
  async syncInfiniteModes(
    @AuthUser() user: AuthPayload | null,
    @Body() body: SyncInfiniteModesDto,
  ) {
    if (!user) {
      return { completedMaps: [] };
    }
    const completedMaps = await this.authService.syncInfiniteModesForUser(
      user.sub,
      body.completedMaps,
    );
    return { completedMaps };
  }
}
