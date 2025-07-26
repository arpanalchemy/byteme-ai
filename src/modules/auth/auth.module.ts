import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { VeChainSignatureHelper } from './helpers/vechain-signature.helper';
import { RefreshTokenService } from "./services/refresh-token.service";
import { User } from "../users/entity/user.entity";
import { RedisService } from "../../common/cache/redis.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: "jwt" }),
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
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    VeChainSignatureHelper,
    RefreshTokenService,
    RedisService,
  ],
  exports: [
    AuthService,
    JwtStrategy,
    PassportModule,
    VeChainSignatureHelper,
    RefreshTokenService,
  ],
})
export class AuthModule {}
