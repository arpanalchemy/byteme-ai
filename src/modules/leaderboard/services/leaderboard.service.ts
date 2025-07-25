import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Leaderboard, LeaderboardPeriod } from "../entity/leaderboard.entity";
import { User } from "../../users/entity/user.entity";
import { OdometerUpload } from "../../odometer/entity/odometer-upload.entity";
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
      const offset = (page - 1) * limit;
      const { periodStart, periodEnd } = this.getPeriodDates(period);

      // Get leaderboard entries for the period
      const query = this.leaderboardRepository
        .createQueryBuilder("leaderboard")
        .leftJoinAndSelect("leaderboard.user", "user")
        .where("leaderboard.period = :period", { period })
        .andWhere("leaderboard.periodStart = :periodStart", { periodStart })
        .andWhere("leaderboard.periodEnd = :periodEnd", { periodEnd })
        .andWhere("leaderboard.isActive = :isActive", { isActive: true });

      // Apply sorting based on sortBy parameter
      switch (sortBy) {
        case "mileage":
          query
            .orderBy("leaderboard.totalMileage", "DESC")
            .addOrderBy("leaderboard.totalCarbonSaved", "DESC")
            .addOrderBy("leaderboard.uploadCount", "DESC");
          break;
        case "carbon":
          query
            .orderBy("leaderboard.totalCarbonSaved", "DESC")
            .addOrderBy("leaderboard.totalMileage", "DESC")
            .addOrderBy("leaderboard.uploadCount", "DESC");
          break;
        case "rewards":
          query
            .orderBy("leaderboard.totalRewards", "DESC")
            .addOrderBy("leaderboard.totalMileage", "DESC")
            .addOrderBy("leaderboard.totalCarbonSaved", "DESC");
          break;
        case "points":
          query
            .orderBy("leaderboard.totalPoints", "DESC")
            .addOrderBy("leaderboard.totalMileage", "DESC")
            .addOrderBy("leaderboard.totalCarbonSaved", "DESC");
          break;
        default:
          query
            .orderBy("leaderboard.totalMileage", "DESC")
            .addOrderBy("leaderboard.totalCarbonSaved", "DESC")
            .addOrderBy("leaderboard.uploadCount", "DESC");
      }

      const total = await query.getCount();
      const entries = await query.skip(offset).take(limit).getMany();

      // Get user rank if authenticated
      let userRank: number | undefined;
      if (userId) {
        userRank = await this.getUserRank(
          userId,
          period,
          periodStart,
          periodEnd
        );
      }

      // Transform entries to DTOs
      const leaderboardEntries: LeaderboardEntryDto[] = entries.map(
        (entry, index) => ({
          rank: offset + index + 1,
          userId: entry.userId,
          walletAddress: entry.user.walletAddress,
          username: entry.user.username || "Anonymous",
          profileImageUrl: entry.user.profileImageUrl,
          totalMileage: parseFloat(entry.totalMileage.toString()),
          totalCarbonSaved: parseFloat(entry.totalCarbonSaved.toString()),
          totalRewards: parseFloat(entry.totalRewards.toString()),
          totalPoints: entry.totalPoints,
          uploadCount: entry.uploadCount,
          rankDisplay: this.getRankDisplay(offset + index + 1),
        })
      );

      return {
        period,
        periodStart: periodStart.toISOString().split("T")[0],
        periodEnd: periodEnd.toISOString().split("T")[0],
        userRank,
        totalParticipants: total,
        entries: leaderboardEntries,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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

      // Get all users with their stats for the period
      const userStats = await this.getUserStatsForPeriod(
        periodStart,
        periodEnd
      );

      // Clear existing leaderboard entries for the period
      await this.leaderboardRepository.delete({
        period,
        periodStart,
        periodEnd,
      });

      // Create new leaderboard entries
      const leaderboardEntries = userStats.map((stats, index) => {
        const entry = this.leaderboardRepository.create({
          userId: stats.userId,
          period,
          totalMileage: stats.totalMileage,
          totalCarbonSaved: stats.totalCarbonSaved,
          totalRewards: stats.totalRewards,
          totalPoints: stats.totalPoints,
          uploadCount: stats.uploadCount,
          rank: index + 1,
          periodStart,
          periodEnd,
          isActive: true,
        });
        return entry;
      });

      await this.leaderboardRepository.save(leaderboardEntries);

      this.logger.log(`Leaderboard updated for period: ${period}`);
    } catch (error) {
      this.logger.error(`Failed to update leaderboard: ${error.message}`);
      throw new BadRequestException("Failed to update leaderboard");
    }
  }

  /**
   * Get user rank for a specific period
   */
  async getUserRank(
    userId: string,
    period: LeaderboardPeriod,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    try {
      const entry = await this.leaderboardRepository.findOne({
        where: {
          userId,
          period,
          periodStart,
          periodEnd,
          isActive: true,
        },
      });

      return entry?.rank || 0;
    } catch (error) {
      this.logger.error(`Failed to get user rank: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get period dates based on period type
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
        periodStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 1);
        break;

      case LeaderboardPeriod.WEEKLY:
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - daysToMonday);
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
      .andWhere("upload.status = :status", { status: "completed" as any })
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
