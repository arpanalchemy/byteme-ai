import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsNotEmpty,
  Min,
  Max,
  IsUUID,
} from "class-validator";
import { LeaderboardPeriod } from "../entity/leaderboard.entity";

export class LeaderboardEntryDto {
  @ApiProperty({
    description: "User rank",
    example: 1,
  })
  rank: number;

  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  userId: string;

  @ApiProperty({
    description: "User wallet address",
    example: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  })
  walletAddress: string;

  @ApiProperty({
    description: "Username",
    example: "EcoDriver123",
  })
  username: string;

  @ApiProperty({
    description: "Profile image URL",
    example: "https://example.com/profile.jpg",
  })
  profileImageUrl: string;

  @ApiProperty({
    description: "Total mileage",
    example: 15000.5,
  })
  totalMileage: number;

  @ApiProperty({
    description: "Total carbon saved",
    example: 3000.1,
  })
  totalCarbonSaved: number;

  @ApiProperty({
    description: "Total rewards earned",
    example: 150.75,
  })
  totalRewards: number;

  @ApiProperty({
    description: "Total points",
    example: 2500,
  })
  totalPoints: number;

  @ApiProperty({
    description: "Upload count",
    example: 45,
  })
  uploadCount: number;

  @ApiProperty({
    description: "Formatted rank display",
    example: "1st",
  })
  rankDisplay: string;
}

export class LeaderboardResponseDto {
  @ApiProperty({
    description: "Leaderboard period",
    enum: LeaderboardPeriod,
    example: LeaderboardPeriod.WEEKLY,
  })
  period: LeaderboardPeriod;

  @ApiProperty({
    description: "Period start date",
    example: "2024-01-01",
  })
  periodStart: string;

  @ApiProperty({
    description: "Period end date",
    example: "2024-01-07",
  })
  periodEnd: string;

  @ApiProperty({
    description: "Current user rank (if authenticated)",
    example: 15,
  })
  userRank?: number;

  @ApiProperty({
    description: "Total participants",
    example: 1250,
  })
  totalParticipants: number;

  @ApiProperty({
    description: "Leaderboard entries",
    type: [LeaderboardEntryDto],
  })
  entries: LeaderboardEntryDto[];

  @ApiProperty({
    description: "Current page",
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: "Items per page",
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: "Total pages",
    example: 63,
  })
  totalPages: number;
}

export class LeaderboardQueryDto {
  @ApiProperty({
    description: "Leaderboard period",
    enum: LeaderboardPeriod,
    example: LeaderboardPeriod.WEEKLY,
    required: false,
  })
  @IsOptional()
  @IsEnum(LeaderboardPeriod)
  period?: LeaderboardPeriod;

  @ApiProperty({
    description: "Page number",
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: "Items per page",
    example: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
