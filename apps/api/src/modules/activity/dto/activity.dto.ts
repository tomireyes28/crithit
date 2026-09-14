import { IsOptional, IsInt, Min, Max, IsIn, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ActivityQueryDto {
  @ApiPropertyOptional({ description: 'Número de página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Límite de actividades por página', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de actividad',
    enum: ['ALL', 'REVIEWS', 'LOGS', 'LISTS'],
    default: 'ALL',
  })
  @IsOptional()
  @IsIn(['ALL', 'REVIEWS', 'LOGS', 'LISTS'])
  type?: 'ALL' | 'REVIEWS' | 'LOGS' | 'LISTS' = 'ALL';
}
