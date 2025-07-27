import { IsNumber, IsOptional, IsDateString, IsEnum } from "class-validator";

export enum LeaderboardType {
  MILEAGE = "mileage",
  CARBON_SAVING = "carbon_saving",
  REWARDS = "rewards",
  POINTS = "points",
  UPLOAD_COUNT = "upload_count",
}

export enum LeaderboardPeriod {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
  ALL_TIME = "all_time",
}

export class CreateLeaderboardDto {
  @IsEnum(LeaderboardType)
  type: LeaderboardType;

  @IsEnum(LeaderboardPeriod)
  period: LeaderboardPeriod;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsNumber()
  maxParticipants?: number;
}

export class UpdateLeaderboardDto {
  @IsOptional()
  @IsEnum(LeaderboardType)
  type?: LeaderboardType;

  @IsOptional()
  @IsEnum(LeaderboardPeriod)
  period?: LeaderboardPeriod;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  maxParticipants?: number;
}

export class LeaderboardEntryDto {
  rank: number;
  userId: string;
  walletAddress: string;
  username: string;
  profileImageUrl: string;
  totalMileage: number;
  totalCarbonSaved: number;
  totalRewards: number;
  totalPoints: number;
  uploadCount: number;
  rankDisplay: string;
}

export class LeaderboardResponseDto {
  period: LeaderboardPeriod;
  periodStart: string;
  periodEnd: string;
  userRank?: number;
  totalParticipants: number;
  entries: LeaderboardEntryDto[];
  page: number;
  limit: number;
  totalPages: number;
}

export class LeaderboardQueryDto {
  @IsOptional()
  @IsEnum(LeaderboardPeriod)
  period?: LeaderboardPeriod;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
