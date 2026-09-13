import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable()
export class IgdbService {
  private readonly logger = new Logger(IgdbService.name);
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private get clientId(): string | undefined {
    return this.configService.get<string>('IGDB_CLIENT_ID');
  }

  private get clientSecret(): string | undefined {
    return this.configService.get<string>('IGDB_CLIENT_SECRET');
  }

  /**
   * Obtiene o renueva el token de autenticación OAuth2 de Twitch para consultar IGDB.
   */
  private async getAccessToken(): Promise<string | null> {
    if (!this.clientId || !this.clientSecret) {
      return null;
    }

    // Retorna el token existente si aún no expira (con 60 segundos de margen)
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    try {
      const url = `https://id.twitch.tv/oauth2/token?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`;
      const response = await fetch(url, { method: 'POST' });

      if (!response.ok) {
        throw new Error(`Twitch OAuth failed: ${response.statusText}`);
      }

      const data = (await response.json()) as TwitchTokenResponse;
      this.accessToken = data.access_token;
      this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
      this.logger.log('Token de acceso a IGDB obtenido exitosamente');

      return this.accessToken;
    } catch (error) {
      this.logger.warn('No se pudo autenticar con IGDB API. Se usará el catálogo local.', error);
      return null;
    }
  }

  /**
   * Ejecuta una consulta directa con sintaxis Apicalypse a IGDB.
   */
  async queryIgdb<T>(endpoint: string, apicalypseQuery: string): Promise<T[] | null> {
    const token = await this.getAccessToken();
    if (!token || !this.clientId) {
      return null;
    }

    try {
      const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
        method: 'POST',
        headers: {
          'Client-ID': this.clientId,
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: apicalypseQuery,
      });

      if (!response.ok) {
        throw new Error(`IGDB query error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as T[];
    } catch (error) {
      this.logger.error(`Error consultando endpoint de IGDB: ${endpoint}`, error);
      return null;
    }
  }

  /**
   * Busca juegos en la API de IGDB y los sincroniza/guarda en la base de datos local.
   */
  async searchAndCacheGames(search: string, limit = 10) {
    const query = `
      fields id, name, slug, summary, storyline, first_release_date, hypes,
             cover.image_id, artworks.image_id, screenshots.image_id,
             genres.name, genres.slug, genres.id,
             platforms.name, platforms.slug, platforms.abbreviation, platforms.id,
             involved_companies.company.name, involved_companies.company.slug, involved_companies.developer, involved_companies.publisher;
      search "${search}";
      limit ${limit};
    `;

    const igdbGames = await this.queryIgdb<any>('games', query);
    if (!igdbGames || igdbGames.length === 0) {
      return [];
    }

    const savedGames: any[] = [];
    for (const item of igdbGames) {
      try {
        const coverImageId = item.cover?.image_id || null;
        const backdropImageId = item.artworks?.[0]?.image_id || item.screenshots?.[0]?.image_id || null;
        const screenshotIds = (item.screenshots || []).map((s: any) => s.image_id).filter(Boolean);
        const releaseDate = item.first_release_date ? new Date(item.first_release_date * 1000) : null;

        const game = await this.prisma.game.upsert({
          where: { igdbId: item.id },
          update: {
            name: item.name,
            slug: item.slug,
            summary: item.summary || null,
            storyline: item.storyline || null,
            coverImageId,
            backdropImageId,
            screenshotIds,
            firstReleaseDate: releaseDate,
            hypeCount: item.hypes || 0,
            lastSyncedAt: new Date(),
          },
          create: {
            igdbId: item.id,
            name: item.name,
            slug: item.slug,
            summary: item.summary || null,
            storyline: item.storyline || null,
            coverImageId,
            backdropImageId,
            screenshotIds,
            firstReleaseDate: releaseDate,
            hypeCount: item.hypes || 0,
            communityScore: null,
            criticScore: null,
          },
        });

        savedGames.push(game);
      } catch (err) {
        this.logger.error(`Error cacheando juego IGDB ${item.name}`, err);
      }
    }

    return savedGames;
  }
}
