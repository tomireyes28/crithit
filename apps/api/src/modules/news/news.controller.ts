import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { NewsQueryDto } from './dto/news.dto';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener lista paginada de noticias con filtros y búsqueda' })
  @ApiResponse({ status: 200, description: 'Artículos de noticias paginados' })
  async findAll(@Query() query: NewsQueryDto) {
    return this.newsService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Obtener el artículo de noticias destacado para la cabecera' })
  @ApiResponse({ status: 200, description: 'Artículo destacado con imagen de alta resolución' })
  async getFeatured() {
    return this.newsService.getFeatured();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de un artículo de noticias por su ID' })
  @ApiResponse({ status: 200, description: 'Artículo de noticias completo' })
  @ApiResponse({ status: 404, description: 'Artículo no encontrado' })
  async findById(@Param('id') id: string) {
    return this.newsService.findById(id);
  }
}
