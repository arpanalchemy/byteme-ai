import { Controller, Get, HttpStatus, Res } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "./common/decorators/public.decorator";
import { Response } from "express";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get("/healthcheck")
  getHello(@Res() res: Response): void {
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      port: process.env.PORT || 8080,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      pid: process.pid,
      message: "Health check endpoint responding successfully",
      serverInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    console.log(
      `🏥 Health check requested - Port: ${healthStatus.port}, PID: ${healthStatus.pid}`
    );
    res.status(HttpStatus.OK).json(healthStatus);
  }

  @Public()
  @Get("/")
  getRoot(@Res() res: Response): void {
    const rootInfo = {
      message: "Drive & Earn API",
      version: "1.0.0",
      status: "running",
      documentation: "/api",
      health: "/healthcheck",
      timestamp: new Date().toISOString(),
      port: process.env.PORT || 8080,
      environment: process.env.NODE_ENV || "development",
    };

    console.log(`🏠 Root endpoint requested - Port: ${rootInfo.port}`);
    res.status(HttpStatus.OK).json(rootInfo);
  }

  @Public()
  @Get("/ping")
  ping(@Res() res: Response): void {
    const pingResponse = {
      pong: true,
      timestamp: new Date().toISOString(),
      port: process.env.PORT || 8080,
      pid: process.pid,
    };

    console.log(`🏓 Ping requested - Port: ${pingResponse.port}`);
    res.status(HttpStatus.OK).json(pingResponse);
  }
}
