import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IgdbService } from './igdb.service';
import { GameQueryDto } from './dto/game-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly igdbService: IgdbService,
  ) {}

  /**
   * Obtiene listado de juegos con filtros, ordenamiento y paginación.
   */
  async findAll(query: GameQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.GameWhereInput = {};

    // Filtro por búsqueda
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { summary: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Filtro por género
    if (query.genre) {
      where.genres = {
        some: {
          genre: { slug: query.genre.toLowerCase() },
        },
      };
    }

    // Filtro por plataforma
    if (query.platform) {
      where.platforms = {
        some: {
          platform: { slug: query.platform.toLowerCase() },
        },
      };
    }

    // Criterio de ordenamiento
    let orderBy: Prisma.GameOrderByWithRelationInput[] = [];
    switch (query.sort) {
      case 'score':
        orderBy = [{ communityScore: 'desc' }, { communityCount: 'desc' }];
        break;
      case 'release':
        orderBy = [{ firstReleaseDate: 'desc' }];
        break;
      case 'name':
        orderBy = [{ name: 'asc' }];
        break;
      case 'trending':
      default:
        orderBy = [{ hypeCount: 'desc' }, { totalReviews: 'desc' }, { communityScore: 'desc' }];
        break;
    }

    // Si hay búsqueda y pocos resultados locales, intentamos consultar a IGDB
    if (query.search && query.search.trim().length >= 2) {
      const localCount = await this.prisma.game.count({ where });
      if (localCount < 3) {
        await this.igdbService.searchAndCacheGames(query.search, 10);
      }
    }

    const [total, items] = await Promise.all([
      this.prisma.game.count({ where }),
      this.prisma.game.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          genres: { include: { genre: true } },
          platforms: { include: { platform: true } },
        },
      }),
    ]);

    const formatted = items.map((game) => ({
      id: game.id,
      igdbId: game.igdbId,
      slug: game.slug,
      name: game.name,
      summary: game.summary,
      coverImageId: game.coverImageId,
      backdropImageId: game.backdropImageId,
      firstReleaseDate: game.firstReleaseDate?.toISOString() || null,
      communityScore: game.communityScore,
      communityCount: game.communityCount,
      criticScore: game.criticScore,
      criticCount: game.criticCount,
      totalReviews: game.totalReviews,
      hypeCount: game.hypeCount,
      genres: game.genres.map((g) => g.genre.name),
      platforms: game.platforms.map((p) => p.platform.abbreviation || p.platform.name),
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
   * Obtiene la ficha completa de un juego por su slug.
   */
  async findBySlug(slug: string) {
    const game = await this.prisma.game.findUnique({
      where: { slug },
      include: {
        genres: { include: { genre: true } },
        platforms: { include: { platform: true } },
        themes: { include: { theme: true } },
        developers: true,
        publishers: true,
        franchise: true,
        reviews: {
          take: 5,
          orderBy: { likeCount: 'desc' },
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
        },
        _count: {
          select: {
            reviews: true,
            playLogs: true,
            favoritedBy: true,
          },
        },
      },
    });

    if (!game) {
      throw new NotFoundException(`Juego no encontrado con el slug: ${slug}`);
    }

    return {
      ...game,
      genres: game.genres.map((g) => g.genre),
      platforms: game.platforms.map((p) => p.platform),
      themes: game.themes.map((t) => t.theme),
    };
  }

  /**
   * Obtiene los juegos en tendencia.
   */
  async getTrending(limit = 8) {
    return this.findAll({ sort: 'trending', limit, page: 1 });
  }

  /**
   * Obtiene los juegos mejor puntuados.
   */
  async getTopRated(limit = 8) {
    return this.findAll({ sort: 'score', limit, page: 1 });
  }

  /**
   * Obtiene los próximos lanzamientos.
   */
  async getUpcoming(limit = 8) {
    const now = new Date();
    const where: Prisma.GameWhereInput = {
      firstReleaseDate: { gt: now },
    };

    const items = await this.prisma.game.findMany({
      where,
      orderBy: { firstReleaseDate: 'asc' },
      take: limit,
      include: {
        genres: { include: { genre: true } },
        platforms: { include: { platform: true } },
      },
    });

    return items.map((game) => ({
      id: game.id,
      igdbId: game.igdbId,
      slug: game.slug,
      name: game.name,
      summary: game.summary,
      coverImageId: game.coverImageId,
      backdropImageId: game.backdropImageId,
      firstReleaseDate: game.firstReleaseDate?.toISOString() || null,
      communityScore: game.communityScore,
      criticScore: game.criticScore,
      genres: game.genres.map((g) => g.genre.name),
      platforms: game.platforms.map((p) => p.platform.abbreviation || p.platform.name),
    }));
  }
}
