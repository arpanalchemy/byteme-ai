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
import { OdometerUpload } from "../../odometer/entity/odometer-upload.entity";
import {
  CreateChallengeDto,
  UpdateChallengeDto,
  ChallengeResponseDto,
  UserChallengeResponseDto,
} from "../dto/challenge.dto";

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
    private readonly odometerUploadRepository: Repository<OdometerUpload>
  ) {}

  // Challenge Management (Admin)

  /**
   * Create a new challenge
   */
  async createChallenge(
    createDto: CreateChallengeDto,
    adminId: string
  ): Promise<ChallengeResponseDto> {
    try {
      const challenge = this.challengeRepository.create({
        ...createDto,
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate),
        createdBy: adminId,
        status: ChallengeStatus.DRAFT,
      });

      const savedChallenge = await this.challengeRepository.save(challenge);

      this.logger.log(`Challenge created: ${savedChallenge.id}`);
      return this.transformChallengeToResponse(savedChallenge);
    } catch (error) {
      this.logger.error(`Failed to create challenge: ${error.message}`);
      throw new BadRequestException("Failed to create challenge");
    }
  }

  /**
   * Get all challenges with filtering
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
    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException("Challenge not found");
    }

    return this.transformChallengeToResponse(challenge);
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

      if (!challenge.canBeEdited) {
        throw new BadRequestException(
          "Cannot edit challenge that has participants"
        );
      }

      // Update date fields if provided
      if (updateDto.startDate) {
        challenge.startDate = new Date(updateDto.startDate);
      }
      if (updateDto.endDate) {
        challenge.endDate = new Date(updateDto.endDate);
      }

      Object.assign(challenge, updateDto);
      const updatedChallenge = await this.challengeRepository.save(challenge);

      this.logger.log(`Challenge updated: ${challengeId}`);
      return this.transformChallengeToResponse(updatedChallenge);
    } catch (error) {
      this.logger.error(`Failed to update challenge: ${error.message}`);
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
      challenge.publishedAt = new Date();
      const updatedChallenge = await this.challengeRepository.save(challenge);

      this.logger.log(`Challenge published: ${challengeId}`);
      return this.transformChallengeToResponse(updatedChallenge);
    } catch (error) {
      this.logger.error(`Failed to publish challenge: ${error.message}`);
      throw new BadRequestException("Failed to publish challenge");
    }
  }

  /**
   * Delete challenge (soft delete)
   */
  async deleteChallenge(challengeId: string): Promise<void> {
    try {
      const challenge = await this.challengeRepository.findOne({
        where: { id: challengeId },
      });

      if (!challenge) {
        throw new NotFoundException("Challenge not found");
      }

      if (!challenge.canBeEdited) {
        throw new BadRequestException(
          "Cannot delete challenge that has participants"
        );
      }

      challenge.status = ChallengeStatus.CANCELLED;
      await this.challengeRepository.save(challenge);

      this.logger.log(`Challenge deleted: ${challengeId}`);
    } catch (error) {
      this.logger.error(`Failed to delete challenge: ${error.message}`);
      throw new BadRequestException("Failed to delete challenge");
    }
  }

  // User Challenge Management

  /**
   * Get available challenges for user
   */
  async getAvailableChallenges(
    userId: string
  ): Promise<ChallengeResponseDto[]> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      // Get active challenges
      const activeChallenges = await this.challengeRepository.find({
        where: { status: ChallengeStatus.ACTIVE },
      });

      // Get user's joined challenges
      const joinedChallengeIds = await this.userChallengeRepository
        .createQueryBuilder("userChallenge")
        .select("userChallenge.challengeId")
        .where("userChallenge.userId = :userId", { userId })
        .getMany();

      const joinedChallengeIdSet = new Set(
        joinedChallengeIds.map((uc) => uc.challengeId)
      );

      // Filter challenges based on requirements and user eligibility
      const availableChallenges = activeChallenges.filter((challenge) => {
        // Skip if user already joined
        if (joinedChallengeIdSet.has(challenge.id)) {
          return false;
        }

        // Check if challenge is full
        if (challenge.isFull) {
          return false;
        }

        // Check requirements
        if (challenge.requirements) {
          const { requirements } = challenge;

          if (
            requirements.minLevel &&
            user.totalPoints < requirements.minLevel
          ) {
            return false;
          }

          if (
            requirements.minMileage &&
            parseFloat(user.totalMileage.toString()) < requirements.minMileage
          ) {
            return false;
          }

          if (
            requirements.minCarbonSaved &&
            parseFloat(user.totalCarbonSaved.toString()) <
              requirements.minCarbonSaved
          ) {
            return false;
          }
        }

        return true;
      });

      return availableChallenges.map((challenge) =>
        this.transformChallengeToResponse(challenge)
      );
    } catch (error) {
      this.logger.error(`Failed to get available challenges: ${error.message}`);
      throw new BadRequestException("Failed to get available challenges");
    }
  }

  /**
   * Join challenge
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

      if (!challenge.isActive) {
        throw new BadRequestException("Challenge is not active");
      }

      if (challenge.isFull) {
        throw new BadRequestException("Challenge is full");
      }

      // Check if user already joined
      const existingUserChallenge = await this.userChallengeRepository.findOne({
        where: { userId, challengeId },
      });

      if (existingUserChallenge) {
        throw new ConflictException("User already joined this challenge");
      }

      // Create user challenge
      const userChallenge = this.userChallengeRepository.create({
        userId,
        challengeId,
        status: UserChallengeStatus.JOINED,
        progress: {},
        isVisible: true,
      });

      const savedUserChallenge =
        await this.userChallengeRepository.save(userChallenge);

      // Update challenge participant count
      challenge.currentParticipants += 1;
      await this.challengeRepository.save(challenge);

      this.logger.log(`User ${userId} joined challenge ${challengeId}`);
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
        .where("userChallenge.userId = :userId", { userId })
        .andWhere("userChallenge.isVisible = :isVisible", { isVisible: true });

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
        where: { userId, challengeId },
        relations: ["challenge"],
      });

      if (!userChallenge) {
        throw new NotFoundException("User challenge not found");
      }

      if (userChallenge.isCompleted) {
        return this.transformUserChallengeToResponse(userChallenge);
      }

      // Get user statistics for the challenge period
      const userStats = await this.getUserStatsForChallenge(
        userId,
        userChallenge.challenge
      );

      // Update progress
      userChallenge.progress = userStats;

      // Check if challenge is completed
      if (await this.checkChallengeCompletion(userChallenge)) {
        userChallenge.status = UserChallengeStatus.COMPLETED;
        userChallenge.completedAt = new Date();

        // Calculate rewards
        userChallenge.rewards =
          await this.calculateChallengeRewards(userChallenge);

        // Update challenge completed count
        userChallenge.challenge.completedParticipants += 1;
        await this.challengeRepository.save(userChallenge.challenge);
      } else {
        userChallenge.status = UserChallengeStatus.IN_PROGRESS;
      }

      const updatedUserChallenge =
        await this.userChallengeRepository.save(userChallenge);

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
        where: { id: userChallengeId, userId },
        relations: ["challenge"],
      });

      if (!userChallenge) {
        throw new NotFoundException("User challenge not found");
      }

      if (!userChallenge.isCompleted) {
        throw new BadRequestException("Challenge not completed");
      }

      if (userChallenge.rewardsClaimed) {
        throw new ConflictException("Rewards already claimed");
      }

      if (!userChallenge.hasRewards) {
        throw new BadRequestException("No rewards to claim");
      }

      // Update user with rewards
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (userChallenge.rewards.b3trTokens) {
        user.b3trBalance += userChallenge.rewards.b3trTokens;
      }

      if (userChallenge.rewards.points) {
        user.totalPoints += userChallenge.rewards.points;
      }

      await this.userRepository.save(user);

      // Mark rewards as claimed
      userChallenge.rewardsClaimed = true;
      userChallenge.claimedAt = new Date();
      await this.userChallengeRepository.save(userChallenge);

      this.logger.log(`Challenge rewards claimed: ${userChallengeId}`);
      return this.transformUserChallengeToResponse(userChallenge);
    } catch (error) {
      this.logger.error(`Failed to claim challenge rewards: ${error.message}`);
      throw new BadRequestException("Failed to claim challenge rewards");
    }
  }

  // Helper methods

  /**
   * Get user statistics for a specific challenge period
   */
  private async getUserStatsForChallenge(
    userId: string,
    challenge: Challenge
  ): Promise<any> {
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(challenge.endDate);

    // Get mileage and carbon saved for the challenge period
    const stats = await this.odometerUploadRepository
      .createQueryBuilder("upload")
      .select([
        "SUM(upload.finalMileage) as totalMileage",
        "SUM(upload.carbonSaved) as totalCarbonSaved",
        "COUNT(*) as uploadCount",
      ])
      .where("upload.userId = :userId", { userId })
      .andWhere("upload.createdAt >= :startDate", { startDate })
      .andWhere("upload.createdAt <= :endDate", { endDate })
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
      mileage: parseFloat(stats?.totalMileage || "0"),
      carbonSaved: parseFloat(stats?.totalCarbonSaved || "0"),
      uploadCount: parseInt(stats?.uploadCount || "0"),
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
   * Calculate challenge rewards
   */
  private async calculateChallengeRewards(
    userChallenge: UserChallenge
  ): Promise<any> {
    const { challenge } = userChallenge;
    const rewards = { ...challenge.rewards };

    // Add leaderboard rewards if applicable
    if (challenge.leaderboardRewards) {
      // This would need to be calculated based on final rankings
      // For now, just return the base rewards
    }

    return rewards;
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
      startDate: challenge.startDate.toISOString().split("T")[0],
      endDate: challenge.endDate.toISOString().split("T")[0],
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
      isCompleted: userChallenge.isCompleted,
      isFailed: userChallenge.isFailed,
      isAbandoned: userChallenge.isAbandoned,
      isInProgress: userChallenge.isInProgress,
      hasRewards: userChallenge.hasRewards,
      isRewardsClaimed: userChallenge.isRewardsClaimed,
      formattedRewards: userChallenge.formattedRewards,
      progressPercentage: userChallenge.progressPercentage,
      timeSinceJoined: userChallenge.timeSinceJoined,
      rankDisplay: userChallenge.rankDisplay,
      createdAt: userChallenge.createdAt,
    };
  }
}
