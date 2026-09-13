import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitialGameEntryDto {
  @ApiProperty({ description: 'ID del juego en Supabase' })
  @IsString()
  @IsNotEmpty({ message: 'El identificador del juego es requerido' })
  gameId: string;

  @ApiPropertyOptional({ description: 'Nota o comentario personal sobre este juego en la lista' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La nota no puede exceder 500 caracteres' })
  note?: string;
}

export class CreateListDto {
  @ApiProperty({ description: 'Título de la lista', example: 'Top 10 RPGs de la Historia' })
  @IsString()
  @IsNotEmpty({ message: 'El título de la lista es requerido' })
  @MinLength(2, { message: 'El título debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El título no puede exceder 100 caracteres' })
  title: string;

  @ApiPropertyOptional({ description: 'Descripción o sinopsis de la lista' })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'La descripción no puede exceder 2000 caracteres' })
  description?: string;

  @ApiPropertyOptional({ description: 'URL de portada personalizada opcional' })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional({ description: 'Indica si es una lista ordenada (Ranked / Numerada)', default: false })
  @IsOptional()
  @IsBoolean()
  isRanked?: boolean;

  @ApiPropertyOptional({ description: 'Indica si la lista es pública o privada', default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Etiquetas temáticas', example: ['RPG', 'Favoritos', 'GOTY'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Juegos iniciales a incluir en la lista', type: [InitialGameEntryDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InitialGameEntryDto)
  initialGames?: InitialGameEntryDto[];
}

export class UpdateListDto {
  @ApiPropertyOptional({ description: 'Título de la lista' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ description: 'Descripción de la lista' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'URL de imagen de portada' })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional({ description: 'Indica si la lista es ordenada' })
  @IsOptional()
  @IsBoolean()
  isRanked?: boolean;

  @ApiPropertyOptional({ description: 'Indica si la lista es pública' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Etiquetas temáticas' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class AddListEntryDto {
  @ApiProperty({ description: 'ID del juego a añadir' })
  @IsString()
  @IsNotEmpty({ message: 'El identificador del juego es requerido' })
  gameId: string;

  @ApiPropertyOptional({ description: 'Posición ordinal en la lista' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  position?: number;

  @ApiPropertyOptional({ description: 'Comentario o justificación del creador' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ReorderItemDto {
  @ApiProperty({ description: 'ID del juego' })
  @IsString()
  @IsNotEmpty()
  gameId: string;

  @ApiProperty({ description: 'Nueva posición ordinal' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  position: number;

  @ApiPropertyOptional({ description: 'Nota actualizada' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ReorderListEntriesDto {
  @ApiProperty({ description: 'Lista de juegos con sus nuevas posiciones', type: [ReorderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  entries: ReorderItemDto[];
}

export class ListQueryDto {
  @ApiPropertyOptional({ description: 'Número de página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Límite de resultados por página', default: 18 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(60)
  limit?: number = 18;

  @ApiPropertyOptional({ description: 'Búsqueda por título o descripción' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por etiqueta temática' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({
    description: 'Criterio de ordenamiento',
    enum: ['popular', 'recent', 'entries'],
    default: 'popular',
  })
  @IsOptional()
  @IsIn(['popular', 'recent', 'entries'])
  sort?: 'popular' | 'recent' | 'entries' = 'popular';

  @ApiPropertyOptional({ description: 'Filtrar por ID de usuario' })
  @IsOptional()
  @IsString()
  userId?: string;
}
