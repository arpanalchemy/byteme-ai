import { Controller, Get, HttpStatus } from '@nestjs/common';

@Controller('healthcheck')
export class HealthcheckController {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  @Get()
  healthCheck() {
    try {
      const response = {
        status: 'healthy',
        statusCode: HttpStatus.OK,
        timestamp: new Date().toISOString(),
        uptime: (Date.now() - this.startTime) / 1000,
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        port: process.env.PORT || '3031'
      };
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
