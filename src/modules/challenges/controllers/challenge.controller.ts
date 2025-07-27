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
import { ChallengeService } from "../services/challenge.service";
import {
  CreateChallengeDto,
  UpdateChallengeDto,
  ChallengeResponseDto,
  UserChallengeResponseDto,
} from "../dto/challenge.dto";
import {
  ChallengeType,
  ChallengeStatus,
  ChallengeVisibility,
} from "../entity/challenge.entity";
import { User } from "../../users/entity/user.entity";

@ApiTags("Challenges")
@Controller("challenges")
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Get()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "type", required: false, enum: ChallengeType })
  @ApiQuery({ name: "status", required: false, enum: ChallengeStatus })
  @ApiQuery({ name: "visibility", required: false, enum: ChallengeVisibility })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: "Challenges retrieved successfully",
  })
  async getChallenges(
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query("type") type?: ChallengeType,
    @Query("status") status?: ChallengeStatus,
    @Query("visibility") visibility?: ChallengeVisibility,
    @Query("search") search?: string,
  ) {
    return this.challengeService.getChallenges(
      page,
      limit,
      type,
      status,
      visibility,
      search,
    );
  }

  @Get("available")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Available challenges for user retrieved successfully",
    type: [ChallengeResponseDto],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAvailableChallenges(
    @CurrentUser() user: User,
  ): Promise<ChallengeResponseDto[]> {
    return this.challengeService.getAvailableChallenges(user.id);
  }

  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "Challenge retrieved successfully",
    type: ChallengeResponseDto,
  })
  @ApiResponse({ status: 404, description: "Challenge not found" })
  async getChallengeById(
    @Param("id") challengeId: string,
  ): Promise<ChallengeResponseDto> {
    return this.challengeService.getChallengeById(challengeId);
  }

  @Post(":id/join")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: "Successfully joined challenge",
    type: UserChallengeResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Challenge not found" })
  @ApiResponse({ status: 409, description: "Already joined challenge" })
  async joinChallenge(
    @CurrentUser() user: User,
    @Param("id") challengeId: string,
  ): Promise<UserChallengeResponseDto> {
    return this.challengeService.joinChallenge(user.id, challengeId);
  }

  @Put(":id/progress")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Challenge progress updated successfully",
    type: UserChallengeResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "User challenge not found" })
  async updateChallengeProgress(
    @CurrentUser() user: User,
    @Param("id") challengeId: string,
  ): Promise<UserChallengeResponseDto> {
    return this.challengeService.updateChallengeProgress(user.id, challengeId);
  }
}

@ApiTags("User Challenges")
@Controller("user/challenges")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Get()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: "User challenges retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getUserChallenges(
    @CurrentUser() user: User,
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.challengeService.getUserChallenges(user.id, page, limit);
  }

  @Put(":userChallengeId/claim-rewards")
  @ApiResponse({
    status: 200,
    description: "Challenge rewards claimed successfully",
    type: UserChallengeResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "User challenge not found" })
  @ApiResponse({ status: 409, description: "Rewards already claimed" })
  async claimChallengeRewards(
    @CurrentUser() user: User,
    @Param("userChallengeId") userChallengeId: string,
  ): Promise<UserChallengeResponseDto> {
    return this.challengeService.claimChallengeRewards(
      user.id,
      userChallengeId,
    );
  }
}

@ApiTags("Admin Challenges")
@Controller("admin/challenges")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: "Challenge created successfully",
    type: ChallengeResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async createChallenge(
    @CurrentUser() admin: User,
    @Body() createDto: CreateChallengeDto,
  ): Promise<ChallengeResponseDto> {
    return this.challengeService.createChallenge(createDto, admin.id);
  }

  @Get()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "type", required: false, enum: ChallengeType })
  @ApiQuery({ name: "status", required: false, enum: ChallengeStatus })
  @ApiQuery({ name: "visibility", required: false, enum: ChallengeVisibility })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: "Challenges retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getChallenges(
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query("type") type?: ChallengeType,
    @Query("status") status?: ChallengeStatus,
    @Query("visibility") visibility?: ChallengeVisibility,
    @Query("search") search?: string,
  ) {
    return this.challengeService.getChallenges(
      page,
      limit,
      type,
      status,
      visibility,
      search,
    );
  }

  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "Challenge retrieved successfully",
    type: ChallengeResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Challenge not found" })
  async getChallengeById(
    @Param("id") challengeId: string,
  ): Promise<ChallengeResponseDto> {
    return this.challengeService.getChallengeById(challengeId);
  }

  @Put(":id")
  @ApiResponse({
    status: 200,
    description: "Challenge updated successfully",
    type: ChallengeResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Challenge not found" })
  @ApiResponse({
    status: 400,
    description: "Cannot edit challenge that has participants",
  })
  async updateChallenge(
    @Param("id") challengeId: string,
    @Body() updateDto: UpdateChallengeDto,
  ): Promise<ChallengeResponseDto> {
    return this.challengeService.updateChallenge(challengeId, updateDto);
  }

  @Put(":id/publish")
  @ApiResponse({
    status: 200,
    description: "Challenge published successfully",
    type: ChallengeResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Challenge not found" })
  async publishChallenge(
    @Param("id") challengeId: string,
  ): Promise<ChallengeResponseDto> {
    return this.challengeService.publishChallenge(challengeId);
  }

  @Delete(":id")
  @ApiResponse({
    status: 200,
    description: "Challenge deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Challenge not found" })
  @ApiResponse({
    status: 400,
    description: "Cannot delete challenge that has participants",
  })
  async deleteChallenge(@Param("id") challengeId: string): Promise<void> {
    return this.challengeService.deleteChallenge(challengeId);
  }
}
