import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiOperation,
} from "@nestjs/swagger";
import { VeChainService } from "../../../common/blockchain/vechain.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ChallengeService } from "../../challenges/services/challenge.service";
import {
  CycleInfoResponseDto,
  UserDataResponseDto,
  GlobalStatsResponseDto,
  DistributeRewardsDto,
  DistributeRewardsResponseDto,
  SetRewardForCycleDto,
  SetRewardForActiveChallengeResponseDto,
  TransactionReceiptResponseDto,
  NetworkHealthResponseDto,
  ServiceStatusResponseDto,
} from "../dto/vechain.dto";

@ApiTags("VeChain Blockchain Operations")
@Controller("vechain")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VeChainController {
  constructor(
    private readonly veChainService: VeChainService,
    private readonly challengeService: ChallengeService,
  ) {}

  @Get("status")
  @ApiOperation({ summary: "Get VeChain service status and configuration" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "VeChain service status retrieved successfully",
    type: ServiceStatusResponseDto,
  })
  async getServiceStatus(): Promise<ServiceStatusResponseDto> {
    return {
      isInitialized: this.veChainService.isInitialized(),
      adminAddress: this.veChainService.getAdminAddress(),
      contractAddress: this.veChainService.getContractAddress(),
      network: this.veChainService["network"] || "unknown",
      nodeUrl: this.veChainService["nodeUrl"] || "unknown",
    };
  }

  @Get("cycle/current")
  @ApiOperation({ summary: "Get current cycle number from EVDriveV2 contract" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Current cycle retrieved successfully",
    schema: {
      type: "object",
      properties: {
        currentCycle: { type: "number", example: 5 },
      },
    },
  })
  async getCurrentCycle(): Promise<{ currentCycle: number }> {
    const currentCycle = await this.veChainService.getCurrentCycle();
    return { currentCycle };
  }

  @Get("cycle/:cycleId")
  @ApiOperation({ summary: "Get cycle information from EVDriveV2 contract" })
  @ApiParam({ name: "cycleId", description: "Cycle ID to get information for" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Cycle information retrieved successfully",
    type: CycleInfoResponseDto,
  })
  async getCycleInfo(
    @Param("cycleId") cycleId: string,
  ): Promise<CycleInfoResponseDto> {
    return await this.veChainService.getCycleInfo(parseInt(cycleId));
  }

  @Get("funds/available")
  @ApiOperation({ summary: "Get available funds in rewards pool" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Available funds retrieved successfully",
    schema: {
      type: "object",
      properties: {
        availableFunds: { type: "number", example: 1000000 },
      },
    },
  })
  async getAvailableFunds(): Promise<{ availableFunds: number }> {
    const availableFunds = await this.veChainService.getAvailableFunds();
    return { availableFunds };
  }

  @Get("user/:address")
  @ApiOperation({ summary: "Get user data from EVDriveV2 contract" })
  @ApiParam({ name: "address", description: "User wallet address" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User data retrieved successfully",
    type: UserDataResponseDto,
  })
  async getUserData(
    @Param("address") address: string,
  ): Promise<UserDataResponseDto> {
    return await this.veChainService.getUserData(address);
  }

  @Get("stats/global")
  @ApiOperation({ summary: "Get global statistics from EVDriveV2 contract" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Global stats retrieved successfully",
    type: GlobalStatsResponseDto,
  })
  async getGlobalStats(): Promise<GlobalStatsResponseDto> {
    return await this.veChainService.getGlobalStats();
  }

  @Post("cycle/reward")
  @ApiOperation({ summary: "Set reward amount for current cycle" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Reward for cycle set successfully",
    schema: {
      type: "object",
      properties: {
        txid: { type: "string", example: "0x1234567890abcdef" },
        message: { type: "string" },
      },
    },
  })
  async setRewardForCycle(
    @Body() data: SetRewardForCycleDto,
  ): Promise<{ txid: string; message: string }> {
    const txid = await this.veChainService.setRewardForCycle(data.rewardAmount);
    return {
      txid,
      message: `Reward amount ${data.rewardAmount} set for cycle successfully`,
    };
  }

  @Post("cycle/reward/active-challenge")
  @ApiOperation({
    summary: "Set reward amount for current cycle based on active challenge",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Reward for active challenge set successfully",
    type: SetRewardForActiveChallengeResponseDto,
  })
  async setRewardForActiveChallenge(): Promise<SetRewardForActiveChallengeResponseDto> {
    return await this.veChainService.setRewardForActiveChallenge(
      this.challengeService,
    );
  }

  @Post("rewards/distribute")
  @ApiOperation({
    summary:
      "Distribute rewards in batch to multiple users (max 100 per batch)",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Rewards distributed successfully",
    type: DistributeRewardsResponseDto,
  })
  async distributeRewards(
    @Body() data: DistributeRewardsDto,
  ): Promise<DistributeRewardsResponseDto> {
    const result = await this.veChainService.distributeRewards(data.batchData);
    return {
      txid: result.txid,
      totalDistributed: result.totalDistributed,
      batchCount: result.batchCount,
      totalUsers: result.totalUsers,
    };
  }

  @Get("transaction/:txid/receipt")
  @ApiOperation({ summary: "Get transaction receipt" })
  @ApiParam({ name: "txid", description: "Transaction ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Transaction receipt retrieved successfully",
    type: TransactionReceiptResponseDto,
  })
  async getTransactionReceipt(
    @Param("txid") txid: string,
  ): Promise<TransactionReceiptResponseDto> {
    return await this.veChainService.getTransactionReceipt(txid);
  }

  @Get("transaction/:txid/confirmed")
  @ApiOperation({ summary: "Check if transaction is confirmed" })
  @ApiParam({ name: "txid", description: "Transaction ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Transaction confirmation status retrieved successfully",
    schema: {
      type: "object",
      properties: {
        txid: { type: "string" },
        confirmed: { type: "boolean" },
      },
    },
  })
  async isTransactionConfirmed(
    @Param("txid") txid: string,
  ): Promise<{ txid: string; confirmed: boolean }> {
    const confirmed = await this.veChainService.isTransactionConfirmed(txid);
    return { txid, confirmed };
  }

  @Get("balance/:address")
  @ApiOperation({ summary: "Get wallet balance" })
  @ApiParam({ name: "address", description: "Wallet address" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Wallet balance retrieved successfully",
    schema: {
      type: "object",
      properties: {
        address: { type: "string" },
        balance: { type: "number" },
      },
    },
  })
  async getBalance(
    @Param("address") address: string,
  ): Promise<{ address: string; balance: number }> {
    const balance = await this.veChainService.getBalance(address);
    return { address, balance };
  }

  @Get("balance/:address/b3tr")
  @ApiOperation({ summary: "Get B3TR token balance" })
  @ApiParam({ name: "address", description: "Wallet address" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "B3TR balance retrieved successfully",
    schema: {
      type: "object",
      properties: {
        address: { type: "string" },
        b3trBalance: { type: "number" },
      },
    },
  })
  async getB3TRBalance(
    @Param("address") address: string,
  ): Promise<{ address: string; b3trBalance: number }> {
    const b3trBalance = await this.veChainService.getB3TRBalance(address);
    return { address, b3trBalance };
  }

  @Get("network/health")
  @ApiOperation({ summary: "Get VeChain network health information" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Network health retrieved successfully",
    type: NetworkHealthResponseDto,
  })
  async getNetworkHealth(): Promise<NetworkHealthResponseDto> {
    const [
      blockHeight,
      lastBlockTime,
      averageBlockTime,
      activeValidators,
      totalStaked,
      networkLoad,
      gasPrice,
    ] = await Promise.all([
      this.veChainService.getBlockHeight(),
      this.veChainService.getLastBlockTime(),
      this.veChainService.getAverageBlockTime(),
      this.veChainService.getActiveValidators(),
      this.veChainService.getTotalStaked(),
      this.veChainService.getNetworkLoad(),
      this.veChainService.getGasPrice(),
    ]);

    return {
      status: "healthy", // This could be determined based on various metrics
      blockHeight,
      lastBlockTime,
      averageBlockTime,
      activeValidators,
      totalStaked,
      networkLoad,
      gasPrice,
    };
  }

  @Post("transfer")
  @ApiOperation({ summary: "Transfer tokens between addresses" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Tokens transferred successfully",
    schema: {
      type: "object",
      properties: {
        txid: { type: "string" },
        success: { type: "boolean" },
        from: { type: "string" },
        to: { type: "string" },
        amount: { type: "number" },
      },
    },
  })
  async transferTokens(
    @Body() data: { fromAddress: string; toAddress: string; amount: number },
  ): Promise<{
    txid: string;
    success: boolean;
    from: string;
    to: string;
    amount: number;
  }> {
    const result = await this.veChainService.transferTokens(
      data.fromAddress,
      data.toAddress,
      data.amount,
    );
    return {
      txid: result.txid,
      success: result.success,
      from: data.fromAddress,
      to: data.toAddress,
      amount: data.amount,
    };
  }

  @Get("network/stats")
  @ApiOperation({ summary: "Get comprehensive network statistics" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Network statistics retrieved successfully",
    schema: {
      type: "object",
      properties: {
        blockHeight: { type: "number" },
        lastBlockTime: { type: "string", format: "date-time" },
        averageBlockTime: { type: "number" },
        activeValidators: { type: "number" },
        totalStaked: { type: "number" },
        networkLoad: { type: "number" },
        gasPrice: {
          type: "object",
          properties: {
            slow: { type: "number" },
            standard: { type: "number" },
            fast: { type: "number" },
          },
        },
      },
    },
  })
  async getNetworkStats(): Promise<{
    blockHeight: number;
    lastBlockTime: Date;
    averageBlockTime: number;
    activeValidators: number;
    totalStaked: number;
    networkLoad: number;
    gasPrice: { slow: number; standard: number; fast: number };
  }> {
    const [
      blockHeight,
      lastBlockTime,
      averageBlockTime,
      activeValidators,
      totalStaked,
      networkLoad,
      gasPrice,
    ] = await Promise.all([
      this.veChainService.getBlockHeight(),
      this.veChainService.getLastBlockTime(),
      this.veChainService.getAverageBlockTime(),
      this.veChainService.getActiveValidators(),
      this.veChainService.getTotalStaked(),
      this.veChainService.getNetworkLoad(),
      this.veChainService.getGasPrice(),
    ]);

    return {
      blockHeight,
      lastBlockTime,
      averageBlockTime,
      activeValidators,
      totalStaked,
      networkLoad,
      gasPrice,
    };
  }
}
