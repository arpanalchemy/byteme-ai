import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  Min,
  Max,
  IsDateString,
} from "class-validator";
import {
  ChallengeType,
  ChallengeStatus,
  ChallengeDifficulty,
  ChallengeVisibility,
} from "../entity/challenge.entity";
import { UserChallengeStatus } from "../entity/user-challenge.entity";

export class CreateChallengeDto {
  @ApiProperty({
    description: "Challenge name",
    example: "Weekend Warrior",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Challenge description",
    example: "Drive 500 km over the weekend and earn bonus rewards!",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Challenge type",
    enum: ChallengeType,
    example: ChallengeType.MILEAGE,
  })
  @IsEnum(ChallengeType)
  @IsNotEmpty()
  type: ChallengeType;

  @ApiProperty({
    description: "Challenge difficulty",
    enum: ChallengeDifficulty,
    example: ChallengeDifficulty.MEDIUM,
  })
  @IsEnum(ChallengeDifficulty)
  @IsNotEmpty()
  difficulty: ChallengeDifficulty;

  @ApiProperty({
    description: "Challenge visibility",
    enum: ChallengeVisibility,
    example: ChallengeVisibility.PUBLIC,
  })
  @IsEnum(ChallengeVisibility)
  @IsNotEmpty()
  visibility: ChallengeVisibility;

  @ApiProperty({
    description: "Challenge image URL",
    example: "https://example.com/challenge-image.png",
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: "Challenge banner URL",
    example: "https://example.com/challenge-banner.png",
    required: false,
  })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiProperty({
    description: "Challenge objectives",
    example: {
      mileage: 500,
      uploadCount: 10,
    },
    required: false,
  })
  @IsOptional()
  objectives?: {
    mileage?: number;
    carbonSaved?: number;
    uploadStreak?: number;
    vehicleCount?: number;
    rewardsEarned?: number;
    uploadCount?: number;
    dailyUploads?: number;
    weeklyUploads?: number;
  };

  @ApiProperty({
    description: "Challenge rewards",
    example: {
      b3trTokens: 50,
      points: 200,
      experience: 100,
    },
    required: false,
  })
  @IsOptional()
  rewards?: {
    b3trTokens?: number;
    points?: number;
    experience?: number;
    badgeId?: string;
    specialReward?: string;
  };

  @ApiProperty({
    description: "Leaderboard rewards",
    example: {
      first: { b3trTokens: 100, points: 500 },
      second: { b3trTokens: 75, points: 300 },
      third: { b3trTokens: 50, points: 200 },
    },
    required: false,
  })
  @IsOptional()
  leaderboardRewards?: {
    first?: { b3trTokens?: number; points?: number; experience?: number };
    second?: { b3trTokens?: number; points?: number; experience?: number };
    third?: { b3trTokens?: number; points?: number; experience?: number };
    top10?: { b3trTokens?: number; points?: number; experience?: number };
    top50?: { b3trTokens?: number; points?: number; experience?: number };
  };

  @ApiProperty({
    description: "Challenge start date",
    example: "2024-01-15",
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: "Challenge end date",
    example: "2024-01-22",
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    description: "Maximum participants (0 = unlimited)",
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxParticipants?: number;

  @ApiProperty({
    description: "Challenge requirements",
    example: {
      minLevel: 5,
      minMileage: 1000,
    },
    required: false,
  })
  @IsOptional()
  requirements?: {
    minLevel?: number;
    minMileage?: number;
    minCarbonSaved?: number;
    requiredBadges?: string[];
    vehicleTypes?: string[];
  };

  @ApiProperty({
    description: "Challenge metadata",
    example: {
      category: "seasonal",
      tags: ["weekend", "mileage"],
      estimatedTime: "1 week",
      featured: true,
    },
    required: false,
  })
  @IsOptional()
  metadata?: {
    category?: string;
    tags?: string[];
    estimatedTime?: string;
    featured?: boolean;
    seasonal?: boolean;
    eventType?: string;
  };

  @ApiProperty({
    description: "Admin notes",
    example: "Created for weekend engagement",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateChallengeDto {
  @ApiProperty({
    description: "Challenge name",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: "Challenge description",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Challenge type",
    enum: ChallengeType,
    required: false,
  })
  @IsOptional()
  @IsEnum(ChallengeType)
  type?: ChallengeType;

  @ApiProperty({
    description: "Challenge status",
    enum: ChallengeStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ChallengeStatus)
  status?: ChallengeStatus;

  @ApiProperty({
    description: "Challenge difficulty",
    enum: ChallengeDifficulty,
    required: false,
  })
  @IsOptional()
  @IsEnum(ChallengeDifficulty)
  difficulty?: ChallengeDifficulty;

  @ApiProperty({
    description: "Challenge visibility",
    enum: ChallengeVisibility,
    required: false,
  })
  @IsOptional()
  @IsEnum(ChallengeVisibility)
  visibility?: ChallengeVisibility;

  @ApiProperty({
    description: "Challenge image URL",
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: "Challenge banner URL",
    required: false,
  })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiProperty({
    description: "Challenge objectives",
    required: false,
  })
  @IsOptional()
  objectives?: {
    mileage?: number;
    carbonSaved?: number;
    uploadStreak?: number;
    vehicleCount?: number;
    rewardsEarned?: number;
    uploadCount?: number;
    dailyUploads?: number;
    weeklyUploads?: number;
  };

  @ApiProperty({
    description: "Challenge rewards",
    required: false,
  })
  @IsOptional()
  rewards?: {
    b3trTokens?: number;
    points?: number;
    experience?: number;
    badgeId?: string;
    specialReward?: string;
  };

  @ApiProperty({
    description: "Leaderboard rewards",
    required: false,
  })
  @IsOptional()
  leaderboardRewards?: {
    first?: { b3trTokens?: number; points?: number; experience?: number };
    second?: { b3trTokens?: number; points?: number; experience?: number };
    third?: { b3trTokens?: number; points?: number; experience?: number };
    top10?: { b3trTokens?: number; points?: number; experience?: number };
    top50?: { b3trTokens?: number; points?: number; experience?: number };
  };

  @ApiProperty({
    description: "Challenge start date",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: "Challenge end date",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: "Maximum participants",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxParticipants?: number;

  @ApiProperty({
    description: "Challenge requirements",
    required: false,
  })
  @IsOptional()
  requirements?: {
    minLevel?: number;
    minMileage?: number;
    minCarbonSaved?: number;
    requiredBadges?: string[];
    vehicleTypes?: string[];
  };

  @ApiProperty({
    description: "Challenge metadata",
    required: false,
  })
  @IsOptional()
  metadata?: {
    category?: string;
    tags?: string[];
    estimatedTime?: string;
    featured?: boolean;
    seasonal?: boolean;
    eventType?: string;
  };

  @ApiProperty({
    description: "Admin notes",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ChallengeResponseDto {
  @ApiProperty({
    description: "Challenge ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Challenge name",
    example: "Weekend Warrior",
  })
  name: string;

  @ApiProperty({
    description: "Challenge description",
    example: "Drive 500 km over the weekend and earn bonus rewards!",
  })
  description: string;

  @ApiProperty({
    description: "Challenge type",
    enum: ChallengeType,
    example: ChallengeType.MILEAGE,
  })
  type: ChallengeType;

  @ApiProperty({
    description: "Challenge status",
    enum: ChallengeStatus,
    example: ChallengeStatus.ACTIVE,
  })
  status: ChallengeStatus;

  @ApiProperty({
    description: "Challenge difficulty",
    enum: ChallengeDifficulty,
    example: ChallengeDifficulty.MEDIUM,
  })
  difficulty: ChallengeDifficulty;

  @ApiProperty({
    description: "Challenge visibility",
    enum: ChallengeVisibility,
    example: ChallengeVisibility.PUBLIC,
  })
  visibility: ChallengeVisibility;

  @ApiProperty({
    description: "Challenge image URL",
    example: "https://example.com/challenge-image.png",
  })
  imageUrl: string;

  @ApiProperty({
    description: "Challenge banner URL",
    example: "https://example.com/challenge-banner.png",
  })
  bannerUrl: string;

  @ApiProperty({
    description: "Challenge objectives",
  })
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

  @ApiProperty({
    description: "Challenge rewards",
  })
  rewards: {
    b3trTokens?: number;
    points?: number;
    experience?: number;
    badgeId?: string;
    specialReward?: string;
  };

  @ApiProperty({
    description: "Leaderboard rewards",
  })
  leaderboardRewards: {
    first?: { b3trTokens?: number; points?: number; experience?: number };
    second?: { b3trTokens?: number; points?: number; experience?: number };
    third?: { b3trTokens?: number; points?: number; experience?: number };
    top10?: { b3trTokens?: number; points?: number; experience?: number };
    top50?: { b3trTokens?: number; points?: number; experience?: number };
  };

  @ApiProperty({
    description: "Challenge start date",
    example: "2024-01-15",
  })
  startDate: string;

  @ApiProperty({
    description: "Challenge end date",
    example: "2024-01-22",
  })
  endDate: string;

  @ApiProperty({
    description: "Maximum participants",
    example: 100,
  })
  maxParticipants: number;

  @ApiProperty({
    description: "Current participants",
    example: 45,
  })
  currentParticipants: number;

  @ApiProperty({
    description: "Completed participants",
    example: 12,
  })
  completedParticipants: number;

  @ApiProperty({
    description: "Challenge requirements",
  })
  requirements: {
    minLevel?: number;
    minMileage?: number;
    minCarbonSaved?: number;
    requiredBadges?: string[];
    vehicleTypes?: string[];
  };

  @ApiProperty({
    description: "Challenge metadata",
  })
  metadata: {
    category?: string;
    tags?: string[];
    estimatedTime?: string;
    featured?: boolean;
    seasonal?: boolean;
    eventType?: string;
  };

  @ApiProperty({
    description: "Whether the challenge is active",
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: "Whether the challenge is upcoming",
    example: false,
  })
  isUpcoming: boolean;

  @ApiProperty({
    description: "Whether the challenge is completed",
    example: false,
  })
  isCompleted: boolean;

  @ApiProperty({
    description: "Whether the challenge is published",
    example: true,
  })
  isPublished: boolean;

  @ApiProperty({
    description: "Whether the challenge can be edited",
    example: true,
  })
  canBeEdited: boolean;

  @ApiProperty({
    description: "Whether the challenge is full",
    example: false,
  })
  isFull: boolean;

  @ApiProperty({
    description: "Days remaining",
    example: 5,
  })
  daysRemaining: number;

  @ApiProperty({
    description: "Progress percentage",
    example: 45.5,
  })
  progressPercentage: number;

  @ApiProperty({
    description: "Completion rate",
    example: 26.7,
  })
  completionRate: number;

  @ApiProperty({
    description: "Formatted duration",
    example: "1 week",
  })
  formattedDuration: string;

  @ApiProperty({
    description: "Difficulty color",
    example: "#F59E0B",
  })
  difficultyColor: string;

  @ApiProperty({
    description: "Creation date",
    example: "2024-01-01T00:00:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last update date",
    example: "2024-01-15T10:30:00Z",
  })
  updatedAt: Date;
}

export class UserChallengeResponseDto {
  @ApiProperty({
    description: "User challenge ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Challenge information",
    type: ChallengeResponseDto,
  })
  challenge: ChallengeResponseDto;

  @ApiProperty({
    description: "User challenge status",
    enum: UserChallengeStatus,
    example: UserChallengeStatus.IN_PROGRESS,
  })
  status: UserChallengeStatus;

  @ApiProperty({
    description: "User progress in the challenge",
  })
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

  @ApiProperty({
    description: "Rewards earned",
  })
  rewards: {
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

  @ApiProperty({
    description: "Whether rewards have been claimed",
    example: false,
  })
  rewardsClaimed: boolean;

  @ApiProperty({
    description: "When rewards were claimed",
    example: "2024-01-15T10:30:00Z",
  })
  claimedAt: Date;

  @ApiProperty({
    description: "When challenge was completed",
    example: "2024-01-15T10:30:00Z",
  })
  completedAt: Date;

  @ApiProperty({
    description: "Final rank in challenge",
    example: 5,
  })
  rank: number;

  @ApiProperty({
    description: "User notes about the challenge",
  })
  notes: string;

  @ApiProperty({
    description: "Whether the challenge is visible",
    example: true,
  })
  isVisible: boolean;

  @ApiProperty({
    description: "Whether the challenge is completed",
    example: false,
  })
  isCompleted: boolean;

  @ApiProperty({
    description: "Whether the challenge is failed",
    example: false,
  })
  isFailed: boolean;

  @ApiProperty({
    description: "Whether the challenge is abandoned",
    example: false,
  })
  isAbandoned: boolean;

  @ApiProperty({
    description: "Whether the challenge is in progress",
    example: true,
  })
  isInProgress: boolean;

  @ApiProperty({
    description: "Whether the challenge has rewards",
    example: true,
  })
  hasRewards: boolean;

  @ApiProperty({
    description: "Whether rewards have been claimed",
    example: false,
  })
  isRewardsClaimed: boolean;

  @ApiProperty({
    description: "Formatted rewards string",
    example: "50 B3TR, 200 points, 100 XP",
  })
  formattedRewards: string;

  @ApiProperty({
    description: "Progress percentage",
    example: 75.5,
  })
  progressPercentage: number;

  @ApiProperty({
    description: "Time since joined",
    example: "2 days ago",
  })
  timeSinceJoined: string;

  @ApiProperty({
    description: "Rank display",
    example: "5th",
  })
  rankDisplay: string;

  @ApiProperty({
    description: "When the user joined",
    example: "2024-01-13T10:30:00Z",
  })
  createdAt: Date;
}
