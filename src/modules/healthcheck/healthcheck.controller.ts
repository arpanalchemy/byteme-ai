import { Controller, Get } from '@nestjs/common';

@Controller('healthcheck')
export class HealthcheckController {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  @Get()
  healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: (Date.now() - this.startTime) / 1000,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      port: process.env.PORT || 3000
    };
  }
}
