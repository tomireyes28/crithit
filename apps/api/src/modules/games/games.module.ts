import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { IgdbService } from './igdb.service';
import { RawgService } from './rawg.service';

@Module({
  controllers: [GamesController],
  providers: [GamesService, IgdbService, RawgService],
  exports: [GamesService, IgdbService, RawgService],
})
export class GamesModule {}
