import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,FETCH",
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Drive & Earn API")
    .setDescription("API for the Drive & Earn sustainability platform")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Authentication", "Wallet-based authentication endpoints")
    .addTag("Users", "User management endpoints")
    .addTag("Odometer", "Odometer photo upload and verification")
    .addTag("Vehicles", "Vehicle management endpoints")
    .addTag("Rewards", "Token rewards and leaderboard")
    .addTag("Store", "Token redemption store")
    .addTag("Admin", "Administrative endpoints")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚗 Drive & Earn API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
}

bootstrap();
