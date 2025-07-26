import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as nodemailer from "nodemailer";
import { User } from "../entity/user.entity";
import { Vehicle } from "../../vehicles/entity/vehicle.entity";
import {
  OdometerUpload,
  UploadStatus,
} from "../../odometer/entity/odometer-upload.entity";
import { VeChainSignatureHelper } from "../../auth/helpers/vechain-signature.helper";
import { VeChainWalletService } from "../../../common/blockchain/vechain-wallet.service";
import { UserWalletService } from "./user-wallet.service";
import { RefreshTokenService } from "../../auth/services/refresh-token.service";
import {
  UserDashboardDto,
  UserProfileDto,
  UpdateUserProfileDto,
} from "../dto/user-dashboard.dto";
import { EmailTemplates } from "../helpers/email-templates.helper";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly emailTransporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(OdometerUpload)
    private readonly odometerUploadRepository: Repository<OdometerUpload>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly vechainSignatureHelper: VeChainSignatureHelper,
    private readonly vechainWalletService: VeChainWalletService,
    private readonly userWalletService: UserWalletService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {
    // Initialize email transporter
    const emailUser = this.configService.get(
      "EMAIL_USER",
      "jaimin.tank@alchemytech.ca",
    );
    const emailPass = this.configService.get("EMAIL_PASS");

    if (!emailUser || !emailPass) {
      console.error("Email credentials not properly configured");
      return;
    }

    // Create Gmail SMTP transporter
    this.emailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Verify the connection
    this.emailTransporter.verify((error) => {
      if (error) {
        console.error("SMTP Connection Error:", error);
      } else {
        console.log("SMTP Server is ready to send emails");
      }
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
  ): Promise<void> {
    // if (!this.emailTransporter) {
    //   throw new BadRequestException('Email service not configured');
    // }

    const fromEmail = this.configService.get(
      "EMAIL_USER",
      "jaimin.tank@alchemytech.ca",
    );

    try {
      await this.emailTransporter.sendMail({
        from: {
          name: "B3TR EV Rewards",
          address: fromEmail,
        },
        to,
        subject,
        html: htmlContent,
        headers: {
          "X-Priority": "1",
          "X-MSMail-Priority": "High",
          Importance: "high",
        },
      });
    } catch (error) {
      console.error("Failed to send email:", error);
      if (error.code === "EAUTH") {
        throw new BadRequestException(
          "Email authentication failed. Please check SMTP credentials.",
        );
      }
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Login with email (send OTP)
   */
  async loginWithEmail(email: string): Promise<{ message: string }> {
    try {
      // Check if user exists
      let user = await this.userRepository.findOne({
        where: { email },
      });

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      if (!user) {
        // Create new user if doesn't exist
        user = this.userRepository.create({
          email,
          emailOtp: otp,
          walletAddress: null,
          isActive: true,
          isVerified: false,
        });
      } else {
        // Update existing user's OTP
        user.emailOtp = otp;
      }

      await this.userRepository.save(user);

      // Send OTP email
      await this.sendEmail(
        email,
        "Your B3TR EV Rewards Login Code",
        EmailTemplates.getOTPEmailTemplate(otp, {
          configService: this.configService,
        }),
      );

      return { message: "OTP sent to your email" };
    } catch (error) {
      this.logger.error(`Failed to send login OTP: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate OTP and login
   */
  async validateOtp(
    email: string,
    otp: string,
  ): Promise<{
    message: string;
    token: string;
    refreshToken?: string;
    expiresIn?: number;
    refreshExpiresIn?: number;
    walletCreated?: boolean;
    wallet?: any;
  }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      if (user.emailOtp !== otp) {
        throw new BadRequestException("Invalid OTP");
      }

      // Clear OTP
      user.emailOtp = undefined;
      await this.userRepository.save(user);

      // Generate tokens
      const payload = {
        sub: user.id,
        walletAddress: user.walletAddress,
        isActive: user.isActive,
        isVerified: user.isVerified,
        type: "access" as const,
      };

      const token = this.jwtService.sign(payload, {
        secret: this.configService.get("JWT_SECRET"),
        expiresIn: "7d",
      });

      const refreshToken = await this.refreshTokenService.generateTokens(user);

      // Check if user has wallet
      const userWallet = await this.userWalletService.getUserWallet(user.id);

      let walletCreated = false;
      let wallet = null;

      if (!userWallet || !user.walletAddress) {
        // Create wallet for user
        const walletResult = await this.userWalletService.createUserWallet(
          user.id,
        );
        walletCreated = true;
        wallet = walletResult.encryptedWallet;
      }

      return {
        message: "Login successful",
        token,
        refreshToken: refreshToken.refreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days
        refreshExpiresIn: 30 * 24 * 60 * 60, // 30 days
        walletCreated,
        wallet,
      };
    } catch (error) {
      this.logger.error(`Failed to validate OTP: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user dashboard
   */
  async getUserDashboard(userId: string): Promise<UserDashboardDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      // Get vehicle count
      const vehicleCount = await this.vehicleRepository.count({
        where: { userId, isActive: true },
      });

      // Get upload count
      const uploadCount = await this.odometerUploadRepository.count({
        where: { userId, status: UploadStatus.COMPLETED },
      });

      // Calculate weekly stats
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyUploads = await this.odometerUploadRepository
        .createQueryBuilder("upload")
        .select([
          "SUM(upload.finalMileage) as milesThisWeek",
          "SUM(upload.carbonSaved) as carbonSavedThisWeek",
        ])
        .where("upload.userId = :userId", { userId })
        .andWhere("upload.createdAt >= :weekAgo", { weekAgo })
        .andWhere("upload.status = :status", { status: UploadStatus.COMPLETED })
        .getRawOne();

      // Calculate monthly stats
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthlyUploads = await this.odometerUploadRepository
        .createQueryBuilder("upload")
        .select([
          "SUM(upload.finalMileage) as milesThisMonth",
          "SUM(upload.carbonSaved) as carbonSavedThisMonth",
        ])
        .where("upload.userId = :userId", { userId })
        .andWhere("upload.createdAt >= :monthAgo", { monthAgo })
        .andWhere("upload.status = :status", { status: UploadStatus.COMPLETED })
        .getRawOne();

      // Get recent activity (last 10 uploads)
      const recentUploads = await this.odometerUploadRepository.find({
        where: { userId },
        order: { createdAt: "DESC" },
        take: 10,
      });

      const recentActivity = recentUploads.map((upload) => ({
        id: upload.id,
        type: "upload" as const,
        description: `Uploaded ${upload.finalMileage} km`,
        amount: upload.finalMileage,
        date: upload.createdAt,
      }));

      // Calculate global rank (placeholder - would need leaderboard implementation)
      const globalRank = await this.calculateUserRank(userId);

      return {
        walletBalance: parseFloat(user.b3trBalance.toString()),
        totalRewards: parseFloat(user.b3trBalance.toString()), // Same as balance for now
        totalCarbonSaved: parseFloat(user.totalCarbonSaved.toString()),
        totalEvMiles: parseFloat(user.totalMileage.toString()),
        currentTier: user.currentTier,
        totalPoints: user.totalPoints,
        vehicleCount,
        uploadCount,
        globalRank,
        weeklyStats: {
          milesThisWeek: parseFloat(weeklyUploads?.milesThisWeek || "0"),
          carbonSavedThisWeek: parseFloat(
            weeklyUploads?.carbonSavedThisWeek || "0",
          ),
          rewardsEarnedThisWeek: 0, // Placeholder - would need reward tracking
          uploadsThisWeek: recentUploads.filter((u) => u.createdAt >= weekAgo)
            .length,
        },
        monthlyStats: {
          milesThisMonth: parseFloat(monthlyUploads?.milesThisMonth || "0"),
          carbonSavedThisMonth: parseFloat(
            monthlyUploads?.carbonSavedThisMonth || "0",
          ),
          rewardsEarnedThisMonth: 0, // Placeholder - would need reward tracking
          uploadsThisMonth: recentUploads.filter((u) => u.createdAt >= monthAgo)
            .length,
        },
        recentActivity,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get user dashboard for ${userId}: ${error.message}`,
      );
      throw new BadRequestException("Failed to get user dashboard");
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfileDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      return {
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
        currentTier: user.currentTier,
        totalMileage: parseFloat(user.totalMileage.toString()),
        totalCarbonSaved: parseFloat(user.totalCarbonSaved.toString()),
        b3trBalance: parseFloat(user.b3trBalance.toString()),
        totalPoints: user.totalPoints,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get user profile for ${userId}: ${error.message}`,
      );
      throw new BadRequestException("Failed to get user profile");
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updateDto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      // Update user fields
      if (updateDto.username !== undefined) {
        user.username = updateDto.username;
      }
      if (updateDto.email !== undefined) {
        user.email = updateDto.email;
      }
      if (updateDto.profileImageUrl !== undefined) {
        user.profileImageUrl = updateDto.profileImageUrl;
      }

      await this.userRepository.save(user);

      return this.getUserProfile(userId);
    } catch (error) {
      this.logger.error(
        `Failed to update user profile for ${userId}: ${error.message}`,
      );
      throw new BadRequestException("Failed to update user profile");
    }
  }

  /**
   * Calculate user global rank (placeholder implementation)
   */
  private async calculateUserRank(userId: string): Promise<number> {
    try {
      // This is a placeholder implementation
      // In a real implementation, this would query the leaderboard
      const userCount = await this.userRepository.count();
      const randomRank = Math.floor(Math.random() * userCount) + 1;
      return randomRank;
    } catch (error) {
      return 999; // Default rank if calculation fails
    }
  }
}
