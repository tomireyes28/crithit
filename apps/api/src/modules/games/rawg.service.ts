import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

interface RawgGameItem {
  id: number;
  slug: string;
  name: string;
  released?: string;
  background_image?: string;
  rating?: number;
  metacritic?: number;
  genres?: Array<{ id: number; name: string; slug: string }>;
  platforms?: Array<{ platform: { id: number; name: string; slug: string } }>;
  short_screenshots?: Array<{ id: number; image: string }>;
}

interface RawgGameDetail extends RawgGameItem {
  description_raw?: string;
  background_image_additional?: string;
  developers?: Array<{ id: number; name: string; slug: string }>;
  publishers?: Array<{ id: number; name: string; slug: string }>;
  stores?: Array<{ store: { id: number; name: string; slug: string }; url?: string }>;
}

interface RawgListResponse {
  count: number;
  results: RawgGameItem[];
}

@Injectable()
export class RawgService {
  private readonly logger = new Logger(RawgService.name);
  private readonly baseUrl = 'https://api.rawg.io/api';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private get apiKey(): string | undefined {
    return this.configService.get<string>('RAWG_API_KEY');
  }

  /**
   * Indica si la clave de RAWG está configurada.
   */
  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Ejecuta una petición HTTP a la API de RAWG.
   */
  private async fetchRawg<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T | null> {
    if (!this.apiKey) {
      this.logger.warn('RAWG_API_KEY no configurada. Omitiendo consulta externa.');
      return null;
    }

    const searchParams = new URLSearchParams({
      key: this.apiKey,
      ...Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}),
    });

    const url = `${this.baseUrl}/${endpoint}?${searchParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        this.logger.error(`Error en RAWG API (${response.status}): ${response.statusText} -> ${endpoint}`);
        return null;
      }
      return (await response.json()) as T;
    } catch (error) {
      this.logger.error(`Error conectando con RAWG API: ${endpoint}`, error);
      return null;
    }
  }

  /**
   * Guarda o actualiza un juego de RAWG en la base de datos de PostgreSQL.
   */
  async upsertRawgGame(item: RawgGameItem | RawgGameDetail) {
    try {
      const releaseDate = item.released ? new Date(item.released) : null;
      const coverUrl = item.background_image || null;
      const detail = item as RawgGameDetail;
      const backdropUrl = detail.background_image_additional || item.background_image || null;
      const summary = detail.description_raw || null;

      // Extraer screenshots
      const screenshotIds: string[] = [];
      if (item.short_screenshots && item.short_screenshots.length > 0) {
        item.short_screenshots.forEach((s) => {
          if (s.image) screenshotIds.push(s.image);
        });
      }

      // Buscar si existe por rawgId o slug
      const existing = await this.prisma.game.findFirst({
        where: {
          OR: [{ rawgId: item.id }, { slug: item.slug }],
        },
      });

      let game;
      if (existing) {
        game = await this.prisma.game.update({
          where: { id: existing.id },
          data: {
            rawgId: item.id,
            name: item.name,
            slug: item.slug,
            summary: summary || existing.summary,
            coverUrl: coverUrl || existing.coverUrl,
            backdropUrl: backdropUrl || existing.backdropUrl,
            metacriticScore: item.metacritic || existing.metacriticScore,
            firstReleaseDate: releaseDate || existing.firstReleaseDate,
            screenshotIds: screenshotIds.length > 0 ? screenshotIds : existing.screenshotIds,
            lastSyncedAt: new Date(),
          },
        });
      } else {
        game = await this.prisma.game.create({
          data: {
            rawgId: item.id,
            name: item.name,
            slug: item.slug,
            summary,
            coverUrl,
            backdropUrl,
            metacriticScore: item.metacritic || null,
            firstReleaseDate: releaseDate,
            screenshotIds,
            lastSyncedAt: new Date(),
          },
        });
      }

      // Sincronizar géneros si vienen informados
      if (item.genres && item.genres.length > 0) {
        for (const g of item.genres) {
          try {
            const genreRecord = await this.prisma.genre.upsert({
              where: { slug: g.slug },
              update: { name: g.name },
              create: { name: g.name, slug: g.slug },
            });

            await this.prisma.gameGenre.upsert({
              where: {
                gameId_genreId: {
                  gameId: game.id,
                  genreId: genreRecord.id,
                },
              },
              update: {},
              create: {
                gameId: game.id,
                genreId: genreRecord.id,
              },
            });
          } catch {
            // Ignorar duplicados de relaciones
          }
        }
      }

      // Sincronizar plataformas
      if (item.platforms && item.platforms.length > 0) {
        for (const p of item.platforms) {
          try {
            const plat = p.platform;
            const platformRecord = await this.prisma.platform.upsert({
              where: { slug: plat.slug },
              update: { name: plat.name },
              create: { name: plat.name, slug: plat.slug },
            });

            await this.prisma.gamePlatform.upsert({
              where: {
                gameId_platformId: {
                  gameId: game.id,
                  platformId: platformRecord.id,
                },
              },
              update: {},
              create: {
                gameId: game.id,
                platformId: platformRecord.id,
              },
            });
          } catch {
            // Ignorar duplicados de relaciones
          }
        }
      }

      return game;
    } catch (err) {
      this.logger.error(`Error procesando juego de RAWG: ${item.name}`, err);
      return null;
    }
  }

  /**
   * Busca juegos en RAWG y los cachea en Supabase.
   */
  async searchAndCacheGames(query: string, limit = 10) {
    const data = await this.fetchRawg<RawgListResponse>('games', {
      search: query,
      page_size: limit,
    });

    if (!data || !data.results || data.results.length === 0) {
      return [];
    }

    const savedGames: any[] = [];
    for (const item of data.results) {
      const saved = await this.upsertRawgGame(item);
      if (saved) savedGames.push(saved);
    }

    return savedGames;
  }

  /**
   * Trae los juegos más populares/relevantes de RAWG para poblar la base de datos inicial.
   */
  async syncPopularGames(limit = 20) {
    this.logger.log(`Sincronizando ${limit} juegos populares de RAWG...`);
    const data = await this.fetchRawg<RawgListResponse>('games', {
      ordering: '-added',
      page_size: limit,
    });

    if (!data || !data.results || data.results.length === 0) {
      return [];
    }

    const savedGames: any[] = [];
    for (const item of data.results) {
      const saved = await this.upsertRawgGame(item);
      if (saved) savedGames.push(saved);
    }

    this.logger.log(`Se sincronizaron exitosamente ${savedGames.length} juegos populares desde RAWG.`);
    return savedGames;
  }

  /**
   * Busca el detalle completo de un juego por su slug si no existe en la base de datos local.
   */
  async getOrFetchBySlug(slug: string) {
    const detail = await this.fetchRawg<RawgGameDetail>(`games/${slug}`);
    if (!detail) {
      return null;
    }
    return this.upsertRawgGame(detail);
  }
}
