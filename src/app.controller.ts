import { Controller, Get, Res, Header } from "@nestjs/common";
import { AppService } from "./app.service";
import { Response } from "express";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header("Content-Type", "text/html")
  getHello(@Res() res: Response): void {
    res.send(this.appService.getHello());
  }

  @Get("health")
  getHealth(): { status: string; timestamp: string; uptime: number } {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get("status")
  getStatus(): {
    service: string;
    version: string;
    environment: string;
    status: string;
    endpoints: string[];
  } {
    return {
      service: "Drive & Earn Backend API",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      status: "operational",
      endpoints: [
        "/ - Landing Page",
        "/docs - Documentation Hub",
        "/api - API Documentation",
        "/health - Health Check",
        "/status - Service Status",
      ],
    };
  }
}
