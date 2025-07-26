import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import {
  RefreshTokenService,
  TokenPayload,
} from "../services/refresh-token.service";

export interface JwtPayload {
  sub: string;
  walletAddress: string;
  isActive: boolean;
  isVerified: boolean;
  type: "access" | "refresh";
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get("JWT_SECRET") ||
        configService.get("app.jwt.secret") ||
        "fallback-secret",
    });
  }

  async validate(payload: TokenPayload | JwtPayload) {
    // Handle both new format (with type) and old format (without type)
    if ("type" in payload) {
      // New format - check token type
      if (payload.type !== "access") {
        throw new UnauthorizedException("Invalid token type");
      }
    }

    const user = await this.authService.validateUser(payload.sub);

    if (!user.isActive) {
      throw new UnprocessableEntityException("User account is inactive");
    }

    return {
      id: user.id,
      walletAddress: user.walletAddress,
      isActive: user.isActive,
      isVerified: user.isVerified,
    };
  }
}
