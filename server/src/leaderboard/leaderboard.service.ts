import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScoreDto } from './dto/create-score.dto';

type LeaderboardFilters = {
  worldId?: number;
  mapId?: number;
  isInfinite?: boolean;
  limit?: number;
};

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard(filters: LeaderboardFilters) {
    const take = this.normalizeLimit(filters.limit);
    const entries = await this.prisma.score.findMany({
      where: {
        ...(filters.worldId !== undefined ? { worldId: filters.worldId } : {}),
        ...(filters.mapId !== undefined ? { mapId: filters.mapId } : {}),
        ...(filters.isInfinite !== undefined
          ? { isInfinite: filters.isInfinite }
          : {}),
      },
      orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
      take,
      include: {
        user: {
          select: { nickname: true },
        },
      },
    });

    return entries.map((entry) => ({
      id: entry.id,
      nickname: entry.user.nickname,
      worldId: entry.worldId,
      mapId: entry.mapId,
      isInfinite: entry.isInfinite,
      wave: entry.wave,
      kills: entry.kills,
      score: entry.score,
      createdAt: entry.createdAt,
    }));
  }

  async createScoreForUser(userId: string, raw: CreateScoreDto) {
    const worldId = this.ensurePositiveInt(raw.worldId, 'worldId');
    const mapId = this.ensurePositiveInt(raw.mapId, 'mapId');
    const wave = this.ensurePositiveInt(raw.wave, 'wave');
    const kills = this.ensureNonNegativeInt(raw.kills, 'kills');
    if (typeof raw.isInfinite !== 'boolean') {
      throw new BadRequestException('isInfinite must be a boolean');
    }

    // Server-authoritative score calculation.
    const score = wave * 1000 + kills * 10;

    const entry = await this.prisma.score.create({
      data: {
        userId,
        worldId,
        mapId,
        isInfinite: raw.isInfinite,
        wave,
        kills,
        score,
      },
      include: {
        user: {
          select: { nickname: true },
        },
      },
    });

    return {
      id: entry.id,
      nickname: entry.user.nickname,
      worldId: entry.worldId,
      mapId: entry.mapId,
      isInfinite: entry.isInfinite,
      wave: entry.wave,
      kills: entry.kills,
      score: entry.score,
      createdAt: entry.createdAt,
    };
  }

  private normalizeLimit(limit?: number): number {
    if (limit === undefined) {
      return 20;
    }
    const parsed = this.ensurePositiveInt(limit, 'limit');
    return Math.min(parsed, 100);
  }

  private ensurePositiveInt(value: unknown, field: string): number {
    if (
      typeof value !== 'number' ||
      !Number.isInteger(value) ||
      Number.isNaN(value) ||
      value <= 0
    ) {
      throw new BadRequestException(`${field} must be a positive integer`);
    }
    return value;
  }

  private ensureNonNegativeInt(value: unknown, field: string): number {
    if (
      typeof value !== 'number' ||
      !Number.isInteger(value) ||
      Number.isNaN(value) ||
      value < 0
    ) {
      throw new BadRequestException(
        `${field} must be a non-negative integer`,
      );
    }
    return value;
  }
}
