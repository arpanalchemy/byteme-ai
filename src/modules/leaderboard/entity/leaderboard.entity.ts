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

export enum LeaderboardPeriod {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  ALL_TIME = "all_time",
}

@Entity("leaderboard")
export class Leaderboard {
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
    enum: LeaderboardPeriod,
    default: LeaderboardPeriod.WEEKLY,
  })
  period: LeaderboardPeriod;

  @Column({
    name: "total_mileage",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalMileage: number;

  @Column({
    name: "total_carbon_saved",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalCarbonSaved: number;

  @Column({
    name: "total_rewards",
    type: "decimal",
    precision: 18,
    scale: 6,
    default: 0,
  })
  totalRewards: number;

  @Column({ name: "total_points", default: 0 })
  totalPoints: number;

  @Column({ name: "upload_count", default: 0 })
  uploadCount: number;

  @Column({ default: 0 })
  rank: number;

  @Column({ name: "period_start", type: "date" })
  periodStart: Date;

  @Column({ name: "period_end", type: "date" })
  periodEnd: Date;

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Virtual properties
  get formattedMileage(): string {
    return `${this.totalMileage.toFixed(1)} km`;
  }

  get formattedCarbonSaved(): string {
    return `${this.totalCarbonSaved.toFixed(2)} kg CO₂`;
  }

  get formattedRewards(): string {
    return `${this.totalRewards.toFixed(2)} B3TR`;
  }

  get rankDisplay(): string {
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
