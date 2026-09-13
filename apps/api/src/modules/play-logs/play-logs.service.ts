import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlayLogDto, UpdatePlayLogDto, PlayLogQueryDto } from './dto/play-log.dto';
import { Prisma, PlayStatus } from '@prisma/client';

@Injectable()
export class PlayLogsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra una nueva partida o actualiza el estado en el diario de juego.
   */
  async logPlay(userId: string, dto: CreatePlayLogDto) {
    const game = await this.prisma.game.findUnique({
      where: { id: dto.gameId },
    });

    if (!game) {
      throw new NotFoundException(`Juego no encontrado con el ID: ${dto.gameId}`);
    }

    const logDate = dto.logDate ? new Date(dto.logDate) : new Date();
    const startedAt = dto.startedAt ? new Date(dto.startedAt) : undefined;
    let finishedAt = dto.finishedAt ? new Date(dto.finishedAt) : undefined;

    // Si se marca como completado o 100% y no se especificó fecha de fin, se asume la fecha del registro
    if (
      (dto.status === 'COMPLETED' || dto.status === 'MASTERED') &&
      !finishedAt
    ) {
      finishedAt = logDate;
    }

    const log = await this.prisma.playLog.create({
      data: {
        userId,
        gameId: dto.gameId,
        status: dto.status,
        logDate,
        startedAt,
        finishedAt,
        platform: dto.platform?.trim() || null,
        hoursPlayed: dto.hoursPlayed !== undefined ? dto.hoursPlayed : null,
        isReplay: dto.isReplay ?? false,
        replayCount: dto.replayCount ?? 0,
        notes: dto.notes?.trim() || null,
      },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            slug: true,
            coverUrl: true,
            backdropUrl: true,
            firstReleaseDate: true,
            communityScore: true,
          },
        },
      },
    });

    return log;
  }

  /**
   * Obtiene el estado de juego activo más reciente de un usuario para un título específico.
   */
  async getUserActiveStatusForGame(userId: string, gameId: string) {
    const latestLog = await this.prisma.playLog.findFirst({
      where: {
        userId,
        gameId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      status: latestLog?.status || null,
      latestLog: latestLog || null,
    };
  }

  /**
   * Obtiene el diario completo de partidas del usuario con filtros, orden y estadísticas.
   */
  async getUserLogs(userId: string, query: PlayLogQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PlayLogWhereInput = {
      userId,
    };

    if (query.status) {
      where.status = query.status;
    }

    let orderBy: Prisma.PlayLogOrderByWithRelationInput[] = [];
    switch (query.sort) {
      case 'date_asc':
        orderBy = [{ logDate: 'asc' }, { createdAt: 'asc' }];
        break;
      case 'hours_desc':
        orderBy = [{ hoursPlayed: 'desc' }, { logDate: 'desc' }];
        break;
      case 'date_desc':
      default:
        orderBy = [{ logDate: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    const [items, total, hoursAgg, groupedStatus] = await Promise.all([
      this.prisma.playLog.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          game: {
            select: {
              id: true,
              name: true,
              slug: true,
              coverUrl: true,
              backdropUrl: true,
              firstReleaseDate: true,
              communityScore: true,
            },
          },
        },
      }),
      this.prisma.playLog.count({ where }),
      this.prisma.playLog.aggregate({
        where: { userId },
        _sum: { hoursPlayed: true },
        _count: { id: true },
      }),
      this.prisma.playLog.groupBy({
        by: ['status'],
        where: { userId },
        _count: { id: true },
      }),
    ]);

    // Resumen de estadísticas por estado
    const statusCounts: Record<string, number> = {
      PLAYING: 0,
      BACKLOG: 0,
      COMPLETED: 0,
      MASTERED: 0,
      DROPPED: 0,
      SHELVED: 0,
      WISHLIST: 0,
    };

    groupedStatus.forEach((g) => {
      statusCounts[g.status] = g._count.id;
    });

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalLogs: hoursAgg._count.id,
        totalHours: hoursAgg._sum.hoursPlayed || 0,
        completedCount: (statusCounts.COMPLETED || 0) + (statusCounts.MASTERED || 0),
        statusCounts,
      },
    };
  }

  /**
   * Obtiene las partidas públicas registradas por la comunidad para un juego.
   */
  async getGameCommunityLogs(gameId: string, limit = 8) {
    return this.prisma.playLog.findMany({
      where: { gameId },
      orderBy: { logDate: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            criticTier: true,
          },
        },
      },
    });
  }

  /**
   * Elimina una entrada del diario.
   */
  async deleteLog(userId: string, logId: string) {
    const log = await this.prisma.playLog.findUnique({
      where: { id: logId },
    });

    if (!log) {
      throw new NotFoundException('Entrada de diario no encontrada');
    }

    if (log.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta entrada');
    }

    await this.prisma.playLog.delete({
      where: { id: logId },
    });

    return {
      success: true,
      message: 'Entrada del diario eliminada correctamente',
    };
  }
}
