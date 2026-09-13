import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'API status report' })
  getHealth() {
    return {
      status: 'ok',
      service: 'crithit-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
