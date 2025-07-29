import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  Notification,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  NotificationChannel,
} from "../entity/notification.entity";
import { User } from "../../users/entity/user.entity";
import {
  CreateNotificationDto,
  CreateBulkNotificationDto,
  UpdateNotificationDto,
  NotificationResponseDto,
  NotificationQueryDto,
  NotificationStatsDto,
} from "../dto/notification.dto";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Notification Management (Admin)

  /**
   * Create a single notification
   */
  async createNotification(
    createDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    try {
      // Verify user exists
      const user = await this.userRepository.findOne({
        where: { id: createDto.userId },
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      const notification = this.notificationRepository.create({
        ...createDto,
        channels: createDto.channels || [NotificationChannel.IN_APP],
        priority: createDto.priority || NotificationPriority.MEDIUM,
        scheduledAt: createDto.scheduledAt
          ? new Date(createDto.scheduledAt)
          : null,
      });

      const savedNotification =
        await this.notificationRepository.save(notification);

      // Send notification if not scheduled
      if (!notification.scheduledAt) {
        await this.sendNotification(savedNotification);
      }

      this.logger.log(`Notification created: ${savedNotification.id}`);
      return this.transformNotificationToResponse(savedNotification);
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`);
      throw new BadRequestException("Failed to create notification");
    }
  }

  /**
   * Create bulk notifications
   */
  async createBulkNotifications(
    createDto: CreateBulkNotificationDto,
  ): Promise<NotificationResponseDto[]> {
    try {
      const notifications: Notification[] = [];

      for (const userId of createDto.userIds) {
        // Verify user exists
        const user = await this.userRepository.findOne({
          where: { id: userId },
        });

        if (!user) {
          this.logger.warn(`User not found: ${userId}`);
          continue;
        }

        const notification = this.notificationRepository.create({
          user: { id: userId },
          type: createDto.type,
          priority: createDto.priority || NotificationPriority.MEDIUM,
          title: createDto.title,
          message: createDto.message,
          data: createDto.data,
          channels: createDto.channels || [NotificationChannel.IN_APP],
          scheduledAt: createDto.scheduledAt
            ? new Date(createDto.scheduledAt)
            : null,
          notes: createDto.notes,
        });

        notifications.push(notification);
      }

      const savedNotifications =
        await this.notificationRepository.save(notifications);

      // Send notifications if not scheduled
      const immediateNotifications = savedNotifications.filter(
        (n) => !n.scheduledAt,
      );
      for (const notification of immediateNotifications) {
        await this.sendNotification(notification);
      }

      this.logger.log(
        `Bulk notifications created: ${savedNotifications.length}`,
      );
      return savedNotifications.map((notification) =>
        this.transformNotificationToResponse(notification),
      );
    } catch (error) {
      this.logger.error(
        `Failed to create bulk notifications: ${error.message}`,
      );
      throw new BadRequestException("Failed to create bulk notifications");
    }
  }

  /**
   * Get notifications with filtering
   */
  async getNotifications(
    query: NotificationQueryDto,
    userId?: string,
  ): Promise<{
    notifications: NotificationResponseDto[];
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
        priority,
        search,
        startDate,
        endDate,
      } = query;
      const offset = (page - 1) * limit;

      const queryBuilder =
        this.notificationRepository.createQueryBuilder("notification");

      if (userId) {
        queryBuilder.andWhere("notification.user_id = :userId", { userId });
      }

      if (type) {
        queryBuilder.andWhere("notification.type = :type", { type });
      }

      if (status) {
        queryBuilder.andWhere("notification.status = :status", { status });
      }

      if (priority) {
        queryBuilder.andWhere("notification.priority = :priority", {
          priority,
        });
      }

      if (search) {
        queryBuilder.andWhere(
          "notification.title ILIKE :search OR notification.message ILIKE :search",
          { search: `%${search}%` },
        );
      }

      if (startDate) {
        queryBuilder.andWhere("notification.createdAt >= :startDate", {
          startDate: new Date(startDate),
        });
      }

      if (endDate) {
        queryBuilder.andWhere("notification.createdAt <= :endDate", {
          endDate: new Date(endDate),
        });
      }

      // Filter out deleted notifications
      queryBuilder.andWhere("notification.isDeleted = :isDeleted", {
        isDeleted: false,
      });

      const total = await queryBuilder.getCount();
      const notifications = await queryBuilder
        .skip(offset)
        .take(limit)
        .orderBy("notification.createdAt", "DESC")
        .getMany();

      return {
        notifications: notifications.map((notification) =>
          this.transformNotificationToResponse(notification),
        ),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Failed to get notifications: ${error.message}`);
      throw new BadRequestException("Failed to get notifications");
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(
    notificationId: string,
    userId?: string,
  ): Promise<NotificationResponseDto> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder("notification")
      .where("notification.id = :notificationId", { notificationId })
      .andWhere("notification.isDeleted = :isDeleted", { isDeleted: false });

    if (userId) {
      queryBuilder.andWhere("notification.user_id = :userId", { userId });
    }

    const notification = await queryBuilder.getOne();

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    return this.transformNotificationToResponse(notification);
  }

  /**
   * Update notification
   */
  async updateNotification(
    notificationId: string,
    updateDto: UpdateNotificationDto,
    userId?: string,
  ): Promise<NotificationResponseDto> {
    try {
      const queryBuilder = this.notificationRepository
        .createQueryBuilder("notification")
        .where("notification.id = :notificationId", { notificationId })
        .andWhere("notification.isDeleted = :isDeleted", { isDeleted: false });

      if (userId) {
        queryBuilder.innerJoin("notification.user", "user");
        queryBuilder.andWhere("user.id = :userId", { userId });
      }

      const notification = await queryBuilder.getOne();

      if (!notification) {
        throw new NotFoundException("Notification not found");
      }

      // Update fields
      if (updateDto.status !== undefined) {
        notification.status = updateDto.status;
      }

      if (updateDto.isRead !== undefined) {
        notification.isRead = updateDto.isRead;
        if (updateDto.isRead && !notification.readAt) {
          notification.readAt = new Date();
        }
      }

      if (updateDto.isArchived !== undefined) {
        notification.isArchived = updateDto.isArchived;
        if (updateDto.isArchived && !notification.archivedAt) {
          notification.archivedAt = new Date();
        }
      }

      if (updateDto.isDeleted !== undefined) {
        notification.isDeleted = updateDto.isDeleted;
        if (updateDto.isDeleted && !notification.deletedAt) {
          notification.deletedAt = new Date();
        }
      }

      const updatedNotification =
        await this.notificationRepository.save(notification);

      this.logger.log(`Notification updated: ${notificationId}`);
      return this.transformNotificationToResponse(updatedNotification);
    } catch (error) {
      this.logger.error(`Failed to update notification: ${error.message}`);
      throw new BadRequestException("Failed to update notification");
    }
  }

  /**
   * Delete notification (soft delete)
   */
  async deleteNotification(
    notificationId: string,
    userId?: string,
  ): Promise<void> {
    try {
      const queryBuilder = this.notificationRepository
        .createQueryBuilder("notification")
        .where("notification.id = :notificationId", { notificationId })
        .andWhere("notification.isDeleted = :isDeleted", { isDeleted: false });

      if (userId) {
        queryBuilder.innerJoin("notification.user", "user");
        queryBuilder.andWhere("user.id = :userId", { userId });
      }

      const notification = await queryBuilder.getOne();

      if (!notification) {
        throw new NotFoundException("Notification not found");
      }

      notification.isDeleted = true;
      notification.deletedAt = new Date();
      await this.notificationRepository.save(notification);

      this.logger.log(`Notification deleted: ${notificationId}`);
    } catch (error) {
      this.logger.error(`Failed to delete notification: ${error.message}`);
      throw new BadRequestException("Failed to delete notification");
    }
  }

  // User Notification Management

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    query: NotificationQueryDto,
  ): Promise<{
    notifications: NotificationResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.getNotifications(query, userId);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<NotificationResponseDto> {
    return this.updateNotification(notificationId, { isRead: true }, userId);
  }

  /**
   * Mark notification as unread
   */
  async markAsUnread(
    notificationId: string,
    userId: string,
  ): Promise<NotificationResponseDto> {
    return this.updateNotification(notificationId, { isRead: false }, userId);
  }

  /**
   * Archive notification
   */
  async archiveNotification(
    notificationId: string,
    userId: string,
  ): Promise<NotificationResponseDto> {
    return this.updateNotification(
      notificationId,
      { isArchived: true },
      userId,
    );
  }

  /**
   * Unarchive notification
   */
  async unarchiveNotification(
    notificationId: string,
    userId: string,
  ): Promise<NotificationResponseDto> {
    return this.updateNotification(
      notificationId,
      { isArchived: false },
      userId,
    );
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await this.notificationRepository
        .createQueryBuilder()
        .update(Notification)
        .set({
          isRead: true,
          readAt: new Date(),
          status: NotificationStatus.READ,
        })
        .where("userId = :userId", { userId })
        .andWhere("isDeleted = :isDeleted", { isDeleted: false })
        .andWhere("isRead = :isRead", { isRead: false })
        .execute();

      this.logger.log(`All notifications marked as read for user: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to mark all notifications as read: ${error.message}`,
      );
      throw new BadRequestException("Failed to mark all notifications as read");
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId?: string): Promise<NotificationStatsDto> {
    try {
      const queryBuilder = this.notificationRepository
        .createQueryBuilder("notification")
        .where("notification.isDeleted = :isDeleted", { isDeleted: false });

      if (userId) {
        queryBuilder.innerJoin("notification.user", "user");
        queryBuilder.andWhere("user.id = :userId", { userId });
      }

      const total = await queryBuilder.getCount();

      const unread = await queryBuilder
        .andWhere("notification.status = :status", {
          status: NotificationStatus.UNREAD,
        })
        .getCount();

      const read = await queryBuilder
        .andWhere("notification.status = :status", {
          status: NotificationStatus.READ,
        })
        .getCount();

      const archived = await queryBuilder
        .andWhere("notification.status = :status", {
          status: NotificationStatus.ARCHIVED,
        })
        .getCount();

      const highPriority = await queryBuilder
        .andWhere("notification.priority IN (:...priorities)", {
          priorities: [NotificationPriority.HIGH, NotificationPriority.URGENT],
        })
        .getCount();

      const urgent = await queryBuilder
        .andWhere("notification.priority = :priority", {
          priority: NotificationPriority.URGENT,
        })
        .getCount();

      // Get notifications by type
      const byTypeQuery = await queryBuilder
        .select(["notification.type", "COUNT(*) as count"])
        .groupBy("notification.type")
        .getRawMany();

      const byType: Record<string, number> = {};
      byTypeQuery.forEach((item) => {
        byType[item.notification_type] = parseInt(item.count);
      });

      // Get notifications by priority
      const byPriorityQuery = await queryBuilder
        .select(["notification.priority", "COUNT(*) as count"])
        .groupBy("notification.priority")
        .getRawMany();

      const byPriority: Record<string, number> = {};
      byPriorityQuery.forEach((item) => {
        byPriority[item.notification_priority] = parseInt(item.count);
      });

      // Calculate average delivery success rate
      const deliveryStats = await queryBuilder
        .select(["notification.deliveryStatus"])
        .getMany();

      let totalSuccessRate = 0;
      let validNotifications = 0;

      deliveryStats.forEach((notification) => {
        if (notification.deliveryStatus) {
          totalSuccessRate += notification.deliverySuccessRate;
          validNotifications++;
        }
      });

      const avgDeliverySuccessRate =
        validNotifications > 0 ? totalSuccessRate / validNotifications : 0;

      return {
        total,
        unread,
        read,
        archived,
        highPriority,
        urgent,
        byType,
        byPriority,
        avgDeliverySuccessRate,
      };
    } catch (error) {
      this.logger.error(`Failed to get notification stats: ${error.message}`);
      throw new BadRequestException("Failed to get notification stats");
    }
  }

  // Helper methods

  /**
   * Send notification through configured channels
   */
  private async sendNotification(notification: Notification): Promise<void> {
    try {
      const deliveryStatus: any = {};

      for (const channel of notification.channels) {
        try {
          switch (channel) {
            case NotificationChannel.IN_APP:
              deliveryStatus.inApp = { sent: true, deliveredAt: new Date() };
              break;
            case NotificationChannel.EMAIL:
              // TODO: Implement email service
              deliveryStatus.email = { sent: true, deliveredAt: new Date() };
              break;
            case NotificationChannel.PUSH:
              // TODO: Implement push notification service
              deliveryStatus.push = { sent: true, deliveredAt: new Date() };
              break;
            case NotificationChannel.SMS:
              // TODO: Implement SMS service
              deliveryStatus.sms = { sent: true, deliveredAt: new Date() };
              break;
          }
        } catch (error) {
          deliveryStatus[channel] = { sent: false, error: error.message };
          this.logger.error(
            `Failed to send notification via ${channel}: ${error.message}`,
          );
        }
      }

      notification.deliveryStatus = deliveryStatus;
      notification.sentAt = new Date();
      await this.notificationRepository.save(notification);

      this.logger.log(`Notification sent: ${notification.id}`);
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
    }
  }

  /**
   * Transform notification to response DTO
   */
  private transformNotificationToResponse(
    notification: Notification,
  ): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.user.id,
      type: notification.type,
      priority: notification.priority,
      status: notification.status,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      channels: notification.channels,
      isRead: notification.isRead,
      readAt: notification.readAt,
      isArchived: notification.isArchived,
      archivedAt: notification.archivedAt,
      isDeleted: notification.isDeleted,
      deletedAt: notification.deletedAt,
      scheduledAt: notification.scheduledAt,
      sentAt: notification.sentAt,
      deliveryStatus: notification.deliveryStatus,
      notes: notification.notes,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
      // Virtual properties
      isUnread: notification.isUnread,
      isScheduled: notification.isScheduled,
      isDelivered: notification.isDelivered,
      isUrgent: notification.isUrgent,
      isHighPriority: notification.isHighPriority,
      formattedCreatedAt: notification.formattedCreatedAt,
      priorityColor: notification.priorityColor,
      typeIcon: notification.typeIcon,
      actionButtonText: notification.actionButtonText,
      canBeArchived: notification.canBeArchived,
      canBeDeleted: notification.canBeDeleted,
      deliverySuccessRate: notification.deliverySuccessRate,
    };
  }

  // Auto-notification methods for system events

  /**
   * Send upload success notification
   */
  async sendUploadSuccessNotification(
    userId: string,
    uploadId: string,
    mileage: number,
    carbonSaved: number,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.UPLOAD_SUCCESS,
      priority: NotificationPriority.MEDIUM,
      title: "Upload Successful!",
      message: `Your odometer reading of ${mileage} km has been verified. You saved ${carbonSaved.toFixed(2)} kg CO₂!`,
      data: {
        uploadId,
        rewardAmount: carbonSaved,
        rewardType: "carbon_saved",
        actionUrl: `/uploads/${uploadId}`,
      },
    });
  }

  /**
   * Send badge earned notification
   */
  async sendBadgeEarnedNotification(
    userId: string,
    badgeId: string,
    badgeName: string,
    rewards?: any,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.BADGE_EARNED,
      priority: NotificationPriority.HIGH,
      title: "Badge Earned!",
      message: `Congratulations! You earned the "${badgeName}" badge!`,
      data: {
        badgeId,
        rewardAmount: rewards?.b3trTokens,
        rewardType: "badge",
        actionUrl: `/badges/${badgeId}`,
      },
    });
  }

  /**
   * Send challenge completed notification
   */
  async sendChallengeCompletedNotification(
    userId: string,
    challengeId: string,
    challengeName: string,
    rewards?: any,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.CHALLENGE_COMPLETED,
      priority: NotificationPriority.HIGH,
      title: "Challenge Completed!",
      message: `You completed the "${challengeName}" challenge!`,
      data: {
        challengeId,
        rewardAmount: rewards?.b3trTokens,
        rewardType: "challenge",
        actionUrl: `/challenges/${challengeId}`,
      },
    });
  }

  /**
   * Send welcome notification
   */
  async sendWelcomeNotification(userId: string): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.WELCOME,
      priority: NotificationPriority.MEDIUM,
      title: "Welcome to Drive & Earn!",
      message:
        "Start uploading your odometer readings to earn B3TR tokens and save the planet!",
      data: {
        actionUrl: "/dashboard",
      },
    });
  }
}
