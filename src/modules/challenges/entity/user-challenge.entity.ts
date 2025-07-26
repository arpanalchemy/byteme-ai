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
import { Challenge } from "./challenge.entity";

export enum UserChallengeStatus {
  JOINED = "joined",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  ABANDONED = "abandoned",
}

@Entity("user_challenges")
@Index(["userId", "challengeId"], { unique: true })
export class UserChallenge {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Index()
  @Column({ name: "user_id" })
  userId: string;

  @ManyToOne(() => Challenge, { onDelete: "CASCADE" })
  @JoinColumn({ name: "challenge_id" })
  challenge: Challenge;

  @Index()
  @Column({ name: "challenge_id" })
  challengeId: string;

  @Column({
    type: "enum",
    enum: UserChallengeStatus,
    default: UserChallengeStatus.JOINED,
  })
  status: UserChallengeStatus;

  @Column({ name: "progress", type: "json", nullable: true })
  progress: {
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
  rewards?: {
    b3trTokens?: number;
    points?: number;
    experience?: number;
    badgeId?: string;
    specialReward?: string;
    leaderboardRank?: number;
    leaderboardReward?: {
      b3trTokens?: number;
      points?: number;
      experience?: number;
    };
  };

  @Column({ name: "rewards_claimed", default: false })
  rewardsClaimed: boolean;

  @Column({ name: "claimed_at", nullable: true })
  claimedAt: Date;

  @Column({ name: "completed_at", nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  rank: number; // Final rank in challenge leaderboard

  @Column({ type: "text", nullable: true })
  notes: string; // User notes about the challenge

  @Column({ name: "is_visible", default: true })
  isVisible: boolean; // Whether the challenge is visible in user's profile

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Virtual properties
  get isCompleted(): boolean {
    return this.status === UserChallengeStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === UserChallengeStatus.FAILED;
  }

  get isAbandoned(): boolean {
    return this.status === UserChallengeStatus.ABANDONED;
  }

  get isInProgress(): boolean {
    return this.status === UserChallengeStatus.IN_PROGRESS;
  }

  get hasRewards(): boolean {
    return !!(
      this.rewards?.b3trTokens ||
      this.rewards?.points ||
      this.rewards?.experience
    );
  }

  get isRewardsClaimed(): boolean {
    return this.rewardsClaimed && !!this.claimedAt;
  }

  get formattedRewards(): string {
    if (!this.rewards) return "No rewards";

    const parts = [];
    if (this.rewards.b3trTokens) parts.push(`${this.rewards.b3trTokens} B3TR`);
    if (this.rewards.points) parts.push(`${this.rewards.points} points`);
    if (this.rewards.experience) parts.push(`${this.rewards.experience} XP`);
    if (this.rewards.leaderboardReward) {
      const lr = this.rewards.leaderboardReward;
      if (lr.b3trTokens) parts.push(`${lr.b3trTokens} B3TR (Leaderboard)`);
      if (lr.points) parts.push(`${lr.points} points (Leaderboard)`);
      if (lr.experience) parts.push(`${lr.experience} XP (Leaderboard)`);
    }

    return parts.length > 0 ? parts.join(", ") : "No rewards";
  }

  get progressPercentage(): number {
    if (!this.challenge?.objectives || !this.progress) return 0;

    const objectives = this.challenge.objectives;
    const progress = this.progress;

    let totalProgress = 0;
    let totalObjectives = 0;

    if (objectives.mileage && progress.mileage !== undefined) {
      totalProgress += Math.min(progress.mileage / objectives.mileage, 1);
      totalObjectives += 1;
    }

    if (objectives.carbonSaved && progress.carbonSaved !== undefined) {
      totalProgress += Math.min(
        progress.carbonSaved / objectives.carbonSaved,
        1
      );
      totalObjectives += 1;
    }

    if (objectives.uploadCount && progress.uploadCount !== undefined) {
      totalProgress += Math.min(
        progress.uploadCount / objectives.uploadCount,
        1
      );
      totalObjectives += 1;
    }

    if (objectives.vehicleCount && progress.vehicleCount !== undefined) {
      totalProgress += Math.min(
        progress.vehicleCount / objectives.vehicleCount,
        1
      );
      totalObjectives += 1;
    }

    if (objectives.rewardsEarned && progress.rewardsEarned !== undefined) {
      totalProgress += Math.min(
        progress.rewardsEarned / objectives.rewardsEarned,
        1
      );
      totalObjectives += 1;
    }

    return totalObjectives > 0 ? (totalProgress / totalObjectives) * 100 : 0;
  }

  get timeSinceJoined(): string {
    const now = new Date();
    const joined = this.createdAt;
    const diffInMs = now.getTime() - joined.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  }

  get rankDisplay(): string {
    if (!this.rank) return "Unranked";

    const suffix =
      this.rank === 1
        ? "st"
        : this.rank === 2
          ? "nd"
          : this.rank === 3
            ? "rd"
            : "th";
    return `${this.rank}${suffix}`;
  }
}
