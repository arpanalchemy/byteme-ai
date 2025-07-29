import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { LeaderboardService } from "../services/leaderboard.service";
import { LeaderboardResponseDto } from "../dto/leaderboard.dto";
import { LeaderboardPeriod } from "../entity/leaderboard.entity";
import { User } from "../../users/entity/user.entity";

@ApiTags("Leaderboard")
@Controller("leaderboard")
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiQuery({
    name: "period",
    required: false,
    enum: LeaderboardPeriod,
    example: LeaderboardPeriod.WEEKLY,
  })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({
    name: "sortBy",
    required: false,
    enum: ["mileage", "carbon", "rewards", "points"],
    example: "mileage",
  })
  @ApiResponse({
    status: 200,
    description: "Leaderboard retrieved successfully",
    type: LeaderboardResponseDto,
  })
  async getLeaderboard(
    @Query("period") period?: LeaderboardPeriod,
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query("sortBy")
    sortBy: "mileage" | "carbon" | "rewards" | "points" = "mileage",
  ): Promise<LeaderboardResponseDto> {
    return this.leaderboardService.getLeaderboard(
      period,
      page,
      limit,
      undefined,
      sortBy,
    );
  }

  @Get("authenticated")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({
    name: "period",
    required: false,
    enum: LeaderboardPeriod,
    example: LeaderboardPeriod.WEEKLY,
  })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({
    name: "sortBy",
    required: false,
    enum: ["mileage", "carbon", "rewards", "points"],
    example: "mileage",
  })
  @ApiResponse({
    status: 200,
    description: "Leaderboard with user rank retrieved successfully",
    type: LeaderboardResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getLeaderboardWithUserRank(
    @CurrentUser() user: User,
    @Query("period") period?: LeaderboardPeriod,
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query("sortBy")
    sortBy: "mileage" | "carbon" | "rewards" | "points" = "mileage",
  ): Promise<LeaderboardResponseDto> {
    return this.leaderboardService.getLeaderboard(
      period,
      page,
      limit,
      user.id,
      sortBy,
    );
  }

  @Get("stats")
  @ApiResponse({
    status: 200,
    description: "Leaderboard statistics retrieved successfully",
  })
  async getLeaderboardStats() {
    return this.leaderboardService.getLeaderboardStats();
  }
}
