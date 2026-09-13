import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto, ReviewQueryDto } from './dto/review.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea o actualiza (upsert) una reseña para un juego por el usuario autenticado.
   */
  async upsertReview(
    userId: string,
    userRole: string,
    criticTier: any,
    dto: CreateReviewDto,
  ) {
    // Validar que el juego exista
    const game = await this.prisma.game.findUnique({
      where: { id: dto.gameId },
    });

    if (!game) {
      throw new NotFoundException(`Juego no encontrado con el ID: ${dto.gameId}`);
    }

    const isCritic = userRole === 'CRITIC' || Boolean(criticTier);

    const review = await this.prisma.review.upsert({
      where: {
        userId_gameId: {
          userId,
          gameId: dto.gameId,
        },
      },
      create: {
        userId,
        gameId: dto.gameId,
        score: dto.score,
        title: dto.title?.trim() || null,
        body: dto.body?.trim() || null,
        platform: dto.platform?.trim() || null,
        playtimeAtReview: dto.playtimeAtReview || null,
        containsSpoilers: dto.containsSpoilers ?? false,
        recommends: dto.recommends ?? null,
        isCriticReview: isCritic,
        criticTier: criticTier || null,
      },
      update: {
        score: dto.score,
        title: dto.title !== undefined ? dto.title.trim() || null : undefined,
        body: dto.body !== undefined ? dto.body.trim() || null : undefined,
        platform: dto.platform !== undefined ? dto.platform.trim() || null : undefined,
        playtimeAtReview: dto.playtimeAtReview !== undefined ? dto.playtimeAtReview : undefined,
        containsSpoilers: dto.containsSpoilers !== undefined ? dto.containsSpoilers : undefined,
        recommends: dto.recommends !== undefined ? dto.recommends : undefined,
        isCriticReview: isCritic,
        criticTier: criticTier || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            criticTier: true,
            criticBadge: true,
          },
        },
      },
    });

    // Recalcular promedios y contadores del juego
    await this.recalculateGameScores(dto.gameId);

    return {
      ...review,
      content: review.body,
      hasSpoilers: review.containsSpoilers,
      playedHours: review.playtimeAtReview,
    };
  }

  /**
   * Recalcula de manera reactiva las puntuaciones y conteos de un juego.
   */
  async recalculateGameScores(gameId: string) {
    const [communityAgg, criticAgg, totalCritHitReviews, game] = await Promise.all([
      this.prisma.review.aggregate({
        where: { gameId, isCriticReview: false, isPublished: true },
        _avg: { score: true },
        _sum: { score: true },
        _count: { id: true },
      }),
      this.prisma.review.aggregate({
        where: { gameId, isCriticReview: true, isPublished: true },
        _avg: { score: true },
        _count: { id: true },
      }),
      this.prisma.review.count({
        where: { gameId, isPublished: true },
      }),
      this.prisma.game.findUnique({
        where: { id: gameId },
        select: { communityScore: true, communityCount: true },
      }),
    ]);

    if (!game) return;

    // Cálculo ponderado para puntuación de la comunidad
    const critHitCommunityCount = communityAgg._count.id;
    const critHitCommunitySum = communityAgg._sum.score || 0;

    let finalCommunityScore = game.communityScore;
    let finalCommunityCount = game.communityCount;

    if (critHitCommunityCount > 0) {
      if (game.communityScore !== null && game.communityCount > 0) {
        // Suavizado bayesiano para que las reseñas locales tengan impacto real
        const effectiveBaseCount = Math.min(game.communityCount, 30);
        finalCommunityScore = Math.round(
          (game.communityScore * effectiveBaseCount + critHitCommunitySum) /
            (effectiveBaseCount + critHitCommunityCount),
        );
        finalCommunityCount = game.communityCount + critHitCommunityCount;
      } else {
        finalCommunityScore = Math.round(communityAgg._avg.score || 0);
        finalCommunityCount = critHitCommunityCount;
      }
    }

    // Cálculo para críticos acreditados
    const criticCount = criticAgg._count.id;
    const criticScore =
      criticCount > 0 && criticAgg._avg.score !== null
        ? Math.round(criticAgg._avg.score)
        : null;

    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        communityScore: finalCommunityScore,
        communityCount: finalCommunityCount,
        criticScore,
        criticCount,
        totalReviews: (game.communityCount || 0) + totalCritHitReviews,
      },
    });
  }

  /**
   * Obtiene las reseñas paginadas de un juego.
   */
  async findByGame(gameId: string, query: ReviewQueryDto, currentUserId?: string) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {
      gameId,
      isPublished: true,
    };

    if (query.criticOnly) {
      where.isCriticReview = true;
    }

    let orderBy: Prisma.ReviewOrderByWithRelationInput[] = [];
    switch (query.sort) {
      case 'recent':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'highest':
        orderBy = [{ score: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'lowest':
        orderBy = [{ score: 'asc' }, { createdAt: 'desc' }];
        break;
      case 'popular':
      default:
        orderBy = [{ likeCount: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy,
        skip,
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
              criticBadge: true,
            },
          },
          likes: currentUserId
            ? {
                where: { userId: currentUserId },
                select: { id: true },
              }
            : false,
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    const formatted = items.map((rev: any) => ({
      id: rev.id,
      userId: rev.userId,
      gameId: rev.gameId,
      score: rev.score,
      title: rev.title,
      body: rev.body,
      content: rev.body,
      platform: rev.platform,
      playtimeAtReview: rev.playtimeAtReview,
      playedHours: rev.playtimeAtReview,
      containsSpoilers: rev.containsSpoilers,
      hasSpoilers: rev.containsSpoilers,
      recommends: rev.recommends,
      isCriticReview: rev.isCriticReview,
      criticTier: rev.criticTier,
      likeCount: rev.likeCount,
      commentCount: rev.commentCount,
      hasLiked: rev.likes && rev.likes.length > 0,
      createdAt: rev.createdAt.toISOString(),
      updatedAt: rev.updatedAt.toISOString(),
      user: rev.user,
    }));

    return {
      data: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtiene la reseña propia del usuario actual para un juego específico.
   */
  async findUserReviewForGame(userId: string, gameId: string) {
    const review = await this.prisma.review.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            criticTier: true,
            criticBadge: true,
          },
        },
      },
    });

    if (!review) return null;

    return {
      ...review,
      content: review.body,
      hasSpoilers: review.containsSpoilers,
      playedHours: review.playtimeAtReview,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }

  /**
   * Obtiene una reseña por su ID.
   */
  async findById(id: string, currentUserId?: string) {
    const review: any = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            criticTier: true,
            criticBadge: true,
          },
        },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
      },
    });

    if (!review) {
      throw new NotFoundException(`Reseña no encontrada con ID: ${id}`);
    }

    return {
      ...review,
      content: review.body,
      hasSpoilers: review.containsSpoilers,
      playedHours: review.playtimeAtReview,
      hasLiked: review.likes && review.likes.length > 0,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }

  /**
   * Elimina una reseña y recalcula los puntajes del juego.
   */
  async deleteReview(userId: string, reviewId: string, userRole: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Reseña no encontrada`);
    }

    if (review.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('No tienes permiso para eliminar esta reseña');
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    await this.recalculateGameScores(review.gameId);

    return {
      success: true,
      message: 'Reseña eliminada correctamente',
    };
  }

  /**
   * Da o quita "me gusta" a una reseña (toggle).
   */
  async toggleLike(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Reseña no encontrada`);
    }

    const existingLike = await this.prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.$transaction([
        this.prisma.reviewLike.delete({
          where: { id: existingLike.id },
        }),
        this.prisma.review.update({
          where: { id: reviewId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);

      const updated = await this.prisma.review.findUnique({
        where: { id: reviewId },
        select: { likeCount: true },
      });

      return {
        liked: false,
        likeCount: Math.max(0, updated?.likeCount || 0),
      };
    } else {
      await this.prisma.$transaction([
        this.prisma.reviewLike.create({
          data: {
            userId,
            reviewId,
          },
        }),
        this.prisma.review.update({
          where: { id: reviewId },
          data: { likeCount: { increment: 1 } },
        }),
      ]);

      const updated = await this.prisma.review.findUnique({
        where: { id: reviewId },
        select: { likeCount: true },
      });

      return {
        liked: true,
        likeCount: updated?.likeCount || 1,
      };
    }
  }
}
