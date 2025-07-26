import { JwtService } from "@nestjs/jwt";

export interface LegacyTokenPayload {
  sub: string;
  walletAddress?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export interface NewTokenPayload {
  sub: string;
  walletAddress: string;
  isActive: boolean;
  isVerified: boolean;
  type: "access" | "refresh";
  iat?: number;
  exp?: number;
}

export class TokenMigrationUtil {
  /**
   * Check if a token is in the old format (without type field)
   */
  static isLegacyToken(payload: any): payload is LegacyTokenPayload {
    return !("type" in payload);
  }

  /**
   * Convert legacy token payload to new format
   */
  static convertLegacyToNew(
    legacyPayload: LegacyTokenPayload,
    user: any
  ): NewTokenPayload {
    return {
      sub: legacyPayload.sub,
      walletAddress: legacyPayload.walletAddress || "",
      isActive: user?.isActive || true,
      isVerified: user?.isVerified || false,
      type: "access",
      iat: legacyPayload.iat,
      exp: legacyPayload.exp,
    };
  }

  /**
   * Validate token and return standardized payload
   */
  static validateAndStandardize(payload: any, user: any): NewTokenPayload {
    if (this.isLegacyToken(payload)) {
      return this.convertLegacyToNew(payload, user);
    }

    return payload as NewTokenPayload;
  }

  /**
   * Generate a new token from legacy token (for migration)
   */
  static async generateNewTokenFromLegacy(
    legacyToken: string,
    jwtService: JwtService,
    user: any
  ): Promise<string> {
    try {
      // Verify the legacy token
      const payload = jwtService.verify(legacyToken) as LegacyTokenPayload;

      // Convert to new format
      const newPayload = this.convertLegacyToNew(payload, user);

      // Generate new token
      return jwtService.sign(newPayload);
    } catch (error) {
      throw new Error("Invalid legacy token");
    }
  }
}
