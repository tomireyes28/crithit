import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, SetFavoritesDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':username')
  @ApiOperation({ summary: 'Obtener el perfil público de un usuario por su @username' })
  @ApiResponse({ status: 200, description: 'Perfil público con Favorite Four, histograma y estadísticas' })
  async getProfile(@Param('username') username: string) {
    return this.usersService.getProfileByUsername(username);
  }

  @Put('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Configurar los 4 juegos favoritos (Favorite Four)' })
  @ApiResponse({ status: 200, description: 'Vitrina Favorite Four actualizada exitosamente' })
  async setFavorites(
    @CurrentUser('id') userId: string,
    @Body() dto: SetFavoritesDto,
  ) {
    return this.usersService.setFavorites(userId, dto);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar la información y biografía del perfil propio' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }
}
