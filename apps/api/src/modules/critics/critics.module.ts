import { Module } from '@nestjs/common';
import { CriticsController } from './critics.controller';
import { CriticsService } from './critics.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, ReviewsModule, NotificationsModule],
  controllers: [CriticsController],
  providers: [CriticsService],
  exports: [CriticsService],
})
export class CriticsModule {}
