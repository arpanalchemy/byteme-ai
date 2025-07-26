import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entity/user.entity";
import { VerifySignatureDto } from "./dto/verify-signature.dto";
import {
  AuthResponseDto,
  RefreshTokenResponseDto,
} from "./dto/auth-response.dto";
import { VeChainSignatureHelper } from "./helpers/vechain-signature.helper";
import { RefreshTokenService } from "./services/refresh-token.service";
import * as crypto from "crypto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly vechainSignatureHelper: VeChainSignatureHelper,
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  async verifySignature(
    verifySignatureDto: VerifySignatureDto
  ): Promise<AuthResponseDto> {
    const { certificate, walletType, username, email } = verifySignatureDto;

    const walletAddress = certificate.signer;
    this.logger.log(`Verifying signature for wallet: ${walletAddress}`);

    // Validate inputs
    if (!this.vechainSignatureHelper.isValidAddress(walletAddress)) {
      throw new UnauthorizedException("Invalid wallet address format");
    }

    // Validate certificate format
    if (!this.vechainSignatureHelper.isValidCertificate(certificate)) {
      throw new UnauthorizedException("Invalid certificate format");
    }

    // Verify the certificate
    const isValidSignature =
      await this.vechainSignatureHelper.verifyCertificate(certificate);

    if (!isValidSignature) {
      this.logger.warn(`Invalid signature for wallet: ${walletAddress}`);
      throw new UnauthorizedException("Invalid signature");
    }

    // Additional check: verify the certificate signer matches the wallet address
    if (certificate.signer.toLowerCase() !== walletAddress.toLowerCase()) {
      this.logger.warn(
        `Certificate signer mismatch: expected ${walletAddress}, got ${certificate.signer}`
      );
      throw new UnauthorizedException(
        "Certificate signer does not match wallet address"
      );
    }

    // Find or create user by wallet address
    let user = await this.userRepository.findOne({
      where: { walletAddress },
    });

    if (!user) {
      // Create new user
      this.logger.log(`Creating new user for wallet: ${walletAddress}`);
      user = this.userRepository.create({
        walletAddress,
        walletType,
        username,
        email,
        isActive: true,
        isVerified: true,
        totalMileage: 0,
        totalCarbonSaved: 0,
        totalPoints: 0,
        currentTier: "bronze",
        b3trBalance: 0,
      });
      await this.userRepository.save(user);
    } else {
      // Update existing user with new information if provided
      if (walletType && !user.walletType) {
        user.walletType = walletType;
      }
      if (username && !user.username) {
        user.username = username;
      }
      if (email && !user.email) {
        user.email = email;
      }
      await this.userRepository.save(user);
    }

    // Update user's last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generate access and refresh tokens
    const tokens = await this.refreshTokenService.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      refreshExpiresIn: tokens.refreshExpiresIn,
      user: {
        id: user.id,
        walletAddress: user.walletAddress || "",
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        isVerified: user.isVerified,
        totalMileage: Number(user.totalMileage),
        totalCarbonSaved: Number(user.totalCarbonSaved),
        totalPoints: user.totalPoints,
        currentTier: user.currentTier,
        b3trBalance: Number(user.b3trBalance),
      },
      message: "Authentication successful",
    };
  }

  async disconnectWallet(userId: string): Promise<{ message: string }> {
    this.logger.log(`Disconnecting wallet for user: ${userId}`);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    return { message: "Wallet disconnected successfully" };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException("User not found or inactive");
    }

    return user;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponseDto> {
    const tokens =
      await this.refreshTokenService.refreshAccessToken(refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      refreshExpiresIn: tokens.refreshExpiresIn,
      message: "Token refreshed successfully",
    };
  }

  /**
   * Logout user and revoke all tokens
   */
  async logout(userId: string): Promise<{ message: string }> {
    await this.refreshTokenService.revokeAllUserTokens(userId);
    return { message: "Logged out successfully" };
  }

  /**
   * Logout user from specific device (revoke specific refresh token)
   */
  async logoutFromDevice(
    userId: string,
    tokenId: string
  ): Promise<{ message: string }> {
    await this.refreshTokenService.revokeRefreshToken(tokenId);
    return { message: "Logged out from device successfully" };
  }
}
