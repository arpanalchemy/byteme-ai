import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { User } from "../../users/entity/user.entity";
import { Reward } from "../../rewards/entity/reward.entity";
import { UserWallet } from "../../users/entity/user-wallet.entity";
import { VeChainService } from "../../../common/blockchain/vechain.service";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CarbonCreditService } from "./carbon-credit.service";
import { SmartContractService } from "./smart-contract.service";

export interface CarbonCreditToken {
  tokenId: string;
  userId: string;
  amount: number;
  carbonSaved: number;
  timestamp: Date;
  transactionHash: string;
  status: "pending" | "minted" | "verified" | "traded";
  metadata: {
    vehicleType: string;
    routeOptimization: boolean;
    ecoFriendlyScore: number;
    verificationMethod: string;
  };
}

export interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  timestamp: Date;
  status: "pending" | "confirmed" | "failed";
  blockNumber: number;
  confirmations: number;
  type: "carbon_credit" | "b3tr_transfer" | "reward_claim" | "nft_mint";
  metadata: any;
}

export interface SmartContractEvent {
  contractAddress: string;
  eventName: string;
  eventData: any;
  blockNumber: number;
  transactionHash: string;
  timestamp: Date;
  userId?: string;
}

export interface CarbonCreditMarketplace {
  totalSupply: number;
  circulatingSupply: number;
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  recentTransactions: BlockchainTransaction[];
  topHolders: Array<{
    address: string;
    balance: number;
    percentage: number;
  }>;
}

export interface WalletAnalytics {
  userId: string;
  walletAddress: string;
  totalBalance: number;
  carbonCredits: number;
  b3trTokens: number;
  transactionHistory: BlockchainTransaction[];
  portfolioValue: number;
  portfolioChange24h: number;
  stakingRewards: number;
  governanceVotes: number;
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(UserWallet)
    private readonly userWalletRepository: Repository<UserWallet>,
    private readonly vechainService: VeChainService,
    private readonly carbonCreditService: CarbonCreditService,
    private readonly smartContractService: SmartContractService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Tokenize carbon savings as NFTs
   */
  async tokenizeCarbonSavings(
    userId: string,
    carbonAmount: number,
    metadata: any
  ): Promise<CarbonCreditToken> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      const userWallet = await this.userWalletRepository.findOne({
        where: { userId },
      });

      if (!user || !userWallet) {
        throw new Error("User or wallet not found");
      }

      // Create carbon credit token
      const tokenData = {
        userId,
        amount: carbonAmount,
        carbonSaved: carbonAmount,
        metadata: {
          vehicleType: metadata.vehicleType || "unknown",
          routeOptimization: metadata.routeOptimization || false,
          ecoFriendlyScore: metadata.ecoFriendlyScore || 0,
          verificationMethod: "odometer_upload",
          ...metadata,
        },
      };

      // Mint NFT on VeChain
      const mintResult = await this.carbonCreditService.mintCarbonCredit(
        userWallet.walletAddress,
        tokenData
      );

      // Create token record
      const carbonCreditToken: CarbonCreditToken = {
        tokenId: mintResult.tokenId,
        userId,
        amount: carbonAmount,
        carbonSaved: carbonAmount,
        timestamp: new Date(),
        transactionHash: mintResult.transactionHash,
        status: "minted",
        metadata: tokenData.metadata,
      };

      // Emit event for real-time updates
      this.eventEmitter.emit("carbon.credit.minted", carbonCreditToken);

      this.logger.log(
        `Carbon credit tokenized for user ${userId}: ${carbonAmount} kg CO2`
      );

      return carbonCreditToken;
    } catch (error) {
      this.logger.error(
        `Failed to tokenize carbon savings for user ${userId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Transfer B3TR tokens between users
   */
  async transferB3TRTokens(
    fromUserId: string,
    toUserId: string,
    amount: number,
    metadata?: any
  ): Promise<BlockchainTransaction> {
    try {
      const fromUser = await this.userRepository.findOne({
        where: { id: fromUserId },
      });
      const toUser = await this.userRepository.findOne({
        where: { id: toUserId },
      });
      const fromWallet = await this.userWalletRepository.findOne({
        where: { userId: fromUserId },
      });
      const toWallet = await this.userWalletRepository.findOne({
        where: { userId: toUserId },
      });

      if (!fromUser || !toUser || !fromWallet || !toWallet) {
        throw new Error("Users or wallets not found");
      }

      // Execute transfer on VeChain
      const transferResult = await this.vechainService.transferTokens(
        fromWallet.walletAddress,
        toWallet.walletAddress,
        amount
      );

      // Create transaction record
      const transaction: BlockchainTransaction = {
        hash: transferResult.hash,
        from: fromWallet.walletAddress,
        to: toWallet.walletAddress,
        value: amount.toString(),
        gasUsed: transferResult.gasUsed,
        gasPrice: transferResult.gasPrice,
        timestamp: new Date(),
        status: "confirmed",
        blockNumber: transferResult.blockNumber,
        confirmations: transferResult.confirmations,
        type: "b3tr_transfer",
        metadata: {
          fromUserId,
          toUserId,
          ...metadata,
        },
      };

      // Update user balances
      await this.updateUserBalances(fromUserId, toUserId, amount);

      // Emit event for real-time updates
      this.eventEmitter.emit("b3tr.transferred", transaction);

      this.logger.log(
        `B3TR tokens transferred: ${amount} from ${fromUserId} to ${toUserId}`
      );

      return transaction;
    } catch (error) {
      this.logger.error(
        `Failed to transfer B3TR tokens from ${fromUserId} to ${toUserId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Claim rewards on blockchain
   */
  async claimRewards(
    userId: string,
    rewardIds: string[]
  ): Promise<BlockchainTransaction[]> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      const userWallet = await this.userWalletRepository.findOne({
        where: { userId },
      });

      if (!user || !userWallet) {
        throw new Error("User or wallet not found");
      }

      const rewards = await this.rewardRepository.find({
        where: { id: In(rewardIds), userId },
      });

      if (rewards.length === 0) {
        throw new Error("No valid rewards found");
      }

      const totalAmount = rewards.reduce(
        (sum, reward) => sum + Number(reward.amount),
        0
      );

      // Claim rewards on smart contract
      const claimResult = await this.smartContractService.claimRewards(
        userWallet.walletAddress,
        rewardIds,
        totalAmount
      );

      // Create transaction records
      const transactions: BlockchainTransaction[] = rewards.map((reward) => ({
        hash: claimResult.hash,
        from: this.configService.get("CARBON_CREDIT_CONTRACT_ADDRESS"),
        to: userWallet.walletAddress,
        value: reward.amount.toString(),
        gasUsed: claimResult.gasUsed,
        gasPrice: claimResult.gasPrice,
        timestamp: new Date(),
        status: "confirmed",
        blockNumber: claimResult.blockNumber,
        confirmations: claimResult.confirmations,
        type: "reward_claim",
        metadata: {
          rewardId: reward.id,
          rewardType: reward.type,
          carbonSaved: reward.carbonSaved,
        },
      }));

      // Update reward status
      await this.rewardRepository.update(
        { id: In(rewardIds) },
        { blockchainStatus: "claimed" as any, confirmedAt: new Date() }
      );

      // Emit events
      transactions.forEach((transaction) => {
        this.eventEmitter.emit("reward.claimed", transaction);
      });

      this.logger.log(
        `Rewards claimed for user ${userId}: ${totalAmount} B3TR`
      );

      return transactions;
    } catch (error) {
      this.logger.error(`Failed to claim rewards for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get real-time transaction monitoring
   */
  async getTransactionMonitoring(userId?: string): Promise<{
    pendingTransactions: BlockchainTransaction[];
    recentTransactions: BlockchainTransaction[];
    networkStats: {
      totalTransactions: number;
      averageGasPrice: number;
      networkLoad: number;
      blockTime: number;
    };
  }> {
    try {
      const pendingTransactions = await this.getPendingTransactions(userId);
      const recentTransactions = await this.getRecentTransactions(userId);
      const networkStats = await this.getNetworkStats();

      return {
        pendingTransactions,
        recentTransactions,
        networkStats,
      };
    } catch (error) {
      this.logger.error("Failed to get transaction monitoring", error);
      throw error;
    }
  }

  /**
   * Get carbon credit marketplace data
   */
  async getCarbonCreditMarketplace(): Promise<CarbonCreditMarketplace> {
    try {
      const totalSupply = await this.carbonCreditService.getTotalSupply();
      const circulatingSupply =
        await this.carbonCreditService.getCirculatingSupply();
      const currentPrice = await this.carbonCreditService.getCurrentPrice();
      const priceChange24h = await this.carbonCreditService.getPriceChange24h();
      const volume24h = await this.carbonCreditService.getVolume24h();
      const marketCap = circulatingSupply * currentPrice;
      const recentTransactions = await this.getRecentCarbonCreditTransactions();
      const topHolders = await this.carbonCreditService.getTopHolders();

      return {
        totalSupply,
        circulatingSupply,
        currentPrice,
        priceChange24h,
        volume24h,
        marketCap,
        recentTransactions,
        topHolders,
      };
    } catch (error) {
      this.logger.error("Failed to get carbon credit marketplace data", error);
      throw error;
    }
  }

  /**
   * Get wallet analytics
   */
  async getWalletAnalytics(userId: string): Promise<WalletAnalytics> {
    try {
      const _user = await this.userRepository.findOne({
        where: { id: userId },
      });
      const userWallet = await this.userWalletRepository.findOne({
        where: { userId },
      });

      if (!_user || !userWallet) {
        throw new Error("User or wallet not found");
      }

      const totalBalance = await this.vechainService.getBalance(
        userWallet.walletAddress
      );
      const carbonCredits = await this.carbonCreditService.getUserCarbonCredits(
        userWallet.walletAddress
      );
      const b3trTokens = await this.vechainService.getB3TRBalance(
        userWallet.walletAddress
      );
      const transactionHistory = await this.getUserTransactionHistory(
        userWallet.walletAddress
      );
      const portfolioValue = await this.calculatePortfolioValue(
        userWallet.walletAddress
      );
      const portfolioChange24h = await this.calculatePortfolioChange24h(
        userWallet.walletAddress
      );
      const stakingRewards = await this.getStakingRewards(
        userWallet.walletAddress
      );
      const governanceVotes = await this.getGovernanceVotes(
        userWallet.walletAddress
      );

      return {
        userId,
        walletAddress: userWallet.walletAddress,
        totalBalance,
        carbonCredits,
        b3trTokens,
        transactionHistory,
        portfolioValue,
        portfolioChange24h,
        stakingRewards,
        governanceVotes,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get wallet analytics for user ${userId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Subscribe to smart contract events
   */
  async subscribeToSmartContractEvents(
    contractAddress: string,
    eventName: string
  ): Promise<void> {
    try {
      await this.smartContractService.subscribeToEvent(
        contractAddress,
        eventName,
        (event) => {
          const smartContractEvent: SmartContractEvent = {
            contractAddress,
            eventName,
            eventData: event,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp: new Date(),
            userId: event.userId,
          };

          this.eventEmitter.emit("smart.contract.event", smartContractEvent);
          this.logger.log(
            `Smart contract event received: ${eventName} from ${contractAddress}`
          );
        }
      );
    } catch (error) {
      this.logger.error(
        `Failed to subscribe to smart contract events for ${contractAddress}`,
        error
      );
      throw error;
    }
  }

  /**
   * Get blockchain network health
   */
  async getNetworkHealth(): Promise<{
    status: "healthy" | "degraded" | "down";
    blockHeight: number;
    lastBlockTime: Date;
    averageBlockTime: number;
    activeValidators: number;
    totalStaked: number;
    networkLoad: number;
    gasPrice: {
      slow: number;
      standard: number;
      fast: number;
    };
  }> {
    try {
      const blockHeight = await this.vechainService.getBlockHeight();
      const lastBlockTime = await this.vechainService.getLastBlockTime();
      const averageBlockTime = await this.vechainService.getAverageBlockTime();
      const activeValidators = await this.vechainService.getActiveValidators();
      const totalStaked = await this.vechainService.getTotalStaked();
      const networkLoad = await this.vechainService.getNetworkLoad();
      const gasPrice = await this.vechainService.getGasPrice();

      // Determine network status
      let status: "healthy" | "degraded" | "down" = "healthy";
      if (averageBlockTime > 10) status = "degraded";
      if (networkLoad > 90) status = "degraded";
      if (blockHeight === 0) status = "down";

      return {
        status,
        blockHeight,
        lastBlockTime,
        averageBlockTime,
        activeValidators,
        totalStaked,
        networkLoad,
        gasPrice,
      };
    } catch (error) {
      this.logger.error("Failed to get network health", error);
      throw error;
    }
  }

  // Private helper methods
  private async updateUserBalances(
    fromUserId: string,
    toUserId: string,
    amount: number
  ): Promise<void> {
    await this.userRepository.update(
      { id: fromUserId },
      { b3trBalance: () => `b3tr_balance - ${amount}` }
    );
    await this.userRepository.update(
      { id: toUserId },
      { b3trBalance: () => `b3tr_balance + ${amount}` }
    );
  }

  private async getPendingTransactions(
    userId?: string
  ): Promise<BlockchainTransaction[]> {
    // Implementation would query pending transactions from blockchain
    return [];
  }

  private async getRecentTransactions(
    userId?: string
  ): Promise<BlockchainTransaction[]> {
    // Implementation would query recent transactions from blockchain
    return [];
  }

  private async getNetworkStats(): Promise<any> {
    // Implementation would get network statistics
    return {
      totalTransactions: 0,
      averageGasPrice: 0,
      networkLoad: 0,
      blockTime: 0,
    };
  }

  private async getRecentCarbonCreditTransactions(): Promise<
    BlockchainTransaction[]
  > {
    // Implementation would query carbon credit transactions
    return [];
  }

  private async getUserTransactionHistory(
    walletAddress: string
  ): Promise<BlockchainTransaction[]> {
    // Implementation would query user's transaction history
    return [];
  }

  private async calculatePortfolioValue(
    walletAddress: string
  ): Promise<number> {
    // Implementation would calculate portfolio value
    return 0;
  }

  private async calculatePortfolioChange24h(
    walletAddress: string
  ): Promise<number> {
    // Implementation would calculate 24h portfolio change
    return 0;
  }

  private async getStakingRewards(_walletAddress: string): Promise<number> {
    // Implementation would get staking rewards
    return 0;
  }

  private async getGovernanceVotes(_walletAddress: string): Promise<number> {
    // Implementation would get governance votes
    return 0;
  }
}
