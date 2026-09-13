import {
  IsInt,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  IsNotEmpty,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID del videojuego en Supabase' })
  @IsString()
  @IsNotEmpty({ message: 'El identificador del juego es requerido' })
  gameId: string;

  @ApiProperty({ description: 'Puntuación en la escala CritHit de 0 a 100', minimum: 0, maximum: 100 })
  @IsInt({ message: 'La puntuación debe ser un número entero' })
  @Min(0, { message: 'La puntuación mínima es 0' })
  @Max(100, { message: 'La puntuación máxima es 100' })
  @Type(() => Number)
  score: number;

  @ApiPropertyOptional({ description: 'Título de la reseña' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Cuerpo u opinión escrita' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ description: 'Plataforma en la que se jugó' })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({ description: 'Horas jugadas al momento de calificar' })
  @IsOptional()
  @Min(0, { message: 'Las horas no pueden ser negativas' })
  @Type(() => Number)
  playtimeAtReview?: number;

  @ApiPropertyOptional({ description: 'Indica si contiene spoilers' })
  @IsOptional()
  @IsBoolean()
  containsSpoilers?: boolean;

  @ApiPropertyOptional({ description: 'Indica si recomienda el juego' })
  @IsOptional()
  @IsBoolean()
  recommends?: boolean;
}

export class UpdateReviewDto {
  @ApiPropertyOptional({ description: 'Puntuación en escala de 0 a 100' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  score?: number;

  @ApiPropertyOptional({ description: 'Título de la reseña' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Cuerpo u opinión escrita' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ description: 'Plataforma jugada' })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({ description: 'Horas jugadas' })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  playtimeAtReview?: number;

  @ApiPropertyOptional({ description: 'Indica si contiene spoilers' })
  @IsOptional()
  @IsBoolean()
  containsSpoilers?: boolean;

  @ApiPropertyOptional({ description: 'Indica si recomienda el juego' })
  @IsOptional()
  @IsBoolean()
  recommends?: boolean;
}

export class ReviewQueryDto {
  @ApiPropertyOptional({ description: 'Número de página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Límite por página', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Criterio de ordenamiento',
    enum: ['popular', 'recent', 'highest', 'lowest'],
    default: 'popular',
  })
  @IsOptional()
  @IsIn(['popular', 'recent', 'highest', 'lowest'])
  sort?: 'popular' | 'recent' | 'highest' | 'lowest' = 'popular';

  @ApiPropertyOptional({ description: 'Filtrar solo críticas acreditadas', default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  criticOnly?: boolean = false;
}
