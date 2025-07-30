import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  Reward,
  RewardType,
  RewardStatus,
  BlockchainStatus,
} from "../entity/reward.entity";
import { User } from "../../users/entity/user.entity";
import { VeChainService } from "../../../common/blockchain/vechain.service";
import { HistoryService } from "../../history/services/history.service";
import {
  CreateRewardDto,
  UpdateRewardDto,
  RewardResponseDto,
  RewardQueryDto,
  RewardStatsDto,
  BatchRewardDto,
} from "../dto/reward.dto";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class RewardService {
  private readonly logger = new Logger(RewardService.name);

  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly vechainService: VeChainService,
    private readonly historyService: HistoryService
  ) {}

  // Reward Management (Admin)

  /**
   * Create a reward entry
   */
  async createReward(createDto: CreateRewardDto): Promise<RewardResponseDto> {
    try {
      // Verify user exists
      const user = await this.userRepository.findOne({
        where: { id: createDto.userId },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      const reward = this.rewardRepository.create({
        user: { id: createDto.userId },
        type: createDto.type,
        amount: createDto.amount,
        description: createDto.description,
        metadata: createDto.metadata,
        milesDriven: createDto.milesDriven,
        carbonSaved: createDto.carbonSaved,
        cycleId: createDto.cycleId,
        submissionId: createDto.submissionId,
        proofData: createDto.proofData,
        processedAt: createDto.processedAt
          ? new Date(createDto.processedAt)
          : undefined,
      });

      const savedReward = await this.rewardRepository.save(reward);

      this.logger.log(
        `Reward created: ${savedReward.id} for user: ${createDto.userId}`
      );
      return this.transformRewardToResponse(savedReward);
    } catch (error) {
      this.logger.error(`Failed to create reward: ${error.message}`);
      throw new BadRequestException("Failed to create reward");
    }
  }

  /**
   * Get rewards with filtering
   */
  async getRewards(
    query: RewardQueryDto,
    userId?: string
  ): Promise<{
    rewards: RewardResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        status,
        blockchainStatus,
        search,
        startDate,
        endDate,
        sortBy = "createdAt",
        sortOrder = "DESC",
      } = query;
      const offset = (page - 1) * limit;

      const queryBuilder = this.rewardRepository.createQueryBuilder("reward");

      // if (userId) {
      //   queryBuilder.innerJoin("reward.user", "user");
      //   queryBuilder.andWhere("user.id = :userId", { userId });
      // }

      if (type) {
        queryBuilder.andWhere("reward.type = :type", { type });
      }

      if (status) {
        queryBuilder.andWhere("reward.status = :status", { status });
      }

      if (blockchainStatus) {
        queryBuilder.andWhere("reward.blockchainStatus = :blockchainStatus", {
          blockchainStatus,
        });
      }

      if (search) {
        queryBuilder.andWhere(
          "reward.description ILIKE :search OR reward.type ILIKE :search",
          { search: `%${search}%` }
        );
      }

      if (startDate) {
        queryBuilder.andWhere("reward.createdAt >= :startDate", {
          startDate: new Date(startDate),
        });
      }

      if (endDate) {
        queryBuilder.andWhere("reward.createdAt <= :endDate", {
          endDate: new Date(endDate),
        });
      }

      const total = await queryBuilder.getCount();
      const rewards = await queryBuilder
        .skip(offset)
        .take(limit)
        .orderBy(`reward.${sortBy}`, sortOrder)
        .getMany();

      return {
        rewards: rewards.map((reward) =>
          this.transformRewardToResponse(reward)
        ),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to get rewards: ${error.message}`);
      throw new BadRequestException("Failed to get rewards");
    }
  }

  /**
   * Get reward by ID
   */
  async getRewardById(
    rewardId: string,
    userId?: string
  ): Promise<RewardResponseDto> {
    const queryBuilder = this.rewardRepository
      .createQueryBuilder("reward")
      .where("reward.id = :rewardId", { rewardId });

    if (userId) {
      queryBuilder.innerJoin("reward.user", "user");
      queryBuilder.andWhere("user.id = :userId", { userId });
    }

    const reward = await queryBuilder.getOne();

    if (!reward) {
      throw new NotFoundException("Reward not found");
    }

    return this.transformRewardToResponse(reward);
  }

  /**
   * Update reward
   */
  async updateReward(
    rewardId: string,
    updateDto: UpdateRewardDto,
    userId?: string
  ): Promise<RewardResponseDto> {
    try {
      const queryBuilder = this.rewardRepository
        .createQueryBuilder("reward")
        .where("reward.id = :rewardId", { rewardId });

      if (userId) {
        queryBuilder.innerJoin("reward.user", "user");
        queryBuilder.andWhere("user.id = :userId", { userId });
      }

      const reward = await queryBuilder.getOne();

      if (!reward) {
        throw new NotFoundException("Reward not found");
      }

      Object.assign(reward, updateDto);
      const updatedReward = await this.rewardRepository.save(reward);

      this.logger.log(`Reward updated: ${rewardId}`);
      return this.transformRewardToResponse(updatedReward);
    } catch (error) {
      this.logger.error(`Failed to update reward: ${error.message}`);
      throw new BadRequestException("Failed to update reward");
    }
  }

  /**
   * Cancel reward
   */
  async cancelReward(rewardId: string, userId?: string): Promise<void> {
    try {
      const queryBuilder = this.rewardRepository
        .createQueryBuilder("reward")
        .where("reward.id = :rewardId", { rewardId });

      if (userId) {
        queryBuilder.innerJoin("reward.user", "user");
        queryBuilder.andWhere("user.id = :userId", { userId });
      }

      const reward = await queryBuilder.getOne();

      if (!reward) {
        throw new NotFoundException("Reward not found");
      }

      if (!reward.canBeCancelled) {
        throw new BadRequestException("Reward cannot be cancelled");
      }

      reward.status = RewardStatus.CANCELLED;
      await this.rewardRepository.save(reward);

      this.logger.log(`Reward cancelled: ${rewardId}`);
    } catch (error) {
      this.logger.error(`Failed to cancel reward: ${error.message}`);
      throw new BadRequestException("Failed to cancel reward");
    }
  }

  // User Reward Management

  /**
   * Get user rewards
   */
  async getUserRewards(
    userId: string,
    query: RewardQueryDto
  ): Promise<{
    rewards: RewardResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.getRewards(query, userId);
  }

  /**
   * Get user reward statistics
   */
  async getUserRewardStats(userId: string): Promise<RewardStatsDto> {
    return this.getRewardStats(userId);
  }

  /**
   * Get reward statistics
   */
  async getRewardStats(userId?: string): Promise<RewardStatsDto> {
    try {
      const queryBuilder = this.rewardRepository.createQueryBuilder("reward");

      if (userId) {
        queryBuilder.innerJoin("reward.user", "user");
        queryBuilder.andWhere("user.id = :userId", { userId });
      }

      const total = await queryBuilder.getCount();

      // Get total amounts
      const totalStats = await queryBuilder
        .select([
          "SUM(reward.amount) as totalamount",
          "SUM(reward.milesDriven) as totalmiles",
          "SUM(reward.carbonSaved) as totalcarbonsaved",
        ])
        .getRawOne();

      const totalAmount = parseFloat(totalStats?.totalamount || "0");
      const totalMiles = parseFloat(totalStats?.totalmiles || "0");
      const totalCarbonSaved = parseFloat(totalStats?.totalcarbonsaved || "0");

      // Get rewards by type
      const byTypeQuery = await queryBuilder
        .select(["reward.type as rewardtype", "COUNT(*) as count"])
        .groupBy("reward.type")
        .getRawMany();

      const byType: Record<string, number> = {};
      byTypeQuery.forEach((item) => {
        byType[item.rewardtype] = parseInt(item.count);
      });

      // Get rewards by status
      const byStatusQuery = await queryBuilder
        .select(["reward.status as rewardstatus", "COUNT(*) as count"])
        .groupBy("reward.status")
        .getRawMany();

      const byStatus: Record<string, number> = {};
      byStatusQuery.forEach((item) => {
        byStatus[item.rewardstatus] = parseInt(item.count);
      });

      // Get rewards by blockchain status
      const byBlockchainStatusQuery = await queryBuilder
        .select([
          "reward.blockchainStatus as rewardblockchainstatus",
          "COUNT(*) as count",
        ])
        .groupBy("reward.blockchainStatus")
        .getRawMany();

      const byBlockchainStatus: Record<string, number> = {};
      byBlockchainStatusQuery.forEach((item) => {
        byBlockchainStatus[item.rewardblockchainstatus] = parseInt(item.count);
      });

      // Calculate averages
      const averageAmount = total > 0 ? totalAmount / total : 0;
      const averageMiles = total > 0 ? totalMiles / total : 0;
      const averageCarbonSaved = total > 0 ? totalCarbonSaved / total : 0;

      // Get most active day
      const mostActiveDayQuery = await queryBuilder
        .select(["DATE(reward.createdAt) as date", "COUNT(*) as count"])
        .groupBy("DATE(reward.createdAt)")
        .orderBy("count", "DESC")
        .limit(1)
        .getRawOne();

      const mostActiveDay = mostActiveDayQuery?.date || null;
      const mostActiveDayCount = parseInt(mostActiveDayQuery?.count || "0");

      return {
        total,
        totalAmount,
        totalMiles,
        totalCarbonSaved: totalCarbonSaved / 1000, // Convert to kg
        byType,
        byStatus,
        byBlockchainStatus,
        averageAmount,
        averageMiles,
        averageCarbonSaved: averageCarbonSaved / 1000, // Convert to kg
        mostActiveDay,
        mostActiveDayCount,
      };
    } catch (error) {
      this.logger.error(`Failed to get reward stats: ${error.message}`);
      throw new BadRequestException("Failed to get reward stats");
    }
  }

  // Blockchain Integration

  /**
   * Process pending rewards and send to blockchain
   */
  // @Cron(CronExpression.EVERY_MINUTE)
  async processPendingRewards(): Promise<void> {
    try {
      this.logger.log("Processing pending rewards...");

      // Get pending rewards
      const pendingRewards = await this.rewardRepository.find({
        where: {
          status: RewardStatus.PENDING,
          blockchainStatus: BlockchainStatus.NOT_SENT,
        },
        relations: ["user"],
        order: { createdAt: "ASC" },
        take: 100, // Process in batches
      });

      if (pendingRewards.length === 0) {
        this.logger.log("No pending rewards to process");
        return;
      }

      this.logger.log(`Processing ${pendingRewards.length} pending rewards`);

      // Group rewards by user for batch processing
      const userRewards = new Map<string, Reward[]>();
      pendingRewards.forEach((reward) => {
        if (!userRewards.has(reward.user.id)) {
          userRewards.set(reward.user.id, []);
        }
        userRewards.get(reward.user.id).push(reward);
      });

      // Process each user's rewards
      for (const [userId, rewards] of userRewards) {
        await this.processUserRewards(userId, rewards);
      }
    } catch (error) {
      this.logger.error("Failed to process pending rewards:", error);
    }
  }

  /**
   * Process rewards for a specific user
   */
  private async processUserRewards(
    userId: string,
    rewards: Reward[]
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Get user wallet address
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user || !user.walletAddress) {
        this.logger.warn(`User ${userId} has no wallet address`);
        return;
      }

      // Get user's current balance for history tracking
      const currentBalance = user.b3trBalance || 0;

      // Prepare batch data for blockchain
      const batchData: BatchRewardDto[] = rewards.map((reward) => ({
        user: user.walletAddress,
        miles: reward.milesDriven,
        amount: reward.amount,
        proofTypes: ["image"],
        proofValues: reward.proofData?.proofValues || [
          reward.proofData?.imageHash || "",
        ],
        impactCodes: ["carbon"],
        impactValues: reward.proofData?.impactValues || [reward.carbonSaved],
        description: reward.description || `Reward for ${reward.type}`,
      }));

      // Update rewards to processing status and log processing start
      for (const reward of rewards) {
        reward.status = RewardStatus.PROCESSING;
        reward.blockchainStatus = BlockchainStatus.SENT;
        reward.processedAt = new Date();
        await this.rewardRepository.save(reward);

        // Log processing status update
        await this.historyService.createRewardProcessingStatusHistory(
          userId,
          reward.amount,
          "processing",
          {
            rewardType: reward.type,
            source: reward.metadata?.source || "odometer_upload",
            uploadId: reward.proofData?.uploadId,
            vehicleId: reward.proofData?.vehicleId,
            vehicleName: reward.metadata?.vehicleName,
            cycleId: reward.cycleId,
            submissionId: reward.submissionId,
            processingTime: Date.now() - startTime,
          }
        );
      }

      // Send to blockchain
      const distributionResult =
        await this.vechainService.distributeRewards(batchData);
      const processingTime = Date.now() - startTime;

      // Calculate new balance
      const totalRewardAmount = rewards.reduce(
        (sum, reward) => sum + reward.amount,
        0
      );
      const newBalance = currentBalance + totalRewardAmount;

      // Update user balance
      await this.updateUserB3trBalance(userId, totalRewardAmount);

      // Update rewards with transaction hash
      for (const reward of rewards) {
        reward.blockchainData = {
          ...reward.blockchainData,
          txHash: distributionResult,
          sentAt: new Date(),
        };
        await this.rewardRepository.save(reward);
      }

      // Log successful distribution for each reward
      for (const reward of rewards) {
        await this.historyService.createRewardDistributionHistory(
          userId,
          reward.amount,
          currentBalance,
          newBalance,
          {
            txHash: distributionResult.txid,
            batchCount: distributionResult.batchCount,
            totalUsers: distributionResult.totalUsers,
            totalDistributed: distributionResult.totalDistributed,
            rewardType: reward.type,
            source: reward.metadata?.source || "odometer_upload",
            carbonSaved: reward.carbonSaved,
            milesDriven: reward.milesDriven,
            uploadId: reward.proofData?.uploadId,
            vehicleId: reward.proofData?.vehicleId,
            vehicleName: reward.metadata?.vehicleName,
            cycleId: reward.cycleId,
            submissionId: reward.submissionId,
            blockchainNetwork: "testnet", // Default to testnet for now
            contractAddress: this.vechainService.getContractAddress() || "",
            processingTime,
          }
        );

        // Log processing completion
        await this.historyService.createRewardProcessingStatusHistory(
          userId,
          reward.amount,
          "completed",
          {
            rewardType: reward.type,
            source: reward.metadata?.source || "odometer_upload",
            uploadId: reward.proofData?.uploadId,
            vehicleId: reward.proofData?.vehicleId,
            vehicleName: reward.metadata?.vehicleName,
            cycleId: reward.cycleId,
            submissionId: reward.submissionId,
            processingTime,
          }
        );
      }

      this.logger.log(
        `Processed ${rewards.length} rewards for user ${userId}: ${distributionResult.txid}`
      );
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(`Failed to process rewards for user ${userId}:`, error);

      // Mark rewards as failed and log failures
      for (const reward of rewards) {
        reward.status = RewardStatus.FAILED;
        reward.blockchainStatus = BlockchainStatus.FAILED;
        reward.failedAt = new Date();
        reward.failureReason = error.message;
        reward.blockchainData = {
          ...reward.blockchainData,
          error: error.message,
          retryCount: (reward.blockchainData?.retryCount || 0) + 1,
          lastRetryAt: new Date(),
        };
        await this.rewardRepository.save(reward);

        // Log distribution failure
        await this.historyService.createRewardDistributionFailureHistory(
          userId,
          reward.amount,
          error.message,
          {
            rewardType: reward.type,
            source: reward.metadata?.source || "odometer_upload",
            carbonSaved: reward.carbonSaved,
            milesDriven: reward.milesDriven,
            uploadId: reward.proofData?.uploadId,
            vehicleId: reward.proofData?.vehicleId,
            vehicleName: reward.metadata?.vehicleName,
            cycleId: reward.cycleId,
            submissionId: reward.submissionId,
            retryCount: reward.blockchainData?.retryCount || 0,
            lastRetryAt: reward.blockchainData?.lastRetryAt,
            blockchainNetwork: "testnet", // Default to testnet for now
            contractAddress: this.vechainService.getContractAddress() || "",
          }
        );

        // Log processing failure
        await this.historyService.createRewardProcessingStatusHistory(
          userId,
          reward.amount,
          "failed",
          {
            rewardType: reward.type,
            source: reward.metadata?.source || "odometer_upload",
            uploadId: reward.proofData?.uploadId,
            vehicleId: reward.proofData?.vehicleId,
            vehicleName: reward.metadata?.vehicleName,
            cycleId: reward.cycleId,
            submissionId: reward.submissionId,
            processingTime,
            errorMessage: error.message,
          }
        );
      }
    }
  }

  /**
   * Check blockchain transaction status and update transaction details
   */
  // @Cron(CronExpression.EVERY_MINUTE)
  async checkBlockchainTransactions(): Promise<void> {
    try {
      this.logger.log("Checking blockchain transactions...");

      // Get sent transactions
      const sentRewards = await this.rewardRepository.find({
        where: {
          blockchainStatus: BlockchainStatus.SENT,
        },
        relations: ["user"],
        take: 50,
      });

      for (const reward of sentRewards) {
        if (reward.blockchainData?.txHash) {
          const txid = reward.blockchainData.txHash.txid;

          try {
            // Check if transaction is confirmed
            const isConfirmed =
              await this.vechainService.isTransactionConfirmed(txid);

            if (isConfirmed) {
              // Get detailed transaction information
              const transactionDetails =
                await this.vechainService.getTransactionDetails(txid);
              // Update reward with transaction details and confirmation
              reward.status =
                transactionDetails.status === "success"
                  ? RewardStatus.COMPLETED
                  : RewardStatus.FAILED;
              reward.blockchainStatus =
                transactionDetails.status === "success"
                  ? BlockchainStatus.CONFIRMED
                  : BlockchainStatus.FAILED;
              reward.confirmedAt = new Date();

              // Store transaction details in metadata
              reward.metadata = {
                ...reward.metadata,
                transactionDetails: {
                  txid: transactionDetails.txid,
                  blockNumber: transactionDetails.blockNumber,
                  blockTime: transactionDetails.blockTime,
                  from: transactionDetails.from,
                  to: transactionDetails.to,
                  value: transactionDetails.value,
                  gasUsed: transactionDetails.gasUsed,
                  gasPrice: transactionDetails.gasPrice,
                  status: transactionDetails.status,
                  confirmations: transactionDetails.confirmations,
                  receipt: {
                    contractAddress: transactionDetails.receipt.contractAddress,
                    cumulativeGasUsed:
                      transactionDetails.receipt.cumulativeGasUsed,
                    effectiveGasPrice:
                      transactionDetails.receipt.effectiveGasPrice,
                    logs: transactionDetails.receipt.logs,
                    logsBloom: transactionDetails.receipt.logsBloom,
                    status: transactionDetails.receipt.status,
                    transactionHash: transactionDetails.receipt.transactionHash,
                    transactionIndex:
                      transactionDetails.receipt.transactionIndex,
                    type: transactionDetails.receipt.type,
                  },
                  input: transactionDetails.input,
                  nonce: transactionDetails.nonce,
                  hash: transactionDetails.hash,
                  r: transactionDetails.r,
                  s: transactionDetails.s,
                  v: transactionDetails.v,
                  network: transactionDetails.network,
                  timestamp: transactionDetails.timestamp,
                },
                lastTransactionCheck: new Date(),
              };

              await this.rewardRepository.save(reward);

              // Update user's B3TR balance when reward is confirmed
              await this.updateUserB3trBalance(reward.user?.id, reward.amount);

              // Log transaction confirmation
              await this.historyService.createTransactionConfirmationHistory(
                reward.user.id,
                txid,
                {
                  blockNumber: transactionDetails.blockNumber,
                  confirmations: transactionDetails.confirmations,
                  gasUsed: transactionDetails.gasUsed,
                  gasPrice: transactionDetails.gasPrice,
                  status: transactionDetails.status,
                  rewardAmount: reward.amount,
                  rewardType: reward.type,
                  source: reward.metadata?.source || "odometer_upload",
                  blockchainNetwork: "testnet", // Default to testnet for now
                  contractAddress:
                    this.vechainService.getContractAddress() || "",
                  processingTime:
                    Date.now() - (reward.createdAt?.getTime() || Date.now()),
                }
              );

              this.logger.log(
                `Reward ${reward.id} confirmed on blockchain with transaction details`
              );
            } else {
              // Update last check time even if not confirmed
              reward.metadata = {
                ...reward.metadata,
                lastTransactionCheck: new Date(),
              };
              await this.rewardRepository.save(reward);
            }
          } catch (txError) {
            this.logger.error(
              `Failed to check transaction ${txid} for reward ${reward.id}:`,
              txError
            );

            // Update last check time and error
            reward.metadata = {
              ...reward.metadata,
              lastTransactionCheck: new Date(),
              lastTransactionCheckError: txError.message,
            };
            await this.rewardRepository.save(reward);
          }
        }
      }
    } catch (error) {
      this.logger.error("Failed to check blockchain transactions:", error);
    }
  }

  /**
   * Update transaction details for a specific reward
   */
  async updateTransactionDetails(rewardId: string): Promise<RewardResponseDto> {
    try {
      const reward = await this.rewardRepository.findOne({
        where: { id: rewardId },
      });

      if (!reward) {
        throw new NotFoundException("Reward not found");
      }

      if (!reward.blockchainData?.txHash?.txid) {
        throw new BadRequestException("Reward has no transaction hash");
      }

      const txid = reward.blockchainData.txHash.txid;
      this.logger.log(
        `Updating transaction details for reward ${rewardId}: ${txid}`
      );

      // Get detailed transaction information
      const transactionDetails =
        await this.vechainService.getTransactionDetails(txid);

      // Update reward with transaction details
      reward.metadata = {
        ...reward.metadata,
        transactionDetails: {
          txid: transactionDetails.txid,
          blockNumber: transactionDetails.blockNumber,
          blockTime: transactionDetails.blockTime,
          from: transactionDetails.from,
          to: transactionDetails.to,
          value: transactionDetails.value,
          gasUsed: transactionDetails.gasUsed,
          gasPrice: transactionDetails.gasPrice,
          status: transactionDetails.status,
          confirmations: transactionDetails.confirmations,
          receipt: {
            contractAddress: transactionDetails.receipt.contractAddress,
            cumulativeGasUsed: transactionDetails.receipt.cumulativeGasUsed,
            effectiveGasPrice: transactionDetails.receipt.effectiveGasPrice,
            logs: transactionDetails.receipt.logs,
            logsBloom: transactionDetails.receipt.logsBloom,
            status: transactionDetails.receipt.status,
            transactionHash: transactionDetails.receipt.transactionHash,
            transactionIndex: transactionDetails.receipt.transactionIndex,
            type: transactionDetails.receipt.type,
          },
          input: transactionDetails.input,
          nonce: transactionDetails.nonce,
          hash: transactionDetails.hash,
          r: transactionDetails.r,
          s: transactionDetails.s,
          v: transactionDetails.v,
          network: transactionDetails.network,
          timestamp: transactionDetails.timestamp,
        },
        lastTransactionCheck: new Date(),
      };

      const updatedReward = await this.rewardRepository.save(reward);

      this.logger.log(`Transaction details updated for reward ${rewardId}`);
      return this.transformRewardToResponse(updatedReward);
    } catch (error) {
      this.logger.error(
        `Failed to update transaction details for reward ${rewardId}:`,
        error
      );
      throw new BadRequestException(
        `Failed to update transaction details: ${error.message}`
      );
    }
  }

  /**
   * Update transaction details for all rewards with transaction hashes
   */
  async updateAllTransactionDetails(): Promise<{
    updated: number;
    failed: number;
    errors: string[];
  }> {
    try {
      this.logger.log("Updating transaction details for all rewards...");

      // Get all rewards with transaction hashes
      const rewards = await this.rewardRepository
        .createQueryBuilder("reward")
        .where("reward.blockchainData->>'txHash' IS NOT NULL")
        .andWhere("reward.blockchainData->'txHash'->>'txid' IS NOT NULL")
        .take(100)
        .getMany();

      let updated = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const reward of rewards) {
        try {
          await this.updateTransactionDetails(reward.id);
          updated++;
        } catch (error) {
          failed++;
          errors.push(`Reward ${reward.id}: ${error.message}`);
          this.logger.error(
            `Failed to update transaction details for reward ${reward.id}:`,
            error
          );
        }
      }

      this.logger.log(
        `Transaction details update completed: ${updated} updated, ${failed} failed`
      );
      return { updated, failed, errors };
    } catch (error) {
      this.logger.error("Failed to update all transaction details:", error);
      throw new BadRequestException(
        `Failed to update all transaction details: ${error.message}`
      );
    }
  }

  /**
   * Retry failed rewards
   */
  async retryFailedReward(rewardId: string): Promise<void> {
    try {
      const reward = await this.rewardRepository.findOne({
        where: { id: rewardId },
      });

      if (!reward) {
        throw new NotFoundException("Reward not found");
      }

      if (!reward.canRetry) {
        throw new BadRequestException("Reward cannot be retried");
      }

      // Reset reward status
      reward.status = RewardStatus.PENDING;
      reward.blockchainStatus = BlockchainStatus.NOT_SENT;
      reward.failedAt = null;
      reward.failureReason = null;
      await this.rewardRepository.save(reward);

      // Log retry attempt
      const retryCount = (reward.blockchainData?.retryCount || 0) + 1;
      await this.historyService.createRewardRetryHistory(
        reward.user.id,
        reward.amount,
        retryCount,
        {
          rewardType: reward.type,
          source: reward.metadata?.source || "odometer_upload",
          carbonSaved: reward.carbonSaved,
          milesDriven: reward.milesDriven,
          uploadId: reward.proofData?.uploadId,
          vehicleId: reward.proofData?.vehicleId,
          vehicleName: reward.metadata?.vehicleName,
          cycleId: reward.cycleId,
          submissionId: reward.submissionId,
          blockchainNetwork: "testnet", // Default to testnet for now
          contractAddress: this.vechainService.getContractAddress() || "",
        }
      );

      this.logger.log(`Reward ${rewardId} queued for retry`);
    } catch (error) {
      this.logger.error(`Failed to retry reward ${rewardId}:`, error);
      throw new BadRequestException("Failed to retry reward");
    }
  }

  // Helper methods

  /**
   * Transform reward to response DTO
   */
  private transformRewardToResponse(reward: Reward): RewardResponseDto {
    return {
      id: reward.id,
      userId: reward.user?.id,
      type: reward.type,
      status: reward.status,
      blockchainStatus: reward.blockchainStatus,
      amount: reward.amount,
      milesDriven: reward.milesDriven,
      carbonSaved: reward.carbonSaved,
      cycleId: reward.cycleId,
      submissionId: reward.submissionId,
      description: reward.description,
      proofData: reward.proofData,
      blockchainData: reward.blockchainData,
      metadata: reward.metadata,
      processedAt: reward.processedAt,
      confirmedAt: reward.confirmedAt,
      failedAt: reward.failedAt,
      failureReason: reward.failureReason,
      createdAt: reward.createdAt,
      updatedAt: reward.updatedAt,
      // Virtual properties
      isPending: reward.isPending,
      isProcessing: reward.isProcessing,
      isCompleted: reward.isCompleted,
      isFailed: reward.isFailed,
      isCancelled: reward.isCancelled,
      isBlockchainPending: reward.isBlockchainPending,
      isBlockchainSent: reward.isBlockchainSent,
      isBlockchainConfirmed: reward.isBlockchainConfirmed,
      isBlockchainFailed: reward.isBlockchainFailed,
      canRetry: reward.canRetry,
      formattedAmount: reward.formattedAmount,
      formattedMiles: reward.formattedMiles,
      formattedCarbonSaved: reward.formattedCarbonSaved,
      carbonSavedKg: reward.carbonSavedKg,
      formattedCarbonSavedKg: reward.formattedCarbonSavedKg,
      rewardPerMile: reward.rewardPerMile,
      formattedRewardPerMile: reward.formattedRewardPerMile,
      carbonEfficiency: reward.carbonEfficiency,
      formattedCarbonEfficiency: reward.formattedCarbonEfficiency,
      processingTime: reward.processingTime,
      confirmationTime: reward.confirmationTime,
      totalProcessingTime: reward.totalProcessingTime,
      formattedProcessingTime: reward.formattedProcessingTime,
      formattedConfirmationTime: reward.formattedConfirmationTime,
      formattedTotalProcessingTime: reward.formattedTotalProcessingTime,
      typeIcon: reward.typeIcon,
      statusColor: reward.statusColor,
      blockchainStatusColor: reward.blockchainStatusColor,
      canBeCancelled: reward.canBeCancelled,
      canBeRetried: reward.canBeRetried,
    };
  }

  // Auto-reward methods for system events

  /**
   * Create upload reward
   */
  async createUploadReward(
    userId: string,
    uploadId: string,
    milesDriven: number,
    carbonSaved: number,
    imageHash: string,
    additionalData?: {
      vehicleId?: string;
      vehicleName?: string;
      previousMileage?: number;
      mileageDifference?: number;
      ocrConfidence?: number;
      processingTime?: number;
      uploadDate?: Date;
      cycleId?: number;
      submissionId?: number;
    }
  ): Promise<RewardResponseDto> {
    const rewardAmount = this.calculateUploadReward(milesDriven, carbonSaved);

    return this.createReward({
      userId,
      type: RewardType.UPLOAD,
      amount: rewardAmount,
      milesDriven,
      carbonSaved,
      cycleId: additionalData?.cycleId,
      submissionId: additionalData?.submissionId,
      description: `Reward for uploading ${milesDriven.toFixed(1)} miles${additionalData?.vehicleName ? ` for ${additionalData.vehicleName}` : ""}`,
      proofData: {
        proofTypes: ["image"],
        proofValues: [imageHash],
        impactCodes: ["carbon"],
        impactValues: [carbonSaved],
        imageHash,
        uploadId,
        vehicleId: additionalData?.vehicleId,
        previousMileage: additionalData?.previousMileage,
        mileageDifference: additionalData?.mileageDifference,
        ocrConfidence: additionalData?.ocrConfidence,
        processingTime: additionalData?.processingTime,
      },
      metadata: {
        source: "upload",
        trigger: "odometer_photo",
        vehicleName: additionalData?.vehicleName,
        uploadDate: additionalData?.uploadDate,
        processingTime: additionalData?.processingTime,
        ocrConfidence: additionalData?.ocrConfidence,
        mileageDifference: additionalData?.mileageDifference,
        previousMileage: additionalData?.previousMileage,
      },
    });
  }

  /**
   * Create badge reward
   */
  async createBadgeReward(
    userId: string,
    badgeId: string,
    badgeName: string,
    rewardAmount: number
  ): Promise<RewardResponseDto> {
    return this.createReward({
      userId,
      type: RewardType.BADGE,
      amount: rewardAmount,
      description: `Reward for earning "${badgeName}" badge`,
      proofData: {
        proofTypes: ["badge"],
        proofValues: [badgeId],
        impactCodes: ["achievement"],
        impactValues: [1],
        badgeId,
      },
      metadata: {
        source: "badge",
        trigger: "automatic",
      },
    });
  }

  /**
   * Create challenge reward
   */
  async createChallengeReward(
    userId: string,
    challengeId: string,
    challengeName: string,
    rewardAmount: number
  ): Promise<RewardResponseDto> {
    return this.createReward({
      userId,
      type: RewardType.CHALLENGE,
      amount: rewardAmount,
      description: `Reward for completing "${challengeName}" challenge`,
      proofData: {
        proofTypes: ["challenge"],
        proofValues: [challengeId],
        impactCodes: ["achievement"],
        impactValues: [1],
        challengeId,
      },
      metadata: {
        source: "challenge",
        trigger: "automatic",
      },
    });
  }

  /**
   * Calculate upload reward based on miles and carbon saved
   */
  private calculateUploadReward(
    milesDriven: number,
    carbonSaved: number
  ): number {
    // Base reward: 0.01 B3TR per mile
    const baseReward = milesDriven * 0.01;

    // Carbon bonus: 0.01 B3TR per kg CO2 saved
    const carbonBonus = (carbonSaved / 1000) * 0.001;

    // Total reward
    const totalReward = baseReward + carbonBonus;

    // Round to 8 decimal places (B3TR precision)
    return Math.round(totalReward * 100000000) / 100000000;
  }

  /**
   * Update user's B3TR balance when reward is confirmed
   */
  private async updateUserB3trBalance(
    userId: string,
    rewardAmount: number
  ): Promise<void> {
    try {
      // Update user's B3TR balance
      await this.userRepository
        .createQueryBuilder()
        .update(User)
        .set({
          b3trBalance: () => `b3tr_balance + ${rewardAmount}`,
        })
        .where("id = :userId", { userId })
        .execute();

      this.logger.log(
        `Updated user ${userId} B3TR balance: +${rewardAmount} B3TR`
      );
    } catch (error) {
      this.logger.error(
        `Failed to update B3TR balance for user ${userId}: ${error.message}`
      );
      // Don't throw error as balance update failure shouldn't fail the reward confirmation
    }
  }
}
