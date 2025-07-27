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
import { HistoryService } from "../services/history.service";
import {
  CreateHistoryDto,
  UpdateHistoryDto,
  HistoryResponseDto,
  HistoryQueryDto,
  HistoryStatsDto,
} from "../dto/history.dto";
import { HistoryType, HistoryCategory } from "../entity/history.entity";
import { User } from "../../users/entity/user.entity";

@ApiTags("History")
@Controller("history")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "type", required: false, enum: HistoryType })
  @ApiQuery({ name: "category", required: false, enum: HistoryCategory })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "startDate", required: false, type: String })
  @ApiQuery({ name: "endDate", required: false, type: String })
  @ApiQuery({ name: "sortBy", required: false, type: String })
  @ApiQuery({ name: "sortOrder", required: false, enum: ["ASC", "DESC"] })
  @ApiResponse({
    status: 200,
    description: "History retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getHistory(
    @CurrentUser() user: User,
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query("type") type?: HistoryType,
    @Query("category") category?: HistoryCategory,
    @Query("search") search?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "ASC" | "DESC",
  ) {
    const query: HistoryQueryDto = {
      page,
      limit,
      type,
      category,
      search,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    };
    return this.historyService.getUserHistory(user.id, query);
  }

  @Get("stats")
  @ApiResponse({
    status: 200,
    description: "History statistics retrieved successfully",
    type: HistoryStatsDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getHistoryStats(@CurrentUser() user: User): Promise<HistoryStatsDto> {
    return this.historyService.getUserHistoryStats(user.id);
  }

  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "History entry retrieved successfully",
    type: HistoryResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "History entry not found" })
  async getHistoryById(
    @CurrentUser() user: User,
    @Param("id") historyId: string,
  ): Promise<HistoryResponseDto> {
    return this.historyService.getHistoryById(historyId, user.id);
  }

  @Delete(":id")
  @ApiResponse({
    status: 200,
    description: "History entry deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "History entry not found" })
  async deleteHistory(
    @CurrentUser() user: User,
    @Param("id") historyId: string,
  ): Promise<void> {
    return this.historyService.deleteHistory(historyId, user.id);
  }
}

@ApiTags("Admin History")
@Controller("admin/history")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminHistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: "History entry created successfully",
    type: HistoryResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async createHistory(
    @Body() createDto: CreateHistoryDto,
  ): Promise<HistoryResponseDto> {
    return this.historyService.createHistory(createDto);
  }

  @Get()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "type", required: false, enum: HistoryType })
  @ApiQuery({ name: "category", required: false, enum: HistoryCategory })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "startDate", required: false, type: String })
  @ApiQuery({ name: "endDate", required: false, type: String })
  @ApiQuery({ name: "sortBy", required: false, type: String })
  @ApiQuery({ name: "sortOrder", required: false, enum: ["ASC", "DESC"] })
  @ApiResponse({
    status: 200,
    description: "History retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getHistory(
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query("type") type?: HistoryType,
    @Query("category") category?: HistoryCategory,
    @Query("search") search?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "ASC" | "DESC",
  ) {
    const query: HistoryQueryDto = {
      page,
      limit,
      type,
      category,
      search,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    };
    return this.historyService.getHistory(query);
  }

  @Get("stats")
  @ApiResponse({
    status: 200,
    description: "History statistics retrieved successfully",
    type: HistoryStatsDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getHistoryStats(): Promise<HistoryStatsDto> {
    return this.historyService.getHistoryStats();
  }

  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "History entry retrieved successfully",
    type: HistoryResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "History entry not found" })
  async getHistoryById(
    @Param("id") historyId: string,
  ): Promise<HistoryResponseDto> {
    return this.historyService.getHistoryById(historyId);
  }

  @Put(":id")
  @ApiResponse({
    status: 200,
    description: "History entry updated successfully",
    type: HistoryResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "History entry not found" })
  async updateHistory(
    @Param("id") historyId: string,
    @Body() updateDto: UpdateHistoryDto,
  ): Promise<HistoryResponseDto> {
    return this.historyService.updateHistory(historyId, updateDto);
  }

  @Delete(":id")
  @ApiResponse({
    status: 200,
    description: "History entry deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "History entry not found" })
  async deleteHistory(@Param("id") historyId: string): Promise<void> {
    return this.historyService.deleteHistory(historyId);
  }
}
