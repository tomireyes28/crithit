import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { GamesModule } from './modules/games/games.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PlayLogsModule } from './modules/play-logs/play-logs.module';
import { UsersModule } from './modules/users/users.module';
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
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
