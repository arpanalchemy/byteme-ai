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
    res.status(200).send("ok");
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
      timestamp: new Date().toISOString(),
    });
  }

  @Public()
  @Get("/ping")
  ping(@Res() res: Response): void {
    res.status(HttpStatus.OK).json({
      pong: true,
      timestamp: new Date().toISOString(),
    });
  }
}
