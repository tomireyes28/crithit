import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateListDto,
  UpdateListDto,
  AddListEntryDto,
  ReorderListEntriesDto,
  ListQueryDto,
  InitialGameEntryDto,
} from './dto/list.dto';

@Injectable()
export class ListsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear una nueva lista de videojuegos con entradas iniciales opcionales
   */
  async createList(userId: string, dto: CreateListDto) {
    const isRanked = dto.isRanked ?? false;
    const isPublic = dto.isPublic ?? true;
    const tags = dto.tags ? Array.from(new Set(dto.tags.map((t) => t.trim()))) : [];

    // Validar y filtrar duplicados de juegos iniciales
    const initialGames: InitialGameEntryDto[] = dto.initialGames || [];
    const uniqueGames: InitialGameEntryDto[] = [];
    const seenIds = new Set<string>();

    for (const item of initialGames) {
      if (!seenIds.has(item.gameId)) {
        seenIds.add(item.gameId);
        uniqueGames.push(item);
      }
    }

    const createdList = await this.prisma.gameList.create({
      data: {
        userId,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        coverImageUrl: dto.coverImageUrl?.trim() || null,
        isRanked,
        isPublic,
        tags,
        entryCount: uniqueGames.length,
        entries: {
          create: uniqueGames.map((item, index) => ({
            gameId: item.gameId,
            position: index + 1,
            note: item.note?.trim() || null,
          })),
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
          },
        },
        entries: {
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
    });

    return createdList;
  }

  /**
   * Explorar listas públicas comunitarias con paginación, filtros y preview de carátulas
   */
  async getPublicLists(query: ListQueryDto, currentUserId?: string) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(60, Math.max(1, query.limit || 18));
    const skip = (page - 1) * limit;

    const where: any = {
      isPublic: true,
    };

    if (query.search?.trim()) {
      where.OR = [
        { title: { contains: query.search.trim(), mode: 'insensitive' } },
        { description: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }

    if (query.tag?.trim()) {
      where.tags = {
        has: query.tag.trim(),
      };
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    let orderBy: any;
    switch (query.sort) {
      case 'recent':
        orderBy = { createdAt: 'desc' };
        break;
      case 'entries':
        orderBy = [{ entryCount: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'popular':
      default:
        orderBy = [{ likeCount: 'desc' }, { entryCount: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    const [total, rawLists] = await Promise.all([
      this.prisma.gameList.count({ where }),
      this.prisma.gameList.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
      }),
    ]);

    let likedListIds = new Set<string>();
    if (currentUserId && rawLists.length > 0) {
      const listIds = rawLists.map((l) => l.id);
      const likes = await this.prisma.listLike.findMany({
        where: {
          userId: currentUserId,
          listId: { in: listIds },
        },
        select: { listId: true },
      });
      likedListIds = new Set(likes.map((l) => l.listId));
    }

    const lists = rawLists.map((list) => {
      const previewCovers = list.entries
        .map((e) => e.game?.coverUrl)
        .filter((url): url is string => Boolean(url));

      return {
        id: list.id,
        userId: list.userId,
        user: list.user,
        title: list.title,
        description: list.description,
        coverImageUrl: list.coverImageUrl,
        isRanked: list.isRanked,
        isPublic: list.isPublic,
        tags: list.tags,
        entryCount: list.entryCount,
        likeCount: list.likeCount,
        hasLiked: likedListIds.has(list.id),
        previewCovers,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
      };
    });

    return {
      data: lists,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener las listas creadas por el usuario autenticado (públicas y privadas)
   */
  async getMyLists(userId: string) {
    const rawLists = await this.prisma.gameList.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
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
    });

    let likedListIds = new Set<string>();
    if (rawLists.length > 0) {
      const listIds = rawLists.map((l) => l.id);
      const likes = await this.prisma.listLike.findMany({
        where: {
          userId,
          listId: { in: listIds },
        },
        select: { listId: true },
      });
      likedListIds = new Set(likes.map((l) => l.listId));
    }

    return rawLists.map((list) => ({
      id: list.id,
      userId: list.userId,
      user: list.user,
      title: list.title,
      description: list.description,
      coverImageUrl: list.coverImageUrl,
      isRanked: list.isRanked,
      isPublic: list.isPublic,
      tags: list.tags,
      entryCount: list.entryCount,
      likeCount: list.likeCount,
      hasLiked: likedListIds.has(list.id),
      previewCovers: list.entries
        .map((e) => e.game?.coverUrl)
        .filter((url): url is string => Boolean(url)),
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    }));
  }

  /**
   * Obtener listas públicas de un usuario por su username (para pestaña en perfil)
   */
  async getUserListsByUsername(username: string, currentUserId?: string) {
    const targetUser = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!targetUser) {
      throw new NotFoundException(`Usuario '${username}' no encontrado`);
    }

    const isOwner = currentUserId === targetUser.id;
    const where: any = { userId: targetUser.id };
    if (!isOwner) {
      where.isPublic = true;
    }

    const rawLists = await this.prisma.gameList.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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
    });

    let likedListIds = new Set<string>();
    if (currentUserId && rawLists.length > 0) {
      const listIds = rawLists.map((l) => l.id);
      const likes = await this.prisma.listLike.findMany({
        where: {
          userId: currentUserId,
          listId: { in: listIds },
        },
        select: { listId: true },
      });
      likedListIds = new Set(likes.map((l) => l.listId));
    }

    return rawLists.map((list) => ({
      id: list.id,
      userId: list.userId,
      user: list.user,
      title: list.title,
      description: list.description,
      coverImageUrl: list.coverImageUrl,
      isRanked: list.isRanked,
      isPublic: list.isPublic,
      tags: list.tags,
      entryCount: list.entryCount,
      likeCount: list.likeCount,
      hasLiked: likedListIds.has(list.id),
      previewCovers: list.entries
        .map((e) => e.game?.coverUrl)
        .filter((url): url is string => Boolean(url)),
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    }));
  }

  /**
   * Obtener detalle completo de una lista con todos sus juegos ordenados
   */
  async getListById(id: string, currentUserId?: string) {
    const list = await this.prisma.gameList.findUnique({
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
            bio: true,
          },
        },
        entries: {
          orderBy: { position: 'asc' },
          include: {
            game: {
              select: {
                id: true,
                slug: true,
                name: true,
                coverUrl: true,
                backdropUrl: true,
                firstReleaseDate: true,
                communityScore: true,
                criticScore: true,
                metacriticScore: true,
                genres: {
                  select: {
                    genre: {
                      select: { id: true, name: true, slug: true },
                    },
                  },
                },
                platforms: {
                  select: {
                    platform: {
                      select: { id: true, name: true, abbreviation: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!list) {
      throw new NotFoundException('Lista no encontrada');
    }

    // Verificar visibilidad privada
    if (!list.isPublic && list.userId !== currentUserId) {
      throw new ForbiddenException('Esta lista es privada');
    }

    let hasLiked = false;
    if (currentUserId) {
      const like = await this.prisma.listLike.findUnique({
        where: {
          userId_listId: {
            userId: currentUserId,
            listId: id,
          },
        },
        select: { id: true },
      });
      hasLiked = Boolean(like);
    }

    // Formatear géneros y plataformas para aplanar la relación pivot
    const formattedEntries = list.entries.map((entry) => ({
      id: entry.id,
      listId: entry.listId,
      gameId: entry.gameId,
      position: entry.position,
      note: entry.note,
      game: {
        ...entry.game,
        genres: entry.game.genres.map((g) => g.genre),
        platforms: entry.game.platforms.map((p) => p.platform),
      },
    }));

    return {
      id: list.id,
      userId: list.userId,
      user: list.user,
      title: list.title,
      description: list.description,
      coverImageUrl: list.coverImageUrl,
      isRanked: list.isRanked,
      isPublic: list.isPublic,
      tags: list.tags,
      entryCount: list.entryCount,
      likeCount: list.likeCount,
      hasLiked,
      entries: formattedEntries,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    };
  }

  /**
   * Actualizar metadatos de la lista (solo dueño)
   */
  async updateList(userId: string, id: string, dto: UpdateListDto) {
    const list = await this.prisma.gameList.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!list) {
      throw new NotFoundException('Lista no encontrada');
    }

    if (list.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para editar esta lista');
    }

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description?.trim() || null;
    if (dto.coverImageUrl !== undefined) data.coverImageUrl = dto.coverImageUrl?.trim() || null;
    if (dto.isRanked !== undefined) data.isRanked = dto.isRanked;
    if (dto.isPublic !== undefined) data.isPublic = dto.isPublic;
    if (dto.tags !== undefined) {
      data.tags = Array.from(new Set(dto.tags.map((t) => t.trim())));
    }

    return this.prisma.gameList.update({
      where: { id },
      data,
    });
  }

  /**
   * Eliminar lista (dueño o admin)
   */
  async deleteList(userId: string, id: string, userRole?: string) {
    const list = await this.prisma.gameList.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!list) {
      throw new NotFoundException('Lista no encontrada');
    }

    if (list.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('No tienes permisos para eliminar esta lista');
    }

    await this.prisma.gameList.delete({
      where: { id },
    });

    return { success: true, message: 'Lista eliminada correctamente' };
  }

  /**
   * Añadir un juego a la lista
   */
  async addEntry(userId: string, listId: string, dto: AddListEntryDto) {
    const list = await this.prisma.gameList.findUnique({
      where: { id: listId },
      select: { id: true, userId: true },
    });

    if (!list) {
      throw new NotFoundException('Lista no encontrada');
    }

    if (list.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para modificar esta lista');
    }

    // Verificar si el juego existe
    const game = await this.prisma.game.findUnique({
      where: { id: dto.gameId },
      select: { id: true },
    });

    if (!game) {
      throw new NotFoundException('Juego no encontrado');
    }

    // Verificar si ya está en la lista
    const existing = await this.prisma.gameListEntry.findUnique({
      where: {
        listId_gameId: {
          listId,
          gameId: dto.gameId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Este juego ya pertenece a la lista');
    }

    // Calcular posición
    let position = dto.position;
    if (!position) {
      const maxPosition = await this.prisma.gameListEntry.aggregate({
        where: { listId },
        _max: { position: true },
      });
      position = (maxPosition._max.position || 0) + 1;
    }

    const [entry] = await this.prisma.$transaction([
      this.prisma.gameListEntry.create({
        data: {
          listId,
          gameId: dto.gameId,
          position,
          note: dto.note?.trim() || null,
        },
        include: {
          game: {
            select: {
              id: true,
              slug: true,
              name: true,
              coverUrl: true,
              communityScore: true,
            },
          },
        },
      }),
      this.prisma.gameList.update({
        where: { id: listId },
        data: { entryCount: { increment: 1 } },
      }),
    ]);

    return entry;
  }

  /**
   * Eliminar un juego de la lista
   */
  async removeEntry(userId: string, listId: string, gameId: string) {
    const list = await this.prisma.gameList.findUnique({
      where: { id: listId },
      select: { id: true, userId: true },
    });

    if (!list) {
      throw new NotFoundException('Lista no encontrada');
    }

    if (list.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para modificar esta lista');
    }

    const existing = await this.prisma.gameListEntry.findUnique({
      where: {
        listId_gameId: {
          listId,
          gameId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('El juego no está en la lista');
    }

    await this.prisma.$transaction([
      this.prisma.gameListEntry.delete({
        where: {
          listId_gameId: {
            listId,
            gameId,
          },
        },
      }),
      this.prisma.gameList.update({
        where: { id: listId },
        data: { entryCount: { decrement: 1 } },
      }),
    ]);

    return { success: true, message: 'Juego removido de la lista' };
  }

  /**
   * Reordenar entradas de una lista
   */
  async reorderEntries(userId: string, listId: string, dto: ReorderListEntriesDto) {
    const list = await this.prisma.gameList.findUnique({
      where: { id: listId },
      select: { id: true, userId: true },
    });

    if (!list) {
      throw new NotFoundException('Lista no encontrada');
    }

    if (list.userId !== userId) {
      throw new ForbiddenException('No tienes permisos para modificar esta lista');
    }

    await this.prisma.$transaction(
      dto.entries.map((item) =>
        this.prisma.gameListEntry.update({
          where: {
            listId_gameId: {
              listId,
              gameId: item.gameId,
            },
          },
          data: {
            position: item.position,
            ...(item.note !== undefined ? { note: item.note?.trim() || null } : {}),
          },
        }),
      ),
    );

    return { success: true, message: 'Posiciones actualizadas' };
  }

  /**
   * Dar o quitar Me Gusta a una lista (Toggle)
   */
  async toggleLike(userId: string, listId: string) {
    const list = await this.prisma.gameList.findUnique({
      where: { id: listId },
      select: { id: true, isPublic: true, userId: true },
    });

    if (!list) {
      throw new NotFoundException('Lista no encontrada');
    }

    if (!list.isPublic && list.userId !== userId) {
      throw new ForbiddenException('No puedes dar like a una lista privada ajena');
    }

    const existingLike = await this.prisma.listLike.findUnique({
      where: {
        userId_listId: {
          userId,
          listId,
        },
      },
    });

    if (existingLike) {
      // Quitar like
      const [, updatedList] = await this.prisma.$transaction([
        this.prisma.listLike.delete({
          where: {
            userId_listId: {
              userId,
              listId,
            },
          },
        }),
        this.prisma.gameList.update({
          where: { id: listId },
          data: { likeCount: { decrement: 1 } },
          select: { likeCount: true },
        }),
      ]);

      return { hasLiked: false, likeCount: Math.max(0, updatedList.likeCount) };
    } else {
      // Dar like
      const [, updatedList] = await this.prisma.$transaction([
        this.prisma.listLike.create({
          data: {
            userId,
            listId,
          },
        }),
        this.prisma.gameList.update({
          where: { id: listId },
          data: { likeCount: { increment: 1 } },
          select: { likeCount: true },
        }),
      ]);

      return { hasLiked: true, likeCount: updatedList.likeCount };
    }
  }

  /**
   * Devuelve las listas del usuario indicando si ya contienen un juego específico
   * (usado para el modal AddToListModal en el ActionDock)
   */
  async getUserListsForGame(userId: string, gameId: string) {
    const lists = await this.prisma.gameList.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        isRanked: true,
        isPublic: true,
        entryCount: true,
        entries: {
          where: { gameId },
          select: { id: true },
        },
      },
    });

    return lists.map((list) => ({
      id: list.id,
      title: list.title,
      isRanked: list.isRanked,
      isPublic: list.isPublic,
      entryCount: list.entryCount,
      containsGame: list.entries.length > 0,
    }));
  }
}
