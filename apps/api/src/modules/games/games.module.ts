import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { IgdbService } from './igdb.service';

@Module({
  controllers: [GamesController],
  providers: [GamesService, IgdbService],
  exports: [GamesService, IgdbService],
})
export class GamesModule {}
