import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Badge, BadgeType, BadgeStatus } from "../entity/badge.entity";
import { UserBadge } from "../entity/user-badge.entity";
import { User } from "../../users/entity/user.entity";
import { Vehicle } from "../../vehicles/entity/vehicle.entity";
import {
  OdometerUpload,
  UploadStatus,
} from "../../odometer/entity/odometer-upload.entity";
import {
  CreateBadgeDto,
  UpdateBadgeDto,
  BadgeResponseDto,
  UserBadgeResponseDto,
} from "../dto/badge.dto";
import { RewardService } from "../../rewards/services/reward.service";

@Injectable()
export class BadgeService {
  private readonly logger = new Logger(BadgeService.name);

  constructor(
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepository: Repository<UserBadge>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(OdometerUpload)
    private readonly odometerUploadRepository: Repository<OdometerUpload>,
    private readonly rewardService: RewardService
  ) {}

  /**
   * Create a new badge
   */
  async createBadge(
    createDto: CreateBadgeDto,
    adminId: string
  ): Promise<BadgeResponseDto> {
    try {
      const badge = this.badgeRepository.create({
        ...createDto,
        createdBy: adminId,
      });

      const savedBadge = await this.badgeRepository.save(badge);
      return this.transformBadgeToResponse(savedBadge);
    } catch (error) {
      this.logger.error(`Failed to create badge: ${error.message}`);
      throw new BadRequestException("Failed to create badge");
    }
  }

  /**
   * Get all badges with pagination and filters
   */
  async getBadges(
    page: number = 1,
    limit: number = 20,
    type?: BadgeType,
    status?: BadgeStatus,
    search?: string
  ): Promise<{
    badges: BadgeResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;

      const query = this.badgeRepository.createQueryBuilder("badge");

      if (type) {
        query.andWhere("badge.type = :type", { type });
      }

      if (status) {
        query.andWhere("badge.status = :status", { status });
      }

      if (search) {
        query.andWhere(
          "badge.name ILIKE :search OR badge.description ILIKE :search",
          { search: `%${search}%` }
        );
      }

      const total = await query.getCount();
      const badges = await query
        .skip(offset)
        .take(limit)
        .orderBy("badge.createdAt", "DESC")
        .getMany();

      return {
        badges: badges.map((badge) => this.transformBadgeToResponse(badge)),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to get badges: ${error.message}`);
      throw new BadRequestException("Failed to get badges");
    }
  }

  /**
   * Get badge by ID
   */
  async getBadgeById(badgeId: string): Promise<BadgeResponseDto> {
    try {
      const badge = await this.badgeRepository.findOne({
        where: { id: badgeId },
      });

      if (!badge) {
        throw new NotFoundException("Badge not found");
      }

      return this.transformBadgeToResponse(badge);
    } catch (error) {
      this.logger.error(`Failed to get badge ${badgeId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update badge
   */
  async updateBadge(
    badgeId: string,
    updateDto: UpdateBadgeDto
  ): Promise<BadgeResponseDto> {
    try {
      const badge = await this.badgeRepository.findOne({
        where: { id: badgeId },
      });

      if (!badge) {
        throw new NotFoundException("Badge not found");
      }

      Object.assign(badge, updateDto);
      const updatedBadge = await this.badgeRepository.save(badge);

      return this.transformBadgeToResponse(updatedBadge);
    } catch (error) {
      this.logger.error(`Failed to update badge ${badgeId}: ${error.message}`);
      throw new BadRequestException("Failed to update badge");
    }
  }

  /**
   * Publish badge
   */
  async publishBadge(badgeId: string): Promise<BadgeResponseDto> {
    try {
      const badge = await this.badgeRepository.findOne({
        where: { id: badgeId },
      });

      if (!badge) {
        throw new NotFoundException("Badge not found");
      }

      badge.status = BadgeStatus.ACTIVE;
      const publishedBadge = await this.badgeRepository.save(badge);

      return this.transformBadgeToResponse(publishedBadge);
    } catch (error) {
      this.logger.error(`Failed to publish badge ${badgeId}: ${error.message}`);
      throw new BadRequestException("Failed to publish badge");
    }
  }

  /**
   * Delete badge
   */
  async deleteBadge(badgeId: string): Promise<void> {
    try {
      const badge = await this.badgeRepository.findOne({
        where: { id: badgeId },
      });

      if (!badge) {
        throw new NotFoundException("Badge not found");
      }

      await this.badgeRepository.remove(badge);
    } catch (error) {
      this.logger.error(`Failed to delete badge ${badgeId}: ${error.message}`);
      throw new BadRequestException("Failed to delete badge");
    }
  }

  /**
   * Get user badges
   */
  async getUserBadges(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    userBadges: UserBadgeResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;

      const query = this.userBadgeRepository
        .createQueryBuilder("userBadge")
        .leftJoinAndSelect("userBadge.badge", "badge")
        .leftJoinAndSelect("userBadge.user", "user")
        .where("user.id = :userId", { userId });

      const total = await query.getCount();
      const userBadges = await query
        .skip(offset)
        .take(limit)
        .orderBy("userBadge.createdAt", "DESC")
        .getMany();

      return {
        userBadges: userBadges.map((userBadge) =>
          this.transformUserBadgeToResponse(userBadge)
        ),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to get user badges: ${error.message}`);
      throw new BadRequestException("Failed to get user badges");
    }
  }

  /**
   * Get available badges for user
   */
  async getAvailableBadges(userId: string): Promise<BadgeResponseDto[]> {
    try {
      const badges = await this.badgeRepository.find({
        where: { status: BadgeStatus.ACTIVE },
      });

      const userBadges = await this.userBadgeRepository.find({
        where: { user: { id: userId } },
        select: ["badge"],
      });

      const earnedBadgeIds = userBadges.map((ub) => ub.badge.id);
      const availableBadges = badges.filter(
        (badge) => !earnedBadgeIds.includes(badge.id)
      );

      return availableBadges.map((badge) =>
        this.transformBadgeToResponse(badge)
      );
    } catch (error) {
      this.logger.error(`Failed to get available badges: ${error.message}`);
      throw new BadRequestException("Failed to get available badges");
    }
  }

  /**
   * Check and award badges to user
   */
  async checkAndAwardBadges(userId: string): Promise<UserBadgeResponseDto[]> {
    try {
      const availableBadges = await this.getAvailableBadges(userId);
      const userStats = await this.getUserStats(userId);
      const awardedBadges: UserBadgeResponseDto[] = [];

      for (const badgeResponse of availableBadges) {
        const badge = await this.badgeRepository.findOne({
          where: { id: badgeResponse.id },
        });

        if (badge) {
          const meetsConditions = await this.checkBadgeConditions(
            badge,
            userStats
          );
          if (meetsConditions) {
            const awardedBadge = await this.awardBadge(
              userId,
              badge.id,
              userStats
            );
            awardedBadges.push(awardedBadge);
          }
        }
      }

      return awardedBadges;
    } catch (error) {
      this.logger.error(`Failed to check and award badges: ${error.message}`);
      throw new BadRequestException("Failed to check and award badges");
    }
  }

  /**
   * Claim badge rewards
   */
  async claimBadgeRewards(
    userId: string,
    userBadgeId: string
  ): Promise<UserBadgeResponseDto> {
    try {
      const userBadge = await this.userBadgeRepository.findOne({
        where: { id: userBadgeId, user: { id: userId } },
      });

      if (!userBadge) {
        throw new NotFoundException("User badge not found");
      }

      if (userBadge.rewardsClaimed) {
        throw new BadRequestException("Rewards already claimed");
      }

      // Mark rewards as claimed
      userBadge.rewardsClaimed = true;
      userBadge.claimedAt = new Date();

      const updatedUserBadge = await this.userBadgeRepository.save(userBadge);

      return this.transformUserBadgeToResponse(updatedUserBadge);
    } catch (error) {
      this.logger.error(`Failed to claim badge rewards: ${error.message}`);
      throw new BadRequestException("Failed to claim badge rewards");
    }
  }

  /**
   * Get user statistics for badge conditions
   */
  private async getUserStats(userId: string): Promise<any> {
    // Get total mileage
    const totalMileage = await this.odometerUploadRepository
      .createQueryBuilder("upload")
      .innerJoin("upload.user", "user")
      .select("SUM(upload.finalMileage)", "totalmileage")
      .where("user.id = :userId", { userId })
      .andWhere("upload.status = :status", { status: UploadStatus.COMPLETED })
      .getRawOne();

    // Get total carbon saved
    const totalCarbonSaved = await this.odometerUploadRepository
      .createQueryBuilder("upload")
      .innerJoin("upload.user", "user")
      .select("SUM(upload.carbonSaved)", "totalcarbonsaved")
      .where("user.id = :userId", { userId })
      .andWhere("upload.status = :status", { status: UploadStatus.COMPLETED })
      .getRawOne();

    // Get vehicle count
    const vehicleCount = await this.vehicleRepository
      .createQueryBuilder("vehicle")
      .where("vehicle.user_id = :userId", { userId })
      .andWhere("vehicle.isActive = :isActive", { isActive: true })
      .getCount();

    // Get user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    return {
      totalMileage: parseFloat(totalMileage?.totalmileage || "0"),
      totalCarbonSaved: parseFloat(totalCarbonSaved?.totalcarbonsaved || "0"),
      vehicleCount,
      totalRewards: parseFloat(user?.b3trBalance.toString() || "0"),
      totalPoints: user?.totalPoints || 0,
    };
  }

  /**
   * Check if user meets badge conditions
   */
  private async checkBadgeConditions(
    badge: Badge,
    userStats: any
  ): Promise<boolean> {
    const { conditions } = badge;
    if (!conditions) return false;

    // Check mileage condition
    if (conditions.mileage && userStats.totalMileage < conditions.mileage) {
      return false;
    }

    // Check carbon saved condition
    if (
      conditions.carbonSaved &&
      userStats.totalCarbonSaved < conditions.carbonSaved
    ) {
      return false;
    }

    // Check vehicle count condition
    if (
      conditions.vehicleCount &&
      userStats.vehicleCount < conditions.vehicleCount
    ) {
      return false;
    }

    // Check rewards earned condition
    if (
      conditions.rewardsEarned &&
      userStats.totalRewards < conditions.rewardsEarned
    ) {
      return false;
    }

    return true;
  }

  /**
   * Award badge to user
   */
  private async awardBadge(
    userId: string,
    badgeId: string,
    userStats: any
  ): Promise<UserBadgeResponseDto> {
    const badge = await this.badgeRepository.findOne({
      where: { id: badgeId },
    });

    if (!badge) {
      throw new NotFoundException("Badge not found");
    }

    // Check if user already has this badge
    const existingUserBadge = await this.userBadgeRepository.findOne({
      where: { user: { id: userId }, badge: { id: badgeId } },
    });

    if (existingUserBadge) {
      throw new ConflictException("User already has this badge");
    }

    // Create user badge
    const userBadge = this.userBadgeRepository.create({
      user: { id: userId },
      badge: { id: badgeId },
      earnedData: {
        mileage: userStats.totalMileage,
        carbonSaved: userStats.totalCarbonSaved,
        vehicleCount: userStats.vehicleCount,
        rewardsEarned: userStats.totalRewards,
      },
      rewards: badge.rewards,
      isVisible: true,
    });

    const savedUserBadge = await this.userBadgeRepository.save(userBadge);

    // Update badge earned count
    badge.earnedCount += 1;
    await this.badgeRepository.save(badge);

    // Create reward if badge has rewards
    if (badge.rewards && badge.rewards.b3trTokens > 0) {
      try {
        await this.rewardService.createBadgeReward(
          userId,
          badgeId,
          badge.name,
          badge.rewards.b3trTokens
        );
        this.logger.log(
          `Reward created for badge ${badge.name} for user ${userId}`
        );
      } catch (rewardError) {
        this.logger.error(
          `Failed to create reward for badge ${badge.name}: ${rewardError.message}`
        );
        // Don't throw error as reward creation failure shouldn't fail the badge award
      }
    }

    return this.transformUserBadgeToResponse(savedUserBadge);
  }

  /**
   * Transform badge to response DTO
   */
  private transformBadgeToResponse(badge: Badge): BadgeResponseDto {
    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      type: badge.type,
      rarity: badge.rarity,
      status: badge.status,
      imageUrl: badge.imageUrl,
      iconUrl: badge.iconUrl,
      conditions: badge.conditions,
      rewards: badge.rewards,
      pointsValue: badge.pointsValue,
      earnedCount: badge.earnedCount,
      metadata: badge.metadata,
      isPublished: badge.isPublished,
      canBeEdited: badge.canBeEdited,
      formattedRewards: badge.formattedRewards,
      difficultyDisplay: badge.difficultyDisplay,
      rarityColor: badge.rarityColor,
      createdAt: badge.createdAt,
      updatedAt: badge.updatedAt,
    };
  }

  /**
   * Transform user badge to response DTO
   */
  private transformUserBadgeToResponse(
    userBadge: UserBadge
  ): UserBadgeResponseDto {
    return {
      id: userBadge.id,
      badge: this.transformBadgeToResponse(userBadge.badge),
      earnedData: userBadge.earnedData,
      rewards: userBadge.rewards,
      rewardsClaimed: userBadge.rewardsClaimed,
      claimedAt: userBadge.claimedAt,
      notes: userBadge.notes,
      isVisible: userBadge.isVisible,
      hasRewards: userBadge.hasRewards,
      formattedRewards: userBadge.formattedRewards,
      timeSinceEarned: userBadge.timeSinceEarned,
      createdAt: userBadge.createdAt,
    };
  }
}
