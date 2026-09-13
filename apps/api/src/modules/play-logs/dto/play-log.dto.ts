import {
  IsEnum,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsInt,
  IsDateString,
  Min,
  Max,
  IsNotEmpty,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlayStatus } from '@prisma/client';

export class CreatePlayLogDto {
  @ApiProperty({ description: 'ID del videojuego en Supabase' })
  @IsString()
  @IsNotEmpty({ message: 'El identificador del juego es requerido' })
  gameId: string;

  @ApiProperty({
    description: 'Estado de la partida',
    enum: [
      'PLAYING',
      'BACKLOG',
      'COMPLETED',
      'MASTERED',
      'DROPPED',
      'SHELVED',
      'WISHLIST',
    ],
  })
  @IsEnum(
    [
      'PLAYING',
      'BACKLOG',
      'COMPLETED',
      'MASTERED',
      'DROPPED',
      'SHELVED',
      'WISHLIST',
    ],
    {
      message:
        'El estado debe ser: PLAYING, BACKLOG, COMPLETED, MASTERED, DROPPED, SHELVED o WISHLIST',
    },
  )
  status: PlayStatus;

  @ApiPropertyOptional({ description: 'Fecha de la sesión o registro (ISO string o YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  logDate?: string;

  @ApiPropertyOptional({ description: 'Fecha en que comenzó a jugar' })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional({ description: 'Fecha en que terminó el juego' })
  @IsOptional()
  @IsDateString()
  finishedAt?: string;

  @ApiPropertyOptional({ description: 'Plataforma en la que se jugó' })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({ description: 'Horas jugadas dedicadas' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Las horas no pueden ser negativas' })
  @Max(10000, { message: 'Horas excedidas' })
  @Type(() => Number)
  hoursPlayed?: number;

  @ApiPropertyOptional({ description: 'Indica si es una rejugada', default: false })
  @IsOptional()
  @IsBoolean()
  isReplay?: boolean;

  @ApiPropertyOptional({ description: 'Número de rejugada', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  replayCount?: number;

  @ApiPropertyOptional({ description: 'Notas o bitácora de la partida' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePlayLogDto {
  @ApiPropertyOptional({
    description: 'Estado de la partida',
    enum: [
      'PLAYING',
      'BACKLOG',
      'COMPLETED',
      'MASTERED',
      'DROPPED',
      'SHELVED',
      'WISHLIST',
    ],
  })
  @IsOptional()
  @IsEnum([
    'PLAYING',
    'BACKLOG',
    'COMPLETED',
    'MASTERED',
    'DROPPED',
    'SHELVED',
    'WISHLIST',
  ])
  status?: PlayStatus;

  @ApiPropertyOptional({ description: 'Fecha de la sesión' })
  @IsOptional()
  @IsDateString()
  logDate?: string;

  @ApiPropertyOptional({ description: 'Plataforma en la que se jugó' })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({ description: 'Horas jugadas' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  hoursPlayed?: number;

  @ApiPropertyOptional({ description: 'Indica si es una rejugada' })
  @IsOptional()
  @IsBoolean()
  isReplay?: boolean;

  @ApiPropertyOptional({ description: 'Notas o bitácora' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class PlayLogQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por estado' })
  @IsOptional()
  @IsEnum([
    'PLAYING',
    'BACKLOG',
    'COMPLETED',
    'MASTERED',
    'DROPPED',
    'SHELVED',
    'WISHLIST',
  ])
  status?: PlayStatus;

  @ApiPropertyOptional({ description: 'Número de página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Límite por página', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Criterio de ordenamiento',
    enum: ['date_desc', 'date_asc', 'hours_desc'],
    default: 'date_desc',
  })
  @IsOptional()
  @IsIn(['date_desc', 'date_asc', 'hours_desc'])
  sort?: 'date_desc' | 'date_asc' | 'hours_desc' = 'date_desc';
}
