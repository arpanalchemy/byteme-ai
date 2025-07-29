import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Sse,
  MessageEvent,
} from "@nestjs/common";
import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { BlockchainService } from "../services/blockchain.service";
import { VeChainService } from "../../../common/blockchain/vechain.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { User } from "../../users/entity/user.entity";
import { Observable, interval } from "rxjs";
import { map } from "rxjs/operators";

@ApiTags("Blockchain & Web3")
@Controller("blockchain")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BlockchainController {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly vechainService: VeChainService
  ) {}

  @Post("tokenize-carbon/:userId")
  @ApiParam({
    name: "userId",
    description: "User ID to tokenize carbon savings for",
  })
  @ApiResponse({
    status: 200,
    description: "Carbon savings tokenized successfully",
    schema: {
      type: "object",
      properties: {
        tokenId: { type: "string", example: "0x1234567890abcdef" },
        userId: { type: "string" },
        amount: { type: "number", example: 25.5 },
        carbonSaved: { type: "number", example: 25.5 },
        timestamp: { type: "string", format: "date-time" },
        transactionHash: { type: "string", example: "0xabcdef1234567890" },
        status: {
          type: "string",
          enum: ["pending", "minted", "verified", "traded"],
        },
        metadata: { type: "object" },
      },
    },
  })
  async tokenizeCarbonSavings(
    @Param("userId") userId: string,
    @Body() data: { carbonAmount: number; metadata: any }
  ) {
    return this.blockchainService.tokenizeCarbonSavings(
      userId,
      data.carbonAmount,
      data.metadata
    );
  }

  @Post("transfer-b3tr")
  @ApiResponse({
    status: 200,
    description: "B3TR tokens transferred successfully",
    schema: {
      type: "object",
      properties: {
        hash: { type: "string", example: "0xabcdef1234567890" },
        from: { type: "string", example: "0x1234567890abcdef" },
        to: { type: "string", example: "0xabcdef1234567890" },
        value: { type: "string", example: "100.5" },
        status: { type: "string", enum: ["pending", "confirmed", "failed"] },
        timestamp: { type: "string", format: "date-time" },
        type: { type: "string", example: "b3tr_transfer" },
      },
    },
  })
  async transferB3TRTokens(
    @Body()
    data: {
      fromUserId: string;
      toUserId: string;
      amount: number;
      metadata?: any;
    }
  ) {
    return this.blockchainService.transferB3TRTokens(
      data.fromUserId,
      data.toUserId,
      data.amount,
      data.metadata
    );
  }

  @Post("claim-rewards/:userId")
  @ApiParam({ name: "userId", description: "User ID to claim rewards for" })
  @ApiResponse({
    status: 200,
    description: "Rewards claimed successfully",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          hash: { type: "string" },
          from: { type: "string" },
          to: { type: "string" },
          value: { type: "string" },
          status: { type: "string" },
          type: { type: "string", example: "reward_claim" },
        },
      },
    },
  })
  async claimRewards(
    @Param("userId") userId: string,
    @Body() data: { rewardIds: string[] }
  ) {
    return this.blockchainService.claimRewards(userId, data.rewardIds);
  }

  @Get("transaction-monitoring")
  @ApiQuery({
    name: "userId",
    required: false,
    description: "Filter by user ID",
  })
  @ApiResponse({
    status: 200,
    description: "Transaction monitoring data retrieved successfully",
    schema: {
      type: "object",
      properties: {
        pendingTransactions: {
          type: "array",
          items: { type: "object" },
        },
        recentTransactions: {
          type: "array",
          items: { type: "object" },
        },
        networkStats: {
          type: "object",
          properties: {
            totalTransactions: { type: "number" },
            averageGasPrice: { type: "number" },
            networkLoad: { type: "number" },
            blockTime: { type: "number" },
          },
        },
      },
    },
  })
  async getTransactionMonitoring(@Query("userId") userId?: string) {
    return this.blockchainService.getTransactionMonitoring(userId);
  }

  @Get("carbon-credit-marketplace")
  @ApiResponse({
    status: 200,
    description: "Carbon credit marketplace data retrieved successfully",
    schema: {
      type: "object",
      properties: {
        totalSupply: { type: "number", example: 1000000 },
        circulatingSupply: { type: "number", example: 750000 },
        currentPrice: { type: "number", example: 0.85 },
        priceChange24h: { type: "number", example: 5.2 },
        volume24h: { type: "number", example: 50000 },
        marketCap: { type: "number", example: 637500 },
        recentTransactions: {
          type: "array",
          items: { type: "object" },
        },
        topHolders: {
          type: "array",
          items: {
            type: "object",
            properties: {
              address: { type: "string" },
              balance: { type: "number" },
              percentage: { type: "number" },
            },
          },
        },
      },
    },
  })
  async getCarbonCreditMarketplace() {
    return this.blockchainService.getCarbonCreditMarketplace();
  }

  @Get("wallet-analytics/:userId")
  @ApiParam({ name: "userId", description: "User ID for wallet analytics" })
  @ApiResponse({
    status: 200,
    description: "Wallet analytics retrieved successfully",
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
        walletAddress: { type: "string" },
        totalBalance: { type: "number" },
        carbonCredits: { type: "number" },
        b3trTokens: { type: "number" },
        portfolioValue: { type: "number" },
        portfolioChange24h: { type: "number" },
        stakingRewards: { type: "number" },
        governanceVotes: { type: "number" },
      },
    },
  })
  async getWalletAnalytics(@Param("userId") userId: string) {
    return this.blockchainService.getWalletAnalytics(userId);
  }

  @Get("my-wallet-analytics")
  @ApiResponse({
    status: 200,
    description: "Current user wallet analytics retrieved successfully",
  })
  async getMyWalletAnalytics(@CurrentUser() user: User) {
    return this.blockchainService.getWalletAnalytics(user.id);
  }

  @Get("network-health")
  @ApiResponse({
    status: 200,
    description: "Blockchain network health retrieved successfully",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["healthy", "degraded", "down"] },
        blockHeight: { type: "number", example: 12345678 },
        lastBlockTime: { type: "string", format: "date-time" },
        averageBlockTime: { type: "number", example: 3.2 },
        activeValidators: { type: "number", example: 101 },
        totalStaked: { type: "number", example: 50000000 },
        networkLoad: { type: "number", example: 65.5 },
        gasPrice: {
          type: "object",
          properties: {
            slow: { type: "number", example: 1.2 },
            standard: { type: "number", example: 2.5 },
            fast: { type: "number", example: 4.8 },
          },
        },
      },
    },
  })
  async getNetworkHealth() {
    return this.blockchainService.getNetworkHealth();
  }

  @Post("subscribe-events/:contractAddress/:eventName")
  @ApiParam({ name: "contractAddress", description: "Smart contract address" })
  @ApiParam({ name: "eventName", description: "Event name to subscribe to" })
  @ApiResponse({
    status: 200,
    description: "Successfully subscribed to smart contract events",
  })
  async subscribeToSmartContractEvents(
    @Param("contractAddress") contractAddress: string,
    @Param("eventName") eventName: string
  ) {
    return this.blockchainService.subscribeToSmartContractEvents(
      contractAddress,
      eventName
    );
  }

  @Sse("live-transactions")
  @ApiResponse({
    status: 200,
    description: "Server-sent events stream for live transaction monitoring",
  })
  getLiveTransactions(): Observable<MessageEvent> {
    return interval(5000).pipe(
      map(() => ({
        data: {
          timestamp: new Date().toISOString(),
          message: "Live transaction monitoring active",
          // In a real implementation, this would emit actual transaction data
        },
      }))
    );
  }

  @Sse("live-marketplace")
  @ApiResponse({
    status: 200,
    description: "Server-sent events stream for live marketplace updates",
  })
  getLiveMarketplace(): Observable<MessageEvent> {
    return interval(10000).pipe(
      map(() => ({
        data: {
          timestamp: new Date().toISOString(),
          message: "Live marketplace monitoring active",
          // In a real implementation, this would emit actual marketplace data
        },
      }))
    );
  }

  @Get("carbon-credit-history/:userId")
  @ApiParam({
    name: "userId",
    description: "User ID for carbon credit history",
  })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 50 })
  @ApiQuery({ name: "offset", required: false, type: Number, example: 0 })
  @ApiResponse({
    status: 200,
    description: "Carbon credit history retrieved successfully",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tokenId: { type: "string" },
          amount: { type: "number" },
          carbonSaved: { type: "number" },
          timestamp: { type: "string", format: "date-time" },
          status: { type: "string" },
          transactionHash: { type: "string" },
        },
      },
    },
  })
  async getCarbonCreditHistory(
    @Param("userId") userId: string,
    @Query("limit") limit: number = 50,
    @Query("offset") offset: number = 0
  ) {
    // Implementation would query carbon credit history from blockchain
    return {
      userId,
      limit,
      offset,
      carbonCredits: [],
      total: 0,
    };
  }

  @Get("transaction-history/:userId")
  @ApiParam({ name: "userId", description: "User ID for transaction history" })
  @ApiQuery({
    name: "type",
    required: false,
    enum: ["all", "carbon_credit", "b3tr_transfer", "reward_claim", "nft_mint"],
  })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 50 })
  @ApiQuery({ name: "offset", required: false, type: Number, example: 0 })
  @ApiResponse({
    status: 200,
    description: "Transaction history retrieved successfully",
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
        transactions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              hash: { type: "string" },
              type: { type: "string" },
              value: { type: "string" },
              timestamp: { type: "string", format: "date-time" },
              status: { type: "string" },
            },
          },
        },
        total: { type: "number" },
        pagination: {
          type: "object",
          properties: {
            limit: { type: "number" },
            offset: { type: "number" },
            hasMore: { type: "boolean" },
          },
        },
      },
    },
  })
  async getTransactionHistory(
    @Param("userId") userId: string,
    @Query("type") type: string = "all",
    @Query("limit") limit: number = 50,
    @Query("offset") offset: number = 0
  ) {
    // Implementation would query transaction history from blockchain
    return {
      userId,
      type,
      transactions: [],
      total: 0,
      pagination: {
        limit,
        offset,
        hasMore: false,
      },
    };
  }

  @Get("portfolio-performance/:userId")
  @ApiParam({
    name: "userId",
    description: "User ID for portfolio performance",
  })
  @ApiQuery({
    name: "period",
    required: false,
    enum: ["1d", "7d", "30d", "90d", "1y"],
    example: "30d",
  })
  @ApiResponse({
    status: 200,
    description: "Portfolio performance retrieved successfully",
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
        period: { type: "string" },
        performance: {
          type: "object",
          properties: {
            totalValue: { type: "number" },
            change: { type: "number" },
            changePercentage: { type: "number" },
            carbonCreditsValue: { type: "number" },
            b3trTokensValue: { type: "number" },
            stakingRewards: { type: "number" },
          },
        },
        chartData: {
          type: "array",
          items: {
            type: "object",
            properties: {
              date: { type: "string" },
              value: { type: "number" },
            },
          },
        },
      },
    },
  })
  async getPortfolioPerformance(
    @Param("userId") userId: string,
    @Query("period") period: string = "30d"
  ) {
    // Implementation would calculate portfolio performance
    return {
      userId,
      period,
      performance: {
        totalValue: 0,
        change: 0,
        changePercentage: 0,
        carbonCreditsValue: 0,
        b3trTokensValue: 0,
        stakingRewards: 0,
      },
      chartData: [],
    };
  }

  @Get("transaction/:txid")
  @ApiParam({
    name: "txid",
    description: "Transaction ID to get details for",
    example:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  })
  @ApiResponse({
    status: 200,
    description: "Transaction details retrieved successfully",
    schema: {
      type: "object",
      properties: {
        txid: { type: "string" },
        blockNumber: { type: "number" },
        blockTime: { type: "string", format: "date-time" },
        from: { type: "string" },
        to: { type: "string" },
        value: { type: "string" },
        gasUsed: { type: "number" },
        gasPrice: { type: "string" },
        status: { type: "string", enum: ["success", "failed", "pending"] },
        confirmations: { type: "number" },
        receipt: {
          type: "object",
          properties: {
            contractAddress: { type: "string" },
            cumulativeGasUsed: { type: "number" },
            effectiveGasPrice: { type: "string" },
            logs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  address: { type: "string" },
                  topics: { type: "array", items: { type: "string" } },
                  data: { type: "string" },
                  logIndex: { type: "number" },
                  transactionIndex: { type: "number" },
                  blockNumber: { type: "number" },
                  blockHash: { type: "string" },
                  transactionHash: { type: "string" },
                  removed: { type: "boolean" },
                },
              },
            },
            logsBloom: { type: "string" },
            status: { type: "number" },
            transactionHash: { type: "string" },
            transactionIndex: { type: "number" },
            type: { type: "number" },
          },
        },
        input: { type: "string" },
        nonce: { type: "number" },
        hash: { type: "string" },
        r: { type: "string" },
        s: { type: "string" },
        v: { type: "number" },
        network: { type: "string" },
        timestamp: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Transaction not found",
  })
  async getTransactionDetails(@Param("txid") txid: string) {
    return this.vechainService.getTransactionDetails(txid);
  }
}
