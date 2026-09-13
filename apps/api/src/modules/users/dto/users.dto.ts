import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'Nombre para mostrar' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  displayName?: string;

  @ApiPropertyOptional({ description: 'Biografía del usuario' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({ description: 'Ubicación o país' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiPropertyOptional({ description: 'Sitio web personal o red social' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @ApiPropertyOptional({ description: 'URL del avatar' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'URL del banner de perfil' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;
}

export class FavoriteItemDto {
  @ApiProperty({ description: 'ID del videojuego en Supabase' })
  @IsString()
  gameId: string;

  @ApiProperty({ description: 'Posición en la vitrina del 1 al 4', minimum: 1, maximum: 4 })
  @IsInt()
  @Min(1)
  @Max(4)
  @Type(() => Number)
  position: number;
}

export class SetFavoritesDto {
  @ApiProperty({ description: 'Lista de los 4 juegos favoritos con sus posiciones', type: [FavoriteItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FavoriteItemDto)
  favorites: FavoriteItemDto[];
}
