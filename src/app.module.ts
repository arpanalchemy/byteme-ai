import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { getDatabaseConfig } from "./config/database.config";
import { JwtAuthGuard } from "./modules/auth/guards/jwt-auth.guard";
import { OdometerModule } from "./modules/odometer/odometer.module";
import { VehiclesModule } from "./modules/vehicles/vehicles.module";
import { AdminModule } from "./modules/admin/admin.module";
import { StoreModule } from "./modules/store/store.module";
import { LeaderboardModule } from "./modules/leaderboard/leaderboard.module";
import { BadgesModule } from "./modules/badges/badges.module";
import { ChallengesModule } from "./modules/challenges/challenges.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { HistoryModule } from "./modules/history/history.module";
import { RewardsModule } from "./modules/rewards/rewards.module";
import { HealthcheckModule } from "./modules/healthcheck/healthcheck.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config = getDatabaseConfig(configService);
        // Add retry logic and graceful handling for database connection
        return {
          ...config,
          retryAttempts: 3,
          retryDelay: 3000,
          keepConnectionAlive: true,
          // Don't fail startup if database is not available
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    AuthModule,
    UsersModule,
    OdometerModule,
    VehiclesModule,
    AdminModule,
    StoreModule,
    LeaderboardModule,
    BadgesModule,
    ChallengesModule,
    NotificationsModule,
    HistoryModule,
    RewardsModule,
    HealthcheckModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
