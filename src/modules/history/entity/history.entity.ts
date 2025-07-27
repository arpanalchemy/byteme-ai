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

export enum HistoryType {
  VEHICLE_UPLOAD = "vehicle_upload",
  REWARD_EARNED = "reward_earned",
  REWARD_SPENT = "reward_spent",
  BADGE_EARNED = "badge_earned",
  CHALLENGE_JOINED = "challenge_joined",
  CHALLENGE_COMPLETED = "challenge_completed",
  CHALLENGE_REWARDS = "challenge_rewards",
  ORDER_PLACED = "order_placed",
  ORDER_CANCELLED = "order_cancelled",
  VEHICLE_ADDED = "vehicle_added",
  VEHICLE_UPDATED = "vehicle_updated",
  LEADERBOARD_RANK = "leaderboard_rank",
  MILESTONE_REACHED = "milestone_reached",
  STREAK_BROKEN = "streak_broken",
  STREAK_MAINTAINED = "streak_maintained",
  SYSTEM_EVENT = "system_event",
}

export enum HistoryCategory {
  UPLOAD = "upload",
  REWARDS = "rewards",
  ACHIEVEMENTS = "achievements",
  CHALLENGES = "challenges",
  ORDERS = "orders",
  VEHICLES = "vehicles",
  LEADERBOARD = "leaderboard",
  SYSTEM = "system",
}

@Entity("history")
@Index(["userId", "type"])
@Index(["userId", "category"])
@Index(["userId", "createdAt"])
@Index(["type", "createdAt"])
export class History {
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
    enum: HistoryType,
    nullable: false,
  })
  type: HistoryType;

  @Column({
    type: "enum",
    enum: HistoryCategory,
    nullable: false,
  })
  category: HistoryCategory;

  @Column({ nullable: false })
  title: string;

  @Column({ type: "text", nullable: false })
  description: string;

  @Column({ type: "json", nullable: true })
  data?: {
    // Vehicle upload data
    vehicleId?: string;
    vehicleName?: string;
    uploadId?: string;
    mileage?: number;
    carbonSaved?: number;
    previousMileage?: number;
    mileageDifference?: number;

    // Reward data
    rewardAmount?: number;
    rewardType?: string; // 'b3tr', 'points', 'experience'
    previousBalance?: number;
    newBalance?: number;
    transactionType?: string; // 'earned', 'spent', 'transferred'

    // Badge data
    badgeId?: string;
    badgeName?: string;
    badgeType?: string;
    badgeRarity?: string;

    // Challenge data
    challengeId?: string;
    challengeName?: string;
    challengeType?: string;
    challengeDifficulty?: string;
    progress?: number;
    objectives?: any;

    // Order data
    orderId?: string;
    orderNumber?: string;
    productId?: string;
    productName?: string;
    quantity?: number;
    totalAmount?: number;
    orderStatus?: string;

    // Leaderboard data
    rank?: number;
    previousRank?: number;
    period?: string; // 'daily', 'weekly', 'monthly', 'all_time'
    score?: number;
    previousScore?: number;

    // Milestone data
    milestone?: string;
    milestoneType?: string;
    milestoneValue?: number;

    // Streak data
    streakCount?: number;
    previousStreakCount?: number;
    streakType?: string; // 'upload', 'login', 'challenge'

    // System data
    eventType?: string;
    systemMessage?: string;
    metadata?: any;

    // Common data
    actionUrl?: string;
    imageUrl?: string;
    deepLink?: string;
    tags?: string[];
  };

  @Column({
    name: "value",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  value: number; // Numeric value for sorting/filtering

  @Column({
    name: "previous_value",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  previousValue: number; // Previous value for comparison

  @Column({ name: "is_visible", default: true })
  isVisible: boolean; // Whether the history entry is visible to user

  @Column({ name: "is_deleted", default: false })
  isDeleted: boolean; // Soft delete

  @Column({ name: "deleted_at", nullable: true })
  deletedAt: Date;

  @Column({ type: "text", nullable: true })
  notes: string; // Admin notes

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Virtual properties
  get isRecent(): boolean {
    const now = new Date();
    const created = this.createdAt;
    const diffInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24;
  }

  get isToday(): boolean {
    const now = new Date();
    const created = this.createdAt;
    return (
      now.getFullYear() === created.getFullYear() &&
      now.getMonth() === created.getMonth() &&
      now.getDate() === created.getDate()
    );
  }

  get isThisWeek(): boolean {
    const now = new Date();
    const created = this.createdAt;
    const diffInDays =
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays < 7;
  }

  get isThisMonth(): boolean {
    const now = new Date();
    const created = this.createdAt;
    return (
      now.getFullYear() === created.getFullYear() &&
      now.getMonth() === created.getMonth()
    );
  }

  get formattedValue(): string {
    switch (this.category) {
      case HistoryCategory.UPLOAD:
        return `${this.value} km`;
      case HistoryCategory.REWARDS:
        return `${this.value} B3TR`;
      case HistoryCategory.ACHIEVEMENTS:
        return `${this.value} points`;
      case HistoryCategory.LEADERBOARD:
        return `Rank #${this.value}`;
      default:
        return this.value?.toString();
    }
  }

  get valueChange(): number {
    return this.value - this.previousValue;
  }

  get formattedValueChange(): string {
    const change = this.valueChange;
    if (change === 0) return "No change";

    const sign = change > 0 ? "+" : "";
    switch (this.category) {
      case HistoryCategory.UPLOAD:
        return `${sign}${change.toFixed(1)} km`;
      case HistoryCategory.REWARDS:
        return `${sign}${change.toFixed(2)} B3TR`;
      case HistoryCategory.ACHIEVEMENTS:
        return `${sign}${change} points`;
      case HistoryCategory.LEADERBOARD:
        return change > 0 ? `+${change} ranks` : `${change} ranks`;
      default:
        return `${sign}${change}`;
    }
  }

  get isPositiveChange(): boolean {
    switch (this.category) {
      case HistoryCategory.UPLOAD:
      case HistoryCategory.REWARDS:
      case HistoryCategory.ACHIEVEMENTS:
        return this.valueChange > 0;
      case HistoryCategory.LEADERBOARD:
        return this.valueChange < 0; // Lower rank is better
      default:
        return this.valueChange >= 0;
    }
  }

  get categoryIcon(): string {
    switch (this.category) {
      case HistoryCategory.UPLOAD:
        return "📸";
      case HistoryCategory.REWARDS:
        return "💰";
      case HistoryCategory.ACHIEVEMENTS:
        return "🏆";
      case HistoryCategory.CHALLENGES:
        return "🎯";
      case HistoryCategory.ORDERS:
        return "🛒";
      case HistoryCategory.VEHICLES:
        return "🚗";
      case HistoryCategory.LEADERBOARD:
        return "📊";
      case HistoryCategory.SYSTEM:
        return "⚙️";
      default:
        return "📌";
    }
  }

  get typeIcon(): string {
    switch (this.type) {
      case HistoryType.VEHICLE_UPLOAD:
        return "📸";
      case HistoryType.REWARD_EARNED:
        return "💰";
      case HistoryType.REWARD_SPENT:
        return "💸";
      case HistoryType.BADGE_EARNED:
        return "🏆";
      case HistoryType.CHALLENGE_JOINED:
        return "🎯";
      case HistoryType.CHALLENGE_COMPLETED:
        return "✅";
      case HistoryType.CHALLENGE_REWARDS:
        return "🎁";
      case HistoryType.ORDER_PLACED:
        return "🛒";
      case HistoryType.ORDER_CANCELLED:
        return "❌";
      case HistoryType.VEHICLE_ADDED:
        return "🚗";
      case HistoryType.VEHICLE_UPDATED:
        return "🔧";
      case HistoryType.LEADERBOARD_RANK:
        return "📊";
      case HistoryType.MILESTONE_REACHED:
        return "🎉";
      case HistoryType.STREAK_BROKEN:
        return "💔";
      case HistoryType.STREAK_MAINTAINED:
        return "🔥";
      case HistoryType.SYSTEM_EVENT:
        return "⚙️";
      default:
        return "📌";
    }
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
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
    return `${Math.floor(diffInDays / 365)}y ago`;
  }

  get canBeDeleted(): boolean {
    return !this.isDeleted;
  }

  get actionButtonText(): string {
    switch (this.type) {
      case HistoryType.VEHICLE_UPLOAD:
        return "View Upload";
      case HistoryType.BADGE_EARNED:
        return "View Badge";
      case HistoryType.CHALLENGE_COMPLETED:
        return "View Challenge";
      case HistoryType.ORDER_PLACED:
        return "Track Order";
      case HistoryType.LEADERBOARD_RANK:
        return "View Leaderboard";
      case HistoryType.VEHICLE_ADDED:
        return "View Vehicle";
      default:
        return "View Details";
    }
  }
}
