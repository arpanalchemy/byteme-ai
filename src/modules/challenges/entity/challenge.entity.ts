import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { UserChallenge } from "./user-challenge.entity";

export enum ChallengeType {
  MILEAGE = "mileage",
  CARBON_SAVED = "carbon_saved",
  UPLOAD_STREAK = "upload_streak",
  VEHICLE_COUNT = "vehicle_count",
  REWARDS_EARNED = "rewards_earned",
  COMMUNITY = "community",
  SPECIAL_EVENT = "special_event",
}

export enum ChallengeStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum ChallengeDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  EXPERT = "expert",
}

export enum ChallengeVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
  INVITE_ONLY = "invite_only",
}

@Entity("challenges")
export class Challenge {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: ChallengeType,
    default: ChallengeType.MILEAGE,
  })
  type: ChallengeType;

  @Column({
    type: "enum",
    enum: ChallengeStatus,
    default: ChallengeStatus.DRAFT,
  })
  status: ChallengeStatus;

  @Column({
    type: "enum",
    enum: ChallengeDifficulty,
    default: ChallengeDifficulty.MEDIUM,
  })
  difficulty: ChallengeDifficulty;

  @Column({
    type: "enum",
    enum: ChallengeVisibility,
    default: ChallengeVisibility.PUBLIC,
  })
  visibility: ChallengeVisibility;

  @Column({ name: "image_url", nullable: true })
  imageUrl: string;

  @Column({ name: "banner_url", nullable: true })
  bannerUrl: string;

  @Column({ name: "objectives", type: "json", nullable: true })
  objectives: {
    mileage?: number;
    carbonSaved?: number;
    uploadStreak?: number;
    vehicleCount?: number;
    rewardsEarned?: number;
    uploadCount?: number;
    dailyUploads?: number;
    weeklyUploads?: number;
  };

  @Column({ name: "rewards", type: "json", nullable: true })
  rewards: {
    b3trTokens?: number;
    points?: number;
    experience?: number;
    badgeId?: string;
    specialReward?: string;
  };

  @Column({ name: "leaderboard_rewards", type: "json", nullable: true })
  leaderboardRewards?: {
    first?: { b3trTokens?: number; points?: number; experience?: number };
    second?: { b3trTokens?: number; points?: number; experience?: number };
    third?: { b3trTokens?: number; points?: number; experience?: number };
    top10?: { b3trTokens?: number; points?: number; experience?: number };
    top50?: { b3trTokens?: number; points?: number; experience?: number };
  };

  @Column({ name: "start_date", type: "date" })
  startDate: Date;

  @Column({ name: "end_date", type: "date" })
  endDate: Date;

  @Column({ name: "max_participants", default: 0 })
  maxParticipants: number; // 0 = unlimited

  @Column({ name: "current_participants", default: 0 })
  currentParticipants: number;

  @Column({ name: "completed_participants", default: 0 })
  completedParticipants: number;

  @Column({ name: "requirements", type: "json", nullable: true })
  requirements?: {
    minLevel?: number;
    minMileage?: number;
    minCarbonSaved?: number;
    requiredBadges?: string[];
    vehicleTypes?: string[];
  };

  @Column({ name: "metadata", type: "json", nullable: true })
  metadata?: {
    category?: string;
    tags?: string[];
    estimatedTime?: string; // e.g., "1 week", "2 weeks"
    featured?: boolean;
    seasonal?: boolean;
    eventType?: string;
  };

  @Column({ name: "created_by", nullable: true })
  createdBy: string; // Admin who created the challenge

  @Column({ name: "published_at", nullable: true })
  publishedAt: Date;

  @Column({ type: "text", nullable: true })
  notes: string; // Admin notes

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Relations
  @OneToMany(() => UserChallenge, (userChallenge) => userChallenge.challenge)
  userChallenges: UserChallenge[];

  // Virtual properties
  get isActive(): boolean {
    const now = new Date();
    return (
      this.status === ChallengeStatus.ACTIVE &&
      now >= this.startDate &&
      now <= this.endDate
    );
  }

  get isUpcoming(): boolean {
    const now = new Date();
    return this.status === ChallengeStatus.ACTIVE && now < this.startDate;
  }

  get isCompleted(): boolean {
    const now = new Date();
    return this.status === ChallengeStatus.COMPLETED || now > this.endDate;
  }

  get isPublished(): boolean {
    return this.status === ChallengeStatus.ACTIVE && !!this.publishedAt;
  }

  get canBeEdited(): boolean {
    return this.currentParticipants === 0;
  }

  get isFull(): boolean {
    return (
      this.maxParticipants > 0 &&
      this.currentParticipants >= this.maxParticipants
    );
  }

  get daysRemaining(): number {
    const now = new Date();
    const end = new Date(this.endDate);
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get progressPercentage(): number {
    if (this.maxParticipants === 0) return 0;
    return Math.min(
      (this.currentParticipants / this.maxParticipants) * 100,
      100,
    );
  }

  get completionRate(): number {
    if (this.currentParticipants === 0) return 0;
    return (this.completedParticipants / this.currentParticipants) * 100;
  }

  get formattedDuration(): string {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day";
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
    return `${Math.floor(diffDays / 30)} months`;
  }

  get difficultyColor(): string {
    switch (this.difficulty) {
      case ChallengeDifficulty.EASY:
        return "#10B981";
      case ChallengeDifficulty.MEDIUM:
        return "#F59E0B";
      case ChallengeDifficulty.HARD:
        return "#EF4444";
      case ChallengeDifficulty.EXPERT:
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  }
}
