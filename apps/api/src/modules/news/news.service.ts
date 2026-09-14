import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NewsQueryDto } from './dto/news.dto';
import { NewsCategory, Prisma } from '@prisma/client';

@Injectable()
export class NewsService implements OnModuleInit {
  private readonly logger = new Logger(NewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedInitialNews();
  }

  /**
   * Obtiene lista paginada de noticias con filtros y búsqueda
   */
  async findAll(query: NewsQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const where: Prisma.NewsArticleWhereInput = {};

    if (query.category) {
      where.category = query.category;
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { summary: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      this.prisma.newsArticle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          games: {
            select: {
              id: true,
              name: true,
              slug: true,
              coverUrl: true,
              communityScore: true,
            },
          },
        },
      }),
      this.prisma.newsArticle.count({ where }),
    ]);

    return {
      articles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtiene el artículo destacado principal (para el Hero Banner)
   */
  async getFeatured() {
    const featured = await this.prisma.newsArticle.findFirst({
      where: {
        imageUrl: { not: null },
      },
      orderBy: { publishedAt: 'desc' },
      include: {
        games: {
          select: {
            id: true,
            name: true,
            slug: true,
            coverUrl: true,
            communityScore: true,
          },
        },
      },
    });

    return featured;
  }

  /**
   * Obtiene el detalle de un artículo por su ID
   */
  async findById(id: string) {
    const article = await this.prisma.newsArticle.findUnique({
      where: { id },
      include: {
        games: {
          select: {
            id: true,
            name: true,
            slug: true,
            coverUrl: true,
            backdropUrl: true,
            communityScore: true,
            criticScore: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Artículo de noticias no encontrado');
    }

    return article;
  }

  /**
   * Población inicial idempotente de noticias editoriales
   */
  async seedInitialNews() {
    const count = await this.prisma.newsArticle.count();
    if (count > 0) return;

    this.logger.log('Poblando noticias iniciales de videojuegos en Supabase...');

    const initialNews = [
      {
        title: 'Grand Theft Auto VI reafirma su ventana de estreno con nuevos detalles técnicos en consolas',
        summary: 'Rockstar Games reitera su ambicioso lanzamiento previsto para finales de 2026, destacando avances fotorrealistas en físicas de agua, iluminación volumétrica y densidad de peatones en Vice City.',
        url: 'https://rockstargames.com/vi',
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
        sourceName: 'CritHit Editorial',
        sourceUrl: 'https://crithit.gg',
        category: NewsCategory.ANNOUNCEMENT,
        publishedAt: new Date(Date.now() - 2 * 3600 * 1000), // Hace 2 horas
        gameSlugs: ['grand-theft-aito-vi', 'grand-theft-auto-vi'],
      },
      {
        title: 'Hollow Knight: Silksong — Team Cherry actualiza su página en tiendas y desata la euforia',
        summary: 'Tras meses de hermetismo, el esperadísimo metroidvania de Team Cherry actualiza sus clasificaciones por edades en los comités de Australia y Corea, sugiriendo un anuncio inminente.',
        url: 'https://teamcherry.com.au/silksong',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
        sourceName: 'Eurogamer',
        sourceUrl: 'https://eurogamer.net',
        category: NewsCategory.RELEASE,
        publishedAt: new Date(Date.now() - 5 * 3600 * 1000), // Hace 5 horas
        gameSlugs: ['hollow-knight-silksong'],
      },
      {
        title: 'Hades II deslumbra en su fase de acceso anticipado con críticas casi unánimes',
        summary: 'Supergiant Games demuestra una vez más su maestría en el subgénero roguelite. La aventura de Melínoë expande el combate místico, la banda sonora de Darren Korb y el carisma de los dioses del Olimpo.',
        url: 'https://supergiantgames.com/games/hades-ii',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
        sourceName: 'IGN',
        sourceUrl: 'https://ign.com',
        category: NewsCategory.REVIEW,
        publishedAt: new Date(Date.now() - 12 * 3600 * 1000), // Hace 12 horas
        gameSlugs: ['hades-ii'],
      },
      {
        title: 'Elden Ring: Shadow of the Erdtree supera los 5 millones de copias vendidas en su primer mes',
        summary: 'La monumental expansión de FromSoftware dirigida por Hidetaka Miyazaki se consolida como uno de los contenidos descargables mejor calificados y más influyentes de la última década.',
        url: 'https://bandainamcoent.com/games/elden-ring',
        imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop',
        sourceName: 'VGC',
        sourceUrl: 'https://videogameschronicle.com',
        category: NewsCategory.UPDATE_PATCH,
        publishedAt: new Date(Date.now() - 24 * 3600 * 1000), // Hace 1 día
        gameSlugs: ['elden-ring'],
      },
      {
        title: 'Baldur\'s Gate 3 lanza el parche masivo con soporte oficial para mods y finales oscuros ampliados',
        summary: 'Larian Studios continúa perfeccionando su obra maestra con herramientas oficiales de creación comunitaria, cinemáticas inéditas para partidas malvadas y optimizaciones de rendimiento en consolas.',
        url: 'https://baldursgate3.game',
        imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
        sourceName: 'PC Gamer',
        sourceUrl: 'https://pcgamer.com',
        category: NewsCategory.UPDATE_PATCH,
        publishedAt: new Date(Date.now() - 36 * 3600 * 1000), // Hace 1.5 días
        gameSlugs: ['baldurs-gate-3'],
      },
      {
        title: 'Cyberpunk 2077 celebra 30 millones de jugadores tras la redención completa de Phantom Liberty',
        summary: 'CD Projekt RED confirma que el universo de Night City continuará con el proyecto Orion en Unreal Engine 5, despidiéndose de REDengine tras una de las recuperaciones más legendarias del medio.',
        url: 'https://cyberpunk.net',
        imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
        sourceName: 'Kotaku',
        sourceUrl: 'https://kotaku.com',
        category: NewsCategory.OPINION,
        publishedAt: new Date(Date.now() - 48 * 3600 * 1000), // Hace 2 días
        gameSlugs: ['cyberpunk-2077'],
      },
      {
        title: 'The Game Awards anuncia fechas oficiales y nuevas categorías para la gala de diciembre',
        summary: 'Geoff Keighley confirma la fecha de emisión del evento más visto del año, prometiendo primicias mundiales, orquesta en directo y una categoría reforzada para la accesibilidad en videojuegos.',
        url: 'https://thegameawards.com',
        imageUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=1200&auto=format&fit=crop',
        sourceName: 'The Verge',
        sourceUrl: 'https://theverge.com',
        category: NewsCategory.EVENT,
        publishedAt: new Date(Date.now() - 60 * 3600 * 1000), // Hace 2.5 días
        gameSlugs: [],
      },
      {
        title: 'Festival de Ofertas de Steam: Las mejores joyas RPG y Metroidvanias con hasta 80% de descuento',
        summary: 'Selección curada de los descuentos más destacados de la plataforma de Valve, incluyendo títulos indispensables a precios históricos para renovar tu backlog de cara al otoño.',
        url: 'https://store.steampowered.com',
        imageUrl: 'https://images.unsplash.com/photo-1612287233207-6f8e71869e54?q=80&w=1200&auto=format&fit=crop',
        sourceName: 'CritHit Deals',
        sourceUrl: 'https://crithit.gg',
        category: NewsCategory.DEAL,
        publishedAt: new Date(Date.now() - 72 * 3600 * 1000), // Hace 3 días
        gameSlugs: ['the-witcher-3-wild-hunt', 'valheim'],
      },
    ];

    for (const item of initialNews) {
      // Buscar juegos vinculados
      const games = item.gameSlugs.length > 0
        ? await this.prisma.game.findMany({
            where: { slug: { in: item.gameSlugs } },
            select: { id: true },
          })
        : [];

      await this.prisma.newsArticle.create({
        data: {
          title: item.title,
          summary: item.summary,
          url: item.url,
          imageUrl: item.imageUrl,
          sourceName: item.sourceName,
          sourceUrl: item.sourceUrl,
          category: item.category,
          publishedAt: item.publishedAt,
          games: {
            connect: games.map((g) => ({ id: g.id })),
          },
        },
      });
    }

    this.logger.log(`Población completada: ${initialNews.length} artículos de noticias generados.`);
  }
}
