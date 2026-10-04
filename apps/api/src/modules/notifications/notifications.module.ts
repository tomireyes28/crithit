import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { NotificationsRealtimeService } from './notifications-realtime.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRealtimeService],
  exports: [NotificationsService, NotificationsRealtimeService],
})
export class NotificationsModule {}
