import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  History,
  HistoryType,
  HistoryCategory,
} from "../entity/history.entity";
import { User } from "../../users/entity/user.entity";
import {
  CreateHistoryDto,
  UpdateHistoryDto,
  HistoryResponseDto,
  HistoryQueryDto,
  HistoryStatsDto,
} from "../dto/history.dto";

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  // History Management (Admin)

  /**
   * Create a history entry
   */
  async createHistory(
    createDto: CreateHistoryDto
  ): Promise<HistoryResponseDto> {
    try {
      // Verify user exists
      const user = await this.userRepository.findOne({
        where: { id: createDto.userId },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      const history = this.historyRepository.create({
        user: { id: createDto.userId },
        type: createDto.type,
        category: createDto.category,
        title: createDto.title,
        data: createDto.data,
        description: createDto.description,
        value: createDto.value || 0,
        previousValue: 0,
        isVisible: true,
      });

      const savedHistory = await this.historyRepository.save(history);

      this.logger.log(`History entry created: ${savedHistory.id}`);
      return this.transformHistoryToResponse(savedHistory);
    } catch (error) {
      this.logger.error(`Failed to create history entry: ${error.message}`);
      throw new BadRequestException("Failed to create history entry");
    }
  }

  /**
   * Get history entries with filtering
   */
  async getHistory(
    query: HistoryQueryDto,
    userId?: string
  ): Promise<{
    history: HistoryResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        category,
        search,
        startDate,
        endDate,
        sortBy = "createdAt",
        sortOrder = "DESC",
      } = query;
      const offset = (page - 1) * limit;

      const queryBuilder = this.historyRepository
        .createQueryBuilder("history")
        .innerJoinAndSelect("history.user", "user");

      if (userId) {
        queryBuilder.andWhere("user.id = :userId", { userId });
      }

      if (type) {
        queryBuilder.andWhere("history.type = :type", { type });
      }

      if (category) {
        queryBuilder.andWhere("history.category = :category", { category });
      }

      if (search) {
        queryBuilder.andWhere(
          "history.title ILIKE :search OR history.description ILIKE :search",
          { search: `%${search}%` }
        );
      }

      if (startDate) {
        queryBuilder.andWhere("history.createdAt >= :startDate", {
          startDate: new Date(startDate),
        });
      }

      if (endDate) {
        queryBuilder.andWhere("history.createdAt <= :endDate", {
          endDate: new Date(endDate),
        });
      }

      // Filter out deleted history entries
      queryBuilder.andWhere("history.isDeleted = :isDeleted", {
        isDeleted: false,
      });

      // Filter visible entries for users
      if (userId) {
        queryBuilder.andWhere("history.isVisible = :isVisible", {
          isVisible: true,
        });
      }

      const total = await queryBuilder.getCount();
      const historyEntries = await queryBuilder
        .skip(offset)
        .take(limit)
        .orderBy(`history.${sortBy}`, sortOrder)
        .getMany();

      return {
        history: historyEntries.map((entry) =>
          this.transformHistoryToResponse(entry)
        ),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to get history: ${error.message}`);
      throw new BadRequestException("Failed to get history");
    }
  }

  /**
   * Get history entry by ID
   */
  async getHistoryById(
    historyId: string,
    userId?: string
  ): Promise<HistoryResponseDto> {
    const queryBuilder = this.historyRepository
      .createQueryBuilder("history")
      .where("history.id = :historyId", { historyId })
      .andWhere("history.isDeleted = :isDeleted", { isDeleted: false });

    if (userId) {
      queryBuilder.innerJoin("history.user", "user");
      queryBuilder.andWhere("user.id = :userId", { userId });
      queryBuilder.andWhere("history.isVisible = :isVisible", {
        isVisible: true,
      });
    }

    const history = await queryBuilder.getOne();

    if (!history) {
      throw new NotFoundException("History entry not found");
    }

    return this.transformHistoryToResponse(history);
  }

  /**
   * Update history entry
   */
  async updateHistory(
    historyId: string,
    updateDto: UpdateHistoryDto,
    userId?: string
  ): Promise<HistoryResponseDto> {
    try {
      const queryBuilder = this.historyRepository
        .createQueryBuilder("history")
        .where("history.id = :historyId", { historyId })
        .andWhere("history.isDeleted = :isDeleted", { isDeleted: false });

      if (userId) {
        queryBuilder.innerJoin("history.user", "user");
        queryBuilder.andWhere("user.id = :userId", { userId });
      }

      const history = await queryBuilder.getOne();

      if (!history) {
        throw new NotFoundException("History entry not found");
      }

      Object.assign(history, updateDto);
      const updatedHistory = await this.historyRepository.save(history);

      this.logger.log(`History entry updated: ${historyId}`);
      return this.transformHistoryToResponse(updatedHistory);
    } catch (error) {
      this.logger.error(`Failed to update history entry: ${error.message}`);
      throw new BadRequestException("Failed to update history entry");
    }
  }

  /**
   * Delete history entry (soft delete)
   */
  async deleteHistory(historyId: string, userId?: string): Promise<void> {
    try {
      const queryBuilder = this.historyRepository
        .createQueryBuilder("history")
        .where("history.id = :historyId", { historyId })
        .andWhere("history.isDeleted = :isDeleted", { isDeleted: false });

      if (userId) {
        queryBuilder.innerJoin("history.user", "user");
        queryBuilder.andWhere("user.id = :userId", { userId });
      }

      const history = await queryBuilder.getOne();

      if (!history) {
        throw new NotFoundException("History entry not found");
      }

      history.isDeleted = true;
      history.deletedAt = new Date();
      await this.historyRepository.save(history);

      this.logger.log(`History entry deleted: ${historyId}`);
    } catch (error) {
      this.logger.error(`Failed to delete history entry: ${error.message}`);
      throw new BadRequestException("Failed to delete history entry");
    }
  }

  // User History Management

  /**
   * Get user history
   */
  async getUserHistory(
    userId: string,
    query: HistoryQueryDto
  ): Promise<{
    history: HistoryResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.getHistory(query, userId);
  }

  /**
   * Get user history statistics
   */
  async getUserHistoryStats(userId: string): Promise<HistoryStatsDto> {
    return this.getHistoryStats(userId);
  }

  /**
   * Get history statistics
   */
  async getHistoryStats(userId?: string): Promise<HistoryStatsDto> {
    try {
      const queryBuilder = this.historyRepository
        .createQueryBuilder("history")
        .where("history.isDeleted = :isDeleted", { isDeleted: false });

      if (userId) {
        queryBuilder.innerJoin("history.user", "user");
        queryBuilder.andWhere("user.id = :userId", { userId });
        queryBuilder.andWhere("history.isVisible = :isVisible", {
          isVisible: true,
        });
      }

      const total = await queryBuilder.getCount();

      // Get history by category
      const byCategoryQuery = await queryBuilder
        .select(["history.category", "COUNT(*) as count"])
        .groupBy("history.category")
        .getRawMany();

      const byCategory: Record<string, number> = {};
      byCategoryQuery.forEach((item) => {
        byCategory[item.history_category] = parseInt(item.count);
      });

      // Get history by type
      const byTypeQuery = await queryBuilder
        .select(["history.type", "COUNT(*) as count"])
        .groupBy("history.type")
        .getRawMany();

      const byType: Record<string, number> = {};
      byTypeQuery.forEach((item) => {
        byType[item.history_type] = parseInt(item.count);
      });

      // Get recent entries (last 24 hours)
      const recent = await queryBuilder
        .andWhere("history.createdAt >= :recentDate", {
          recentDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        })
        .getCount();

      // Get today's entries
      const today = await queryBuilder
        .andWhere("DATE(history.createdAt) = DATE(NOW())")
        .getCount();

      // Get this week's entries
      const thisWeek = await queryBuilder
        .andWhere("history.createdAt >= :weekStart", {
          weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        })
        .getCount();

      // Get this month's entries
      const thisMonth = await queryBuilder
        .andWhere("history.createdAt >= :monthStart", {
          monthStart: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          ),
        })
        .getCount();

      // Get total and average values
      const valueStats = await queryBuilder
        .select([
          "SUM(history.value) as totalValue",
          "AVG(history.value) as averageValue",
        ])
        .getRawOne();

      const totalValue = parseFloat(valueStats?.totalValue || "0");
      const averageValue = parseFloat(valueStats?.averageValue || "0");

      // Get most active day
      const mostActiveDayQuery = await queryBuilder
        .select(["DATE(history.createdAt) as date", "COUNT(*) as count"])
        .groupBy("DATE(history.createdAt)")
        .orderBy("count", "DESC")
        .limit(1)
        .getRawOne();

      const mostActiveDay = mostActiveDayQuery?.date || null;
      const mostActiveDayCount = parseInt(mostActiveDayQuery?.count || "0");

      return {
        total,
        byCategory,
        byType,
        recent,
        today,
        thisWeek,
        thisMonth,
        totalValue,
        averageValue,
        mostActiveDay,
        mostActiveDayCount,
      };
    } catch (error) {
      this.logger.error(`Failed to get history stats: ${error.message}`);
      throw new BadRequestException("Failed to get history stats");
    }
  }

  // Helper methods

  /**
   * Transform history to response DTO
   */
  private transformHistoryToResponse(history: History): HistoryResponseDto {
    return {
      id: history.id,
      userId: history.user.id,
      type: history.type,
      category: history.category,
      title: history.title,
      description: history.description,
      data: history.data,
      value: history.value,
      previousValue: history.previousValue,
      isVisible: history.isVisible,
      isDeleted: history.isDeleted,
      deletedAt: history.deletedAt,
      notes: history.notes,
      createdAt: history.createdAt,
      updatedAt: history.updatedAt,
      // Virtual properties
      isRecent: history.isRecent,
      isToday: history.isToday,
      isThisWeek: history.isThisWeek,
      isThisMonth: history.isThisMonth,
      formattedValue: history.formattedValue,
      valueChange: history.valueChange,
      formattedValueChange: history.formattedValueChange,
      isPositiveChange: history.isPositiveChange,
      categoryIcon: history.categoryIcon,
      typeIcon: history.typeIcon,
      formattedCreatedAt: history.formattedCreatedAt,
      canBeDeleted: history.canBeDeleted,
      actionButtonText: history.actionButtonText,
    };
  }

  // Auto-history methods for system events

  /**
   * Create vehicle upload history
   */
  async createVehicleUploadHistory(
    userId: string,
    vehicleId: string,
    vehicleName: string,
    uploadId: string,
    mileage: number,
    carbonSaved: number,
    previousMileage?: number
  ): Promise<void> {
    const mileageDifference = previousMileage
      ? mileage - previousMileage
      : mileage;

    // Get user name for the title
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    const userName = user?.username || user?.email || "Unknown User";

    await this.createHistory({
      userId,
      type: HistoryType.VEHICLE_UPLOAD,
      category: HistoryCategory.ORDERS,
      title: `VEHICLE UPLOAD for ${userName}`,
      description: "User performed vehicle upload activity",
      data: {
        activity: "vehicle_upload",
        timestamp: new Date().toISOString(),
        userId: userId,
        value: mileage,
        previousValue: previousMileage || 0,
        vehicleId,
        vehicleName,
        uploadId,
        carbonSaved,
        mileageDifference,
        actionUrl: `/uploads/${uploadId}`,
      },
      value: mileage,
      previousValue: previousMileage || 0,
    });
  }

  /**
   * Create reward earned history
   */
  async createRewardEarnedHistory(
    userId: string,
    rewardAmount: number,
    rewardType: string,
    previousBalance: number,
    newBalance: number,
    source?: string
  ): Promise<void> {
    await this.createHistory({
      userId,
      type: HistoryType.REWARD_EARNED,
      category: HistoryCategory.REWARDS,
      title: "Rewards Earned",
      description: `Earned ${rewardAmount.toFixed(2)} B3TR tokens`,
      data: {
        rewardAmount,
        rewardType,
        previousBalance,
        newBalance,
        transactionType: "earned",
        actionUrl: "/dashboard",
      },
      value: rewardAmount,
      previousValue: previousBalance,
    });
  }

  /**
   * Create reward spent history
   */
  async createRewardSpentHistory(
    userId: string,
    rewardAmount: number,
    rewardType: string,
    previousBalance: number,
    newBalance: number,
    purpose?: string,
    orderId?: string
  ): Promise<void> {
    await this.createHistory({
      userId,
      type: HistoryType.REWARD_SPENT,
      category: HistoryCategory.REWARDS,
      title: "Rewards Spent",
      description: `Spent ${rewardAmount.toFixed(2)} B3TR tokens${purpose ? ` on ${purpose}` : ""}`,
      data: {
        rewardAmount,
        rewardType,
        previousBalance,
        newBalance,
        transactionType: "spent",
        orderId,
        actionUrl: orderId ? `/orders/${orderId}` : "/dashboard",
      },
      value: rewardAmount,
      previousValue: previousBalance,
    });
  }

  /**
   * Create badge earned history
   */
  async createBadgeEarnedHistory(
    userId: string,
    badgeId: string,
    badgeName: string,
    badgeType: string,
    badgeRarity: string,
    rewards?: any
  ): Promise<void> {
    await this.createHistory({
      userId,
      type: HistoryType.BADGE_EARNED,
      category: HistoryCategory.ACHIEVEMENTS,
      title: "Badge Earned",
      description: `Earned the "${badgeName}" badge!`,
      data: {
        badgeId,
        badgeName,
        badgeType,
        badgeRarity,
        rewardAmount: rewards?.b3trTokens,
        rewardType: "badge",
        actionUrl: `/badges/${badgeId}`,
      },
      value: rewards?.b3trTokens || 0,
      previousValue: 0,
    });
  }

  /**
   * Create challenge joined history
   */
  async createChallengeJoinedHistory(
    userId: string,
    challengeId: string,
    challengeName: string,
    challengeType: string,
    challengeDifficulty: string
  ): Promise<void> {
    await this.createHistory({
      userId,
      type: HistoryType.CHALLENGE_JOINED,
      category: HistoryCategory.CHALLENGES,
      title: "Challenge Joined",
      description: `Joined the "${challengeName}" challenge`,
      data: {
        challengeId,
        challengeName,
        challengeType,
        challengeDifficulty,
        actionUrl: `/challenges/${challengeId}`,
      },
      value: 0,
      previousValue: 0,
    });
  }

  /**
   * Create challenge completed history
   */
  async createChallengeCompletedHistory(
    userId: string,
    challengeId: string,
    challengeName: string,
    challengeType: string,
    challengeDifficulty: string,
    rewards?: any
  ): Promise<void> {
    await this.createHistory({
      userId,
      type: HistoryType.CHALLENGE_COMPLETED,
      category: HistoryCategory.CHALLENGES,
      title: "Challenge Completed",
      description: `Completed the "${challengeName}" challenge!`,
      data: {
        challengeId,
        challengeName,
        challengeType,
        challengeDifficulty,
        rewardAmount: rewards?.b3trTokens,
        rewardType: "challenge",
        actionUrl: `/challenges/${challengeId}`,
      },
      value: rewards?.b3trTokens || 0,
      previousValue: 0,
    });
  }

  /**
   * Create order placed history
   */
  async createOrderPlacedHistory(
    userId: string,
    orderId: string,
    orderNumber: string,
    productName: string,
    quantity: number,
    totalAmount: number
  ): Promise<void> {
    await this.createHistory({
      userId,
      type: HistoryType.ORDER_PLACED,
      category: HistoryCategory.ORDERS,
      title: "Order Placed",
      description: `Placed order for ${quantity}x ${productName}`,
      data: {
        orderId,
        orderNumber,
        productName,
        quantity,
        totalAmount,
        orderStatus: "pending",
        actionUrl: `/orders/${orderId}`,
      },
      value: totalAmount,
      previousValue: 0,
    });
  }

  /**
   * Create vehicle added history
   */
  async createVehicleAddedHistory(
    userId: string,
    vehicleId: string,
    vehicleName: string,
    vehicleType: string
  ): Promise<void> {
    await this.createHistory({
      userId,
      type: HistoryType.VEHICLE_ADDED,
      category: HistoryCategory.VEHICLES,
      title: "Vehicle Added",
      description: `Added ${vehicleName} (${vehicleType}) to your fleet`,
      data: {
        vehicleId,
        vehicleName,
        actionUrl: `/vehicles/${vehicleId}`,
      },
      value: 0,
      previousValue: 0,
    });
  }

  /**
   * Create leaderboard rank history
   */
  async createLeaderboardRankHistory(
    userId: string,
    rank: number,
    previousRank: number,
    period: string,
    score: number,
    previousScore: number
  ): Promise<void> {
    await this.createHistory({
      userId,
      type: HistoryType.LEADERBOARD_RANK,
      category: HistoryCategory.LEADERBOARD,
      title: "Leaderboard Update",
      description: `Ranked #${rank} in ${period} leaderboard`,
      data: {
        rank,
        previousRank,
        period,
        score,
        previousScore,
        actionUrl: "/leaderboard",
      },
      value: rank,
      previousValue: previousRank,
    });
  }

  /**
   * Create milestone reached history
   */
  async createMilestoneReachedHistory(
    userId: string,
    milestone: string,
    milestoneType: string,
    milestoneValue: number,
    rewards?: any
  ): Promise<void> {
    await this.createHistory({
      userId,
      type: HistoryType.MILESTONE_REACHED,
      category: HistoryCategory.ACHIEVEMENTS,
      title: "Milestone Reached",
      description: `Reached ${milestone} milestone!`,
      data: {
        milestone,
        milestoneType,
        milestoneValue,
        rewardAmount: rewards?.b3trTokens,
        rewardType: "milestone",
        actionUrl: "/dashboard",
      },
      value: milestoneValue,
      previousValue: 0,
    });
  }
}
