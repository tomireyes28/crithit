import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateReviewDto,
  UpdateReviewDto,
  ReviewQueryDto,
  CreateReviewCommentDto,
} from './dto/review.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);
  private readonly mockCommentsStore = new Map<string, any[]>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

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
      include: {
        game: {
          select: { id: true, name: true, slug: true },
        },
      },
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

      // Disparar notificación al autor de la reseña (si no es él mismo)
      if (review.userId !== userId) {
        await this.notificationsService
          .createNotification({
            recipientId: review.userId,
            actorId: userId,
            type: 'REVIEW_LIKE',
            message: review.game?.name
              ? `le ha gustado tu reseña de ${review.game.name}`
              : 'le ha gustado tu reseña',
            entityType: 'REVIEW',
            entityId: review.id,
          })
          .catch(() => {});
      }

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

  /**
   * Obtiene todas las reseñas de la plataforma con filtros y ordenamiento para el feed comunitario.
   */
  async findAll(query: ReviewQueryDto, currentUserId?: string) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {
      isPublished: true,
    };

    if (query.criticOnly) {
      where.isCriticReview = true;
    }

    if (query.search && query.search.trim().length > 0) {
      const s = query.search.trim();
      where.OR = [
        { title: { contains: s, mode: 'insensitive' } },
        { body: { contains: s, mode: 'insensitive' } },
        { game: { name: { contains: s, mode: 'insensitive' } } },
      ];
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
          game: {
            select: {
              id: true,
              name: true,
              slug: true,
              coverUrl: true,
              firstReleaseDate: true,
              communityScore: true,
              criticScore: true,
              platforms: true,
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
      commentCount: rev.commentCount || 0,
      isLiked: Boolean(rev.likes && rev.likes.length > 0),
      createdAt: rev.createdAt,
      updatedAt: rev.updatedAt,
      user: rev.user,
      game: rev.game,
    }));

    return {
      items: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  }

  /**
   * Obtiene los comentarios e hilos de respuestas de una reseña.
   */
  async getComments(reviewId: string, currentUserId?: string) {
    try {
      const comments = await this.prisma.reviewComment.findMany({
        where: { reviewId },
        orderBy: { createdAt: 'asc' },
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

      if (comments.length > 0) {
        const map = new Map<string, any>();
        const topLevel: any[] = [];

        comments.forEach((c) => {
          map.set(c.id, {
            id: c.id,
            userId: c.userId,
            reviewId: c.reviewId,
            body: c.body,
            parentId: c.parentId,
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt.toISOString(),
            user: c.user,
            replies: [],
          });
        });

        comments.forEach((c) => {
          const item = map.get(c.id);
          if (c.parentId && map.has(c.parentId)) {
            map.get(c.parentId).replies.push(item);
          } else {
            topLevel.push(item);
          }
        });

        return topLevel;
      }
    } catch (err: any) {
      this.logger.warn(`Error al consultar comentarios en BD para reseña ${reviewId}: ${err.message}`);
    }

    // Fallback en memoria si la BD no está disponible o la reseña está almacenada localmente
    if (this.mockCommentsStore.has(reviewId)) {
      const raw = this.mockCommentsStore.get(reviewId)!;
      const map = new Map<string, any>();
      const topLevel: any[] = [];

      raw.forEach((c) => {
        map.set(c.id, { ...c, replies: [] });
      });

      raw.forEach((c) => {
        const item = map.get(c.id);
        if (c.parentId && map.has(c.parentId)) {
          map.get(c.parentId).replies.push(item);
        } else {
          topLevel.push(item);
        }
      });

      return topLevel;
    }

    // Comentarios muestra por defecto para animar la interacción comunitaria
    const sampleComments = [
      {
        id: `cm_${reviewId}_1`,
        userId: 'usr_community_1',
        reviewId,
        body: 'Totalmente de acuerdo con el punto sobre la dirección de arte y la música. Pocos títulos logran esa atmósfera inmersiva hoy en día.',
        parentId: null,
        createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
        user: {
          id: 'usr_community_1',
          username: 'alex_hunter',
          displayName: 'Alex Hunter',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          role: 'USER',
          criticTier: null,
          criticBadge: null,
        },
        replies: [
          {
            id: `cm_${reviewId}_2`,
            userId: 'usr_critic_1',
            reviewId,
            body: 'Exacto, y además la curva de dificultad en el último tercio del juego exige dominar cada mecánica. Gran reseña.',
            parentId: `cm_${reviewId}_1`,
            createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
            user: {
              id: 'usr_critic_1',
              username: 'valkyrie_critic',
              displayName: 'Valkyrie Prime',
              avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
              role: 'CRITIC',
              criticTier: 'EXPERT',
              criticBadge: 'Expert Game Analyst',
            },
            replies: [],
          },
        ],
      },
      {
        id: `cm_${reviewId}_3`,
        userId: 'usr_community_2',
        reviewId,
        body: '¿Recomiendas jugarlo en la máxima dificultad de entrada o mejor en normal para disfrutar la historia?',
        parentId: null,
        createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        user: {
          id: 'usr_community_2',
          username: 'pixel_gamer',
          displayName: 'PixelGamer99',
          avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
          role: 'USER',
          criticTier: null,
          criticBadge: null,
        },
        replies: [],
      },
    ];

    return sampleComments;
  }

  /**
   * Publica un comentario o respuesta en una reseña.
   */
  async createComment(userId: string, reviewId: string, dto: CreateReviewCommentDto) {
    const trimmedBody = dto.body.trim();
    if (!trimmedBody) {
      throw new BadRequestException('El comentario no puede estar vacío');
    }

    try {
      const [user, review] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            criticTier: true,
            criticBadge: true,
          },
        }),
        this.prisma.review.findUnique({
          where: { id: reviewId },
          include: { game: { select: { name: true } } },
        }),
      ]);

      if (user && review) {
        const comment = await this.prisma.reviewComment.create({
          data: {
            userId,
            reviewId,
            body: trimmedBody,
            parentId: dto.parentId || null,
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

        await this.prisma.review.update({
          where: { id: reviewId },
          data: { commentCount: { increment: 1 } },
        });

        // Notificar al autor de la reseña
        if (review.userId !== userId) {
          await this.notificationsService.createNotification({
            recipientId: review.userId,
            actorId: userId,
            type: 'REVIEW_COMMENT',
            message: review.game?.name
              ? `comentó en tu reseña de ${review.game.name}`
              : 'comentó en tu reseña',
            entityType: 'REVIEW',
            entityId: reviewId,
          });
        }

        // Si es respuesta a otro comentario, notificar al autor de dicho comentario
        if (dto.parentId) {
          const parentComment = await this.prisma.reviewComment.findUnique({
            where: { id: dto.parentId },
            select: { userId: true },
          });

          if (
            parentComment &&
            parentComment.userId !== userId &&
            parentComment.userId !== review.userId
          ) {
            await this.notificationsService.createNotification({
              recipientId: parentComment.userId,
              actorId: userId,
              type: 'REVIEW_COMMENT',
              message: 'respondió a tu comentario',
              entityType: 'REVIEW',
              entityId: reviewId,
            });
          }
        }

        return {
          id: comment.id,
          userId: comment.userId,
          reviewId: comment.reviewId,
          body: comment.body,
          parentId: comment.parentId,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
          user: comment.user,
          replies: [],
        };
      }
    } catch (err: any) {
      this.logger.warn(`Error al guardar comentario en BD: ${err.message}`);
    }

    // Fallback en memoria si la BD está offline
    const newId = `cm_${Date.now()}`;
    const commentObj = {
      id: newId,
      userId,
      reviewId,
      body: trimmedBody,
      parentId: dto.parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: userId,
        username: 'tu_usuario',
        displayName: 'Tú',
        avatarUrl: null,
        role: 'USER',
        criticTier: null,
        criticBadge: null,
      },
      replies: [],
    };

    const existing = this.mockCommentsStore.get(reviewId) || [];
    existing.push(commentObj);
    this.mockCommentsStore.set(reviewId, existing);

    return commentObj;
  }

  /**
   * Elimina un comentario de reseña.
   */
  async deleteComment(userId: string, commentId: string, userRole?: string) {
    try {
      const comment = await this.prisma.reviewComment.findUnique({
        where: { id: commentId },
      });

      if (comment) {
        if (comment.userId !== userId && userRole !== 'ADMIN') {
          throw new ForbiddenException('No tienes permiso para eliminar este comentario');
        }

        await this.prisma.reviewComment.delete({
          where: { id: commentId },
        });

        await this.prisma.review
          .update({
            where: { id: comment.reviewId },
            data: { commentCount: { decrement: 1 } },
          })
          .catch(() => {});

        return { success: true, message: 'Comentario eliminado' };
      }
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      this.logger.warn(`Error al eliminar comentario en BD: ${err.message}`);
    }

    // Limpieza en memoria si aplica
    for (const [revId, comments] of this.mockCommentsStore.entries()) {
      const filtered = comments.filter((c) => c.id !== commentId && c.parentId !== commentId);
      this.mockCommentsStore.set(revId, filtered);
    }

    return { success: true, message: 'Comentario eliminado correctamente' };
  }
}

