import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { GameQueryDto } from './dto/game-query.dto';

@ApiTags('Games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({ summary: 'Explorar catálogo de juegos con filtros, búsqueda y paginación' })
  @ApiResponse({ status: 200, description: 'Lista paginada de juegos' })
  async findAll(@Query() query: GameQueryDto) {
    return this.gamesService.findAll(query);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Obtener los juegos en mayor tendencia actual' })
  @ApiResponse({ status: 200, description: 'Juegos en tendencia' })
  async getTrending(@Query('limit') limit?: number) {
    return this.gamesService.getTrending(limit ? Number(limit) : 8);
  }

  @Get('top-rated')
  @ApiOperation({ summary: 'Obtener los juegos con mayor puntuación' })
  @ApiResponse({ status: 200, description: 'Juegos top rated' })
  async getTopRated(@Query('limit') limit?: number) {
    return this.gamesService.getTopRated(limit ? Number(limit) : 8);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Obtener próximos lanzamientos de videojuegos' })
  @ApiResponse({ status: 200, description: 'Próximos lanzamientos' })
  async getUpcoming(@Query('limit') limit?: number) {
    return this.gamesService.getUpcoming(limit ? Number(limit) : 8);
  }

  @Get('genres')
  @ApiOperation({ summary: 'Obtener lista de géneros disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de géneros' })
  async getGenres() {
    return this.gamesService.getGenres();
  }

  @Get('platforms')
  @ApiOperation({ summary: 'Obtener lista de plataformas disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de plataformas' })
  async getPlatforms() {
    return this.gamesService.getPlatforms();
  }

  @Get(':slug')

  @ApiOperation({ summary: 'Obtener la ficha detallada de un juego por su slug' })
  @ApiResponse({ status: 200, description: 'Ficha completa del juego' })
  @ApiResponse({ status: 404, description: 'Juego no encontrado' })
  async findBySlug(@Param('slug') slug: string) {
    return this.gamesService.findBySlug(slug);
  }
}
