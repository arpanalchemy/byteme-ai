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
  UserChallenge,
  UserChallengeStatus,
} from "../../challenges/entity/user-challenge.entity";
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
    private readonly odometerUploadRepository: Repository<OdometerUpload>,
    @InjectRepository(UserChallenge)
    private readonly userChallengeRepository: Repository<UserChallenge>
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
      console.log(
        "🚀 ~ LeaderboardService ~ getLeaderboard ~ userStats:",
        userStats
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
      console.log(
        "🚀 ~ LeaderboardService ~ getLeaderboard ~ paginatedStats:",
        paginatedStats
      );

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
          user: { id: stat.userId },
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
    // Get odometer upload stats
    const uploadStats = await this.odometerUploadRepository
      .createQueryBuilder("upload")
      .innerJoin("upload.user", "user")
      .select([
        "user.id as userid",
        "SUM(upload.finalMileage) as totalmileage",
        "SUM(upload.carbonSaved) as totalcarbonsaved",
        "COUNT(*) as uploadcount",
      ])
      .where("upload.createdAt >= :periodStart", { periodStart })
      .andWhere("upload.createdAt < :periodEnd", { periodEnd })
      .andWhere("upload.status = :status", { status: UploadStatus.COMPLETED })
      .andWhere("upload.isApproved = :isApproved", { isApproved: true })
      .groupBy("user.id")
      .getRawMany();
    console.log(
      "🚀 ~ LeaderboardService ~ getUserStatsForPeriod ~ uploadStats:",
      uploadStats
    );

    // Get challenge participation stats
    const challengeStats = await this.userChallengeRepository
      .createQueryBuilder("userChallenge")
      .leftJoin("userChallenge.challenge", "challenge")
      .innerJoin("userChallenge.user", "user")
      .select([
        "user.id as userid",
        "COUNT(*) as challengecount",
        "SUM(CASE WHEN userChallenge.status = :completedStatus THEN 1 ELSE 0 END) as completedchallenges",
        "0 as challengerewards",
      ])
      .where("userChallenge.createdAt >= :periodStart", { periodStart })
      .andWhere("userChallenge.createdAt <= :periodEnd", { periodEnd })
      .andWhere("challenge.status = :challengeStatus", {
        challengeStatus: "active",
      })
      .setParameter("completedStatus", UserChallengeStatus.COMPLETED)
      .groupBy("user.id")
      .getRawMany();
    console.log(
      "🚀 ~ LeaderboardService ~ getUserStatsForPeriod ~ challengeStats:",
      challengeStats
    );

    // Combine stats
    const userStatsMap = new Map();

    // Process upload stats
    uploadStats.forEach((stat) => {
      userStatsMap.set(stat.userid, {
        userId: stat.userid,
        totalMileage: parseFloat(stat.totalmileage || "0"),
        totalCarbonSaved: parseFloat(stat.totalcarbonsaved || "0"),
        totalRewards: 0,
        totalPoints: 0,
        uploadCount: parseInt(stat.uploadcount || "0"),
        challengeCount: 0,
        completedChallenges: 0,
        challengeRewards: 0,
      });
    });
    console.log(
      "🚀 ~ LeaderboardService ~ getUserStatsForPeriod ~ uploadStats:",
      uploadStats
    );
    console.log(
      "🚀 ~ LeaderboardService ~ getUserStatsForPeriod ~ userStatsMap:",
      userStatsMap
    );

    // Process challenge stats
    challengeStats.forEach((stat) => {
      const existing = userStatsMap.get(stat.userid);
      if (existing) {
        existing.challengeCount = parseInt(stat.challengecount || "0");
        existing.completedChallenges = parseInt(
          stat.completedchallenges || "0"
        );
        existing.challengeRewards = parseFloat(stat.challengerewards || "0");
        existing.totalRewards += existing.challengeRewards;
      } else {
        userStatsMap.set(stat.userid, {
          userId: stat.userid,
          totalMileage: 0,
          totalCarbonSaved: 0,
          totalRewards: parseFloat(stat.challengerewards || "0"),
          totalPoints: 0,
          uploadCount: 0,
          challengeCount: parseInt(stat.challengecount || "0"),
          completedChallenges: parseInt(stat.completedchallenges || "0"),
          challengeRewards: parseFloat(stat.challengerewards || "0"),
        });
      }
    });
    console.log(
      "🚀 ~ LeaderboardService ~ getUserStatsForPeriod ~ challengeStats:",
      challengeStats
    );

    // Get user details and calculate final points
    const userStats = await Promise.all(
      Array.from(userStatsMap.values()).map(async (stat) => {
        const user = await this.userRepository.findOne({
          where: { id: stat.userId },
        });
        console.log(
          "🚀 ~ LeaderboardService ~ getUserStatsForPeriod ~ user:",
          user
        );

        if (!user) return null;

        // Calculate total points (mileage + carbon saved + challenge rewards + completion bonus)
        const totalPoints = Math.round(
          stat.totalMileage * 0.1 + // 0.1 points per km
            stat.totalCarbonSaved * 10 + // 10 points per kg CO2 saved
            stat.challengeRewards * 100 + // 100 points per B3TR token earned
            stat.completedChallenges * 500 // 500 points per completed challenge
        );
        console.log(
          "🚀 ~ LeaderboardService ~ getUserStatsForPeriod ~ totalPoints:",
          totalPoints
        );

        return {
          ...stat,
          totalRewards:
            stat.totalRewards + parseFloat(user.b3trBalance.toString()),
          totalPoints,
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
