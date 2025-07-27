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
  ) {}

  /**
   * Create a new challenge
   */
  async createChallenge(
    createDto: CreateChallengeDto,
    adminId: string,
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
    search?: string,
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
          { search: `%${search}%` },
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
          this.transformChallengeToResponse(challenge),
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
        `Failed to get challenge ${challengeId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Update challenge
   */
  async updateChallenge(
    challengeId: string,
    updateDto: UpdateChallengeDto,
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
        `Failed to update challenge ${challengeId}: ${error.message}`,
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
        `Failed to publish challenge ${challengeId}: ${error.message}`,
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
        `Failed to delete challenge ${challengeId}: ${error.message}`,
      );
      throw new BadRequestException("Failed to delete challenge");
    }
  }

  /**
   * Get available challenges for user
   */
  async getAvailableChallenges(
    userId: string,
  ): Promise<ChallengeResponseDto[]> {
    try {
      const challenges = await this.challengeRepository.find({
        where: { status: ChallengeStatus.ACTIVE },
      });

      const userChallenges = await this.userChallengeRepository.find({
        where: { userId },
        select: ["challengeId"],
      });

      const joinedChallengeIds = userChallenges.map((uc) => uc.challengeId);
      const availableChallenges = challenges.filter(
        (challenge) => !joinedChallengeIds.includes(challenge.id),
      );

      return availableChallenges.map((challenge) =>
        this.transformChallengeToResponse(challenge),
      );
    } catch (error) {
      this.logger.error(`Failed to get available challenges: ${error.message}`);
      throw new BadRequestException("Failed to get available challenges");
    }
  }

  /**
   * Join a challenge
   */
  async joinChallenge(
    userId: string,
    challengeId: string,
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
        progress: {
          mileage: 0,
          carbonSaved: 0,
          uploadCount: 0,
          vehicleCount: 0,
          rewardsEarned: 0,
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
    limit: number = 20,
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
        .where("userChallenge.userId = :userId", { userId });

      const total = await query.getCount();
      const userChallenges = await query
        .skip(offset)
        .take(limit)
        .orderBy("userChallenge.createdAt", "DESC")
        .getMany();

      return {
        userChallenges: userChallenges.map((userChallenge) =>
          this.transformUserChallengeToResponse(userChallenge),
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
    challengeId: string,
  ): Promise<UserChallengeResponseDto> {
    try {
      const userChallenge = await this.userChallengeRepository.findOne({
        where: { userId, challengeId },
        relations: ["challenge"],
      });

      if (!userChallenge) {
        throw new NotFoundException("User challenge not found");
      }

      // Get user stats for the challenge period
      const userStats = await this.getUserStatsForChallenge(
        userId,
        userChallenge.challenge,
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
      }

      const updatedUserChallenge =
        await this.userChallengeRepository.save(userChallenge);

      return this.transformUserChallengeToResponse(updatedUserChallenge);
    } catch (error) {
      this.logger.error(
        `Failed to update challenge progress: ${error.message}`,
      );
      throw new BadRequestException("Failed to update challenge progress");
    }
  }

  /**
   * Claim challenge rewards
   */
  async claimChallengeRewards(
    userId: string,
    userChallengeId: string,
  ): Promise<UserChallengeResponseDto> {
    try {
      const userChallenge = await this.userChallengeRepository.findOne({
        where: { id: userChallengeId, userId },
        relations: ["challenge"],
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
  private async getUserStatsForChallenge(
    userId: string,
    challenge: Challenge,
  ): Promise<any> {
    const { startDate, endDate } = challenge;

    // Get upload statistics for the challenge period
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
      .andWhere("upload.status = :status", { status: UploadStatus.COMPLETED })
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
    userChallenge: UserChallenge,
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
    userChallenge: UserChallenge,
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
    challenge: Challenge,
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
    userChallenge: UserChallenge,
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
