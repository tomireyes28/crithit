import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  Headers,
  UseGuards,
  Sse,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { NotificationsRealtimeService } from './notifications-realtime.service';
import { NotificationQueryDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly realtimeService: NotificationsRealtimeService,
    private readonly jwtService: JwtService,
  ) {}

  @Sse('stream')
  @Public()
  @ApiOperation({
    summary: 'Canal en tiempo real Server-Sent Events (SSE) para notificaciones instantáneas',
  })
  async stream(
    @Query('token') queryToken?: string,
    @Headers('authorization') authHeader?: string,
  ) {
    let rawToken = queryToken;
    if (!rawToken && authHeader) {
      rawToken = authHeader.replace(/^Bearer\s+/i, '');
    }

    if (!rawToken) {
      throw new UnauthorizedException('Token de sesión requerido para suscribirse al canal SSE');
    }

    let userId: string | null = null;
    try {
      const payload: any = this.jwtService.decode(rawToken);
      userId = payload?.sub || payload?.id;
    } catch {
      throw new UnauthorizedException('Token inválido para SSE');
    }

    if (!userId) {
      throw new UnauthorizedException('Usuario no válido en el token');
    }

    return this.realtimeService.subscribe(userId);
  }

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
