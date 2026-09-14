import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CriticsService } from './critics.service';
import { SubmitExamDto, StartExamDto } from './dto/critic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Critics')
@Controller('critics')
export class CriticsController {
  constructor(private readonly criticsService: CriticsService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar el estado de acreditación de crítico del usuario' })
  @ApiResponse({ status: 200, description: 'Rango actual, fecha de verificación y estadísticas de intentos' })
  async getStatus(@CurrentUser('id') userId: string) {
    return this.criticsService.getStatus(userId);
  }

  @Post('exam/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Iniciar un intento de examen y obtener 20 preguntas aleatorias' })
  @ApiResponse({ status: 200, description: 'Preguntas del examen sin soluciones expuestas' })
  async startExam(
    @CurrentUser('id') userId: string,
    @Body() dto: StartExamDto,
  ) {
    return this.criticsService.startExam(userId, dto);
  }

  @Post('exam/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enviar las respuestas del examen para su corrección y acreditación' })
  @ApiResponse({ status: 200, description: 'Resultado del examen, desglose pedagógico y rango asignado' })
  async submitExam(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitExamDto,
  ) {
    return this.criticsService.submitExam(userId, dto);
  }

  @Get('exam/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar el historial de intentos de examen del usuario' })
  @ApiResponse({ status: 200, description: 'Historial cronológico de intentos de examen' })
  async getHistory(@CurrentUser('id') userId: string) {
    return this.criticsService.getHistory(userId);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Consultar los críticos acreditados más activos de la comunidad' })
  @ApiResponse({ status: 200, description: 'Lista pública de críticos destacados' })
  async getLeaderboard() {
    return this.criticsService.getLeaderboard();
  }
}
