import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto, SetFavoritesDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene el perfil público completo de un usuario por su nombre de usuario.
   */
  async getProfileByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bannerUrl: true,
        bio: true,
        location: true,
        website: true,
        role: true,
        criticTier: true,
        criticBadge: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario @${username} no encontrado`);
    }

    // Consultas paralelas para métricas y vitrinas
    const [
      favoriteGames,
      reviews,
      playLogsAgg,
      completedCount,
      recentReviews,
      recentPlays,
      followersCount,
      followingCount,
    ] = await Promise.all([
      this.prisma.userFavoriteGame.findMany({
        where: { userId: user.id },
        orderBy: { position: 'asc' },
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
      this.prisma.review.findMany({
        where: { userId: user.id, isPublished: true },
        select: { score: true },
      }),
      this.prisma.playLog.aggregate({
        where: { userId: user.id },
        _sum: { hoursPlayed: true },
        _count: { id: true },
      }),
      this.prisma.playLog.count({
        where: {
          userId: user.id,
          status: { in: ['COMPLETED', 'MASTERED'] },
        },
      }),
      this.prisma.review.findMany({
        where: { userId: user.id, isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 4,
        include: {
          game: {
            select: {
              id: true,
              name: true,
              slug: true,
              coverUrl: true,
              firstReleaseDate: true,
              communityScore: true,
            },
          },
        },
      }),
      this.prisma.playLog.findMany({
        where: { userId: user.id },
        orderBy: { logDate: 'desc' },
        take: 4,
        include: {
          game: {
            select: {
              id: true,
              name: true,
              slug: true,
              coverUrl: true,
              firstReleaseDate: true,
              communityScore: true,
            },
          },
        },
      }),
      this.prisma.follow.count({ where: { followingId: user.id } }),
      this.prisma.follow.count({ where: { followerId: user.id } }),
    ]);

    // Promedio exacto de puntuación (0 a 100)
    const averageScore =
      reviews.length > 0
        ? Math.round(
            reviews.reduce((acc, r) => acc + r.score, 0) / reviews.length,
          )
        : null;

    // Histograma de distribución de puntuaciones (10 intervalos)
    const buckets = [
      { range: '0-10', min: 0, max: 10, count: 0 },
      { range: '11-20', min: 11, max: 20, count: 0 },
      { range: '21-30', min: 21, max: 30, count: 0 },
      { range: '31-40', min: 31, max: 40, count: 0 },
      { range: '41-50', min: 41, max: 50, count: 0 },
      { range: '51-60', min: 51, max: 60, count: 0 },
      { range: '61-70', min: 61, max: 70, count: 0 },
      { range: '71-80', min: 71, max: 80, count: 0 },
      { range: '81-90', min: 81, max: 90, count: 0 },
      { range: '91-100', min: 91, max: 100, count: 0 },
    ];

    reviews.forEach((r) => {
      const bucket = buckets.find((b) => r.score >= b.min && r.score <= b.max);
      if (bucket) {
        bucket.count += 1;
      }
    });

    return {
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
      },
      favoriteGames: favoriteGames.map((f) => ({
        id: f.id,
        position: f.position,
        game: f.game,
      })),
      stats: {
        totalReviews: reviews.length,
        totalLoggedPlays: playLogsAgg._count.id,
        totalHoursPlayed: playLogsAgg._sum.hoursPlayed || 0,
        completedGames: completedCount,
        averageScore,
        followersCount,
        followingCount,
        scoreDistribution: buckets,
      },
      recentReviews: recentReviews.map((r: any) => ({
        ...r,
        content: r.body,
        hasSpoilers: r.containsSpoilers,
        playedHours: r.playtimeAtReview,
        createdAt: r.createdAt.toISOString(),
      })),
      recentPlays: recentPlays.map((p) => ({
        ...p,
        logDate: p.logDate.toISOString(),
        createdAt: p.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Configura o reordena los 4 juegos favoritos del usuario ("Favorite Four").
   */
  async setFavorites(userId: string, dto: SetFavoritesDto) {
    if (dto.favorites.length > 4) {
      throw new BadRequestException('Solo puedes tener hasta 4 juegos favoritos');
    }

    // Verificar que las posiciones sean del 1 al 4 y no estén duplicadas
    const positions = dto.favorites.map((f) => f.position);
    const uniquePositions = new Set(positions);
    if (positions.length !== uniquePositions.size) {
      throw new BadRequestException('Las posiciones de los favoritos no pueden repetirse');
    }

    for (const pos of positions) {
      if (pos < 1 || pos > 4) {
        throw new BadRequestException('Las posiciones deben ser entre 1 y 4');
      }
    }

    // Transacción atómica: reemplazar favoritos existentes
    await this.prisma.$transaction([
      this.prisma.userFavoriteGame.deleteMany({
        where: { userId },
      }),
      this.prisma.userFavoriteGame.createMany({
        data: dto.favorites.map((f) => ({
          userId,
          gameId: f.gameId,
          position: f.position,
        })),
      }),
    ]);

    return this.prisma.userFavoriteGame.findMany({
      where: { userId },
      orderBy: { position: 'asc' },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            slug: true,
            coverUrl: true,
            communityScore: true,
            firstReleaseDate: true,
          },
        },
      },
    });
  }

  /**
   * Actualiza los datos del perfil de un usuario.
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName?.trim() || undefined,
        bio: dto.bio?.trim() !== undefined ? dto.bio.trim() || null : undefined,
        location: dto.location?.trim() !== undefined ? dto.location.trim() || null : undefined,
        website: dto.website?.trim() !== undefined ? dto.website.trim() || null : undefined,
        avatarUrl: dto.avatarUrl?.trim() !== undefined ? dto.avatarUrl.trim() || null : undefined,
        bannerUrl: dto.bannerUrl?.trim() !== undefined ? dto.bannerUrl.trim() || null : undefined,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bannerUrl: true,
        bio: true,
        location: true,
        website: true,
        role: true,
        criticTier: true,
        criticBadge: true,
      },
    });

    return updated;
  }

  /**
   * Seguir o dejar de seguir a un usuario (Toggle)
   */
  async toggleFollow(followerId: string, targetUsername: string) {
    const targetUser = await this.prisma.user.findUnique({
      where: { username: targetUsername },
      select: { id: true, username: true },
    });

    if (!targetUser) {
      throw new NotFoundException(`Usuario @${targetUsername} no encontrado`);
    }

    if (followerId === targetUser.id) {
      throw new BadRequestException('No puedes seguirte a ti mismo');
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetUser.id,
        },
      },
    });

    if (existingFollow) {
      await this.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId: targetUser.id,
          },
        },
      });

      const followerCount = await this.prisma.follow.count({
        where: { followingId: targetUser.id },
      });

      return { isFollowing: false, followerCount };
    } else {
      await this.prisma.follow.create({
        data: {
          followerId,
          followingId: targetUser.id,
        },
      });

      const followerCount = await this.prisma.follow.count({
        where: { followingId: targetUser.id },
      });

      return { isFollowing: true, followerCount };
    }
  }

  /**
   * Obtener el estado de seguimiento entre el usuario actual y el objetivo
   */
  async getFollowStatus(targetUsername: string, currentUserId?: string) {
    const targetUser = await this.prisma.user.findUnique({
      where: { username: targetUsername },
      select: { id: true },
    });

    if (!targetUser) {
      throw new NotFoundException(`Usuario @${targetUsername} no encontrado`);
    }

    const [followerCount, followingCount, isFollowing] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: targetUser.id } }),
      this.prisma.follow.count({ where: { followerId: targetUser.id } }),
      currentUserId && currentUserId !== targetUser.id
        ? this.prisma.follow
            .findUnique({
              where: {
                followerId_followingId: {
                  followerId: currentUserId,
                  followingId: targetUser.id,
                },
              },
            })
            .then((res) => Boolean(res))
        : Promise.resolve(false),
    ]);

    return {
      isFollowing,
      followerCount,
      followingCount,
    };
  }

  /**
   * Obtener lista de seguidores de un usuario
   */
  async getFollowers(targetUsername: string, currentUserId?: string) {
    const targetUser = await this.prisma.user.findUnique({
      where: { username: targetUsername },
      select: { id: true },
    });

    if (!targetUser) {
      throw new NotFoundException(`Usuario @${targetUsername} no encontrado`);
    }

    const followers = await this.prisma.follow.findMany({
      where: { followingId: targetUser.id },
      orderBy: { createdAt: 'desc' },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            role: true,
            criticTier: true,
          },
        },
      },
    });

    let myFollowingIds = new Set<string>();
    if (currentUserId) {
      const myFollows = await this.prisma.follow.findMany({
        where: {
          followerId: currentUserId,
          followingId: { in: followers.map((f) => f.follower.id) },
        },
        select: { followingId: true },
      });
      myFollowingIds = new Set(myFollows.map((f) => f.followingId));
    }

    return followers.map((f) => ({
      ...f.follower,
      isFollowing: myFollowingIds.has(f.follower.id),
      followedAt: f.createdAt,
    }));
  }

  /**
   * Obtener lista de usuarios a los que sigue un usuario
   */
  async getFollowing(targetUsername: string, currentUserId?: string) {
    const targetUser = await this.prisma.user.findUnique({
      where: { username: targetUsername },
      select: { id: true },
    });

    if (!targetUser) {
      throw new NotFoundException(`Usuario @${targetUsername} no encontrado`);
    }

    const followings = await this.prisma.follow.findMany({
      where: { followerId: targetUser.id },
      orderBy: { createdAt: 'desc' },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            role: true,
            criticTier: true,
          },
        },
      },
    });

    let myFollowingIds = new Set<string>();
    if (currentUserId) {
      const myFollows = await this.prisma.follow.findMany({
        where: {
          followerId: currentUserId,
          followingId: { in: followings.map((f) => f.following.id) },
        },
        select: { followingId: true },
      });
      myFollowingIds = new Set(myFollows.map((f) => f.followingId));
    }

    return followings.map((f) => ({
      ...f.following,
      isFollowing: myFollowingIds.has(f.following.id),
      followedAt: f.createdAt,
    }));
  }
}
