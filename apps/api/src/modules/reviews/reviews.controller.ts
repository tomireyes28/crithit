import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, ReviewQueryDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publicar o actualizar una reseña y puntuación para un videojuego' })
  @ApiResponse({ status: 201, description: 'Reseña guardada y puntuaciones recalculadas' })
  async upsertReview(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.upsertReview(
      user.id,
      user.role,
      user.criticTier,
      dto,
    );
  }

  @Get('game/:gameId')
  @ApiOperation({ summary: 'Obtener reseñas paginadas de un videojuego' })
  @ApiResponse({ status: 200, description: 'Lista paginada de opiniones' })
  async findByGame(
    @Param('gameId') gameId: string,
    @Query() query: ReviewQueryDto,
    @Req() req: any,
  ) {
    // Si hay un token en la cabecera, extraemos el userId para saber si dio like
    const userId = req.user?.id;
    return this.reviewsService.findByGame(gameId, query, userId);
  }

  @Get('game/:gameId/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener la reseña del usuario autenticado para este juego' })
  @ApiResponse({ status: 200, description: 'Reseña del usuario o null' })
  async findMyReview(
    @CurrentUser('id') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.reviewsService.findUserReviewForGame(userId, gameId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reseña por su ID' })
  @ApiResponse({ status: 200, description: 'Detalle de la reseña' })
  async findById(@Param('id') id: string, @Req() req: any) {
    return this.reviewsService.findById(id, req.user?.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una reseña propia' })
  @ApiResponse({ status: 200, description: 'Reseña eliminada con éxito' })
  async deleteReview(@CurrentUser() user: any, @Param('id') id: string) {
    return this.reviewsService.deleteReview(user.id, id, user.role);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dar o quitar me gusta a una reseña (toggle)' })
  @ApiResponse({ status: 200, description: 'Estado actualizado del like' })
  async toggleLike(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.reviewsService.toggleLike(userId, id);
  }
}
