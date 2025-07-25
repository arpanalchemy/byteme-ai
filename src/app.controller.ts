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
      port: process.env.PORT || 3000,
    };

    res.status(HttpStatus.OK).json(healthStatus);
  }

  @Public()
  @Get("/")
  getRoot(@Res() res: Response): void {
    res.status(HttpStatus.OK).json({
      message: "Drive & Earn API",
      version: "1.0.0",
      status: "running",
      documentation: "/api",
      health: "/healthcheck",
    });
  }
}
