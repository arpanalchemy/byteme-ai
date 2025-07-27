import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  Min,
  IsUrl,
} from "class-validator";

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

export class CreateChallengeDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(ChallengeType)
  type: ChallengeType;

  @IsNumber()
  @Min(1)
  targetValue: number;

  @IsNumber()
  @Min(1)
  rewardAmount: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  requirements?: string;
}

export class UpdateChallengeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ChallengeType)
  type?: ChallengeType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  targetValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  rewardAmount?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsEnum(ChallengeStatus)
  status?: ChallengeStatus;
}

export class ChallengeResponseDto {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  status: ChallengeStatus;
  difficulty: ChallengeDifficulty;
  visibility: ChallengeVisibility;
  imageUrl?: string;
  bannerUrl?: string;
  objectives?: any;
  rewards?: any;
  leaderboardRewards?: any;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  completedParticipants: number;
  requirements?: any;
  metadata?: any;
  isActive: boolean;
  isUpcoming: boolean;
  isCompleted: boolean;
  isPublished: boolean;
  canBeEdited: boolean;
  isFull: boolean;
  daysRemaining: number;
  progressPercentage: number;
  completionRate: number;
  formattedDuration: string;
  difficultyColor: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserChallengeResponseDto {
  id: string;
  challenge: ChallengeResponseDto;
  status: string;
  progress: any;
  rewards?: any;
  rewardsClaimed: boolean;
  claimedAt?: Date;
  completedAt?: Date;
  rank?: number;
  notes?: string;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}
