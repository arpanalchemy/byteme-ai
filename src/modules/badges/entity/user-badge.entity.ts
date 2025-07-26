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
import { Badge } from "./badge.entity";

@Entity("user_badges")
@Index(["userId", "badgeId"], { unique: true })
export class UserBadge {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Index()
  @Column({ name: "user_id" })
  userId: string;

  @ManyToOne(() => Badge, { onDelete: "CASCADE" })
  @JoinColumn({ name: "badge_id" })
  badge: Badge;

  @Index()
  @Column({ name: "badge_id" })
  badgeId: string;

  @Column({ name: "earned_data", type: "json", nullable: true })
  earnedData?: {
    mileage?: number;
    carbonSaved?: number;
    uploadStreak?: number;
    vehicleCount?: number;
    rewardsEarned?: number;
    challengeCompletions?: number;
    specialEvent?: string;
  };

  @Column({ name: "rewards", type: "json", nullable: true })
  rewards?: {
    b3trTokens?: number;
    points?: number;
    experience?: number;
  };

  @Column({ name: "rewards_claimed", default: false })
  rewardsClaimed: boolean;

  @Column({ name: "claimed_at", nullable: true })
  claimedAt: Date;

  @Column({ type: "text", nullable: true })
  notes: string; // User notes about the badge

  @Column({ name: "is_visible", default: true })
  isVisible: boolean; // Whether the badge is visible in user's profile

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Virtual properties
  get isRewardsClaimed(): boolean {
    return this.rewardsClaimed && !!this.claimedAt;
  }

  get hasRewards(): boolean {
    return !!(
      this.rewards?.b3trTokens ||
      this.rewards?.points ||
      this.rewards?.experience
    );
  }

  get formattedRewards(): string {
    if (!this.rewards) return "No rewards";

    const parts = [];
    if (this.rewards.b3trTokens) parts.push(`${this.rewards.b3trTokens} B3TR`);
    if (this.rewards.points) parts.push(`${this.rewards.points} points`);
    if (this.rewards.experience) parts.push(`${this.rewards.experience} XP`);

    return parts.length > 0 ? parts.join(", ") : "No rewards";
  }

  get timeSinceEarned(): string {
    const now = new Date();
    const earned = this.createdAt;
    const diffInMs = now.getTime() - earned.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  }
}
