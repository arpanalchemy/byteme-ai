import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AdminController } from "./controllers/admin.controller";
import { AdminService } from "./services/admin.service";
import { User } from "../users/entity/user.entity";
import { Vehicle } from "../vehicles/entity/vehicle.entity";
import { OdometerUpload } from "../odometer/entity/odometer-upload.entity";
import { RefreshTokenService } from "../auth/services/refresh-token.service";
import { RedisService } from "../../common/cache/redis.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Vehicle, OdometerUpload]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get("JWT_SECRET") ||
          configService.get("app.jwt.secret"),
        signOptions: {
          expiresIn:
            configService.get("JWT_EXPIRES_IN") ||
            configService.get("app.jwt.expiresIn", "3m"),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, RefreshTokenService, RedisService],
  exports: [AdminService],
})
export class AdminModule {}
