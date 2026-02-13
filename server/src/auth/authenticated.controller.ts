import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthUser } from './auth.decorator';
import type { AuthPayload } from './jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { UpdateNicknameDto } from './dto/update-nickname.dto';

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
}
