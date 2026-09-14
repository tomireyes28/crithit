import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { ActivityQueryDto } from './dto/activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Activity')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el feed de actividad social de las personas que sigues' })
  @ApiResponse({ status: 200, description: 'Línea de tiempo social de usuarios seguidos' })
  async getFollowingFeed(
    @CurrentUser('id') userId: string,
    @Query() query: ActivityQueryDto,
  ) {
    return this.activityService.getFollowingFeed(userId, query);
  }

  @Get('global')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Obtener el feed global de actividad reciente de la comunidad' })
  @ApiResponse({ status: 200, description: 'Línea de tiempo comunitaria global' })
  async getGlobalFeed(@Query() query: ActivityQueryDto) {
    return this.activityService.getGlobalFeed(query);
  }
}
