import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class GameQueryDto {
  @ApiPropertyOptional({ description: 'Término de búsqueda por nombre', example: 'Zelda' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por slug de género', example: 'rpg' })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({ description: 'Filtrar por slug de plataforma', example: 'pc' })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({
    description: 'Criterio de ordenamiento',
    enum: ['trending', 'score', 'release', 'name'],
    default: 'trending',
  })
  @IsOptional()
  @IsIn(['trending', 'score', 'release', 'name'])
  sort?: 'trending' | 'score' | 'release' | 'name' = 'trending';

  @ApiPropertyOptional({ description: 'Número de página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Elementos por página', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
