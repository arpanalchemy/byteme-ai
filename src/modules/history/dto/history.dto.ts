import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
  Min,
  Max,
} from "class-validator";

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

export class CreateHistoryDto {
  @IsUUID()
  userId: string;

  @IsEnum(HistoryType)
  type: HistoryType;

  @IsEnum(HistoryCategory)
  category: HistoryCategory;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsNumber()
  previousValue?: number;

  @IsOptional()
  @IsString()
  metadata?: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @IsOptional()
  data?: any;
}

export class UpdateHistoryDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  metadata?: string;
}

export class HistoryResponseDto {
  id: string;
  userId: string;
  type: HistoryType;
  category: HistoryCategory;
  title: string;
  description: string;
  details?: string;
  value: number;
  previousValue: number;
  metadata?: string;
  timestamp?: Date;
  data?: any;
  isVisible: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  notes?: string;
  isRecent: boolean;
  isToday: boolean;
  isThisWeek: boolean;
  isThisMonth: boolean;
  formattedValue: string;
  valueChange: number;
  formattedValueChange: string;
  isPositiveChange: boolean;
  categoryIcon: string;
  typeIcon: string;
  formattedCreatedAt: string;
  canBeDeleted: boolean;
  actionButtonText: string;
  createdAt: Date;
  updatedAt: Date;
}

export class HistoryQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsEnum(HistoryType)
  type?: HistoryType;

  @IsOptional()
  @IsEnum(HistoryCategory)
  category?: HistoryCategory;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC";
}

export class HistoryStatsDto {
  total: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  recent: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalValue: number;
  averageValue: number;
  mostActiveDay: string;
  mostActiveDayCount: number;
}
