import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { VerifySignatureDto } from "./dto/verify-signature.dto";
import {
  AuthResponseDto,
  RefreshTokenDto,
  RefreshTokenResponseDto,
  LogoutResponseDto,
  LogoutDeviceDto,
  UserInfoResponseDto,
} from "./dto/auth-response.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { TokenMigrationUtil } from "../../common/utils/token-migration.util";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entity/user.entity";
import { UnprocessableEntityError } from "openai";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  @Post("verify-signature")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Verify wallet signature and authenticate user",
    description:
      "Verify the wallet signature using the VeChain certificate and authenticate the user. If the user doesn't exist, a new user account will be created. Returns access and refresh tokens upon successful verification.",
  })
  @ApiResponse({
    status: 200,
    description: "Authentication successful - tokens generated",
    type: AuthResponseDto,
    schema: {
      example: {
        accessToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        refreshToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        expiresIn: 3600,
        refreshExpiresIn: 604800,
        user: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
          username: "john_doe",
          email: "john@example.com",
          isActive: true,
          isVerified: true,
          totalMileage: 1000.5,
          totalCarbonSaved: 50.25,
          totalPoints: 100,
          currentTier: "silver",
          b3trBalance: 10.5,
        },
        message: "Authentication successful",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Invalid signature or certificate",
    schema: {
      example: {
        statusCode: 401,
        message: "Invalid signature",
        error: "Unauthorized",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid request parameters",
    schema: {
      example: {
        statusCode: 400,
        message: "Invalid wallet address format",
        error: "Bad Request",
      },
    },
  })
  async verifySignature(
    @Body() verifySignatureDto: VerifySignatureDto
  ): Promise<AuthResponseDto> {
    return this.authService.verifySignature(verifySignatureDto);
  }

  @Post("disconnect")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Disconnect wallet and invalidate session",
    description:
      "Disconnect the user's wallet and update last login timestamp. This does not revoke tokens - use logout endpoints for that.",
  })
  @ApiResponse({
    status: 200,
    description: "Wallet disconnected successfully",
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          example: "Wallet disconnected successfully",
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - invalid or missing token",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
        error: "Unauthorized",
      },
    },
  })
  async disconnectWallet(@CurrentUser() user: any) {
    return this.authService.disconnectWallet(user.id);
  }

  @Post("refresh")
  @Public()
  @ApiOperation({
    summary: "Refresh access token",
    description:
      "Use a valid refresh token to get new access and refresh tokens. The old refresh token will be revoked.",
  })
  @ApiResponse({
    status: 200,
    description: "Token refreshed successfully - new tokens generated",
    type: RefreshTokenResponseDto,
    schema: {
      example: {
        accessToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        refreshToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        expiresIn: 3600,
        refreshExpiresIn: 604800,
        message: "Token refreshed successfully",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Invalid refresh token",
    schema: {
      example: {
        statusCode: 401,
        message: "Invalid refresh token",
        error: "Unauthorized",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid request format",
    schema: {
      example: {
        statusCode: 400,
        message: "refreshToken should not be empty",
        error: "Bad Request",
      },
    },
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto
  ): Promise<RefreshTokenResponseDto> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Logout user and revoke all tokens",
    description:
      "Logout the user and revoke all refresh tokens across all devices. This will invalidate all active sessions.",
  })
  @ApiResponse({
    status: 200,
    description: "Logged out successfully - all tokens revoked",
    type: LogoutResponseDto,
    schema: {
      example: {
        message: "Logged out successfully",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - invalid or missing token",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
        error: "Unauthorized",
      },
    },
  })
  async logout(@CurrentUser() user: any): Promise<LogoutResponseDto> {
    return this.authService.logout(user.id);
  }

  @Post("logout/device")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Logout from specific device",
    description:
      "Logout from a specific device by revoking a particular refresh token. Other devices remain logged in.",
  })
  @ApiResponse({
    status: 200,
    description: "Logged out from device successfully - specific token revoked",
    type: LogoutResponseDto,
    schema: {
      example: {
        message: "Logged out from device successfully",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - invalid or missing token",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
        error: "Unauthorized",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid request format",
    schema: {
      example: {
        statusCode: 400,
        message: "tokenId should not be empty",
        error: "Bad Request",
      },
    },
  })
  async logoutFromDevice(
    @CurrentUser() user: any,
    @Body() body: LogoutDeviceDto
  ): Promise<LogoutResponseDto> {
    return this.authService.logoutFromDevice(user.id, body.tokenId);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get current user information",
    description:
      "Retrieve the current authenticated user's profile information and statistics.",
  })
  @ApiResponse({
    status: 200,
    description: "User information retrieved successfully",
    type: UserInfoResponseDto,
    schema: {
      example: {
        user: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
          username: "john_doe",
          email: "john@example.com",
          isActive: true,
          isVerified: true,
          totalMileage: 1000.5,
          totalCarbonSaved: 50.25,
          totalPoints: 100,
          currentTier: "silver",
          b3trBalance: 10.5,
        },
        message: "User information retrieved successfully",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - invalid or missing token",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
        error: "Unauthorized",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
    schema: {
      example: {
        statusCode: 404,
        message: "User not found or inactive",
        error: "Not Found",
      },
    },
  })
  async getCurrentUser(@CurrentUser() user: any): Promise<UserInfoResponseDto> {
    const userData = await this.authService.validateUser(user.id);

    return {
      user: {
        id: userData.id,
        walletAddress: userData.walletAddress,
        username: userData.username,
        email: userData.email,
        isActive: userData.isActive,
        isVerified: userData.isVerified,
        totalMileage: Number(userData.totalMileage),
        totalCarbonSaved: Number(userData.totalCarbonSaved),
        totalPoints: userData.totalPoints,
        currentTier: userData.currentTier,
        b3trBalance: Number(userData.b3trBalance),
      },
      message: "User information retrieved successfully",
    };
  }

  @Post("migrate-token")
  @Public()
  @ApiOperation({
    summary: "Migrate legacy token to new format",
    description:
      "Convert a legacy JWT token (without type field) to the new format. This endpoint helps with backward compatibility during the token format migration.",
  })
  @ApiResponse({
    status: 200,
    description: "Token migrated successfully",
    schema: {
      example: {
        accessToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        message: "Token migrated successfully",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Invalid legacy token",
    schema: {
      example: {
        statusCode: 401,
        message: "Invalid legacy token",
        error: "Unauthorized",
      },
    },
  })
  async migrateToken(@Body() body: { token: string }) {
    try {
      if (!body.token) {
        throw new UnauthorizedException("Token is required");
      }

      // Verify the legacy token
      const payload = this.jwtService.verify(body.token);

      // Check if it's actually a legacy token
      if ("type" in payload) {
        throw new UnauthorizedException("Token is already in new format");
      }

      // Get user data
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      if (!user.isActive) {
        throw new UnprocessableEntityException("User account is inactive");
      }

      // Generate new token
      const newPayload = {
        sub: user.id,
        walletAddress: user.walletAddress || "",
        isActive: user.isActive,
        isVerified: user.isVerified,
        type: "access" as const,
      };

      const newToken = this.jwtService.sign(newPayload);

      return {
        accessToken: newToken,
        message: "Token migrated successfully",
      };
    } catch (error) {
      // Provide more specific error messages
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error.name === "TokenExpiredError") {
        throw new UnauthorizedException("Token has expired");
      }

      if (error.name === "JsonWebTokenError") {
        throw new UnauthorizedException("Invalid token format");
      }

      if (error.name === "NotBeforeError") {
        throw new UnauthorizedException("Token not yet valid");
      }

      // Log the actual error for debugging
      console.error("Token migration error:", error);
      throw new UnauthorizedException("Invalid legacy token");
    }
  }

  @Post("inspect-token")
  @Public()
  @ApiOperation({
    summary: "Inspect token details (for debugging)",
    description:
      "Decode and inspect a JWT token without validation. Use this for debugging token issues.",
  })
  @ApiResponse({
    status: 200,
    description: "Token details",
    schema: {
      example: {
        header: { alg: "HS256", typ: "JWT" },
        payload: { sub: "user-id", walletAddress: "0x...", exp: 1234567890 },
        message: "Token inspected successfully",
      },
    },
  })
  async inspectToken(@Body() body: { token: string }) {
    try {
      if (!body.token) {
        throw new UnauthorizedException("Token is required");
      }

      // Decode token without verification (for inspection only)
      const parts = body.token.split(".");
      if (parts.length !== 3) {
        throw new UnauthorizedException("Invalid token format");
      }

      const header = JSON.parse(Buffer.from(parts[0], "base64").toString());
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp && payload.exp < now;
      const isLegacy = !("type" in payload);

      return {
        header,
        payload,
        isExpired,
        isLegacy,
        currentTime: now,
        message: "Token inspected successfully",
      };
    } catch (error) {
      console.error("Token inspection error:", error);
      throw new UnauthorizedException("Failed to inspect token");
    }
  }
}
