import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { RewardService } from "../services/reward.service";
import {
  CreateRewardDto,
  UpdateRewardDto,
  RewardResponseDto,
  RewardQueryDto,
  RewardStatsDto,
} from "../dto/reward.dto";
import {
  RewardType,
  RewardStatus,
  BlockchainStatus,
} from "../entity/reward.entity";
import { User } from "../../users/entity/user.entity";

@ApiTags("Rewards")
@Controller("rewards")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Get()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "type", required: false, enum: RewardType })
  @ApiQuery({ name: "status", required: false, enum: RewardStatus })
  @ApiQuery({
    name: "blockchainStatus",
    required: false,
    enum: BlockchainStatus,
  })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "startDate", required: false, type: String })
  @ApiQuery({ name: "endDate", required: false, type: String })
  @ApiQuery({ name: "sortBy", required: false, type: String })
  @ApiQuery({ name: "sortOrder", required: false, enum: ["ASC", "DESC"] })
  @ApiResponse({
    status: 200,
    description: "Rewards retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getRewards(
    @CurrentUser() user: User,
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query("type") type?: RewardType,
    @Query("status") status?: RewardStatus,
    @Query("blockchainStatus") blockchainStatus?: BlockchainStatus,
    @Query("search") search?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "ASC" | "DESC"
  ) {
    const query: RewardQueryDto = {
      page,
      limit,
      type,
      status,
      blockchainStatus,
      search,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    };
    return this.rewardService.getUserRewards(user.id, query);
  }

  @Get("stats")
  @ApiResponse({
    status: 200,
    description: "Reward statistics retrieved successfully",
    type: RewardStatsDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getRewardStats(@CurrentUser() user: User): Promise<RewardStatsDto> {
    return this.rewardService.getUserRewardStats(user.id);
  }

  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "Reward retrieved successfully",
    type: RewardResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Reward not found" })
  async getRewardById(
    @CurrentUser() user: User,
    @Param("id") rewardId: string
  ): Promise<RewardResponseDto> {
    return this.rewardService.getRewardById(rewardId, user.id);
  }

  @Delete(":id/cancel")
  @ApiResponse({
    status: 200,
    description: "Reward cancelled successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Reward not found" })
  async cancelReward(
    @CurrentUser() user: User,
    @Param("id") rewardId: string
  ): Promise<void> {
    return this.rewardService.cancelReward(rewardId, user.id);
  }

  @Put(":id/retry")
  @ApiResponse({
    status: 200,
    description: "Reward queued for retry successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Reward not found" })
  async retryReward(
    @CurrentUser() user: User,
    @Param("id") rewardId: string
  ): Promise<void> {
    return this.rewardService.retryFailedReward(rewardId);
  }
}

@ApiTags("Admin Rewards")
@Controller("admin/rewards")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminRewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: "Reward created successfully",
    type: RewardResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async createReward(
    @Body() createDto: CreateRewardDto
  ): Promise<RewardResponseDto> {
    return this.rewardService.createReward(createDto);
  }

  @Get()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "type", required: false, enum: RewardType })
  @ApiQuery({ name: "status", required: false, enum: RewardStatus })
  @ApiQuery({
    name: "blockchainStatus",
    required: false,
    enum: BlockchainStatus,
  })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "startDate", required: false, type: String })
  @ApiQuery({ name: "endDate", required: false, type: String })
  @ApiQuery({ name: "sortBy", required: false, type: String })
  @ApiQuery({ name: "sortOrder", required: false, enum: ["ASC", "DESC"] })
  @ApiResponse({
    status: 200,
    description: "Rewards retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getRewards(
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query("type") type?: RewardType,
    @Query("status") status?: RewardStatus,
    @Query("blockchainStatus") blockchainStatus?: BlockchainStatus,
    @Query("search") search?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "ASC" | "DESC"
  ) {
    const query: RewardQueryDto = {
      page,
      limit,
      type,
      status,
      blockchainStatus,
      search,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    };
    return this.rewardService.getRewards(query);
  }

  @Get("stats")
  @ApiResponse({
    status: 200,
    description: "Reward statistics retrieved successfully",
    type: RewardStatsDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getRewardStats(): Promise<RewardStatsDto> {
    return this.rewardService.getRewardStats();
  }

  @Get("process/pending-rewards")
  @ApiResponse({
    status: 200,
    description: "Pending rewards processed successfully",
    type: RewardStatsDto,
  })
  async processPendingRewards(): Promise<void> {
    return this.rewardService.processPendingRewards();
  }

  @Get("verify/blockchain-transactions")
  @ApiResponse({
    status: 200,
    description: "Blockchain transactions verified successfully",
    type: RewardStatsDto,
  })
  async checkBlockchainTransactions(): Promise<void> {
    return this.rewardService.checkBlockchainTransactions();
  }

  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "Reward retrieved successfully",
    type: RewardResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Reward not found" })
  async getRewardById(
    @Param("id") rewardId: string
  ): Promise<RewardResponseDto> {
    return this.rewardService.getRewardById(rewardId);
  }

  @Put(":id")
  @ApiResponse({
    status: 200,
    description: "Reward updated successfully",
    type: RewardResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Reward not found" })
  async updateReward(
    @Param("id") rewardId: string,
    @Body() updateDto: UpdateRewardDto
  ): Promise<RewardResponseDto> {
    return this.rewardService.updateReward(rewardId, updateDto);
  }

  @Delete(":id/cancel")
  @ApiResponse({
    status: 200,
    description: "Reward cancelled successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Reward not found" })
  async cancelReward(@Param("id") rewardId: string): Promise<void> {
    return this.rewardService.cancelReward(rewardId);
  }

  @Put(":id/retry")
  @ApiResponse({
    status: 200,
    description: "Reward queued for retry successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Reward not found" })
  async retryReward(@Param("id") rewardId: string): Promise<void> {
    return this.rewardService.retryFailedReward(rewardId);
  }

  @Post(":id/update-transaction-details")
  @ApiResponse({
    status: 200,
    description: "Transaction details updated successfully",
    type: RewardResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Reward not found" })
  @ApiResponse({ status: 400, description: "Reward has no transaction hash" })
  async updateTransactionDetails(
    @Param("id") rewardId: string
  ): Promise<RewardResponseDto> {
    return this.rewardService.updateTransactionDetails(rewardId);
  }

  @Post("update-all-transaction-details")
  @ApiResponse({
    status: 200,
    description: "All transaction details updated successfully",
    schema: {
      type: "object",
      properties: {
        updated: { type: "number" },
        failed: { type: "number" },
        errors: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async updateAllTransactionDetails(): Promise<{
    updated: number;
    failed: number;
    errors: string[];
  }> {
    return this.rewardService.updateAllTransactionDetails();
  }
}
