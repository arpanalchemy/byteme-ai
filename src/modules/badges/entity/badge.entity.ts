import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { UserBadge } from "./user-badge.entity";

export enum BadgeType {
  MILEAGE = "mileage",
  CARBON_SAVED = "carbon_saved",
  UPLOAD_STREAK = "upload_streak",
  VEHICLE_COUNT = "vehicle_count",
  REWARDS_EARNED = "rewards_earned",
  CHALLENGE_COMPLETION = "challenge_completion",
  SPECIAL_EVENT = "special_event",
}

export enum BadgeRarity {
  COMMON = "common",
  RARE = "rare",
  EPIC = "epic",
  LEGENDARY = "legendary",
}

export enum BadgeStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  INACTIVE = "inactive",
}

@Entity("badges")
export class Badge {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: BadgeType,
    default: BadgeType.MILEAGE,
  })
  type: BadgeType;

  @Column({
    type: "enum",
    enum: BadgeRarity,
    default: BadgeRarity.COMMON,
  })
  rarity: BadgeRarity;

  @Column({
    type: "enum",
    enum: BadgeStatus,
    default: BadgeStatus.ACTIVE,
  })
  status: BadgeStatus;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  iconUrl: string;

  @Column({ type: "json", nullable: true })
  conditions: {
    mileage?: number;
    carbonSaved?: number;
    uploadStreak?: number;
    vehicleCount?: number;
    rewardsEarned?: number;
    challengeCompletions?: number;
    specialEvent?: string;
    timeFrame?: "daily" | "weekly" | "monthly" | "all_time";
  };

  @Column({ type: "json", nullable: true })
  rewards?: {
    b3trTokens?: number;
    points?: number;
    experience?: number;
  };

  @Column({ default: 0 })
  pointsValue: number; // Points awarded when badge is earned

  @Column({ default: 0 })
  earnedCount: number; // Number of users who have earned this badge

  @Column({ type: "json", nullable: true })
  metadata?: {
    category?: string;
    tags?: string[];
    difficulty?: number; // 1-10 scale
    estimatedTime?: string; // e.g., "2 weeks", "1 month"
  };

  @Column({ nullable: true })
  createdBy: string; // Admin who created the badge

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ type: "text", nullable: true })
  notes: string; // Admin notes

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Relations
  @OneToMany(() => UserBadge, (userBadge) => userBadge.badge)
  userBadges: UserBadge[];

  // Virtual properties
  get isPublished(): boolean {
    return this.status === BadgeStatus.ACTIVE && !!this.publishedAt;
  }

  get canBeEdited(): boolean {
    return this.earnedCount === 0;
  }

  get formattedRewards(): string {
    if (!this.rewards) return "No rewards";

    const parts = [];
    if (this.rewards.b3trTokens) parts.push(`${this.rewards.b3trTokens} B3TR`);
    if (this.rewards.points) parts.push(`${this.rewards.points} points`);
    if (this.rewards.experience) parts.push(`${this.rewards.experience} XP`);

    return parts.length > 0 ? parts.join(", ") : "No rewards";
  }

  get difficultyDisplay(): string {
    if (!this.metadata?.difficulty) return "Unknown";

    const difficulty = this.metadata.difficulty;
    if (difficulty <= 2) return "Very Easy";
    if (difficulty <= 4) return "Easy";
    if (difficulty <= 6) return "Medium";
    if (difficulty <= 8) return "Hard";
    return "Very Hard";
  }

  get rarityColor(): string {
    switch (this.rarity) {
      case BadgeRarity.COMMON:
        return "#9CA3AF";
      case BadgeRarity.RARE:
        return "#3B82F6";
      case BadgeRarity.EPIC:
        return "#8B5CF6";
      case BadgeRarity.LEGENDARY:
        return "#F59E0B";
      default:
        return "#9CA3AF";
    }
  }
}
