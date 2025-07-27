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
import { NotificationService } from "../services/notification.service";
import {
  CreateNotificationDto,
  CreateBulkNotificationDto,
  UpdateNotificationDto,
  NotificationResponseDto,
  NotificationQueryDto,
  NotificationStatsDto,
} from "../dto/notification.dto";
import {
  NotificationType,
  NotificationStatus,
  NotificationPriority,
} from "../entity/notification.entity";
import { User } from "../../users/entity/user.entity";

@ApiTags("Notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "type", required: false, enum: NotificationType })
  @ApiQuery({ name: "status", required: false, enum: NotificationStatus })
  @ApiQuery({ name: "priority", required: false, enum: NotificationPriority })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "startDate", required: false, type: String })
  @ApiQuery({ name: "endDate", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: "Notifications retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getNotifications(
    @CurrentUser() user: User,
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query("type") type?: NotificationType,
    @Query("status") status?: NotificationStatus,
    @Query("priority") priority?: NotificationPriority,
    @Query("search") search?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const query: NotificationQueryDto = {
      page,
      limit,
      type,
      status,
      priority,
      search,
      startDate,
      endDate,
    };
    return this.notificationService.getUserNotifications(user.id, query);
  }

  @Get("stats")
  @ApiResponse({
    status: 200,
    description: "Notification statistics retrieved successfully",
    type: NotificationStatsDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getNotificationStats(
    @CurrentUser() user: User,
  ): Promise<NotificationStatsDto> {
    return this.notificationService.getNotificationStats(user.id);
  }

  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "Notification retrieved successfully",
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async getNotificationById(
    @CurrentUser() user: User,
    @Param("id") notificationId: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.getNotificationById(
      notificationId,
      user.id,
    );
  }

  @Put(":id/read")
  @ApiResponse({
    status: 200,
    description: "Notification marked as read successfully",
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async markAsRead(
    @CurrentUser() user: User,
    @Param("id") notificationId: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.markAsRead(notificationId, user.id);
  }

  @Put(":id/unread")
  @ApiResponse({
    status: 200,
    description: "Notification marked as unread successfully",
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async markAsUnread(
    @CurrentUser() user: User,
    @Param("id") notificationId: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.markAsUnread(notificationId, user.id);
  }

  @Put(":id/archive")
  @ApiResponse({
    status: 200,
    description: "Notification archived successfully",
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async archiveNotification(
    @CurrentUser() user: User,
    @Param("id") notificationId: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.archiveNotification(
      notificationId,
      user.id,
    );
  }

  @Put(":id/unarchive")
  @ApiResponse({
    status: 200,
    description: "Notification unarchived successfully",
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async unarchiveNotification(
    @CurrentUser() user: User,
    @Param("id") notificationId: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.unarchiveNotification(
      notificationId,
      user.id,
    );
  }

  @Put("mark-all-read")
  @ApiResponse({
    status: 200,
    description: "All notifications marked as read successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async markAllAsRead(@CurrentUser() user: User): Promise<void> {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Delete(":id")
  @ApiResponse({
    status: 200,
    description: "Notification deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async deleteNotification(
    @CurrentUser() user: User,
    @Param("id") notificationId: string,
  ): Promise<void> {
    return this.notificationService.deleteNotification(notificationId, user.id);
  }
}

@ApiTags("Admin Notifications")
@Controller("admin/notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminNotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: "Notification created successfully",
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async createNotification(
    @Body() createDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.createNotification(createDto);
  }

  @Post("bulk")
  @ApiResponse({
    status: 201,
    description: "Bulk notifications created successfully",
    type: [NotificationResponseDto],
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async createBulkNotifications(
    @Body() createDto: CreateBulkNotificationDto,
  ): Promise<NotificationResponseDto[]> {
    return this.notificationService.createBulkNotifications(createDto);
  }

  @Get()
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "type", required: false, enum: NotificationType })
  @ApiQuery({ name: "status", required: false, enum: NotificationStatus })
  @ApiQuery({ name: "priority", required: false, enum: NotificationPriority })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "startDate", required: false, type: String })
  @ApiQuery({ name: "endDate", required: false, type: String })
  @ApiResponse({
    status: 200,
    description: "Notifications retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getNotifications(
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query("type") type?: NotificationType,
    @Query("status") status?: NotificationStatus,
    @Query("priority") priority?: NotificationPriority,
    @Query("search") search?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const query: NotificationQueryDto = {
      page,
      limit,
      type,
      status,
      priority,
      search,
      startDate,
      endDate,
    };
    return this.notificationService.getNotifications(query);
  }

  @Get("stats")
  @ApiResponse({
    status: 200,
    description: "Notification statistics retrieved successfully",
    type: NotificationStatsDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getNotificationStats(): Promise<NotificationStatsDto> {
    return this.notificationService.getNotificationStats();
  }

  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "Notification retrieved successfully",
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async getNotificationById(
    @Param("id") notificationId: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.getNotificationById(notificationId);
  }

  @Put(":id")
  @ApiResponse({
    status: 200,
    description: "Notification updated successfully",
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async updateNotification(
    @Param("id") notificationId: string,
    @Body() updateDto: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationService.updateNotification(
      notificationId,
      updateDto,
    );
  }

  @Delete(":id")
  @ApiResponse({
    status: 200,
    description: "Notification deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async deleteNotification(@Param("id") notificationId: string): Promise<void> {
    return this.notificationService.deleteNotification(notificationId);
  }
}
