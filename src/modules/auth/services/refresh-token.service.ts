import { Injectable, Logger, UnauthorizedException, UnprocessableEntityException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "../../../common/cache/redis.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../users/entity/user.entity";
import * as crypto from "crypto";

export interface TokenPayload {
  sub: string;
  walletAddress: string;
  isActive: boolean;
  isVerified: boolean;
  type: "access" | "refresh";
  jti?: string; // JWT ID for refresh tokens
}

export interface RefreshTokenData {
  userId: string;
  walletAddress: string;
  tokenId: string;
  expiresAt: number;
  isRevoked: boolean;
}

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);
  private readonly accessTokenExpiry: number;
  private readonly refreshTokenExpiry: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
    // Get token expiry times from config
    this.accessTokenExpiry = this.parseExpiryTime(
      this.configService.get("JWT_EXPIRES_IN") ||
        this.configService.get("app.jwt.expiresIn", "3m")
    );
    this.refreshTokenExpiry = this.parseExpiryTime(
      this.configService.get("JWT_REFRESH_EXPIRES_IN") ||
        this.configService.get("app.jwt.refreshExpiresIn", "7d")
    );
  }

  /**
   * Generate access and refresh tokens for a user
   */
  async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    refreshExpiresIn: number;
  }> {
    const tokenId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    // Create access token payload
    const accessTokenPayload: TokenPayload = {
      sub: user.id,
      walletAddress: user.walletAddress || "",
      isActive: user.isActive,
      isVerified: user.isVerified,
      type: "access",
    };

    // Create refresh token payload
    const refreshTokenPayload: TokenPayload = {
      sub: user.id,
      walletAddress: user.walletAddress || "",
      isActive: user.isActive,
      isVerified: user.isVerified,
      type: "refresh",
      jti: tokenId, // JWT ID for refresh token
    };

    // Generate tokens
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: this.accessTokenExpiry,
    });

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: this.refreshTokenExpiry,
    });

    // Store refresh token data in Redis
    const refreshTokenData: RefreshTokenData = {
      userId: user.id,
      walletAddress: user.walletAddress || "",
      tokenId,
      expiresAt: now + this.refreshTokenExpiry,
      isRevoked: false,
    };

    await this.redisService.set(
      `refresh_token:${tokenId}`,
      refreshTokenData,
      this.refreshTokenExpiry
    );

    // Store user's active refresh tokens
    await this.addUserRefreshToken(user.id, tokenId);

    this.logger.log(`Generated tokens for user ${user.id}`);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenExpiry,
      refreshExpiresIn: this.refreshTokenExpiry,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    refreshExpiresIn: number;
  }> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken) as TokenPayload & {
        jti: string;
      };

      if (payload.type !== "refresh") {
        throw new UnauthorizedException("Invalid token type");
      }

      // Check if refresh token is revoked
      const refreshTokenData = await this.redisService.get<RefreshTokenData>(
        `refresh_token:${payload.jti}`
      );

      if (!refreshTokenData || refreshTokenData.isRevoked) {
        throw new UnauthorizedException("Refresh token is revoked or invalid");
      }

      // Get user
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnprocessableEntityException("User not found or inactive");
      }

      // Revoke the old refresh token
      await this.revokeRefreshToken(payload.jti);

      // Generate new tokens
      return await this.generateTokens(user);
    } catch (error) {
      this.logger.error(`Failed to refresh token: ${error.message}`);
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  /**
   * Revoke a refresh token
   */
  async revokeRefreshToken(tokenId: string): Promise<void> {
    const refreshTokenData = await this.redisService.get<RefreshTokenData>(
      `refresh_token:${tokenId}`
    );

    if (refreshTokenData) {
      refreshTokenData.isRevoked = true;
      await this.redisService.set(
        `refresh_token:${tokenId}`,
        refreshTokenData,
        3600 // Keep revoked token for 1 hour for audit purposes
      );

      // Remove from user's active tokens
      await this.removeUserRefreshToken(refreshTokenData.userId, tokenId);

      this.logger.log(`Revoked refresh token: ${tokenId}`);
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    const userTokens = await this.redisService.get<string[]>(
      `user_refresh_tokens:${userId}`
    );

    if (userTokens) {
      // Revoke each token
      for (const tokenId of userTokens) {
        await this.revokeRefreshToken(tokenId);
      }

      // Clear user's token list
      await this.redisService.delete(`user_refresh_tokens:${userId}`);

      this.logger.log(`Revoked all tokens for user: ${userId}`);
    }
  }

  /**
   * Validate access token
   */
  async validateAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = this.jwtService.verify(token) as TokenPayload;

      if (payload.type !== "access") {
        throw new UnauthorizedException("Invalid token type");
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException("Invalid access token");
    }
  }

  /**
   * Add refresh token to user's active tokens list
   */
  private async addUserRefreshToken(
    userId: string,
    tokenId: string
  ): Promise<void> {
    const userTokens =
      (await this.redisService.get<string[]>(
        `user_refresh_tokens:${userId}`
      )) || [];

    userTokens.push(tokenId);

    await this.redisService.set(
      `user_refresh_tokens:${userId}`,
      userTokens,
      this.refreshTokenExpiry
    );
  }

  /**
   * Remove refresh token from user's active tokens list
   */
  private async removeUserRefreshToken(
    userId: string,
    tokenId: string
  ): Promise<void> {
    const userTokens =
      (await this.redisService.get<string[]>(
        `user_refresh_tokens:${userId}`
      )) || [];

    const filteredTokens = userTokens.filter((id) => id !== tokenId);

    if (filteredTokens.length > 0) {
      await this.redisService.set(
        `user_refresh_tokens:${userId}`,
        filteredTokens,
        this.refreshTokenExpiry
      );
    } else {
      await this.redisService.delete(`user_refresh_tokens:${userId}`);
    }
  }

  /**
   * Parse expiry time string to seconds
   */
  private parseExpiryTime(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 3600; // Default to 1 hour
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 3600;
      case "d":
        return value * 86400;
      default:
        return 3600;
    }
  }

  /**
   * Get token statistics
   */
  async getTokenStats(): Promise<{
    activeRefreshTokens: number;
    revokedTokens: number;
  }> {
    // This is a simplified implementation
    // In a production environment, you might want to track these metrics more accurately
    return {
      activeRefreshTokens: 0, // Would need to implement proper counting
      revokedTokens: 0,
    };
  }
}
