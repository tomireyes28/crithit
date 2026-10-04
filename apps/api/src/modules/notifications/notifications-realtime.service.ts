import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable, interval, merge } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

export interface RealtimeMessageEvent {
  data: {
    type: 'CONNECTED' | 'PING' | 'NOTIFICATION' | 'UNREAD_COUNT';
    payload?: any;
    timestamp?: number;
  };
}

@Injectable()
export class NotificationsRealtimeService {
  private readonly logger = new Logger(NotificationsRealtimeService.name);
  private readonly userConnections = new Map<string, Set<Subject<RealtimeMessageEvent>>>();

  /**
   * Suscribe a un usuario autenticado a su canal SSE en tiempo real.
   */
  subscribe(userId: string): Observable<RealtimeMessageEvent> {
    const userSubject = new Subject<RealtimeMessageEvent>();

    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(userSubject);
    this.logger.debug(
      `Usuario ${userId} conectado a SSE. Conexiones vivas: ${this.getTotalConnectionsCount()}`,
    );

    // 1. Mensaje inicial de sincronización
    const initialEvent: RealtimeMessageEvent = {
      data: {
        type: 'CONNECTED',
        payload: { userId, message: 'Canal en tiempo real conectado' },
        timestamp: Date.now(),
      },
    };

    // 2. Heartbeat cada 25 segundos (ping liviano <50 bytes) para evitar desconexiones
    const heartbeat$ = interval(25000).pipe(
      map(
        (): RealtimeMessageEvent => ({
          data: {
            type: 'PING',
            timestamp: Date.now(),
          },
        }),
      ),
    );

    const userStream$ = userSubject.asObservable();

    return merge(
      new Observable<RealtimeMessageEvent>((subscriber) => {
        subscriber.next(initialEvent);
        subscriber.complete();
      }),
      userStream$,
      heartbeat$,
    ).pipe(
      finalize(() => {
        const userSubs = this.userConnections.get(userId);
        if (userSubs) {
          userSubs.delete(userSubject);
          if (userSubs.size === 0) {
            this.userConnections.delete(userId);
          }
        }
        this.logger.debug(`Conexión SSE cerrada para usuario ${userId}`);
      }),
    );
  }

  /**
   * Envía un evento instantáneo al usuario destinatario específico.
   */
  sendToUser(recipientId: string, event: { type: 'NOTIFICATION' | 'UNREAD_COUNT'; payload: any }): boolean {
    const userSubs = this.userConnections.get(recipientId);
    if (!userSubs || userSubs.size === 0) {
      return false;
    }

    const message: RealtimeMessageEvent = {
      data: {
        type: event.type,
        payload: event.payload,
        timestamp: Date.now(),
      },
    };

    for (const sub of userSubs) {
      try {
        sub.next(message);
      } catch (err: any) {
        this.logger.warn(`Error al emitir evento SSE a ${recipientId}: ${err.message}`);
      }
    }
    return true;
  }

  /**
   * Estadísticas de conexiones en tiempo real.
   */
  getConnectedUsersCount(): number {
    return this.userConnections.size;
  }

  getTotalConnectionsCount(): number {
    let total = 0;
    for (const subs of this.userConnections.values()) {
      total += subs.size;
    }
    return total;
  }
}
