import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../users/entity/user.entity";

export enum NotificationType {
  UPLOAD_SUCCESS = "upload_success",
  UPLOAD_FAILED = "upload_failed",
  BADGE_EARNED = "badge_earned",
  CHALLENGE_JOINED = "challenge_joined",
  CHALLENGE_COMPLETED = "challenge_completed",
  CHALLENGE_REWARDS = "challenge_rewards",
  REWARDS_EARNED = "rewards_earned",
  LEADERBOARD_UPDATE = "leaderboard_update",
  ORDER_PLACED = "order_placed",
  ORDER_STATUS = "order_status",
  VEHICLE_ADDED = "vehicle_added",
  VEHICLE_UPDATED = "vehicle_updated",
  SYSTEM_ANNOUNCEMENT = "system_announcement",
  MAINTENANCE_ALERT = "maintenance_alert",
  SECURITY_ALERT = "security_alert",
  WELCOME = "welcome",
  MILESTONE_REACHED = "milestone_reached",
  STREAK_BROKEN = "streak_broken",
  STREAK_MAINTAINED = "streak_maintained",
}

export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum NotificationStatus {
  UNREAD = "unread",
  READ = "read",
  ARCHIVED = "archived",
}

export enum NotificationChannel {
  IN_APP = "in_app",
  EMAIL = "email",
  PUSH = "push",
  SMS = "sms",
}

@Entity("notifications")
@Index(["userId", "status"])
@Index(["userId", "createdAt"])
@Index(["type", "createdAt"])
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Index()
  @Column({ name: "user_id" })
  userId: string;

  @Column({
    type: "enum",
    enum: NotificationType,
    nullable: false,
  })
  type: NotificationType;

  @Column({
    type: "enum",
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  priority: NotificationPriority;

  @Column({
    type: "enum",
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD,
  })
  status: NotificationStatus;

  @Column({ nullable: false })
  title: string;

  @Column({ type: "text", nullable: false })
  message: string;

  @Column({ type: "json", nullable: true })
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

  @Column({
    type: "enum",
    enum: NotificationChannel,
    array: true,
    default: [NotificationChannel.IN_APP],
  })
  channels: NotificationChannel[];

  @Column({ name: "is_read", default: false })
  isRead: boolean;

  @Column({ name: "read_at", nullable: true })
  readAt: Date;

  @Column({ name: "is_archived", default: false })
  isArchived: boolean;

  @Column({ name: "archived_at", nullable: true })
  archivedAt: Date;

  @Column({ name: "is_deleted", default: false })
  isDeleted: boolean;

  @Column({ name: "deleted_at", nullable: true })
  deletedAt: Date;

  @Column({ name: "scheduled_at", nullable: true })
  scheduledAt: Date; // For scheduled notifications

  @Column({ name: "sent_at", nullable: true })
  sentAt: Date; // When notification was actually sent

  @Column({ name: "delivery_status", type: "json", nullable: true })
  deliveryStatus?: {
    inApp?: { sent: boolean; deliveredAt?: Date };
    email?: { sent: boolean; deliveredAt?: Date; error?: string };
    push?: { sent: boolean; deliveredAt?: Date; error?: string };
    sms?: { sent: boolean; deliveredAt?: Date; error?: string };
  };

  @Column({ type: "text", nullable: true })
  notes: string; // Admin notes

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Virtual properties
  get isUnread(): boolean {
    return this.status === NotificationStatus.UNREAD;
  }

  get isReadStatus(): boolean {
    return this.status === NotificationStatus.READ;
  }

  get isArchivedStatus(): boolean {
    return this.status === NotificationStatus.ARCHIVED;
  }

  get isScheduled(): boolean {
    return !!this.scheduledAt && this.scheduledAt > new Date();
  }

  get isDelivered(): boolean {
    return !!this.sentAt;
  }

  get isUrgent(): boolean {
    return this.priority === NotificationPriority.URGENT;
  }

  get isHighPriority(): boolean {
    return (
      this.priority === NotificationPriority.HIGH ||
      this.priority === NotificationPriority.URGENT
    );
  }

  get formattedCreatedAt(): string {
    const now = new Date();
    const created = this.createdAt;
    const diffInMs = now.getTime() - created.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return created.toLocaleDateString();
  }

  get priorityColor(): string {
    switch (this.priority) {
      case NotificationPriority.LOW:
        return "#6B7280";
      case NotificationPriority.MEDIUM:
        return "#3B82F6";
      case NotificationPriority.HIGH:
        return "#F59E0B";
      case NotificationPriority.URGENT:
        return "#EF4444";
      default:
        return "#6B7280";
    }
  }

  get typeIcon(): string {
    switch (this.type) {
      case NotificationType.UPLOAD_SUCCESS:
        return "📸";
      case NotificationType.BADGE_EARNED:
        return "🏆";
      case NotificationType.CHALLENGE_COMPLETED:
        return "🎯";
      case NotificationType.REWARDS_EARNED:
        return "💰";
      case NotificationType.LEADERBOARD_UPDATE:
        return "📊";
      case NotificationType.ORDER_PLACED:
        return "🛒";
      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return "📢";
      case NotificationType.WELCOME:
        return "👋";
      case NotificationType.MILESTONE_REACHED:
        return "🎉";
      case NotificationType.STREAK_MAINTAINED:
        return "🔥";
      default:
        return "📌";
    }
  }

  get actionButtonText(): string {
    switch (this.type) {
      case NotificationType.BADGE_EARNED:
        return "View Badge";
      case NotificationType.CHALLENGE_COMPLETED:
        return "Claim Rewards";
      case NotificationType.ORDER_PLACED:
        return "Track Order";
      case NotificationType.LEADERBOARD_UPDATE:
        return "View Leaderboard";
      case NotificationType.REWARDS_EARNED:
        return "View Rewards";
      default:
        return "View Details";
    }
  }

  get canBeArchived(): boolean {
    return this.status !== NotificationStatus.ARCHIVED && !this.isDeleted;
  }

  get canBeDeleted(): boolean {
    return !this.isDeleted;
  }

  get deliverySuccessRate(): number {
    if (!this.deliveryStatus) return 0;

    const channels = Object.keys(this.deliveryStatus);
    const successful = channels.filter(
      (channel) => this.deliveryStatus[channel]?.sent,
    ).length;

    return channels.length > 0 ? (successful / channels.length) * 100 : 0;
  }
}
