import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsDate,
  IsBoolean,
  IsNotEmpty,
  Min,
  Max,
  IsUUID,
} from "class-validator";
import {
  RewardType,
  RewardStatus,
  BlockchainStatus,
} from "../entity/reward.entity";

export class CreateRewardDto {
  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: "Reward type",
    enum: RewardType,
    example: RewardType.UPLOAD,
  })
  @IsEnum(RewardType)
  @IsNotEmpty()
  type: RewardType;

  @ApiProperty({
    description: "Reward amount in B3TR tokens",
    example: 10.5,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: "Miles driven for this reward",
    example: 150.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  milesDriven?: number;

  @ApiProperty({
    description: "Carbon saved in grams",
    example: 2500.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carbonSaved?: number;

  @ApiProperty({
    description: "Blockchain cycle ID",
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  cycleId?: number;

  @ApiProperty({
    description: "Description of the reward",
    example: "Reward for uploading 150 miles",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Proof data for blockchain",
    example: {
      proofTypes: ["image"],
      proofValues: ["hash123"],
      impactCodes: ["carbon"],
      impactValues: [2500],
      imageHash: "hash123",
      uploadId: "456e7890-e89b-12d3-a456-426614174000",
    },
    required: false,
  })
  @IsOptional()
  proofData?: {
    proofTypes?: string[];
    proofValues?: string[];
    impactCodes?: string[];
    impactValues?: number[];
    imageHash?: string;
    uploadId?: string;
    badgeId?: string;
    challengeId?: string;
    milestoneType?: string;
    leaderboardPeriod?: string;
    leaderboardRank?: number;
  };

  @ApiProperty({
    description: "Additional metadata",
    example: {
      source: "upload",
      trigger: "automatic",
      tier: "bronze",
      multiplier: 1.0,
    },
    required: false,
  })
  @IsOptional()
  metadata?: {
    source?: string;
    trigger?: string;
    batchId?: string;
    batchIndex?: number;
    previousBalance?: number;
    newBalance?: number;
    tier?: string;
    multiplier?: number;
    bonus?: number;
  };
}

export class UpdateRewardDto {
  @ApiProperty({
    description: "Reward status",
    enum: RewardStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(RewardStatus)
  status?: RewardStatus;

  @ApiProperty({
    description: "Blockchain status",
    enum: BlockchainStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(BlockchainStatus)
  blockchainStatus?: BlockchainStatus;

  @ApiProperty({
    description: "Reward amount in B3TR tokens",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiProperty({
    description: "Miles driven for this reward",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  milesDriven?: number;

  @ApiProperty({
    description: "Carbon saved in grams",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carbonSaved?: number;

  @ApiProperty({
    description: "Blockchain cycle ID",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  cycleId?: number;

  @ApiProperty({
    description: "Description of the reward",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Proof data for blockchain",
    required: false,
  })
  @IsOptional()
  proofData?: {
    proofTypes?: string[];
    proofValues?: string[];
    impactCodes?: string[];
    impactValues?: number[];
    imageHash?: string;
    uploadId?: string;
    badgeId?: string;
    challengeId?: string;
    milestoneType?: string;
    leaderboardPeriod?: string;
    leaderboardRank?: number;
  };

  @ApiProperty({
    description: "Blockchain transaction data",
    required: false,
  })
  @IsOptional()
  blockchainData?: {
    txHash?: string;
    blockNumber?: number;
    gasUsed?: number;
    gasPrice?: string;
    nonce?: number;
    error?: string;
    retryCount?: number;
    lastRetryAt?: Date;
  };

  @ApiProperty({
    description: "Additional metadata",
    required: false,
  })
  @IsOptional()
  metadata?: {
    source?: string;
    trigger?: string;
    batchId?: string;
    batchIndex?: number;
    previousBalance?: number;
    newBalance?: number;
    tier?: string;
    multiplier?: number;
    bonus?: number;
  };

  @ApiProperty({
    description: "Failure reason",
    required: false,
  })
  @IsOptional()
  @IsString()
  failureReason?: string;
}

export class RewardResponseDto {
  @ApiProperty({
    description: "Reward ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  userId: string;

  @ApiProperty({
    description: "Reward type",
    enum: RewardType,
    example: RewardType.UPLOAD,
  })
  type: RewardType;

  @ApiProperty({
    description: "Reward status",
    enum: RewardStatus,
    example: RewardStatus.PENDING,
  })
  status: RewardStatus;

  @ApiProperty({
    description: "Blockchain status",
    enum: BlockchainStatus,
    example: BlockchainStatus.NOT_SENT,
  })
  blockchainStatus: BlockchainStatus;

  @ApiProperty({
    description: "Reward amount in B3TR tokens",
    example: 10.5,
  })
  amount: number;

  @ApiProperty({
    description: "Miles driven for this reward",
    example: 150.5,
  })
  milesDriven: number;

  @ApiProperty({
    description: "Carbon saved in grams",
    example: 2500.5,
  })
  carbonSaved: number;

  @ApiProperty({
    description: "Blockchain cycle ID",
    example: 1,
  })
  cycleId: number;

  @ApiProperty({
    description: "Blockchain submission ID",
    example: 123,
  })
  submissionId: number;

  @ApiProperty({
    description: "Description of the reward",
    example: "Reward for uploading 150 miles",
  })
  description: string;

  @ApiProperty({
    description: "Proof data for blockchain",
  })
  proofData: {
    proofTypes?: string[];
    proofValues?: string[];
    impactCodes?: string[];
    impactValues?: number[];
    imageHash?: string;
    uploadId?: string;
    badgeId?: string;
    challengeId?: string;
    milestoneType?: string;
    leaderboardPeriod?: string;
    leaderboardRank?: number;
  };

  @ApiProperty({
    description: "Blockchain transaction data",
  })
  blockchainData: {
    txHash?: string;
    blockNumber?: number;
    gasUsed?: number;
    gasPrice?: string;
    nonce?: number;
    error?: string;
    retryCount?: number;
    lastRetryAt?: Date;
  };

  @ApiProperty({
    description: "Additional metadata",
  })
  metadata: {
    source?: string;
    trigger?: string;
    batchId?: string;
    batchIndex?: number;
    previousBalance?: number;
    newBalance?: number;
    tier?: string;
    multiplier?: number;
    bonus?: number;
  };

  @ApiProperty({
    description: "When the reward was processed",
    example: "2024-01-15T10:30:00Z",
  })
  processedAt: Date;

  @ApiProperty({
    description: "When the reward was confirmed on blockchain",
    example: "2024-01-15T10:35:00Z",
  })
  confirmedAt: Date;

  @ApiProperty({
    description: "When the reward failed",
    example: "2024-01-15T10:30:00Z",
  })
  failedAt: Date;

  @ApiProperty({
    description: "Failure reason",
    example: "Insufficient funds",
  })
  failureReason: string;

  @ApiProperty({
    description: "Creation date",
    example: "2024-01-15T10:30:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last update date",
    example: "2024-01-15T10:30:00Z",
  })
  updatedAt: Date;

  @ApiProperty({
    description: "Whether the reward is pending",
    example: true,
  })
  isPending: boolean;

  @ApiProperty({
    description: "Whether the reward is processing",
    example: false,
  })
  isProcessing: boolean;

  @ApiProperty({
    description: "Whether the reward is completed",
    example: false,
  })
  isCompleted: boolean;

  @ApiProperty({
    description: "Whether the reward failed",
    example: false,
  })
  isFailed: boolean;

  @ApiProperty({
    description: "Whether the reward is cancelled",
    example: false,
  })
  isCancelled: boolean;

  @ApiProperty({
    description: "Whether the reward is pending on blockchain",
    example: true,
  })
  isBlockchainPending: boolean;

  @ApiProperty({
    description: "Whether the reward was sent to blockchain",
    example: false,
  })
  isBlockchainSent: boolean;

  @ApiProperty({
    description: "Whether the reward was confirmed on blockchain",
    example: false,
  })
  isBlockchainConfirmed: boolean;

  @ApiProperty({
    description: "Whether the reward failed on blockchain",
    example: false,
  })
  isBlockchainFailed: boolean;

  @ApiProperty({
    description: "Whether the reward can be retried",
    example: false,
  })
  canRetry: boolean;

  @ApiProperty({
    description: "Formatted reward amount",
    example: "10.50000000 B3TR",
  })
  formattedAmount: string;

  @ApiProperty({
    description: "Formatted miles driven",
    example: "150.5 miles",
  })
  formattedMiles: string;

  @ApiProperty({
    description: "Formatted carbon saved",
    example: "2500.50g CO2",
  })
  formattedCarbonSaved: string;

  @ApiProperty({
    description: "Carbon saved in kg",
    example: 2.5005,
  })
  carbonSavedKg: number;

  @ApiProperty({
    description: "Formatted carbon saved in kg",
    example: "2.501kg CO2",
  })
  formattedCarbonSavedKg: string;

  @ApiProperty({
    description: "Reward per mile",
    example: 0.069767,
  })
  rewardPerMile: number;

  @ApiProperty({
    description: "Formatted reward per mile",
    example: "0.069767 B3TR/mile",
  })
  formattedRewardPerMile: string;

  @ApiProperty({
    description: "Carbon efficiency",
    example: 4.199,
  })
  carbonEfficiency: number;

  @ApiProperty({
    description: "Formatted carbon efficiency",
    example: "4.1990 B3TR/kg CO2",
  })
  formattedCarbonEfficiency: string;

  @ApiProperty({
    description: "Processing time in milliseconds",
    example: 5000,
  })
  processingTime: number;

  @ApiProperty({
    description: "Confirmation time in milliseconds",
    example: 300000,
  })
  confirmationTime: number;

  @ApiProperty({
    description: "Total processing time in milliseconds",
    example: 305000,
  })
  totalProcessingTime: number;

  @ApiProperty({
    description: "Formatted processing time",
    example: "5.0s",
  })
  formattedProcessingTime: string;

  @ApiProperty({
    description: "Formatted confirmation time",
    example: "5.0m",
  })
  formattedConfirmationTime: string;

  @ApiProperty({
    description: "Formatted total processing time",
    example: "5.1m",
  })
  formattedTotalProcessingTime: string;

  @ApiProperty({
    description: "Reward type icon",
    example: "📸",
  })
  typeIcon: string;

  @ApiProperty({
    description: "Status color",
    example: "yellow",
  })
  statusColor: string;

  @ApiProperty({
    description: "Blockchain status color",
    example: "gray",
  })
  blockchainStatusColor: string;

  @ApiProperty({
    description: "Whether the reward can be cancelled",
    example: true,
  })
  canBeCancelled: boolean;

  @ApiProperty({
    description: "Whether the reward can be retried",
    example: false,
  })
  canBeRetried: boolean;
}

export class RewardQueryDto {
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

  @ApiProperty({
    description: "Reward type filter",
    enum: RewardType,
    required: false,
  })
  @IsOptional()
  @IsEnum(RewardType)
  type?: RewardType;

  @ApiProperty({
    description: "Reward status filter",
    enum: RewardStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(RewardStatus)
  status?: RewardStatus;

  @ApiProperty({
    description: "Blockchain status filter",
    enum: BlockchainStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(BlockchainStatus)
  blockchainStatus?: BlockchainStatus;

  @ApiProperty({
    description: "Search term",
    example: "upload",
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: "Start date filter",
    example: "2024-01-01",
    required: false,
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    description: "End date filter",
    example: "2024-01-31",
    required: false,
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({
    description: "Sort by field",
    example: "createdAt",
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: "Sort order",
    example: "DESC",
    required: false,
  })
  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC";
}

export class RewardStatsDto {
  @ApiProperty({
    description: "Total rewards",
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: "Total reward amount",
    example: 1500.5,
  })
  totalAmount: number;

  @ApiProperty({
    description: "Total miles driven",
    example: 15000.5,
  })
  totalMiles: number;

  @ApiProperty({
    description: "Total carbon saved in kg",
    example: 2500.5,
  })
  totalCarbonSaved: number;

  @ApiProperty({
    description: "Rewards by type",
    example: {
      upload: 100,
      badge: 30,
      challenge: 20,
    },
  })
  byType: Record<string, number>;

  @ApiProperty({
    description: "Rewards by status",
    example: {
      pending: 50,
      completed: 100,
      failed: 5,
    },
  })
  byStatus: Record<string, number>;

  @ApiProperty({
    description: "Rewards by blockchain status",
    example: {
      not_sent: 50,
      confirmed: 100,
      failed: 5,
    },
  })
  byBlockchainStatus: Record<string, number>;

  @ApiProperty({
    description: "Average reward amount",
    example: 10.0,
  })
  averageAmount: number;

  @ApiProperty({
    description: "Average miles per reward",
    example: 100.0,
  })
  averageMiles: number;

  @ApiProperty({
    description: "Average carbon saved per reward",
    example: 16.67,
  })
  averageCarbonSaved: number;

  @ApiProperty({
    description: "Most active day",
    example: "2024-01-15",
  })
  mostActiveDay: string;

  @ApiProperty({
    description: "Most active day count",
    example: 8,
  })
  mostActiveDayCount: number;
}

export class BatchRewardDto {
  @ApiProperty({
    description: "User wallet address",
    example: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  })
  @IsString()
  @IsNotEmpty()
  user: string;

  @ApiProperty({
    description: "Miles driven",
    example: 150.5,
  })
  @IsNumber()
  @Min(0)
  miles: number;

  @ApiProperty({
    description: "Reward amount in B3TR tokens",
    example: 10.5,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: "Proof types",
    example: ["image"],
  })
  @IsArray()
  @IsString({ each: true })
  proofTypes: string[];

  @ApiProperty({
    description: "Proof values",
    example: ["hash123"],
  })
  @IsArray()
  @IsString({ each: true })
  proofValues: string[];

  @ApiProperty({
    description: "Impact codes",
    example: ["carbon"],
  })
  @IsArray()
  @IsString({ each: true })
  impactCodes: string[];

  @ApiProperty({
    description: "Impact values",
    example: [2500],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  impactValues: number[];

  @ApiProperty({
    description: "Description",
    example: "Reward for uploading 150 miles",
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
