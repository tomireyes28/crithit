import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { NotificationQueryDto } from './dto/notification.dto';

export interface CreateNotificationParams {
  recipientId: string;
  actorId?: string;
  type: NotificationType;
  message: string;
  entityType?: string;
  entityId?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una notificación social en la base de datos.
   * Evita auto-notificaciones (actorId === recipientId) y spam duplicado en un lapso corto.
   */
  async createNotification(params: CreateNotificationParams) {
    if (params.actorId && params.actorId === params.recipientId) {
      return null;
    }

    try {
      // Prevención de spam/duplicación en los últimos 30 segundos
      if (params.actorId) {
        const recent = await this.prisma.notification.findFirst({
          where: {
            recipientId: params.recipientId,
            actorId: params.actorId,
            type: params.type,
            entityId: params.entityId || null,
            createdAt: {
              gte: new Date(Date.now() - 30 * 1000),
            },
          },
        });

        if (recent) {
          if (!recent.isRead) {
            return recent;
          }
          return await this.prisma.notification.update({
            where: { id: recent.id },
            data: { isRead: false, createdAt: new Date() },
          });
        }
      }

      return await this.prisma.notification.create({
        data: {
          recipientId: params.recipientId,
          actorId: params.actorId || null,
          type: params.type,
          message: params.message,
          entityType: params.entityType || null,
          entityId: params.entityId || null,
        },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              criticTier: true,
              criticBadge: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error al crear notificación: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Obtiene las notificaciones paginadas del usuario.
   */
  async getUserNotifications(userId: string, query: NotificationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 15;
    const skip = (page - 1) * limit;

    const where: any = {
      recipientId: userId,
    };

    if (query.unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              role: true,
              criticTier: true,
              criticBadge: true,
            },
          },
        },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: {
          recipientId: userId,
          isRead: false,
        },
      }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Devuelve únicamente el número de notificaciones no leídas (endpoint liviano para polling).
   */
  async getUnreadCount(userId: string) {
    const unreadCount = await this.prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    return { unreadCount };
  }

  /**
   * Marca una notificación específica como leída.
   */
  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notification.recipientId !== userId) {
      throw new ForbiddenException('No tienes permiso para modificar esta notificación');
    }

    if (!notification.isRead) {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    }

    return { success: true, id: notificationId, isRead: true };
  }

  /**
   * Marca todas las notificaciones pendientes del usuario como leídas.
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      success: true,
      markedCount: result.count,
      message: 'Todas las notificaciones han sido marcadas como leídas',
    };
  }

  /**
   * Elimina una notificación individual.
   */
  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notification.recipientId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta notificación');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return {
      success: true,
      message: 'Notificación eliminada correctamente',
    };
  }
}
