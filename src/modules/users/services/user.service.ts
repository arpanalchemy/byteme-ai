import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entity/user.entity";
import { Vehicle } from "../../vehicles/entity/vehicle.entity";
import { OdometerUpload } from "../../odometer/entity/odometer-upload.entity";
import { ConfigService } from "@nestjs/config";
import { EmailTemplates } from "../helpers/email-templates.helper";
import { JwtService } from "@nestjs/jwt";
import { VeChainSignatureHelper } from "../../auth/helpers/vechain-signature.helper";
import {
  UserDashboardDto,
  UserProfileDto,
  UpdateUserProfileDto,
} from "../dto/user-dashboard.dto";
import * as crypto from "crypto";
import * as nodemailer from "nodemailer";

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
    private readonly vechainSignatureHelper: VeChainSignatureHelper
  ) {
    const emailUser = this.configService.get(
      "EMAIL_USER",
      "jaimin.tank@alchemytech.ca"
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
    htmlContent: string
  ): Promise<void> {
    // if (!this.emailTransporter) {
    //   throw new BadRequestException('Email service not configured');
    // }

    const fromEmail = this.configService.get(
      "EMAIL_USER",
      "jaimin.tank@alchemytech.ca"
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
          "Email authentication failed. Please check SMTP credentials."
        );
      }
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }

  async loginWithEmail(email: string): Promise<{ message: string }> {
    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Create new user if not found
      user = this.userRepository.create({
        email,
        isActive: true,
        isVerified: false,
        totalMileage: 0,
        totalCarbonSaved: 0,
        totalPoints: 0,
        currentTier: "bronze",
        b3trBalance: 0,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailOtp = otp;
    await this.userRepository.save(user);

    await this.sendEmail(
      email,
      "Your B3TR EV Rewards Login Code",
      EmailTemplates.getOTPEmailTemplate(otp, {
        configService: this.configService,
      })
    );

    return { message: "Login code sent to your email address" };
  }

  async validateOtp(
    email: string,
    otp: string
  ): Promise<{ message: string; token: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.emailOtp || user.emailOtp !== otp) {
      throw new UnauthorizedException("Invalid OTP");
    }

    // Clear the OTP after successful validation
    user.emailOtp = undefined;

    // Generate a random wallet address if not exists
    if (!user.walletAddress) {
      const walletAddress = "0x" + crypto.randomBytes(20).toString("hex");
      if (!this.vechainSignatureHelper.isValidAddress(walletAddress)) {
        throw new Error("Generated invalid wallet address");
      }
      user.walletAddress = walletAddress;
      user.walletType = "sync2";
      user.isVerified = true;
    }

    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generate JWT token using the same payload structure as auth service
    const payload = {
      sub: user.id,
      walletAddress: user.walletAddress,
      email: user.email,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: "OTP validated successfully",
      token,
    };
  }

  /**
   * Get user dashboard data
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
        where: { userId, status: "completed" as any },
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
        .andWhere("upload.status = :status", { status: "completed" as any })
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
        .andWhere("upload.status = :status", { status: "completed" as any })
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
            weeklyUploads?.carbonSavedThisWeek || "0"
          ),
          rewardsEarnedThisWeek: 0, // Placeholder - would need reward tracking
          uploadsThisWeek: recentUploads.filter((u) => u.createdAt >= weekAgo)
            .length,
        },
        monthlyStats: {
          milesThisMonth: parseFloat(monthlyUploads?.milesThisMonth || "0"),
          carbonSavedThisMonth: parseFloat(
            monthlyUploads?.carbonSavedThisMonth || "0"
          ),
          rewardsEarnedThisMonth: 0, // Placeholder - would need reward tracking
          uploadsThisMonth: recentUploads.filter((u) => u.createdAt >= monthAgo)
            .length,
        },
        recentActivity,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get user dashboard for ${userId}: ${error.message}`
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
        `Failed to get user profile for ${userId}: ${error.message}`
      );
      throw new BadRequestException("Failed to get user profile");
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updateDto: UpdateUserProfileDto
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
        `Failed to update user profile for ${userId}: ${error.message}`
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
