import { ApiProperty } from "@nestjs/swagger";
import {
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
} from "../entity/notification.entity";

export class CreateNotificationDto {
  @ApiProperty({
    description: "User ID to send notification to",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  userId: string;

  @ApiProperty({
    description: "Notification type",
    enum: NotificationType,
    example: NotificationType.BADGE_EARNED,
  })
  type: NotificationType;

  @ApiProperty({
    description: "Notification priority",
    enum: NotificationPriority,
    example: NotificationPriority.MEDIUM,
    required: false,
  })
  priority?: NotificationPriority;

  @ApiProperty({
    description: "Notification title",
    example: "Badge Earned!",
  })
  title: string;

  @ApiProperty({
    description: "Notification message",
    example: 'Congratulations! You earned the "First 1000 km" badge.',
  })
  message: string;

  @ApiProperty({
    description: "Notification data",
    example: {
      badgeId: "123e4567-e89b-12d3-a456-426614174000",
      rewardAmount: 50,
      actionUrl: "/badges/123e4567-e89b-12d3-a456-426614174000",
    },
    required: false,
  })
  data?: {
    badgeId?: string;
    challengeId?: string;
    orderId?: string;
    vehicleId?: string;
    uploadId?: string;
    rewardAmount?: number;
    rewardType?: string;
    rank?: number;
    milestone?: string;
    streakCount?: number;
    actionUrl?: string;
    imageUrl?: string;
    deepLink?: string;
    metadata?: any;
  };

  @ApiProperty({
    description: "Notification channels",
    enum: NotificationChannel,
    isArray: true,
    example: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    required: false,
  })
  channels?: NotificationChannel[];

  @ApiProperty({
    description: "Scheduled date for notification",
    example: "2024-01-15T10:00:00Z",
    required: false,
  })
  scheduledAt?: string;

  @ApiProperty({
    description: "Admin notes",
    example: "Welcome notification for new user",
    required: false,
  })
  notes?: string;
}

export class CreateBulkNotificationDto {
  @ApiProperty({
    description: "User IDs to send notification to",
    example: [
      "123e4567-e89b-12d3-a456-426614174000",
      "456e7890-e89b-12d3-a456-426614174000",
    ],
    isArray: true,
  })
  userIds: string[];

  @ApiProperty({
    description: "Notification type",
    enum: NotificationType,
    example: NotificationType.SYSTEM_ANNOUNCEMENT,
  })
  type: NotificationType;

  @ApiProperty({
    description: "Notification priority",
    enum: NotificationPriority,
    example: NotificationPriority.MEDIUM,
    required: false,
  })
  priority?: NotificationPriority;

  @ApiProperty({
    description: "Notification title",
    example: "System Maintenance",
  })
  title: string;

  @ApiProperty({
    description: "Notification message",
    example: "The platform will be under maintenance from 2-4 AM.",
  })
  message: string;

  @ApiProperty({
    description: "Notification data",
    required: false,
  })
  data?: {
    badgeId?: string;
    challengeId?: string;
    orderId?: string;
    vehicleId?: string;
    uploadId?: string;
    rewardAmount?: number;
    rewardType?: string;
    rank?: number;
    milestone?: string;
    streakCount?: number;
    actionUrl?: string;
    imageUrl?: string;
    deepLink?: string;
    metadata?: any;
  };

  @ApiProperty({
    description: "Notification channels",
    enum: NotificationChannel,
    isArray: true,
    example: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    required: false,
  })
  channels?: NotificationChannel[];

  @ApiProperty({
    description: "Scheduled date for notification",
    example: "2024-01-15T10:00:00Z",
    required: false,
  })
  scheduledAt?: string;

  @ApiProperty({
    description: "Admin notes",
    example: "Bulk system announcement",
    required: false,
  })
  notes?: string;
}

export class UpdateNotificationDto {
  @ApiProperty({
    description: "Notification status",
    enum: NotificationStatus,
    example: NotificationStatus.READ,
    required: false,
  })
  status?: NotificationStatus;

  @ApiProperty({
    description: "Whether notification is read",
    example: true,
    required: false,
  })
  isRead?: boolean;

  @ApiProperty({
    description: "Whether notification is archived",
    example: false,
    required: false,
  })
  isArchived?: boolean;

  @ApiProperty({
    description: "Whether notification is deleted",
    example: false,
    required: false,
  })
  isDeleted?: boolean;
}

export class NotificationResponseDto {
  @ApiProperty({
    description: "Notification ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  userId: string;

  @ApiProperty({
    description: "Notification type",
    enum: NotificationType,
    example: NotificationType.BADGE_EARNED,
  })
  type: NotificationType;

  @ApiProperty({
    description: "Notification priority",
    enum: NotificationPriority,
    example: NotificationPriority.MEDIUM,
  })
  priority: NotificationPriority;

  @ApiProperty({
    description: "Notification status",
    enum: NotificationStatus,
    example: NotificationStatus.UNREAD,
  })
  status: NotificationStatus;

  @ApiProperty({
    description: "Notification title",
    example: "Badge Earned!",
  })
  title: string;

  @ApiProperty({
    description: "Notification message",
    example: 'Congratulations! You earned the "First 1000 km" badge.',
  })
  message: string;

  @ApiProperty({
    description: "Notification data",
  })
  data: {
    badgeId?: string;
    challengeId?: string;
    orderId?: string;
    vehicleId?: string;
    uploadId?: string;
    rewardAmount?: number;
    rewardType?: string;
    rank?: number;
    milestone?: string;
    streakCount?: number;
    actionUrl?: string;
    imageUrl?: string;
    deepLink?: string;
    metadata?: any;
  };

  @ApiProperty({
    description: "Notification channels",
    enum: NotificationChannel,
    isArray: true,
    example: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
  })
  channels: NotificationChannel[];

  @ApiProperty({
    description: "Whether notification is read",
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: "When notification was read",
    example: "2024-01-15T10:30:00Z",
  })
  readAt: Date;

  @ApiProperty({
    description: "Whether notification is archived",
    example: false,
  })
  isArchived: boolean;

  @ApiProperty({
    description: "When notification was archived",
    example: "2024-01-15T10:30:00Z",
  })
  archivedAt: Date;

  @ApiProperty({
    description: "Whether notification is deleted",
    example: false,
  })
  isDeleted: boolean;

  @ApiProperty({
    description: "When notification was deleted",
    example: "2024-01-15T10:30:00Z",
  })
  deletedAt: Date;

  @ApiProperty({
    description: "Scheduled date for notification",
    example: "2024-01-15T10:00:00Z",
  })
  scheduledAt: Date;

  @ApiProperty({
    description: "When notification was sent",
    example: "2024-01-15T10:30:00Z",
  })
  sentAt: Date;

  @ApiProperty({
    description: "Delivery status for different channels",
  })
  deliveryStatus: {
    inApp?: { sent: boolean; deliveredAt?: Date };
    email?: { sent: boolean; deliveredAt?: Date; error?: string };
    push?: { sent: boolean; deliveredAt?: Date; error?: string };
    sms?: { sent: boolean; deliveredAt?: Date; error?: string };
  };

  @ApiProperty({
    description: "Admin notes",
    example: "Welcome notification for new user",
  })
  notes: string;

  @ApiProperty({
    description: "Creation date",
    example: "2024-01-15T10:30:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last update date",
    example: "2024-01-15T10:30:00Z",
  })
  updatedAt: Date;

  // Virtual properties
  @ApiProperty({
    description: "Whether notification is unread",
    example: true,
  })
  isUnread: boolean;

  @ApiProperty({
    description: "Whether notification is scheduled",
    example: false,
  })
  isScheduled: boolean;

  @ApiProperty({
    description: "Whether notification is delivered",
    example: true,
  })
  isDelivered: boolean;

  @ApiProperty({
    description: "Whether notification is urgent",
    example: false,
  })
  isUrgent: boolean;

  @ApiProperty({
    description: "Whether notification is high priority",
    example: false,
  })
  isHighPriority: boolean;

  @ApiProperty({
    description: "Formatted creation time",
    example: "2 hours ago",
  })
  formattedCreatedAt: string;

  @ApiProperty({
    description: "Priority color",
    example: "#3B82F6",
  })
  priorityColor: string;

  @ApiProperty({
    description: "Type icon",
    example: "🏆",
  })
  typeIcon: string;

  @ApiProperty({
    description: "Action button text",
    example: "View Badge",
  })
  actionButtonText: string;

  @ApiProperty({
    description: "Whether notification can be archived",
    example: true,
  })
  canBeArchived: boolean;

  @ApiProperty({
    description: "Whether notification can be deleted",
    example: true,
  })
  canBeDeleted: boolean;

  @ApiProperty({
    description: "Delivery success rate",
    example: 100,
  })
  deliverySuccessRate: number;
}

export class NotificationQueryDto {
  @ApiProperty({
    description: "Page number",
    example: 1,
    required: false,
  })
  page?: number;

  @ApiProperty({
    description: "Items per page",
    example: 20,
    required: false,
  })
  limit?: number;

  @ApiProperty({
    description: "Notification type filter",
    enum: NotificationType,
    required: false,
  })
  type?: NotificationType;

  @ApiProperty({
    description: "Notification status filter",
    enum: NotificationStatus,
    required: false,
  })
  status?: NotificationStatus;

  @ApiProperty({
    description: "Notification priority filter",
    enum: NotificationPriority,
    required: false,
  })
  priority?: NotificationPriority;

  @ApiProperty({
    description: "Search term",
    example: "badge",
    required: false,
  })
  search?: string;

  @ApiProperty({
    description: "Start date filter",
    example: "2024-01-01",
    required: false,
  })
  startDate?: string;

  @ApiProperty({
    description: "End date filter",
    example: "2024-01-31",
    required: false,
  })
  endDate?: string;
}

export class NotificationStatsDto {
  @ApiProperty({
    description: "Total notifications",
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: "Unread notifications",
    example: 25,
  })
  unread: number;

  @ApiProperty({
    description: "Read notifications",
    example: 100,
  })
  read: number;

  @ApiProperty({
    description: "Archived notifications",
    example: 25,
  })
  archived: number;

  @ApiProperty({
    description: "High priority notifications",
    example: 5,
  })
  highPriority: number;

  @ApiProperty({
    description: "Urgent notifications",
    example: 2,
  })
  urgent: number;

  @ApiProperty({
    description: "Notifications by type",
    example: {
      badge_earned: 30,
      challenge_completed: 20,
      rewards_earned: 25,
      system_announcement: 10,
    },
  })
  byType: Record<string, number>;

  @ApiProperty({
    description: "Notifications by priority",
    example: {
      low: 50,
      medium: 80,
      high: 15,
      urgent: 5,
    },
  })
  byPriority: Record<string, number>;

  @ApiProperty({
    description: "Average delivery success rate",
    example: 95.5,
  })
  avgDeliverySuccessRate: number;
}
