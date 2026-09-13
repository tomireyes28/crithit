import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlayLogsService } from './play-logs.service';
import { CreatePlayLogDto, PlayLogQueryDto } from './dto/play-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('PlayLogs')
@Controller('play-logs')
export class PlayLogsController {
  constructor(private readonly playLogsService: PlayLogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar una nueva partida en el diario de juego' })
  @ApiResponse({ status: 201, description: 'Partida guardada exitosamente en el diario' })
  async logPlay(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePlayLogDto,
  ) {
    return this.playLogsService.logPlay(userId, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el diario personal de partidas del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Historial y estadísticas de juego del usuario' })
  async getUserLogs(
    @CurrentUser('id') userId: string,
    @Query() query: PlayLogQueryDto,
  ) {
    return this.playLogsService.getUserLogs(userId, query);
  }

  @Get('game/:gameId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el estado activo actual del usuario para un juego' })
  @ApiResponse({ status: 200, description: 'Estado activo o null' })
  async getUserGameStatus(
    @CurrentUser('id') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.playLogsService.getUserActiveStatusForGame(userId, gameId);
  }

  @Get('game/:gameId')
  @ApiOperation({ summary: 'Obtener partidas recientes registradas por la comunidad para este juego' })
  @ApiResponse({ status: 200, description: 'Partidas comunitarias' })
  async getGameCommunityLogs(
    @Param('gameId') gameId: string,
    @Query('limit') limit?: number,
  ) {
    return this.playLogsService.getGameCommunityLogs(
      gameId,
      limit ? Number(limit) : 8,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una entrada del diario de juego' })
  @ApiResponse({ status: 200, description: 'Entrada eliminada correctamente' })
  async deleteLog(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.playLogsService.deleteLog(userId, id);
  }
}
