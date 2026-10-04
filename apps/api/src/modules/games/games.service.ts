import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IgdbService } from './igdb.service';
import { RawgService } from './rawg.service';
import { GameQueryDto } from './dto/game-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

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
   * Obtiene los juegos más populares por período (semana, mes o histórico) con ranking numérico y métricas de hype.
   */
  async getPopularWeekly(timeframe: 'week' | 'month' | 'all_time' = 'week', limit = 10) {
    try {
      let orderBy: Prisma.GameOrderByWithRelationInput[] = [];

      switch (timeframe) {
        case 'month':
          orderBy = [
            { totalReviews: 'desc' },
            { hypeCount: 'desc' },
            { communityScore: { sort: 'desc', nulls: 'last' } },
          ];
          break;
        case 'all_time':
          orderBy = [
            { communityScore: { sort: 'desc', nulls: 'last' } },
            { communityCount: 'desc' },
            { metacriticScore: { sort: 'desc', nulls: 'last' } },
          ];
          break;
        case 'week':
        default:
          orderBy = [
            { hypeCount: 'desc' },
            { totalReviews: 'desc' },
            { communityScore: { sort: 'desc', nulls: 'last' } },
          ];
          break;
      }

      const items = await this.prisma.game.findMany({
        take: limit,
        orderBy,
        include: {
          genres: { include: { genre: true } },
          platforms: { include: { platform: true } },
        },
      });

      if (!items || items.length === 0) {
        return {
          timeframe,
          data: this.getPopularWeeklyFallback(timeframe, limit),
          total: limit,
        };
      }

      const formatted = items.map((game, index) => ({
        id: game.id,
        rank: index + 1,
        slug: game.slug,
        name: game.name,
        summary: game.summary,
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
        weeklyEngagement: Math.max(
          150,
          (game.hypeCount || 0) * 12 + (game.totalReviews || 0) * 20 + (game.communityCount || 0) * 8,
        ),
        genres: game.genres.map((g) => g.genre.name),
        platforms: game.platforms.map((p) => p.platform.abbreviation || p.platform.name),
      }));

      return {
        timeframe,
        data: formatted,
        total: formatted.length,
      };
    } catch (err: any) {
      this.logger.warn(`Fallback activado para getPopularWeekly: ${err.message}`);
      return {
        timeframe,
        data: this.getPopularWeeklyFallback(timeframe, limit),
        total: limit,
      };
    }
  }

  private getPopularWeeklyFallback(timeframe: string, limit = 10) {
    const fallbackList = [
      {
        id: '1',
        rank: 1,
        name: 'Elden Ring: Shadow of the Erdtree',
        slug: 'elden-ring-shadow-of-the-erdtree',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7vde.jpg',
        backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co7vde.jpg',
        communityScore: 95,
        criticScore: 96,
        metacriticScore: 95,
        weeklyEngagement: 2480,
        totalReviews: 890,
        genres: ['Action RPG', 'Fantasía Oscura'],
        platforms: ['PC', 'PS5', 'Xbox Series X'],
      },
      {
        id: '2',
        rank: 2,
        name: 'Black Myth: Wukong',
        slug: 'black-myth-wukong',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8j9a.jpg',
        backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co8j9a.jpg',
        communityScore: 89,
        criticScore: 82,
        metacriticScore: 81,
        weeklyEngagement: 2150,
        totalReviews: 640,
        genres: ['Acción', 'Aventura Mitológica'],
        platforms: ['PC', 'PS5'],
      },
      {
        id: '3',
        rank: 3,
        name: 'Metaphor: ReFantazio',
        slug: 'metaphor-refantazio',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6s98.jpg',
        backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co6s98.jpg',
        communityScore: 93,
        criticScore: 94,
        metacriticScore: 93,
        weeklyEngagement: 1890,
        totalReviews: 420,
        genres: ['JRPG', 'Estrategia por Turnos'],
        platforms: ['PC', 'PS5', 'Xbox Series X'],
      },
      {
        id: '4',
        rank: 4,
        name: 'Hades II',
        slug: 'hades-ii',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5zpp.jpg',
        backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co5zpp.jpg',
        communityScore: 92,
        criticScore: 90,
        metacriticScore: 91,
        weeklyEngagement: 1650,
        totalReviews: 380,
        genres: ['Roguelike', 'Indie Acción'],
        platforms: ['PC'],
      },
      {
        id: '5',
        rank: 5,
        name: 'Astro Bot',
        slug: 'astro-bot',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co86v2.jpg',
        backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co86v2.jpg',
        communityScore: 94,
        criticScore: 94,
        metacriticScore: 94,
        weeklyEngagement: 1520,
        totalReviews: 340,
        genres: ['Plataformas 3D', 'Aventura'],
        platforms: ['PS5'],
      },
      {
        id: '6',
        rank: 6,
        name: "Baldur's Gate 3",
        slug: 'baldurs-gate-3',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.jpg',
        backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co670h.jpg',
        communityScore: 96,
        criticScore: 96,
        metacriticScore: 96,
        weeklyEngagement: 1490,
        totalReviews: 1250,
        genres: ['CRPG', 'Fantasía'],
        platforms: ['PC', 'PS5', 'Xbox Series X'],
      },
      {
        id: '7',
        rank: 7,
        name: 'Silent Hill 2',
        slug: 'silent-hill-2-remake',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5p1d.jpg',
        backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co5p1d.jpg',
        communityScore: 88,
        criticScore: 86,
        metacriticScore: 86,
        weeklyEngagement: 1380,
        totalReviews: 310,
        genres: ['Survival Horror', 'Terror Psicológico'],
        platforms: ['PC', 'PS5'],
      },
      {
        id: '8',
        rank: 8,
        name: 'Final Fantasy VII Rebirth',
        slug: 'final-fantasy-vii-rebirth',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6t8i.jpg',
        backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co6t8i.jpg',
        communityScore: 92,
        criticScore: 92,
        metacriticScore: 92,
        weeklyEngagement: 1290,
        totalReviews: 530,
        genres: ['Action RPG', 'Aventura'],
        platforms: ['PS5'],
      },
      {
        id: '9',
        rank: 9,
        name: 'The Witcher 3: Wild Hunt',
        slug: 'the-witcher-3-wild-hunt',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg',
        backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co1wyy.jpg',
        communityScore: 97,
        criticScore: 95,
        metacriticScore: 94,
        weeklyEngagement: 1190,
        totalReviews: 2100,
        genres: ['RPG', 'Mundo Abierto'],
        platforms: ['PC', 'PS5', 'Xbox Series X', 'Switch'],
      },
      {
        id: '10',
        rank: 10,
        name: 'Cyberpunk 2077: Phantom Liberty',
        slug: 'cyberpunk-2077-phantom-liberty',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6pud.jpg',
        backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co6pud.jpg',
        communityScore: 90,
        criticScore: 89,
        metacriticScore: 89,
        weeklyEngagement: 1120,
        totalReviews: 870,
        genres: ['Sci-Fi', 'RPG Primera Persona'],
        platforms: ['PC', 'PS5', 'Xbox Series X'],
      },
    ];

    if (timeframe === 'all_time') {
      return [...fallbackList].sort((a, b) => b.communityScore - a.communityScore).slice(0, limit);
    }
    return fallbackList.slice(0, limit);
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

  /**
   * Obtiene los lanzamientos de un mes y año específico para el calendario interactivo.
   */
  async getCalendar(year: number, month: number, platformSlug?: string) {
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const where: Prisma.GameWhereInput = {
      firstReleaseDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    };

    if (platformSlug && platformSlug !== 'all') {
      where.platforms = {
        some: {
          platform: {
            slug: platformSlug,
          },
        },
      };
    }

    const games = await this.prisma.game.findMany({
      where,
      orderBy: { firstReleaseDate: 'asc' },
      include: {
        genres: { include: { genre: true } },
        platforms: { include: { platform: true } },
      },
    });

    return games.map((game) => ({
      id: game.id,
      slug: game.slug,
      name: game.name,
      summary: game.summary,
      coverUrl: this.getCoverUrl(game.coverUrl, game.coverImageId),
      backdropUrl: this.getBackdropUrl(game.backdropUrl, game.backdropImageId),
      firstReleaseDate: game.firstReleaseDate?.toISOString() || null,
      communityScore: game.communityScore,
      criticScore: game.criticScore,
      metacriticScore: game.metacriticScore,
      genres: game.genres.map((g) => g.genre.name),
      platforms: game.platforms.map((p) => ({
        id: p.platform.id,
        name: p.platform.name,
        slug: p.platform.slug,
        abbreviation: p.platform.abbreviation,
      })),
    }));
  }
}

