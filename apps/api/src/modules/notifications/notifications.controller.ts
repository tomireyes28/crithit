import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener notificaciones paginadas del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones con metadatos de paginación' })
  async getUserNotifications(
    @CurrentUser('id') userId: string,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationsService.getUserNotifications(userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Obtener la cantidad de notificaciones no leídas' })
  @ApiResponse({ status: 200, description: 'Contador de notificaciones no leídas' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Marcar todas las notificaciones pendientes como leídas' })
  @ApiResponse({ status: 200, description: 'Confirmación de notificaciones actualizadas' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Marcar una notificación individual como leída' })
  @ApiResponse({ status: 200, description: 'Notificación marcada como leída' })
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(userId, notificationId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una notificación' })
  @ApiResponse({ status: 200, description: 'Notificación eliminada' })
  async deleteNotification(
    @CurrentUser('id') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.deleteNotification(userId, notificationId);
  }
}
