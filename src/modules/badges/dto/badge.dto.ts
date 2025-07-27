import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
  Min,
  IsNotEmpty,
} from "class-validator";
import { BadgeType, BadgeRarity, BadgeStatus } from "../entity/badge.entity";

export class CreateBadgeDto {
  @ApiProperty({
    description: "Badge name",
    example: "First 1000 km",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Badge description",
    example: "Drive your first 1000 kilometers",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Badge type",
    enum: BadgeType,
    example: BadgeType.MILEAGE,
  })
  @IsEnum(BadgeType)
  @IsNotEmpty()
  type: BadgeType;

  @ApiProperty({
    description: "Badge rarity",
    enum: BadgeRarity,
    example: BadgeRarity.COMMON,
  })
  @IsEnum(BadgeRarity)
  @IsNotEmpty()
  rarity: BadgeRarity;

  @ApiProperty({
    description: "Badge image URL",
    example: "https://example.com/badge-image.png",
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: "Badge icon URL",
    example: "https://example.com/badge-icon.png",
    required: false,
  })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiProperty({
    description: "Badge conditions",
    example: {
      mileage: 1000,
      timeFrame: "all_time",
    },
    required: false,
  })
  @IsOptional()
  conditions?: {
    mileage?: number;
    carbonSaved?: number;
    uploadStreak?: number;
    vehicleCount?: number;
    rewardsEarned?: number;
    challengeCompletions?: number;
    specialEvent?: string;
    timeFrame?: "daily" | "weekly" | "monthly" | "all_time";
  };

  @ApiProperty({
    description: "Badge rewards",
    example: {
      b3trTokens: 10,
      points: 100,
      experience: 50,
    },
    required: false,
  })
  @IsOptional()
  rewards?: {
    b3trTokens?: number;
    points?: number;
    experience?: number;
  };

  @ApiProperty({
    description: "Points value of the badge",
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pointsValue?: number;

  @ApiProperty({
    description: "Badge metadata",
    example: {
      category: "milestone",
      tags: ["beginner", "mileage"],
      difficulty: 3,
      estimatedTime: "2 weeks",
    },
    required: false,
  })
  @IsOptional()
  metadata?: {
    category?: string;
    tags?: string[];
    difficulty?: number;
    estimatedTime?: string;
  };

  @ApiProperty({
    description: "Admin notes",
    example: "Created for new user onboarding",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBadgeDto {
  @ApiProperty({
    description: "Badge name",
    example: "First 1000 km",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: "Badge description",
    example: "Drive your first 1000 kilometers",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Badge type",
    enum: BadgeType,
    required: false,
  })
  @IsOptional()
  @IsEnum(BadgeType)
  type?: BadgeType;

  @ApiProperty({
    description: "Badge rarity",
    enum: BadgeRarity,
    required: false,
  })
  @IsOptional()
  @IsEnum(BadgeRarity)
  rarity?: BadgeRarity;

  @ApiProperty({
    description: "Badge status",
    enum: BadgeStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(BadgeStatus)
  status?: BadgeStatus;

  @ApiProperty({
    description: "Badge image URL",
    example: "https://example.com/badge-image.png",
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: "Badge icon URL",
    example: "https://example.com/badge-icon.png",
    required: false,
  })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiProperty({
    description: "Badge conditions",
    required: false,
  })
  @IsOptional()
  conditions?: {
    mileage?: number;
    carbonSaved?: number;
    uploadStreak?: number;
    vehicleCount?: number;
    rewardsEarned?: number;
    challengeCompletions?: number;
    specialEvent?: string;
    timeFrame?: "daily" | "weekly" | "monthly" | "all_time";
  };

  @ApiProperty({
    description: "Badge rewards",
    required: false,
  })
  @IsOptional()
  rewards?: {
    b3trTokens?: number;
    points?: number;
    experience?: number;
  };

  @ApiProperty({
    description: "Points value of the badge",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pointsValue?: number;

  @ApiProperty({
    description: "Badge metadata",
    required: false,
  })
  @IsOptional()
  metadata?: {
    category?: string;
    tags?: string[];
    difficulty?: number;
    estimatedTime?: string;
  };

  @ApiProperty({
    description: "Admin notes",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BadgeResponseDto {
  @ApiProperty({
    description: "Badge ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Badge name",
    example: "First 1000 km",
  })
  name: string;

  @ApiProperty({
    description: "Badge description",
    example: "Drive your first 1000 kilometers",
  })
  description: string;

  @ApiProperty({
    description: "Badge type",
    enum: BadgeType,
    example: BadgeType.MILEAGE,
  })
  type: BadgeType;

  @ApiProperty({
    description: "Badge rarity",
    enum: BadgeRarity,
    example: BadgeRarity.COMMON,
  })
  rarity: BadgeRarity;

  @ApiProperty({
    description: "Badge status",
    enum: BadgeStatus,
    example: BadgeStatus.ACTIVE,
  })
  status: BadgeStatus;

  @ApiProperty({
    description: "Badge image URL",
    example: "https://example.com/badge-image.png",
  })
  imageUrl: string;

  @ApiProperty({
    description: "Badge icon URL",
    example: "https://example.com/badge-icon.png",
  })
  iconUrl: string;

  @ApiProperty({
    description: "Badge conditions",
  })
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

  @ApiProperty({
    description: "Badge rewards",
  })
  rewards: {
    b3trTokens?: number;
    points?: number;
    experience?: number;
  };

  @ApiProperty({
    description: "Points value of the badge",
    example: 100,
  })
  pointsValue: number;

  @ApiProperty({
    description: "Number of users who have earned this badge",
    example: 45,
  })
  earnedCount: number;

  @ApiProperty({
    description: "Badge metadata",
  })
  metadata: {
    category?: string;
    tags?: string[];
    difficulty?: number;
    estimatedTime?: string;
  };

  @ApiProperty({
    description: "Whether the badge is published",
    example: true,
  })
  isPublished: boolean;

  @ApiProperty({
    description: "Whether the badge can be edited",
    example: true,
  })
  canBeEdited: boolean;

  @ApiProperty({
    description: "Formatted rewards string",
    example: "10 B3TR, 100 points, 50 XP",
  })
  formattedRewards: string;

  @ApiProperty({
    description: "Difficulty display",
    example: "Easy",
  })
  difficultyDisplay: string;

  @ApiProperty({
    description: "Rarity color",
    example: "#9CA3AF",
  })
  rarityColor: string;

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

export class UserBadgeResponseDto {
  @ApiProperty({
    description: "User badge ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Badge information",
    type: BadgeResponseDto,
  })
  badge: BadgeResponseDto;

  @ApiProperty({
    description: "Data when badge was earned",
  })
  earnedData: {
    mileage?: number;
    carbonSaved?: number;
    uploadStreak?: number;
    vehicleCount?: number;
    rewardsEarned?: number;
    challengeCompletions?: number;
    specialEvent?: string;
  };

  @ApiProperty({
    description: "Rewards for this badge",
  })
  rewards: {
    b3trTokens?: number;
    points?: number;
    experience?: number;
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
    description: "User notes about the badge",
  })
  notes: string;

  @ApiProperty({
    description: "Whether the badge is visible",
    example: true,
  })
  isVisible: boolean;

  @ApiProperty({
    description: "Whether the badge has rewards",
    example: true,
  })
  hasRewards: boolean;

  @ApiProperty({
    description: "Formatted rewards string",
    example: "10 B3TR, 100 points, 50 XP",
  })
  formattedRewards: string;

  @ApiProperty({
    description: "Time since badge was earned",
    example: "2 days ago",
  })
  timeSinceEarned: string;

  @ApiProperty({
    description: "When the badge was earned",
    example: "2024-01-13T10:30:00Z",
  })
  createdAt: Date;
}
