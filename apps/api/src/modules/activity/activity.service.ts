import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityQueryDto } from './dto/activity.dto';

export interface FeedItem {
  id: string;
  type: 'RATED_GAME' | 'REVIEWED_GAME' | 'LOGGED_GAME' | 'CREATED_LIST';
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    role: string;
    criticTier: string | null;
  };
  game?: {
    id: string;
    slug: string;
    name: string;
    coverUrl: string | null;
    firstReleaseDate: Date | null;
    communityScore: number | null;
  };
  score?: number;
  status?: string;
  review?: {
    id: string;
    title: string | null;
    body: string | null;
    containsSpoilers: boolean;
    platform: string | null;
    playtimeAtReview: number | null;
    likeCount: number;
  };
  log?: {
    id: string;
    status: string;
    platform: string | null;
    hoursPlayed: number | null;
    notes: string | null;
    logDate: Date;
  };
  list?: {
    id: string;
    title: string;
    description: string | null;
    isRanked: boolean;
    tags: string[];
    entryCount: number;
    likeCount: number;
    previewCovers: string[];
  };
  createdAt: Date;
}

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene el feed de actividad de los usuarios que sigue el usuario autenticado
   */
  async getFollowingFeed(userId: string, query: ActivityQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 20));

    // 1. Obtener los IDs de las personas que el usuario sigue
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = follows.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          followingCount: 0,
        },
      };
    }

    // 2. Agregar actividades de los seguidos
    const activities = await this.aggregateActivities(followingIds, query.type);

    const total = activities.length;
    const startIndex = (page - 1) * limit;
    const paginated = activities.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        followingCount: followingIds.length,
      },
    };
  }

  /**
   * Obtiene el feed global de actividad reciente de toda la comunidad
   */
  async getGlobalFeed(query: ActivityQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(50, Math.max(1, query.limit || 20));

    // Consulta global (sin filtro de userIds)
    const activities = await this.aggregateActivities(undefined, query.type);

    const total = activities.length;
    const startIndex = (page - 1) * limit;
    const paginated = activities.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Método auxiliar para agregar y ordenar actividades polimórficas
   */
  private async aggregateActivities(
    userIds?: string[],
    filterType: string = 'ALL',
  ): Promise<FeedItem[]> {
    const userFilter = userIds ? { in: userIds } : undefined;
    const fetchReviews = filterType === 'ALL' || filterType === 'REVIEWS';
    const fetchLogs = filterType === 'ALL' || filterType === 'LOGS';
    const fetchLists = filterType === 'ALL' || filterType === 'LISTS';

    const [reviews, logs, lists] = await Promise.all([
      fetchReviews
        ? this.prisma.review.findMany({
            where: {
              ...(userFilter ? { userId: userFilter } : {}),
              isPublished: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 40,
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
              game: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  coverUrl: true,
                  firstReleaseDate: true,
                  communityScore: true,
                },
              },
            },
          })
        : Promise.resolve([]),

      fetchLogs
        ? this.prisma.playLog.findMany({
            where: {
              ...(userFilter ? { userId: userFilter } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: 40,
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
              game: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  coverUrl: true,
                  firstReleaseDate: true,
                  communityScore: true,
                },
              },
            },
          })
        : Promise.resolve([]),

      fetchLists
        ? this.prisma.gameList.findMany({
            where: {
              ...(userFilter ? { userId: userFilter } : {}),
              isPublic: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 25,
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
              entries: {
                take: 4,
                orderBy: { position: 'asc' },
                include: {
                  game: {
                    select: {
                      id: true,
                      slug: true,
                      name: true,
                      coverUrl: true,
                    },
                  },
                },
              },
            },
          })
        : Promise.resolve([]),
    ]);

    const items: FeedItem[] = [];

    // Mapear reseñas
    for (const r of reviews) {
      items.push({
        id: `review-${r.id}`,
        type: r.body?.trim() ? 'REVIEWED_GAME' : 'RATED_GAME',
        user: r.user,
        game: r.game,
        score: r.score,
        review: {
          id: r.id,
          title: r.title,
          body: r.body,
          containsSpoilers: r.containsSpoilers,
          platform: r.platform,
          playtimeAtReview: r.playtimeAtReview,
          likeCount: r.likeCount,
        },
        createdAt: r.createdAt,
      });
    }

    // Mapear logs de partidas
    for (const p of logs) {
      items.push({
        id: `log-${p.id}`,
        type: 'LOGGED_GAME',
        user: p.user,
        game: p.game,
        status: p.status,
        log: {
          id: p.id,
          status: p.status,
          platform: p.platform,
          hoursPlayed: p.hoursPlayed,
          notes: p.notes,
          logDate: p.logDate,
        },
        createdAt: p.createdAt,
      });
    }

    // Mapear listas
    for (const l of lists) {
      const previewCovers = l.entries
        .map((e) => e.game?.coverUrl)
        .filter((url): url is string => Boolean(url));

      items.push({
        id: `list-${l.id}`,
        type: 'CREATED_LIST',
        user: l.user,
        list: {
          id: l.id,
          title: l.title,
          description: l.description,
          isRanked: l.isRanked,
          tags: l.tags,
          entryCount: l.entryCount,
          likeCount: l.likeCount,
          previewCovers,
        },
        createdAt: l.createdAt,
      });
    }

    // Ordenar todas las actividades de forma descendente por fecha
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return items;
  }
}
