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
import { BadgeService } from "../services/badge.service";
import {
  CreateBadgeDto,
  UpdateBadgeDto,
  BadgeResponseDto,
  UserBadgeResponseDto,
} from "../dto/badge.dto";
import { BadgeType, BadgeStatus } from "../entity/badge.entity";
import { User } from "../../users/entity/user.entity";

@ApiTags("Badges")
@Controller("badges")
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  @Get()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "type", required: false, enum: BadgeType })
  @ApiQuery({ name: "status", required: false, enum: BadgeStatus })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: "Badges retrieved successfully",
  })
  async getBadges(
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query("type") type?: BadgeType,
    @Query("status") status?: BadgeStatus,
    @Query("search") search?: string,
  ) {
    return this.badgeService.getBadges(page, limit, type, status, search);
  }

  @Get("available")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Available badges for user retrieved successfully",
    type: [BadgeResponseDto],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAvailableBadges(
    @CurrentUser() user: User,
  ): Promise<BadgeResponseDto[]> {
    return this.badgeService.getAvailableBadges(user.id);
  }

  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "Badge retrieved successfully",
    type: BadgeResponseDto,
  })
  @ApiResponse({ status: 404, description: "Badge not found" })
  async getBadgeById(@Param("id") badgeId: string): Promise<BadgeResponseDto> {
    return this.badgeService.getBadgeById(badgeId);
  }

  @Post("check-awards")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Badge awards checked successfully",
    type: [UserBadgeResponseDto],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async checkAndAwardBadges(
    @CurrentUser() user: User,
  ): Promise<UserBadgeResponseDto[]> {
    return this.badgeService.checkAndAwardBadges(user.id);
  }
}

@ApiTags("User Badges")
@Controller("user/badges")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserBadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  @Get()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: "User badges retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getUserBadges(
    @CurrentUser() user: User,
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.badgeService.getUserBadges(user.id, page, limit);
  }

  @Put(":userBadgeId/claim-rewards")
  @ApiResponse({
    status: 200,
    description: "Badge rewards claimed successfully",
    type: UserBadgeResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "User badge not found" })
  @ApiResponse({ status: 409, description: "Rewards already claimed" })
  async claimBadgeRewards(
    @CurrentUser() user: User,
    @Param("userBadgeId") userBadgeId: string,
  ): Promise<UserBadgeResponseDto> {
    return this.badgeService.claimBadgeRewards(user.id, userBadgeId);
  }
}

@ApiTags("Admin Badges")
@Controller("admin/badges")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminBadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: "Badge created successfully",
    type: BadgeResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async createBadge(
    @CurrentUser() admin: User,
    @Body() createDto: CreateBadgeDto,
  ): Promise<BadgeResponseDto> {
    return this.badgeService.createBadge(createDto, admin.id);
  }

  @Get()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "type", required: false, enum: BadgeType })
  @ApiQuery({ name: "status", required: false, enum: BadgeStatus })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: "Badges retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getBadges(
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query("type") type?: BadgeType,
    @Query("status") status?: BadgeStatus,
    @Query("search") search?: string,
  ) {
    return this.badgeService.getBadges(page, limit, type, status, search);
  }

  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "Badge retrieved successfully",
    type: BadgeResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Badge not found" })
  async getBadgeById(@Param("id") badgeId: string): Promise<BadgeResponseDto> {
    return this.badgeService.getBadgeById(badgeId);
  }

  @Put(":id")
  @ApiResponse({
    status: 200,
    description: "Badge updated successfully",
    type: BadgeResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Badge not found" })
  @ApiResponse({
    status: 400,
    description: "Cannot edit badge that has been earned",
  })
  async updateBadge(
    @Param("id") badgeId: string,
    @Body() updateDto: UpdateBadgeDto,
  ): Promise<BadgeResponseDto> {
    return this.badgeService.updateBadge(badgeId, updateDto);
  }

  @Put(":id/publish")
  @ApiResponse({
    status: 200,
    description: "Badge published successfully",
    type: BadgeResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Badge not found" })
  async publishBadge(@Param("id") badgeId: string): Promise<BadgeResponseDto> {
    return this.badgeService.publishBadge(badgeId);
  }

  @Delete(":id")
  @ApiResponse({
    status: 200,
    description: "Badge deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Badge not found" })
  @ApiResponse({
    status: 400,
    description: "Cannot delete badge that has been earned",
  })
  async deleteBadge(@Param("id") badgeId: string): Promise<void> {
    return this.badgeService.deleteBadge(badgeId);
  }
}
