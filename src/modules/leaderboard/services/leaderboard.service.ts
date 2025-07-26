import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Leaderboard, LeaderboardPeriod } from "../entity/leaderboard.entity";
import { User } from "../../users/entity/user.entity";
import {
  OdometerUpload,
  UploadStatus,
} from "../../odometer/entity/odometer-upload.entity";
import {
  LeaderboardResponseDto,
  LeaderboardEntryDto,
} from "../dto/leaderboard.dto";

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    @InjectRepository(Leaderboard)
    private readonly leaderboardRepository: Repository<Leaderboard>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OdometerUpload)
    private readonly odometerUploadRepository: Repository<OdometerUpload>
  ) {}

  /**
   * Get leaderboard for a specific period
   */
  async getLeaderboard(
    period: LeaderboardPeriod = LeaderboardPeriod.WEEKLY,
    page: number = 1,
    limit: number = 20,
    userId?: string,
    sortBy: "mileage" | "carbon" | "rewards" | "points" = "mileage"
  ): Promise<LeaderboardResponseDto> {
    try {
      const { periodStart, periodEnd } = this.getPeriodDates(period);
      const offset = (page - 1) * limit;

      // Get user statistics for the period
      const userStats = await this.getUserStatsForPeriod(
        periodStart,
        periodEnd
      );

      // Sort by the specified criteria
      const sortedStats = userStats.sort((a, b) => {
        switch (sortBy) {
          case "mileage":
            return b.totalMileage - a.totalMileage;
          case "carbon":
            return b.totalCarbonSaved - a.totalCarbonSaved;
          case "rewards":
            return b.totalRewards - a.totalRewards;
          case "points":
            return b.totalPoints - a.totalPoints;
          default:
            return b.totalMileage - a.totalMileage;
        }
      });

      // Get paginated results
      const paginatedStats = sortedStats.slice(offset, offset + limit);

      // Get user details for the paginated results
      const entries: LeaderboardEntryDto[] = await Promise.all(
        paginatedStats.map(async (stat, index) => {
          const user = await this.userRepository.findOne({
            where: { id: stat.userId },
          });

          if (!user) {
            return null;
          }

          const rank = offset + index + 1;

          return {
            rank,
            userId: stat.userId,
            walletAddress: user.walletAddress,
            username: user.username || "Anonymous",
            profileImageUrl: user.profileImageUrl || "",
            totalMileage: stat.totalMileage,
            totalCarbonSaved: stat.totalCarbonSaved,
            totalRewards: stat.totalRewards,
            totalPoints: stat.totalPoints,
            uploadCount: stat.uploadCount,
            rankDisplay: this.getRankDisplay(rank),
          };
        })
      );

      // Filter out null entries
      const validEntries = entries.filter(Boolean);

      // Get current user's rank if provided
      let userRank: number | undefined;
      if (userId) {
        userRank = await this.getUserRank(
          userId,
          period,
          periodStart,
          periodEnd
        );
      }

      return {
        period,
        periodStart: periodStart.toISOString().split("T")[0],
        periodEnd: periodEnd.toISOString().split("T")[0],
        userRank,
        totalParticipants: userStats.length,
        entries: validEntries,
        page,
        limit,
        totalPages: Math.ceil(userStats.length / limit),
      };
    } catch (error) {
      this.logger.error(`Failed to get leaderboard: ${error.message}`);
      throw new BadRequestException("Failed to get leaderboard");
    }
  }

  /**
   * Update leaderboard for a specific period
   */
  async updateLeaderboard(
    period: LeaderboardPeriod = LeaderboardPeriod.WEEKLY
  ): Promise<void> {
    try {
      const { periodStart, periodEnd } = this.getPeriodDates(period);

      // Get user statistics for the period
      const userStats = await this.getUserStatsForPeriod(
        periodStart,
        periodEnd
      );

      // Clear existing leaderboard entries for this period
      await this.leaderboardRepository.delete({
        period,
        isActive: true,
      });

      // Create new leaderboard entries
      const leaderboardEntries = userStats.map((stat, index) => {
        return this.leaderboardRepository.create({
          period,
          userId: stat.userId,
          rank: index + 1,
          totalMileage: stat.totalMileage,
          totalCarbonSaved: stat.totalCarbonSaved,
          totalRewards: stat.totalRewards,
          totalPoints: stat.totalPoints,
          uploadCount: stat.uploadCount,
          periodStart,
          periodEnd,
          isActive: true,
        });
      });

      await this.leaderboardRepository.save(leaderboardEntries);

      this.logger.log(`Leaderboard updated for period: ${period}`);
    } catch (error) {
      this.logger.error(`Failed to update leaderboard: ${error.message}`);
      throw new BadRequestException("Failed to update leaderboard");
    }
  }

  /**
   * Get user's rank for a specific period
   */
  async getUserRank(
    userId: string,
    period: LeaderboardPeriod,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    try {
      const userStats = await this.getUserStatsForPeriod(
        periodStart,
        periodEnd
      );
      const userIndex = userStats.findIndex((stat) => stat.userId === userId);

      return userIndex >= 0 ? userIndex + 1 : 0;
    } catch (error) {
      this.logger.error(`Failed to get user rank: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get period start and end dates
   */
  private getPeriodDates(period: LeaderboardPeriod): {
    periodStart: Date;
    periodEnd: Date;
  } {
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    switch (period) {
      case LeaderboardPeriod.DAILY:
        periodStart = new Date(now);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(now);
        periodEnd.setDate(periodEnd.getDate() + 1);
        break;

      case LeaderboardPeriod.WEEKLY:
        periodStart = new Date(now);
        periodStart.setDate(periodStart.getDate() - periodStart.getDay());
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 7);
        break;

      case LeaderboardPeriod.MONTHLY:
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;

      case LeaderboardPeriod.ALL_TIME:
        periodStart = new Date(2020, 0, 1); // Start from 2020
        periodEnd = new Date(now);
        periodEnd.setDate(periodEnd.getDate() + 1);
        break;

      default:
        throw new BadRequestException("Invalid period");
    }

    return { periodStart, periodEnd };
  }

  /**
   * Get user statistics for a specific period
   */
  private async getUserStatsForPeriod(
    periodStart: Date,
    periodEnd: Date
  ): Promise<any[]> {
    const stats = await this.odometerUploadRepository
      .createQueryBuilder("upload")
      .select([
        "upload.userId as userId",
        "SUM(upload.finalMileage) as totalMileage",
        "SUM(upload.carbonSaved) as totalCarbonSaved",
        "COUNT(*) as uploadCount",
      ])
      .where("upload.createdAt >= :periodStart", { periodStart })
      .andWhere("upload.createdAt < :periodEnd", { periodEnd })
      .andWhere("upload.status = :status", { status: UploadStatus.COMPLETED })
      .groupBy("upload.userId")
      .orderBy("totalMileage", "DESC")
      .addOrderBy("totalCarbonSaved", "DESC")
      .addOrderBy("uploadCount", "DESC")
      .getRawMany();

    // Get user details and calculate points
    const userStats = await Promise.all(
      stats.map(async (stat) => {
        const user = await this.userRepository.findOne({
          where: { id: stat.userId },
        });

        if (!user) return null;

        // Calculate points (1 point per km + bonus for carbon saved)
        const points =
          parseFloat(stat.totalMileage || "0") +
          parseFloat(stat.totalCarbonSaved || "0") * 0.1;

        return {
          userId: stat.userId,
          totalMileage: parseFloat(stat.totalMileage || "0"),
          totalCarbonSaved: parseFloat(stat.totalCarbonSaved || "0"),
          totalRewards: parseFloat(user.b3trBalance.toString()),
          totalPoints: Math.floor(points),
          uploadCount: parseInt(stat.uploadCount || "0"),
        };
      })
    );

    return userStats.filter(Boolean);
  }

  /**
   * Get rank display string
   */
  private getRankDisplay(rank: number): string {
    const suffix =
      rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th";
    return `${rank}${suffix}`;
  }

  /**
   * Get leaderboard statistics
   */
  async getLeaderboardStats(): Promise<any> {
    try {
      const stats = await this.leaderboardRepository
        .createQueryBuilder("leaderboard")
        .select([
          "leaderboard.period as period",
          "COUNT(*) as totalParticipants",
          "AVG(leaderboard.totalMileage) as avgMileage",
          "AVG(leaderboard.totalCarbonSaved) as avgCarbonSaved",
          "SUM(leaderboard.totalMileage) as totalMileage",
          "SUM(leaderboard.totalCarbonSaved) as totalCarbonSaved",
        ])
        .where("leaderboard.isActive = :isActive", { isActive: true })
        .groupBy("leaderboard.period")
        .getRawMany();

      return stats;
    } catch (error) {
      this.logger.error(`Failed to get leaderboard stats: ${error.message}`);
      throw new BadRequestException("Failed to get leaderboard statistics");
    }
  }
}
