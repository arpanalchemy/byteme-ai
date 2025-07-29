import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  Challenge,
  ChallengeType,
  ChallengeStatus,
  ChallengeVisibility,
} from "../entity/challenge.entity";
import {
  UserChallenge,
  UserChallengeStatus,
} from "../entity/user-challenge.entity";
import { User } from "../../users/entity/user.entity";
import { Vehicle } from "../../vehicles/entity/vehicle.entity";
import {
  OdometerUpload,
  UploadStatus,
} from "../../odometer/entity/odometer-upload.entity";
import {
  CreateChallengeDto,
  UpdateChallengeDto,
  ChallengeResponseDto,
  UserChallengeResponseDto,
} from "../dto/challenge.dto";
import { RewardService } from "../../rewards/services/reward.service";

@Injectable()
export class ChallengeService {
  private readonly logger = new Logger(ChallengeService.name);

  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,
    @InjectRepository(UserChallenge)
    private readonly userChallengeRepository: Repository<UserChallenge>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(OdometerUpload)
    private readonly odometerUploadRepository: Repository<OdometerUpload>,
    private readonly rewardService: RewardService
  ) {}

  /**
   * Create a new challenge
   */
  async createChallenge(
    createDto: CreateChallengeDto,
    adminId: string
  ): Promise<ChallengeResponseDto> {
    try {
      const challenge = this.challengeRepository.create({
        name: createDto.name,
        description: createDto.description,
        type: createDto.type,
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate),
        imageUrl: createDto.imageUrl,
        createdBy: adminId,
      });

      const savedChallenge = await this.challengeRepository.save(challenge);
      return this.transformChallengeToResponse(savedChallenge);
    } catch (error) {
      this.logger.error(`Failed to create challenge: ${error.message}`);
      throw new BadRequestException("Failed to create challenge");
    }
  }

  /**
   * Get all challenges with pagination and filters
   */
  async getChallenges(
    page: number = 1,
    limit: number = 20,
    type?: ChallengeType,
    status?: ChallengeStatus,
    visibility?: ChallengeVisibility,
    search?: string
  ): Promise<{
    challenges: ChallengeResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;

      const query = this.challengeRepository.createQueryBuilder("challenge");

      if (type) {
        query.andWhere("challenge.type = :type", { type });
      }

      if (status) {
        query.andWhere("challenge.status = :status", { status });
      }

      if (visibility) {
        query.andWhere("challenge.visibility = :visibility", { visibility });
      }

      if (search) {
        query.andWhere(
          "challenge.name ILIKE :search OR challenge.description ILIKE :search",
          { search: `%${search}%` }
        );
      }

      const total = await query.getCount();
      const challenges = await query
        .skip(offset)
        .take(limit)
        .orderBy("challenge.createdAt", "DESC")
        .getMany();

      return {
        challenges: challenges.map((challenge) =>
          this.transformChallengeToResponse(challenge)
        ),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to get challenges: ${error.message}`);
      throw new BadRequestException("Failed to get challenges");
    }
  }

  /**
   * Get challenge by ID
   */
  async getChallengeById(challengeId: string): Promise<ChallengeResponseDto> {
    try {
      const challenge = await this.challengeRepository.findOne({
        where: { id: challengeId },
      });

      if (!challenge) {
        throw new NotFoundException("Challenge not found");
      }

      return this.transformChallengeToResponse(challenge);
    } catch (error) {
      this.logger.error(
        `Failed to get challenge ${challengeId}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Update challenge
   */
  async updateChallenge(
    challengeId: string,
    updateDto: UpdateChallengeDto
  ): Promise<ChallengeResponseDto> {
    try {
      const challenge = await this.challengeRepository.findOne({
        where: { id: challengeId },
      });

      if (!challenge) {
        throw new NotFoundException("Challenge not found");
      }

      Object.assign(challenge, updateDto);
      const updatedChallenge = await this.challengeRepository.save(challenge);

      return this.transformChallengeToResponse(updatedChallenge);
    } catch (error) {
      this.logger.error(
        `Failed to update challenge ${challengeId}: ${error.message}`
      );
      throw new BadRequestException("Failed to update challenge");
    }
  }

  /**
   * Publish challenge
   */
  async publishChallenge(challengeId: string): Promise<ChallengeResponseDto> {
    try {
      const challenge = await this.challengeRepository.findOne({
        where: { id: challengeId },
      });

      if (!challenge) {
        throw new NotFoundException("Challenge not found");
      }

      challenge.status = ChallengeStatus.ACTIVE;
      const publishedChallenge = await this.challengeRepository.save(challenge);

      return this.transformChallengeToResponse(publishedChallenge);
    } catch (error) {
      this.logger.error(
        `Failed to publish challenge ${challengeId}: ${error.message}`
      );
      throw new BadRequestException("Failed to publish challenge");
    }
  }

  /**
   * Delete challenge
   */
  async deleteChallenge(challengeId: string): Promise<void> {
    try {
      const challenge = await this.challengeRepository.findOne({
        where: { id: challengeId },
      });

      if (!challenge) {
        throw new NotFoundException("Challenge not found");
      }

      await this.challengeRepository.remove(challenge);
    } catch (error) {
      this.logger.error(
        `Failed to delete challenge ${challengeId}: ${error.message}`
      );
      throw new BadRequestException("Failed to delete challenge");
    }
  }

  /**
   * Get available challenges for user
   */
  async getAvailableChallenges(
    userId: string
  ): Promise<ChallengeResponseDto[]> {
    try {
      const challenges = await this.challengeRepository.find({
        where: { status: ChallengeStatus.ACTIVE },
      });

      const userChallenges = await this.userChallengeRepository.find({
        where: { user: { id: userId } },
        select: ["challenge"],
      });

      const joinedChallengeIds = userChallenges.map((uc) => uc.challenge.id);
      const availableChallenges = challenges.filter(
        (challenge) => !joinedChallengeIds.includes(challenge.id)
      );

      return availableChallenges.map((challenge) =>
        this.transformChallengeToResponse(challenge)
      );
    } catch (error) {
      this.logger.error(`Failed to get available challenges: ${error.message}`);
      throw new BadRequestException("Failed to get available challenges");
    }
  }

  /**
   * Join active challenges for a user
   */
  async joinActiveChallenges(
    userId: string
  ): Promise<UserChallengeResponseDto[]> {
    try {
      // Get all active challenges
      const activeChallenges = await this.challengeRepository.find({
        where: {
          status: ChallengeStatus.ACTIVE,
          visibility: ChallengeVisibility.PUBLIC,
        },
      });

      const joinedChallenges: UserChallengeResponseDto[] = [];

      for (const challenge of activeChallenges) {
        try {
          // Check if user is already participating
          const existingParticipation =
            await this.userChallengeRepository.findOne({
              where: {
                user: { id: userId },
                challenge: { id: challenge.id },
              },
              relations: ["user", "challenge"],
            });

          if (!existingParticipation) {
            // Join the challenge with current progress
            const userChallenge = await this.joinChallenge(
              userId,
              challenge.id
            );
            joinedChallenges.push(userChallenge);

            this.logger.log(
              `User ${userId} joined challenge ${challenge.name} with current progress: ${JSON.stringify(userChallenge.progress)}`
            );
          }
        } catch (error) {
          this.logger.warn(
            `Failed to join challenge ${challenge.id}: ${error.message}`
          );
          // Continue with other challenges
        }
      }

      this.logger.log(
        `User ${userId} joined ${joinedChallenges.length} active challenges`
      );
      return joinedChallenges;
    } catch (error) {
      this.logger.error(`Failed to join active challenges: ${error.message}`);
      throw new BadRequestException("Failed to join active challenges");
    }
  }

  /**
   * Join a challenge
   */
  async joinChallenge(
    userId: string,
    challengeId: string
  ): Promise<UserChallengeResponseDto> {
    try {
      const challenge = await this.challengeRepository.findOne({
        where: { id: challengeId },
      });

      if (!challenge) {
        throw new NotFoundException("Challenge not found");
      }

      if (challenge.status !== ChallengeStatus.ACTIVE) {
        throw new BadRequestException("Challenge is not active");
      }

      // Check if user already joined
      const existingUserChallenge = await this.userChallengeRepository.findOne({
        where: { user: { id: userId }, challenge: { id: challengeId } },
        relations: ["user", "challenge"],
      });

      if (existingUserChallenge) {
        throw new ConflictException("User already joined this challenge");
      }

      // Get current user stats for all time (so users get credit for previous uploads)
      const currentStats = await this.getCurrentUserStats(userId);

      // Create user challenge with current progress
      const userChallenge = this.userChallengeRepository.create({
        user: { id: userId },
        challenge: { id: challengeId },
        status: UserChallengeStatus.JOINED,
        progress: {
          mileage: currentStats.mileage,
          carbonSaved: currentStats.carbonSaved,
          uploadCount: currentStats.uploadCount,
          vehicleCount: currentStats.vehicleCount,
          rewardsEarned: currentStats.rewardsEarned,
        },
      });

      const savedUserChallenge =
        await this.userChallengeRepository.save(userChallenge);

      return this.transformUserChallengeToResponse(savedUserChallenge);
    } catch (error) {
      this.logger.error(`Failed to join challenge: ${error.message}`);
      throw new BadRequestException("Failed to join challenge");
    }
  }

  /**
   * Get user challenges
   */
  async getUserChallenges(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    userChallenges: UserChallengeResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const offset = (page - 1) * limit;

      const query = this.userChallengeRepository
        .createQueryBuilder("userChallenge")
        .leftJoinAndSelect("userChallenge.challenge", "challenge")
        .leftJoinAndSelect("userChallenge.user", "user")
        .where("user.id = :userId", { userId });

      const total = await query.getCount();
      const userChallenges = await query
        .skip(offset)
        .take(limit)
        .orderBy("userChallenge.createdAt", "DESC")
        .getMany();

      return {
        userChallenges: userChallenges.map((userChallenge) =>
          this.transformUserChallengeToResponse(userChallenge)
        ),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to get user challenges: ${error.message}`);
      throw new BadRequestException("Failed to get user challenges");
    }
  }

  /**
   * Update challenge progress
   */
  async updateChallengeProgress(
    userId: string,
    challengeId: string
  ): Promise<UserChallengeResponseDto> {
    try {
      const userChallenge = await this.userChallengeRepository.findOne({
        where: { user: { id: userId }, challenge: { id: challengeId } },
        relations: ["user", "challenge"],
      });

      if (!userChallenge) {
        throw new NotFoundException("User challenge not found");
      }

      // Get user stats for the challenge period
      const userStats = await this.getUserStatsForChallenge(
        userId,
        userChallenge.challenge
      );

      // Update progress
      userChallenge.progress = {
        mileage: userStats.mileage,
        carbonSaved: userStats.carbonSaved,
        uploadCount: userStats.uploadCount,
        vehicleCount: userStats.vehicleCount,
        rewardsEarned: userStats.rewardsEarned,
      };

      // Check if challenge is completed
      const isCompleted = await this.checkChallengeCompletion(userChallenge);
      if (
        isCompleted &&
        userChallenge.status !== UserChallengeStatus.COMPLETED
      ) {
        userChallenge.status = UserChallengeStatus.COMPLETED;
        userChallenge.completedAt = new Date();

        // Calculate and assign rewards
        const calculatedRewards =
          await this.calculateChallengeRewards(userChallenge);
        userChallenge.rewards = calculatedRewards;

        this.logger.log(
          `Challenge completed! User: ${userId}, Challenge: ${challengeId}, Rewards: ${JSON.stringify(calculatedRewards)}`
        );

        // Create reward if challenge has rewards
        if (calculatedRewards && calculatedRewards.b3trTokens > 0) {
          try {
            await this.rewardService.createChallengeReward(
              userId,
              challengeId,
              userChallenge.challenge.name,
              calculatedRewards.b3trTokens
            );
            this.logger.log(
              `Reward created for challenge ${userChallenge.challenge.name} for user ${userId}`
            );
          } catch (rewardError) {
            this.logger.error(
              `Failed to create reward for challenge ${userChallenge.challenge.name}: ${rewardError.message}`
            );
            // Don't throw error as reward creation failure shouldn't fail the challenge completion
          }
        }
      }

      const updatedUserChallenge =
        await this.userChallengeRepository.save(userChallenge);

      // If challenge was just completed, calculate rankings for all participants
      if (
        isCompleted &&
        userChallenge.status === UserChallengeStatus.COMPLETED
      ) {
        try {
          await this.calculateChallengeRankings(challengeId);

          // Update the user challenge with their final rank
          const finalUserChallenge = await this.userChallengeRepository.findOne(
            {
              where: { user: { id: userId }, challenge: { id: challengeId } },
              relations: ["user", "challenge"],
            }
          );
          if (finalUserChallenge && finalUserChallenge.rank) {
            // Recalculate rewards with the final rank
            const finalRewards =
              await this.calculateChallengeRewards(finalUserChallenge);
            finalUserChallenge.rewards = finalRewards;
            await this.userChallengeRepository.save(finalUserChallenge);

            this.logger.log(
              `Final rewards calculated with rank ${finalUserChallenge.rank}: ${JSON.stringify(finalRewards)}`
            );
          }
        } catch (rankingError) {
          this.logger.error(
            `Failed to calculate rankings: ${rankingError.message}`
          );
          // Don't fail the entire operation if ranking calculation fails
        }
      }

      return this.transformUserChallengeToResponse(updatedUserChallenge);
    } catch (error) {
      this.logger.error(
        `Failed to update challenge progress: ${error.message}`
      );
      throw new BadRequestException("Failed to update challenge progress");
    }
  }

  /**
   * Claim challenge rewards
   */
  async claimChallengeRewards(
    userId: string,
    userChallengeId: string
  ): Promise<UserChallengeResponseDto> {
    try {
      const userChallenge = await this.userChallengeRepository.findOne({
        where: { id: userChallengeId, user: { id: userId } },
        relations: ["user", "challenge"],
      });

      if (!userChallenge) {
        throw new NotFoundException("User challenge not found");
      }

      if (userChallenge.status !== UserChallengeStatus.COMPLETED) {
        throw new BadRequestException("Challenge not completed");
      }

      if (userChallenge.rewardsClaimed) {
        throw new BadRequestException("Rewards already claimed");
      }

      // Mark rewards as claimed
      userChallenge.rewardsClaimed = true;
      userChallenge.claimedAt = new Date();

      const updatedUserChallenge =
        await this.userChallengeRepository.save(userChallenge);

      return this.transformUserChallengeToResponse(updatedUserChallenge);
    } catch (error) {
      this.logger.error(`Failed to claim challenge rewards: ${error.message}`);
      throw new BadRequestException("Failed to claim challenge rewards");
    }
  }

  /**
   * Get user statistics for a challenge
   */
  /**
   * Get current user stats for all time
   */
  async getCurrentUserStats(userId: string): Promise<any> {
    // Get upload statistics for all time
    const stats = await this.odometerUploadRepository
      .createQueryBuilder("upload")
      .innerJoin("upload.user", "user")
      .select([
        "SUM(upload.finalMileage) as totalmileage",
        "SUM(upload.carbonSaved) as totalcarbonsaved",
        "COUNT(*) as uploadcount",
      ])
      .where("user.id = :userId", { userId })
      .andWhere("upload.status = :status", { status: UploadStatus.COMPLETED })
      .andWhere("upload.isApproved = :isApproved", { isApproved: true })
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
      mileage: parseFloat(stats?.totalmileage ?? "0"),
      carbonSaved: parseFloat(stats?.totalcarbonsaved ?? "0"),
      uploadCount: parseInt(stats?.uploadcount ?? "0"),
      vehicleCount,
      rewardsEarned: parseFloat(user?.b3trBalance?.toString() ?? "0"),
    };
  }

  private async getUserStatsForChallenge(
    userId: string,
    challenge: Challenge
  ): Promise<any> {
    const { startDate, endDate } = challenge;

    // Get upload statistics for the challenge period
    const stats = await this.odometerUploadRepository
      .createQueryBuilder("upload")
      .innerJoin("upload.user", "user")
      .select([
        "SUM(upload.finalMileage) as totalmileage",
        "SUM(upload.carbonSaved) as totalcarbonsaved",
        "COUNT(*) as uploadcount",
      ])
      .where("user.id = :userId", { userId })
      .andWhere("upload.createdAt >= :startDate", { startDate })
      .andWhere("upload.createdAt <= :endDate", { endDate })
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
      mileage: parseFloat(stats?.totalmileage || "0"),
      carbonSaved: parseFloat(stats?.totalcarbonsaved || "0"),
      uploadCount: parseInt(stats?.uploadcount || "0"),
      vehicleCount,
      rewardsEarned: parseFloat(user?.b3trBalance.toString() || "0"),
    };
  }

  /**
   * Check if challenge is completed
   */
  private async checkChallengeCompletion(
    userChallenge: UserChallenge
  ): Promise<boolean> {
    const { challenge, progress } = userChallenge;
    const { objectives } = challenge;

    if (!objectives || !progress) return false;

    // Check each objective
    if (objectives.mileage && progress.mileage < objectives.mileage) {
      return false;
    }

    if (
      objectives.carbonSaved &&
      progress.carbonSaved < objectives.carbonSaved
    ) {
      return false;
    }

    if (
      objectives.uploadCount &&
      progress.uploadCount < objectives.uploadCount
    ) {
      return false;
    }

    if (
      objectives.vehicleCount &&
      progress.vehicleCount < objectives.vehicleCount
    ) {
      return false;
    }

    if (
      objectives.rewardsEarned &&
      progress.rewardsEarned < objectives.rewardsEarned
    ) {
      return false;
    }

    return true;
  }

  /**
   * Calculate challenge rewards including leaderboard rewards
   */
  private async calculateChallengeRewards(
    userChallenge: UserChallenge
  ): Promise<any> {
    const { challenge, progress, rank } = userChallenge;

    this.logger.log(
      `Calculating rewards for challenge: ${challenge.name}, User: ${userChallenge.user.id}, Rank: ${rank}`
    );

    // Start with base rewards and extend with leaderboard properties
    const rewards: any = { ...challenge.rewards };

    // Calculate completion bonus based on progress
    const completionBonus = this.calculateCompletionBonus(challenge, progress);
    if (completionBonus.b3trTokens > 0) {
      rewards.b3trTokens =
        (rewards.b3trTokens || 0) + completionBonus.b3trTokens;
    }
    if (completionBonus.points > 0) {
      rewards.points = (rewards.points || 0) + completionBonus.points;
    }
    if (completionBonus.experience > 0) {
      rewards.experience =
        (rewards.experience || 0) + completionBonus.experience;
    }

    // Calculate leaderboard rewards if user has a rank
    if (rank && challenge.leaderboardRewards) {
      const leaderboardReward = this.calculateLeaderboardReward(
        challenge,
        rank
      );
      if (leaderboardReward.b3trTokens > 0) {
        rewards.b3trTokens =
          (rewards.b3trTokens || 0) + leaderboardReward.b3trTokens;
      }
      if (leaderboardReward.points > 0) {
        rewards.points = (rewards.points || 0) + leaderboardReward.points;
      }
      if (leaderboardReward.experience > 0) {
        rewards.experience =
          (rewards.experience || 0) + leaderboardReward.experience;
      }

      // Store leaderboard reward details
      rewards.leaderboardRank = rank;
      rewards.leaderboardReward = leaderboardReward;
    }

    // Calculate difficulty multiplier
    const difficultyMultiplier = this.getDifficultyMultiplier(
      challenge.difficulty
    );
    if (difficultyMultiplier > 1) {
      rewards.b3trTokens = Math.floor(
        (rewards.b3trTokens || 0) * difficultyMultiplier
      );
      rewards.points = Math.floor((rewards.points || 0) * difficultyMultiplier);
      rewards.experience = Math.floor(
        (rewards.experience || 0) * difficultyMultiplier
      );
    }

    // Calculate time-based bonus (early completion)
    const timeBonus = this.calculateTimeBonus(challenge, userChallenge);
    if (timeBonus.b3trTokens > 0) {
      rewards.b3trTokens = (rewards.b3trTokens || 0) + timeBonus.b3trTokens;
    }
    if (timeBonus.points > 0) {
      rewards.points = (rewards.points || 0) + timeBonus.points;
    }

    this.logger.log(`Final rewards calculated: ${JSON.stringify(rewards)}`);
    return rewards;
  }

  /**
   * Calculate completion bonus based on progress
   */
  private calculateCompletionBonus(challenge: Challenge, progress: any): any {
    const bonus = { b3trTokens: 0, points: 0, experience: 0 };

    if (!progress || !challenge.objectives) return bonus;

    // Calculate completion percentage
    let completionPercentage = 0;
    let totalObjectives = 0;
    let completedObjectives = 0;

    // Check each objective type
    if (challenge.objectives.mileage && progress.mileage) {
      totalObjectives++;
      if (progress.mileage >= challenge.objectives.mileage) {
        completedObjectives++;
      }
    }

    if (challenge.objectives.carbonSaved && progress.carbonSaved) {
      totalObjectives++;
      if (progress.carbonSaved >= challenge.objectives.carbonSaved) {
        completedObjectives++;
      }
    }

    if (challenge.objectives.uploadStreak && progress.uploadStreak) {
      totalObjectives++;
      if (progress.uploadStreak >= challenge.objectives.uploadStreak) {
        completedObjectives++;
      }
    }

    if (challenge.objectives.vehicleCount && progress.vehicleCount) {
      totalObjectives++;
      if (progress.vehicleCount >= challenge.objectives.vehicleCount) {
        completedObjectives++;
      }
    }

    if (challenge.objectives.rewardsEarned && progress.rewardsEarned) {
      totalObjectives++;
      if (progress.rewardsEarned >= challenge.objectives.rewardsEarned) {
        completedObjectives++;
      }
    }

    if (challenge.objectives.uploadCount && progress.uploadCount) {
      totalObjectives++;
      if (progress.uploadCount >= challenge.objectives.uploadCount) {
        completedObjectives++;
      }
    }

    if (totalObjectives > 0) {
      completionPercentage = (completedObjectives / totalObjectives) * 100;
    }

    // Award bonus based on completion percentage
    if (completionPercentage >= 100) {
      // Perfect completion
      bonus.b3trTokens = Math.floor((challenge.rewards?.b3trTokens || 0) * 0.5);
      bonus.points = Math.floor((challenge.rewards?.points || 0) * 0.5);
      bonus.experience = Math.floor((challenge.rewards?.experience || 0) * 0.5);
    } else if (completionPercentage >= 80) {
      // Excellent completion
      bonus.b3trTokens = Math.floor((challenge.rewards?.b3trTokens || 0) * 0.3);
      bonus.points = Math.floor((challenge.rewards?.points || 0) * 0.3);
      bonus.experience = Math.floor((challenge.rewards?.experience || 0) * 0.3);
    } else if (completionPercentage >= 60) {
      // Good completion
      bonus.b3trTokens = Math.floor((challenge.rewards?.b3trTokens || 0) * 0.2);
      bonus.points = Math.floor((challenge.rewards?.points || 0) * 0.2);
      bonus.experience = Math.floor((challenge.rewards?.experience || 0) * 0.2);
    }

    return bonus;
  }

  /**
   * Calculate leaderboard rewards based on rank
   */
  private calculateLeaderboardReward(challenge: Challenge, rank: number): any {
    const reward = { b3trTokens: 0, points: 0, experience: 0 };

    if (!challenge.leaderboardRewards) return reward;

    if (rank === 1 && challenge.leaderboardRewards.first) {
      reward.b3trTokens = challenge.leaderboardRewards.first.b3trTokens || 0;
      reward.points = challenge.leaderboardRewards.first.points || 0;
      reward.experience = challenge.leaderboardRewards.first.experience || 0;
    } else if (rank === 2 && challenge.leaderboardRewards.second) {
      reward.b3trTokens = challenge.leaderboardRewards.second.b3trTokens || 0;
      reward.points = challenge.leaderboardRewards.second.points || 0;
      reward.experience = challenge.leaderboardRewards.second.experience || 0;
    } else if (rank === 3 && challenge.leaderboardRewards.third) {
      reward.b3trTokens = challenge.leaderboardRewards.third.b3trTokens || 0;
      reward.points = challenge.leaderboardRewards.third.points || 0;
      reward.experience = challenge.leaderboardRewards.third.experience || 0;
    } else if (rank <= 10 && challenge.leaderboardRewards.top10) {
      reward.b3trTokens = challenge.leaderboardRewards.top10.b3trTokens || 0;
      reward.points = challenge.leaderboardRewards.top10.points || 0;
      reward.experience = challenge.leaderboardRewards.top10.experience || 0;
    } else if (rank <= 50 && challenge.leaderboardRewards.top50) {
      reward.b3trTokens = challenge.leaderboardRewards.top50.b3trTokens || 0;
      reward.points = challenge.leaderboardRewards.top50.points || 0;
      reward.experience = challenge.leaderboardRewards.top50.experience || 0;
    }

    return reward;
  }

  /**
   * Get difficulty multiplier for rewards
   */
  private getDifficultyMultiplier(difficulty: string): number {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return 0.8;
      case "medium":
        return 1.0;
      case "hard":
        return 1.3;
      case "expert":
        return 1.6;
      default:
        return 1.0;
    }
  }

  /**
   * Calculate time-based bonus for early completion
   */
  private calculateTimeBonus(
    challenge: Challenge,
    userChallenge: UserChallenge
  ): any {
    const bonus = { b3trTokens: 0, points: 0, experience: 0 };

    if (
      !userChallenge.completedAt ||
      !challenge.startDate ||
      !challenge.endDate
    ) {
      return bonus;
    }

    const challengeDuration =
      challenge.endDate.getTime() - challenge.startDate.getTime();
    const timeToComplete =
      userChallenge.completedAt.getTime() - challenge.startDate.getTime();
    const completionPercentage = (timeToComplete / challengeDuration) * 100;

    // Award bonus for early completion
    if (completionPercentage <= 25) {
      // Completed in first 25% of challenge duration
      bonus.b3trTokens = Math.floor((challenge.rewards?.b3trTokens || 0) * 0.3);
      bonus.points = Math.floor((challenge.rewards?.points || 0) * 0.3);
      bonus.experience = Math.floor((challenge.rewards?.experience || 0) * 0.3);
    } else if (completionPercentage <= 50) {
      // Completed in first 50% of challenge duration
      bonus.b3trTokens = Math.floor((challenge.rewards?.b3trTokens || 0) * 0.2);
      bonus.points = Math.floor((challenge.rewards?.points || 0) * 0.2);
      bonus.experience = Math.floor((challenge.rewards?.experience || 0) * 0.2);
    } else if (completionPercentage <= 75) {
      // Completed in first 75% of challenge duration
      bonus.b3trTokens = Math.floor((challenge.rewards?.b3trTokens || 0) * 0.1);
      bonus.points = Math.floor((challenge.rewards?.points || 0) * 0.1);
      bonus.experience = Math.floor((challenge.rewards?.experience || 0) * 0.1);
    }

    return bonus;
  }

  /**
   * Calculate and update rankings for a challenge
   */
  async calculateChallengeRankings(challengeId: string): Promise<void> {
    try {
      const challenge = await this.challengeRepository.findOne({
        where: { id: challengeId },
        relations: ["userChallenges", "userChallenges.user"],
      });

      if (!challenge) {
        throw new NotFoundException("Challenge not found");
      }

      // Get all completed user challenges for this challenge
      const completedUserChallenges = challenge.userChallenges.filter(
        (uc) => uc.status === UserChallengeStatus.COMPLETED
      );

      if (completedUserChallenges.length === 0) {
        this.logger.log(
          `No completed challenges found for challenge: ${challengeId}`
        );
        return;
      }

      // Sort by completion time (earliest first) and then by progress
      const sortedUserChallenges = completedUserChallenges.sort((a, b) => {
        // First sort by completion time
        if (a.completedAt && b.completedAt) {
          const timeDiff = a.completedAt.getTime() - b.completedAt.getTime();
          if (timeDiff !== 0) return timeDiff;
        }

        // Then sort by progress (higher progress first)
        const aProgress = this.calculateTotalProgress(
          a.progress,
          challenge.objectives
        );
        const bProgress = this.calculateTotalProgress(
          b.progress,
          challenge.objectives
        );
        return bProgress - aProgress;
      });

      // Update rankings
      for (let i = 0; i < sortedUserChallenges.length; i++) {
        const userChallenge = sortedUserChallenges[i];
        userChallenge.rank = i + 1;
        await this.userChallengeRepository.save(userChallenge);
      }

      this.logger.log(
        `Updated rankings for challenge ${challengeId}: ${sortedUserChallenges.length} participants ranked`
      );
    } catch (error) {
      this.logger.error(
        `Failed to calculate challenge rankings: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Calculate total progress percentage for ranking
   */
  private calculateTotalProgress(progress: any, objectives: any): number {
    if (!progress || !objectives) return 0;

    let totalProgress = 0;
    let totalObjectives = 0;

    if (objectives.mileage && progress.mileage) {
      totalProgress += Math.min(
        (progress.mileage / objectives.mileage) * 100,
        100
      );
      totalObjectives++;
    }

    if (objectives.carbonSaved && progress.carbonSaved) {
      totalProgress += Math.min(
        (progress.carbonSaved / objectives.carbonSaved) * 100,
        100
      );
      totalObjectives++;
    }

    if (objectives.uploadStreak && progress.uploadStreak) {
      totalProgress += Math.min(
        (progress.uploadStreak / objectives.uploadStreak) * 100,
        100
      );
      totalObjectives++;
    }

    if (objectives.vehicleCount && progress.vehicleCount) {
      totalProgress += Math.min(
        (progress.vehicleCount / objectives.vehicleCount) * 100,
        100
      );
      totalObjectives++;
    }

    if (objectives.rewardsEarned && progress.rewardsEarned) {
      totalProgress += Math.min(
        (progress.rewardsEarned / objectives.rewardsEarned) * 100,
        100
      );
      totalObjectives++;
    }

    if (objectives.uploadCount && progress.uploadCount) {
      totalProgress += Math.min(
        (progress.uploadCount / objectives.uploadCount) * 100,
        100
      );
      totalObjectives++;
    }

    return totalObjectives > 0 ? totalProgress / totalObjectives : 0;
  }

  /**
   * Transform challenge to response DTO
   */
  private transformChallengeToResponse(
    challenge: Challenge
  ): ChallengeResponseDto {
    return {
      id: challenge.id,
      name: challenge.name,
      description: challenge.description,
      type: challenge.type,
      status: challenge.status,
      difficulty: challenge.difficulty,
      visibility: challenge.visibility,
      imageUrl: challenge.imageUrl,
      bannerUrl: challenge.bannerUrl,
      objectives: challenge.objectives,
      rewards: challenge.rewards,
      leaderboardRewards: challenge.leaderboardRewards,
      startDate: challenge.startDate as any,
      endDate: challenge.endDate as any,
      maxParticipants: challenge.maxParticipants,
      currentParticipants: challenge.currentParticipants,
      completedParticipants: challenge.completedParticipants,
      requirements: challenge.requirements,
      metadata: challenge.metadata,
      isActive: challenge.isActive,
      isUpcoming: challenge.isUpcoming,
      isCompleted: challenge.isCompleted,
      isPublished: challenge.isPublished,
      canBeEdited: challenge.canBeEdited,
      isFull: challenge.isFull,
      daysRemaining: challenge.daysRemaining,
      progressPercentage: challenge.progressPercentage,
      completionRate: challenge.completionRate,
      formattedDuration: challenge.formattedDuration,
      difficultyColor: challenge.difficultyColor,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    };
  }

  /**
   * Transform user challenge to response DTO
   */
  private transformUserChallengeToResponse(
    userChallenge: UserChallenge
  ): UserChallengeResponseDto {
    return {
      id: userChallenge.id,
      challenge: this.transformChallengeToResponse(userChallenge.challenge),
      status: userChallenge.status,
      progress: userChallenge.progress,
      rewards: userChallenge.rewards,
      rewardsClaimed: userChallenge.rewardsClaimed,
      claimedAt: userChallenge.claimedAt,
      completedAt: userChallenge.completedAt,
      rank: userChallenge.rank,
      notes: userChallenge.notes,
      isVisible: userChallenge.isVisible,
      createdAt: userChallenge.createdAt,
      updatedAt: userChallenge.updatedAt,
    };
  }
}
