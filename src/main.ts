import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  console.log("🚀 Starting Drive & Earn API...");
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔧 Port: ${process.env.PORT || 8080}`);
  console.log(`🌐 Process ID: ${process.pid}`);

  try {
    const app = await NestFactory.create(AppModule);
    console.log("✅ NestJS application created successfully");

    // Enable CORS
    app.enableCors({
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,FETCH",
      credentials: true,
    });
    console.log("✅ CORS enabled");

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
    console.log("✅ Validation pipe configured");

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
    console.log("✅ Swagger documentation configured");

    const port = process.env.PORT || 8080;
    console.log(`🎯 Attempting to listen on port ${port}...`);

    await app.listen(port, "0.0.0.0");
    console.log(`✅ Application successfully listening on port ${port}`);
    console.log(`🚗 Drive & Earn API is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api`);
    console.log(`🏥 Health Check: http://localhost:${port}`);
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
