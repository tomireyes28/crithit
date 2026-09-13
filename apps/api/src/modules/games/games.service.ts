import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IgdbService } from './igdb.service';
import { RawgService } from './rawg.service';
import { GameQueryDto } from './dto/game-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly igdbService: IgdbService,
    private readonly rawgService: RawgService,
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
        where.communityScore = { not: null };
        orderBy = [
          { communityScore: { sort: 'desc', nulls: 'last' } },
          { communityCount: 'desc' },
          { metacriticScore: { sort: 'desc', nulls: 'last' } },
        ];
        break;
      case 'release':
        orderBy = [{ firstReleaseDate: { sort: 'desc', nulls: 'last' } }];
        break;
      case 'name':
        orderBy = [{ name: 'asc' }];
        break;
      case 'trending':
      default:
        orderBy = [
          { hypeCount: 'desc' },
          { totalReviews: 'desc' },
          { communityScore: { sort: 'desc', nulls: 'last' } },
        ];
        break;
    }

    // Si la base de datos tiene pocos juegos y RAWG está configurado, sincronizamos populares
    const totalLocal = await this.prisma.game.count();
    if (totalLocal < 5 && this.rawgService.isConfigured) {
      await this.rawgService.syncPopularGames(20);
    }

    // Si hay búsqueda y pocos resultados locales, consultamos a RAWG (o IGDB)
    if (query.search && query.search.trim().length >= 2) {
      const localCount = await this.prisma.game.count({ where });
      if (localCount < 3) {
        if (this.rawgService.isConfigured) {
          await this.rawgService.searchAndCacheGames(query.search, 10);
        } else {
          await this.igdbService.searchAndCacheGames(query.search, 10);
        }
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
      rawgId: game.rawgId,
      slug: game.slug,
      name: game.name,
      summary: game.summary,
      coverImageId: game.coverImageId,
      backdropImageId: game.backdropImageId,
      coverUrl: this.getCoverUrl(game.coverUrl, game.coverImageId),
      backdropUrl: this.getBackdropUrl(game.backdropUrl, game.backdropImageId),
      firstReleaseDate: game.firstReleaseDate?.toISOString() || null,
      communityScore: game.communityScore,
      communityCount: game.communityCount,
      criticScore: game.criticScore,
      criticCount: game.criticCount,
      metacriticScore: game.metacriticScore,
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

  private getCoverUrl(coverUrl?: string | null, coverImageId?: string | null): string | null {
    if (coverUrl) return coverUrl;
    if (coverImageId) return `https://images.igdb.com/igdb/image/upload/t_cover_big/${coverImageId}.jpg`;
    return null;
  }

  private getBackdropUrl(backdropUrl?: string | null, backdropImageId?: string | null): string | null {
    if (backdropUrl) return backdropUrl;
    if (backdropImageId) return `https://images.igdb.com/igdb/image/upload/t_1080p/${backdropImageId}.jpg`;
    return null;
  }

  /**
   * Obtiene la ficha completa de un juego por su slug.
   */
  async findBySlug(slug: string) {
    let game = await this.prisma.game.findUnique({
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

    // Si no existe localmente, intentamos traerlo de RAWG bajo demanda
    if (!game && this.rawgService.isConfigured) {
      const fetched = await this.rawgService.getOrFetchBySlug(slug);
      if (fetched) {
        return this.findBySlug(slug);
      }
    }

    if (!game) {
      throw new NotFoundException(`Juego no encontrado con el slug: ${slug}`);
    }

    return {
      ...game,
      coverUrl: this.getCoverUrl(game.coverUrl, game.coverImageId),
      backdropUrl: this.getBackdropUrl(game.backdropUrl, game.backdropImageId),
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
      rawgId: game.rawgId,
      slug: game.slug,
      name: game.name,
      summary: game.summary,
      coverImageId: game.coverImageId,
      backdropImageId: game.backdropImageId,
      coverUrl: this.getCoverUrl(game.coverUrl, game.coverImageId),
      backdropUrl: this.getBackdropUrl(game.backdropUrl, game.backdropImageId),
      firstReleaseDate: game.firstReleaseDate?.toISOString() || null,
      communityScore: game.communityScore,
      criticScore: game.criticScore,
      metacriticScore: game.metacriticScore,
      genres: game.genres.map((g) => g.genre.name),
      platforms: game.platforms.map((p) => p.platform.abbreviation || p.platform.name),
    }));
  }

  /**
   * Obtiene la lista de todos los géneros disponibles.
   */
  async getGenres() {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
  }

  /**
   * Obtiene la lista de todas las plataformas disponibles.
   */
  async getPlatforms() {
    return this.prisma.platform.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, abbreviation: true },
    });
  }
}

