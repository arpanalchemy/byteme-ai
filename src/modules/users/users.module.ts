import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entity/user.entity";
import { Vehicle } from "../vehicles/entity/vehicle.entity";
import { OdometerUpload } from "../odometer/entity/odometer-upload.entity";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { VeChainSignatureHelper } from "../auth/helpers/vechain-signature.helper";
import { VeChainWalletService } from "../../common/blockchain/vechain-wallet.service";
import { UserWallet } from "./entity/user-wallet.entity";
import { UserWalletService } from "./services/user-wallet.service";
import { EncryptionService } from "../../common/encryption/encryption.service";
import { RefreshTokenService } from "../auth/services/refresh-token.service";
import { RedisService } from "../../common/cache/redis.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Vehicle, OdometerUpload, UserWallet]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>("JWT_SECRET") ||
          configService.get("app.jwt.secret"),
        signOptions: {
          expiresIn:
            configService.get<string>("JWT_EXPIRATION") ||
            configService.get("app.jwt.expiresIn", "3m"),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    VeChainSignatureHelper,
    VeChainWalletService,
    UserWalletService,
    EncryptionService,
    RefreshTokenService,
    RedisService,
  ],
  exports: [UserService],
})
export class UsersModule {}
