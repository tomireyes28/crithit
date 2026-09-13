import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ListsService } from './lists.service';
import {
  CreateListDto,
  UpdateListDto,
  AddListEntryDto,
  ReorderListEntriesDto,
  ListQueryDto,
} from './dto/list.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Lists')
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva lista de videojuegos' })
  @ApiResponse({ status: 201, description: 'Lista creada exitosamente' })
  async createList(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateListDto,
  ) {
    return this.listsService.createList(userId, dto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Explorar listas públicas comunitarias' })
  @ApiResponse({ status: 200, description: 'Listas públicas paginadas' })
  async getPublicLists(
    @Query() query: ListQueryDto,
    @CurrentUser('id') currentUserId?: string,
  ) {
    return this.listsService.getPublicLists(query, currentUserId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener todas las listas creadas por el usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Listas del usuario' })
  async getMyLists(@CurrentUser('id') userId: string) {
    return this.listsService.getMyLists(userId);
  }

  @Get('user/:username')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Obtener las listas públicas de un usuario por su nombre de usuario' })
  @ApiResponse({ status: 200, description: 'Listas del usuario' })
  async getUserLists(
    @Param('username') username: string,
    @CurrentUser('id') currentUserId?: string,
  ) {
    return this.listsService.getUserListsByUsername(username, currentUserId);
  }

  @Get('game/:gameId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar en cuáles listas del usuario ya está incluido este juego' })
  @ApiResponse({ status: 200, description: 'Resumen de pertenencia a listas' })
  async getUserListsForGame(
    @CurrentUser('id') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.listsService.getUserListsForGame(userId, gameId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Obtener el detalle completo de una lista con sus videojuegos' })
  @ApiResponse({ status: 200, description: 'Detalle de la lista' })
  async getListById(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId?: string,
  ) {
    return this.listsService.getListById(id, currentUserId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar metadatos de una lista' })
  @ApiResponse({ status: 200, description: 'Lista actualizada' })
  async updateList(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateListDto,
  ) {
    return this.listsService.updateList(userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una lista' })
  @ApiResponse({ status: 200, description: 'Lista eliminada' })
  async deleteList(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.listsService.deleteList(user.id, id, user.role);
  }

  @Post(':id/entries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Añadir un videojuego a una lista' })
  @ApiResponse({ status: 201, description: 'Juego añadido' })
  async addEntry(
    @CurrentUser('id') userId: string,
    @Param('id') listId: string,
    @Body() dto: AddListEntryDto,
  ) {
    return this.listsService.addEntry(userId, listId, dto);
  }

  @Delete(':id/entries/:gameId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover un videojuego de una lista' })
  @ApiResponse({ status: 200, description: 'Juego removido' })
  async removeEntry(
    @CurrentUser('id') userId: string,
    @Param('id') listId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.listsService.removeEntry(userId, listId, gameId);
  }

  @Put(':id/entries/reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reordenar posiciones de videojuegos en una lista' })
  @ApiResponse({ status: 200, description: 'Entradas reordenadas' })
  async reorderEntries(
    @CurrentUser('id') userId: string,
    @Param('id') listId: string,
    @Body() dto: ReorderListEntriesDto,
  ) {
    return this.listsService.reorderEntries(userId, listId, dto);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dar o quitar Me Gusta a una lista (Toggle)' })
  @ApiResponse({ status: 200, description: 'Estado del like actualizado' })
  async toggleLike(
    @CurrentUser('id') userId: string,
    @Param('id') listId: string,
  ) {
    return this.listsService.toggleLike(userId, listId);
  }
}
