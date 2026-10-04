import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('Core')
@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'API status report' })
  getHealth() {
    return {
      status: 'ok',
      service: 'crithit-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Búsqueda global unificada para paleta de comandos (Command Palette)' })
  @ApiResponse({ status: 200, description: 'Resultados categorizados de búsqueda rápida' })
  async globalSearch(@Query('q') q?: string) {
    const query = q?.trim() || '';
    if (!query || query.length < 2) {
      return { games: [], users: [], lists: [], news: [] };
    }

    try {
      const [games, users, lists, news] = await Promise.all([
        this.prisma.game.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { slug: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 6,
          select: {
            id: true,
            name: true,
            slug: true,
            coverUrl: true,
            communityScore: true,
            criticScore: true,
            firstReleaseDate: true,
            platforms: { select: { platform: { select: { abbreviation: true, name: true } } } },
            genres: { select: { genre: { select: { name: true } } } },
          },
        }),
        this.prisma.user.findMany({
          where: {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { displayName: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 4,
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            criticBadge: true,
            criticTier: true,
          },
        }),
        this.prisma.gameList.findMany({
          where: {
            isPublic: true,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 4,
          select: {
            id: true,
            title: true,
            description: true,
            isRanked: true,
            user: { select: { username: true, displayName: true } },
            entries: { take: 1, select: { game: { select: { coverUrl: true } } } },
            _count: { select: { entries: true, likes: true } },
          },
        }),
        this.prisma.newsArticle.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { summary: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 3,
          select: {
            id: true,
            title: true,
            category: true,
            imageUrl: true,
            publishedAt: true,
          },
        }),
      ]);

      return {
        games: games.map((g) => ({
          ...g,
          platforms: g.platforms.map((p) => p.platform.abbreviation || p.platform.name),
          genres: g.genres.map((ge) => ge.genre.name),
        })),
        users,
        lists: lists.map((l) => ({
          ...l,
          gameCount: l._count.entries,
          likeCount: l._count.likes,
        })),
        news,
      };
    } catch {
      return this.getSearchFallback(query);
    }
  }

  private getSearchFallback(q: string) {
    const s = q.toLowerCase();
    const mockGames = [
      {
        id: '1',
        name: 'Elden Ring: Shadow of the Erdtree',
        slug: 'elden-ring-shadow-of-the-erdtree',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7vde.jpg',
        communityScore: 95,
        criticScore: 96,
        platforms: ['PC', 'PS5', 'Xbox Series X'],
        genres: ['Action RPG'],
      },
      {
        id: '2',
        name: 'Black Myth: Wukong',
        slug: 'black-myth-wukong',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8j9a.jpg',
        communityScore: 89,
        criticScore: 82,
        platforms: ['PC', 'PS5'],
        genres: ['Acción', 'Aventura'],
      },
      {
        id: '3',
        name: 'Metaphor: ReFantazio',
        slug: 'metaphor-refantazio',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6s98.jpg',
        communityScore: 93,
        criticScore: 94,
        platforms: ['PC', 'PS5', 'Xbox Series X'],
        genres: ['JRPG'],
      },
      {
        id: '4',
        name: 'Hades II',
        slug: 'hades-ii',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5zpp.jpg',
        communityScore: 92,
        criticScore: 90,
        platforms: ['PC'],
        genres: ['Roguelike'],
      },
      {
        id: '5',
        name: 'Astro Bot',
        slug: 'astro-bot',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co86v2.jpg',
        communityScore: 94,
        criticScore: 94,
        platforms: ['PS5'],
        genres: ['Plataformas 3D'],
      },
      {
        id: '6',
        name: "Baldur's Gate 3",
        slug: 'baldurs-gate-3',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.jpg',
        communityScore: 96,
        criticScore: 96,
        platforms: ['PC', 'PS5', 'Xbox Series X'],
        genres: ['CRPG'],
      },
      {
        id: '7',
        name: 'Silent Hill 2',
        slug: 'silent-hill-2-remake',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5p1d.jpg',
        communityScore: 88,
        criticScore: 86,
        platforms: ['PC', 'PS5'],
        genres: ['Survival Horror'],
      },
      {
        id: '8',
        name: 'Final Fantasy VII Rebirth',
        slug: 'final-fantasy-vii-rebirth',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6t8i.jpg',
        communityScore: 92,
        criticScore: 92,
        platforms: ['PS5'],
        genres: ['Action RPG'],
      },
      {
        id: '9',
        name: 'The Witcher 3: Wild Hunt',
        slug: 'the-witcher-3-wild-hunt',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg',
        communityScore: 97,
        criticScore: 95,
        platforms: ['PC', 'PS5', 'Xbox Series X', 'Switch'],
        genres: ['RPG'],
      },
      {
        id: '10',
        name: 'Cyberpunk 2077: Phantom Liberty',
        slug: 'cyberpunk-2077-phantom-liberty',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6pud.jpg',
        communityScore: 90,
        criticScore: 89,
        platforms: ['PC', 'PS5', 'Xbox Series X'],
        genres: ['Sci-Fi', 'RPG'],
      },
    ];

    const mockUsers = [
      {
        id: 'u1',
        username: 'tomi_critic',
        displayName: 'Tomás Reyes',
        avatarUrl: null,
        role: 'CRITIC',
        criticBadge: 'EXPERT',
        criticTier: 'EXPERT',
      },
      {
        id: 'u2',
        username: 'gamer_retro',
        displayName: 'Retro Pixel',
        avatarUrl: null,
        role: 'USER',
        criticBadge: null,
        criticTier: null,
      },
    ];

    const mockLists = [
      {
        id: 'l1',
        title: 'Top 10 Mejores RPGs de la Historia',
        description: 'Una selección curada de las mayores obras maestras del rol.',
        isRanked: true,
        user: { username: 'tomi_critic', displayName: 'Tomás Reyes' },
        gameCount: 10,
        likeCount: 42,
      },
    ];

    const mockNews = [
      {
        id: 'n1',
        title: 'Grand Theft Auto VI revela nuevos detalles de su tecnología y físicas',
        category: 'releases',
        coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e',
        publishedAt: new Date().toISOString(),
      },
    ];

    return {
      games: mockGames.filter((g) => g.name.toLowerCase().includes(s) || g.slug.toLowerCase().includes(s)),
      users: mockUsers.filter(
        (u) => u.username.toLowerCase().includes(s) || u.displayName.toLowerCase().includes(s),
      ),
      lists: mockLists.filter((l) => l.title.toLowerCase().includes(s)),
      news: mockNews.filter((n) => n.title.toLowerCase().includes(s)),
    };
  }
}
