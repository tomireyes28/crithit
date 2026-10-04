import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CacheService } from './cache.service';

@ApiTags('Cache')
@Controller('cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Obtener métricas y estadísticas del sistema de caché' })
  @ApiResponse({ status: 200, description: 'Estadísticas de aciertos (hits), fallos (misses) y estado' })
  getStats() {
    return this.cacheService.getStats();
  }

  @Post('clear')
  @ApiOperation({ summary: 'Limpiar o invalidar la caché del sistema' })
  @ApiResponse({ status: 200, description: 'Caché invalidada' })
  async clearAll() {
    await this.cacheService.delByPattern('*');
    return { success: true, message: 'Caché invalidada completamente' };
  }
}
