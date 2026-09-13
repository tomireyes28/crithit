import { Module } from '@nestjs/common';
import { PlayLogsController } from './play-logs.controller';
import { PlayLogsService } from './play-logs.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlayLogsController],
  providers: [PlayLogsService],
  exports: [PlayLogsService],
})
export class PlayLogsModule {}
