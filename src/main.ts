import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Enable CORS with specific origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:3000", "http://localhost:3001"];

    app.enableCors({
      origin: allowedOrigins,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
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

    // Serve Swagger JSON document
    app.use("/api-json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(document);
    });

    const port = process.env.PORT || 3000;
    await app.listen(port, "0.0.0.0");
    console.log(`✅ Application successfully listening on port ${port}`);
    console.log(`🚗 Drive & Earn API is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation (UI): http://localhost:${port}/api`);
    console.log(
      `📄 API Documentation (JSON): http://localhost:${port}/api-json`
    );
    console.log(`🏥 Health Check: http://localhost:${port}/healthcheck`);
    console.log(`🎉 Application startup completed successfully!`);
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

bootstrap();
