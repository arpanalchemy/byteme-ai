import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Vehicle } from "../vehicles/entity/vehicle.entity";
import { OdometerUpload } from "../odometer/entity/odometer-upload.entity";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { VeChainSignatureHelper } from "../auth/helpers/vechain-signature.helper";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Vehicle, OdometerUpload]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRATION", "24h"),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService, VeChainSignatureHelper],
  exports: [UserService],
})
export class UsersModule {}
