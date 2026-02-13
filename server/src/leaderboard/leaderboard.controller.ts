import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { JwtAuthGuard, type AuthPayload } from '../auth/jwt-auth.guard';
import { AuthUser } from '../auth/auth.decorator';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async list(
    @Query('worldId') worldIdRaw?: string,
    @Query('mapId') mapIdRaw?: string,
    @Query('isInfinite') isInfiniteRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    const worldId = this.parseOptionalPositiveInt(worldIdRaw, 'worldId');
    const mapId = this.parseOptionalPositiveInt(mapIdRaw, 'mapId');
    const limit = this.parseOptionalPositiveInt(limitRaw, 'limit');
    const isInfinite = this.parseOptionalBoolean(isInfiniteRaw, 'isInfinite');

    return {
      entries: await this.leaderboardService.getLeaderboard({
        worldId,
        mapId,
        isInfinite,
        limit,
      }),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @AuthUser() user: AuthPayload | null,
    @Body() body: CreateScoreDto,
  ) {
    if (!user) {
      throw new BadRequestException('Missing authenticated user');
    }
    return {
      entry: await this.leaderboardService.createScoreForUser(user.sub, body),
    };
  }

  private parseOptionalPositiveInt(
    value: string | undefined,
    field: string,
  ): number | undefined {
    if (value === undefined) {
      return undefined;
    }
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException(`${field} must be a positive integer`);
    }
    return parsed;
  }

  private parseOptionalBoolean(
    value: string | undefined,
    field: string,
  ): boolean | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    throw new BadRequestException(`${field} must be true or false`);
  }
}
