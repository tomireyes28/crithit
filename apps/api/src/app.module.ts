import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { GamesModule } from './modules/games/games.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PlayLogsModule } from './modules/play-logs/play-logs.module';
import { UsersModule } from './modules/users/users.module';
import { ListsModule } from './modules/lists/lists.module';
import { ActivityModule } from './modules/activity/activity.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CriticsModule } from './modules/critics/critics.module';
import { NewsModule } from './modules/news/news.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    AuthModule,
    GamesModule,
    ReviewsModule,
    PlayLogsModule,
    UsersModule,
    ListsModule,
    ActivityModule,
    NotificationsModule,
    CriticsModule,
    NewsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
