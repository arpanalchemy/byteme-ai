import {
  Injectable,
  Logger,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { User } from "../../users/entity/user.entity";
import { Vehicle } from "../../vehicles/entity/vehicle.entity";
import { OdometerUpload } from "../../odometer/entity/odometer-upload.entity";
import { AdminLoginDto } from "../dto/admin-login.dto";
import {
  AdminDashboardStatsDto,
  AdminUserStatsDto,
} from "../dto/admin-dashboard.dto";

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  // Static admin credentials (should be moved to environment variables in production)
  private readonly ADMIN_USERNAME = "admin";
  private readonly ADMIN_PASSWORD = "admin123";

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(OdometerUpload)
    private readonly odometerUploadRepository: Repository<OdometerUpload>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Admin login with static credentials
   */
  async adminLogin(
    loginDto: AdminLoginDto
  ): Promise<{ token: string; message: string }> {
    const { username, password } = loginDto;

    if (username !== this.ADMIN_USERNAME || password !== this.ADMIN_PASSWORD) {
      throw new UnauthorizedException("Invalid admin credentials");
    }

    // Generate admin JWT token
    const payload = {
      sub: "admin",
      username: "admin",
      role: "admin",
      iat: Date.now(),
    };

    const token = this.jwtService.sign(payload);

    this.logger.log("Admin login successful");
    return {
      token,
      message: "Admin login successful",
    };
  }

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats(): Promise<AdminDashboardStatsDto> {
    try {
      // Get total users
      const totalUsers = await this.userRepository.count();

      // Get active users (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeUsers = await this.userRepository.count({
        where: {
          lastLogin: { $gte: thirtyDaysAgo } as any,
        },
      });

      // Get total vehicles
      const totalVehicles = await this.vehicleRepository.count({
        where: { isActive: true },
      });

      // Get total EV miles and carbon saved
      const userStats = await this.userRepository
        .createQueryBuilder("user")
        .select([
          "SUM(user.totalMileage) as totalEvMiles",
          "SUM(user.totalCarbonSaved) as totalCarbonSaved",
          "SUM(user.b3trBalance) as totalTokensDistributed",
        ])
        .getRawOne();

      // Get total uploads
      const totalUploads = await this.odometerUploadRepository.count();

      // Get pending uploads
      const pendingUploads = await this.odometerUploadRepository.count({
        where: { status: "pending" as any },
      });

      // Calculate weekly rewards (placeholder - would need actual reward tracking)
      const weeklyRewardsDistributed = 2500.75; // Placeholder

      return {
        totalUsers,
        activeUsers,
        totalVehicles,
        totalEvMiles: parseFloat(userStats?.totalEvMiles || "0"),
        totalCarbonSaved: parseFloat(userStats?.totalCarbonSaved || "0"),
        totalTokensDistributed: parseFloat(
          userStats?.totalTokensDistributed || "0"
        ),
        weeklyRewardsDistributed,
        totalUploads,
        pendingUploads,
        totalOrders: 350, // Placeholder - would need store module
        pendingOrders: 15, // Placeholder - would need store module
      };
    } catch (error) {
      this.logger.error("Failed to get dashboard stats", error);
      throw new BadRequestException("Failed to get dashboard statistics");
    }
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<{
    users: AdminUserStatsDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;

      const query = this.userRepository.createQueryBuilder("user");

      if (search) {
        query.where(
          "user.walletAddress ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search",
          { search: `%${search}%` }
        );
      }

      const total = await query.getCount();
      const users = await query
        .skip(offset)
        .take(limit)
        .orderBy("user.createdAt", "DESC")
        .getMany();

      const userStats: AdminUserStatsDto[] = users.map((user) => ({
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        totalMileage: parseFloat(user.totalMileage.toString()),
        totalCarbonSaved: parseFloat(user.totalCarbonSaved.toString()),
        b3trBalance: parseFloat(user.b3trBalance.toString()),
        currentTier: user.currentTier,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      }));

      return {
        users: userStats,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error("Failed to get users", error);
      throw new BadRequestException("Failed to get users");
    }
  }

  /**
   * Get user details by ID
   */
  async getUserDetails(userId: string): Promise<AdminUserStatsDto> {
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
        totalMileage: parseFloat(user.totalMileage.toString()),
        totalCarbonSaved: parseFloat(user.totalCarbonSaved.toString()),
        b3trBalance: parseFloat(user.b3trBalance.toString()),
        currentTier: user.currentTier,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      };
    } catch (error) {
      this.logger.error(`Failed to get user details for ${userId}`, error);
      throw new BadRequestException("Failed to get user details");
    }
  }

  /**
   * Block/Unblock user
   */
  async toggleUserStatus(
    userId: string
  ): Promise<{ message: string; isActive: boolean }> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      user.isActive = !user.isActive;
      await this.userRepository.save(user);

      const action = user.isActive ? "unblocked" : "blocked";
      this.logger.log(`User ${userId} ${action}`);

      return {
        message: `User ${action} successfully`,
        isActive: user.isActive,
      };
    } catch (error) {
      this.logger.error(`Failed to toggle user status for ${userId}`, error);
      throw new BadRequestException("Failed to toggle user status");
    }
  }

  /**
   * Get user vehicles
   */
  async getUserVehicles(userId: string): Promise<any[]> {
    try {
      const vehicles = await this.vehicleRepository.find({
        where: { userId, isActive: true },
        order: { createdAt: "DESC" },
      });

      return vehicles.map((vehicle) => ({
        id: vehicle.id,
        vehicleType: vehicle.vehicleType,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        plateNumber: vehicle.plateNumber,
        totalMileage: parseFloat(vehicle.totalMileage.toString()),
        totalCarbonSaved: parseFloat(vehicle.totalCarbonSaved.toString()),
        isPrimary: vehicle.isPrimary,
        createdAt: vehicle.createdAt,
        lastUploadDate: vehicle.lastUploadDate,
      }));
    } catch (error) {
      this.logger.error(`Failed to get vehicles for user ${userId}`, error);
      throw new BadRequestException("Failed to get user vehicles");
    }
  }

  /**
   * Get user upload history
   */
  async getUserUploadHistory(userId: string): Promise<any[]> {
    try {
      const uploads = await this.odometerUploadRepository.find({
        where: { userId },
        order: { createdAt: "DESC" },
        take: 50, // Limit to last 50 uploads
      });

      return uploads.map((upload) => ({
        id: upload.id,
        status: upload.status,
        extractedMileage: upload.extractedMileage,
        finalMileage: upload.finalMileage,
        carbonSaved: parseFloat(upload.carbonSaved.toString()),
        confidence: upload.ocrConfidenceScore,
        createdAt: upload.createdAt,
        processedAt: upload.processedAt,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get upload history for user ${userId}`,
        error
      );
      throw new BadRequestException("Failed to get user upload history");
    }
  }

  /**
   * Get system analytics
   */
  async getSystemAnalytics(): Promise<any> {
    try {
      // Get user growth over time
      const userGrowth = await this.userRepository
        .createQueryBuilder("user")
        .select(["DATE(user.createdAt) as date", "COUNT(*) as count"])
        .groupBy("DATE(user.createdAt)")
        .orderBy("date", "DESC")
        .limit(30)
        .getRawMany();

      // Get vehicle type distribution
      const vehicleTypes = await this.vehicleRepository
        .createQueryBuilder("vehicle")
        .select(["vehicle.vehicleType as type", "COUNT(*) as count"])
        .where("vehicle.isActive = :isActive", { isActive: true })
        .groupBy("vehicle.vehicleType")
        .getRawMany();

      // Get upload status distribution
      const uploadStatus = await this.odometerUploadRepository
        .createQueryBuilder("upload")
        .select(["upload.status as status", "COUNT(*) as count"])
        .groupBy("upload.status")
        .getRawMany();

      return {
        userGrowth,
        vehicleTypes,
        uploadStatus,
      };
    } catch (error) {
      this.logger.error("Failed to get system analytics", error);
      throw new BadRequestException("Failed to get system analytics");
    }
  }
}
