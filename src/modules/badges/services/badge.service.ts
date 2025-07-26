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
import { OdometerUpload } from "../../odometer/entity/odometer-upload.entity";
import {
  CreateBadgeDto,
  UpdateBadgeDto,
  BadgeResponseDto,
  UserBadgeResponseDto,
} from "../dto/badge.dto";

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
    private readonly odometerUploadRepository: Repository<OdometerUpload>
  ) {}

  // Badge Management (Admin)

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
        status: BadgeStatus.DRAFT,
      });

      const savedBadge = await this.badgeRepository.save(badge);

      this.logger.log(`Badge created: ${savedBadge.id}`);
      return this.transformBadgeToResponse(savedBadge);
    } catch (error) {
      this.logger.error(`Failed to create badge: ${error.message}`);
      throw new BadRequestException("Failed to create badge");
    }
  }

  /**
   * Get all badges with filtering
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
    const badge = await this.badgeRepository.findOne({
      where: { id: badgeId },
    });

    if (!badge) {
      throw new NotFoundException("Badge not found");
    }

    return this.transformBadgeToResponse(badge);
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

      if (!badge.canBeEdited) {
        throw new BadRequestException(
          "Cannot edit badge that has been earned by users"
        );
      }

      Object.assign(badge, updateDto);
      const updatedBadge = await this.badgeRepository.save(badge);

      this.logger.log(`Badge updated: ${badgeId}`);
      return this.transformBadgeToResponse(updatedBadge);
    } catch (error) {
      this.logger.error(`Failed to update badge: ${error.message}`);
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
      badge.publishedAt = new Date();
      const updatedBadge = await this.badgeRepository.save(badge);

      this.logger.log(`Badge published: ${badgeId}`);
      return this.transformBadgeToResponse(updatedBadge);
    } catch (error) {
      this.logger.error(`Failed to publish badge: ${error.message}`);
      throw new BadRequestException("Failed to publish badge");
    }
  }

  /**
   * Delete badge (soft delete)
   */
  async deleteBadge(badgeId: string): Promise<void> {
    try {
      const badge = await this.badgeRepository.findOne({
        where: { id: badgeId },
      });

      if (!badge) {
        throw new NotFoundException("Badge not found");
      }

      if (!badge.canBeEdited) {
        throw new BadRequestException(
          "Cannot delete badge that has been earned by users"
        );
      }

      badge.status = BadgeStatus.INACTIVE;
      await this.badgeRepository.save(badge);

      this.logger.log(`Badge deleted: ${badgeId}`);
    } catch (error) {
      this.logger.error(`Failed to delete badge: ${error.message}`);
      throw new BadRequestException("Failed to delete badge");
    }
  }

  // User Badge Management

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
        .where("userBadge.userId = :userId", { userId })
        .andWhere("userBadge.isVisible = :isVisible", { isVisible: true });

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
      // Get all active badges
      const activeBadges = await this.badgeRepository.find({
        where: { status: BadgeStatus.ACTIVE },
      });

      // Get user's earned badges
      const earnedBadgeIds = await this.userBadgeRepository
        .createQueryBuilder("userBadge")
        .select("userBadge.badgeId")
        .where("userBadge.userId = :userId", { userId })
        .getMany();

      const earnedBadgeIdSet = new Set(earnedBadgeIds.map((ub) => ub.badgeId));

      // Filter out already earned badges
      const availableBadges = activeBadges.filter(
        (badge) => !earnedBadgeIdSet.has(badge.id)
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
   * Check and award badges for user
   */
  async checkAndAwardBadges(userId: string): Promise<UserBadgeResponseDto[]> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      // Get user statistics
      const userStats = await this.getUserStats(userId);

      // Get available badges
      const availableBadges = await this.getAvailableBadges(userId);

      const newlyAwardedBadges: UserBadgeResponseDto[] = [];

      for (const badgeResponse of availableBadges) {
        const badge = await this.badgeRepository.findOne({
          where: { id: badgeResponse.id },
        });
        if (badge && (await this.checkBadgeConditions(badge, userStats))) {
          const userBadge = await this.awardBadge(userId, badge.id, userStats);
          newlyAwardedBadges.push(userBadge);
        }
      }

      if (newlyAwardedBadges.length > 0) {
        this.logger.log(
          `Awarded ${newlyAwardedBadges.length} badges to user ${userId}`
        );
      }

      return newlyAwardedBadges;
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
        where: { id: userBadgeId, userId },
        relations: ["badge"],
      });

      if (!userBadge) {
        throw new NotFoundException("User badge not found");
      }

      if (userBadge.rewardsClaimed) {
        throw new ConflictException("Rewards already claimed");
      }

      if (!userBadge.hasRewards) {
        throw new BadRequestException("No rewards to claim");
      }

      // Update user with rewards
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (userBadge.rewards.b3trTokens) {
        user.b3trBalance += userBadge.rewards.b3trTokens;
      }

      if (userBadge.rewards.points) {
        user.totalPoints += userBadge.rewards.points;
      }

      await this.userRepository.save(user);

      // Mark rewards as claimed
      userBadge.rewardsClaimed = true;
      userBadge.claimedAt = new Date();
      await this.userBadgeRepository.save(userBadge);

      this.logger.log(`Badge rewards claimed: ${userBadgeId}`);
      return this.transformUserBadgeToResponse(userBadge);
    } catch (error) {
      this.logger.error(`Failed to claim badge rewards: ${error.message}`);
      throw new BadRequestException("Failed to claim badge rewards");
    }
  }

  // Helper methods

  /**
   * Get user statistics for badge checking
   */
  private async getUserStats(userId: string): Promise<any> {
    // Get total mileage
    const totalMileage = await this.odometerUploadRepository
      .createQueryBuilder("upload")
      .select("SUM(upload.finalMileage)", "totalMileage")
      .where("upload.userId = :userId", { userId })
      .andWhere("upload.status = :status", { status: "completed" as any })
      .getRawOne();

    // Get total carbon saved
    const totalCarbonSaved = await this.odometerUploadRepository
      .createQueryBuilder("upload")
      .select("SUM(upload.carbonSaved)", "totalCarbonSaved")
      .where("upload.userId = :userId", { userId })
      .andWhere("upload.status = :status", { status: "completed" as any })
      .getRawOne();

    // Get vehicle count
    const vehicleCount = await this.vehicleRepository.count({
      where: { userId, isActive: true },
    });

    // Get user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    return {
      totalMileage: parseFloat(totalMileage?.totalMileage || "0"),
      totalCarbonSaved: parseFloat(totalCarbonSaved?.totalCarbonSaved || "0"),
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
      where: { userId, badgeId },
    });

    if (existingUserBadge) {
      throw new ConflictException("User already has this badge");
    }

    // Create user badge
    const userBadge = this.userBadgeRepository.create({
      userId,
      badgeId,
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
