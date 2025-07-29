import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
} from "class-validator";

export enum RewardType {
  UPLOAD = "upload",
  BADGE = "badge",
  CHALLENGE = "challenge",
  MILESTONE = "milestone",
  LEADERBOARD = "leaderboard",
  BONUS = "bonus",
  REFERRAL = "referral",
}

export enum RewardStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum BlockchainStatus {
  NOT_SENT = "not_sent",
  SENT = "sent",
  CONFIRMED = "confirmed",
  FAILED = "failed",
}

export class CreateRewardDto {
  @IsUUID()
  userId: string;

  @IsEnum(RewardType)
  type: RewardType;

  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  milesDriven?: number;

  @IsOptional()
  @IsNumber()
  carbonSaved?: number;

  @IsOptional()
  @IsNumber()
  cycleId?: number;

  @IsOptional()
  @IsNumber()
  submissionId?: number;

  @IsOptional()
  proofData?: any;

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
    // Upload-specific metadata
    vehicleName?: string;
    uploadDate?: Date;
    processingTime?: number;
    ocrConfidence?: number;
    mileageDifference?: number;
    previousMileage?: number;
    // Transaction details
    transactionDetails?: {
      txid: string;
      blockNumber: number;
      blockTime: Date;
      from: string;
      to: string;
      value: string;
      gasUsed: number;
      gasPrice: string;
      status: "success" | "failed" | "pending";
      confirmations: number;
      receipt: {
        contractAddress?: string;
        cumulativeGasUsed: number;
        effectiveGasPrice: string;
        logs: Array<{
          address: string;
          topics: string[];
          data: string;
          logIndex: number;
          transactionIndex: number;
          blockNumber: number;
          blockHash: string;
          transactionHash: string;
          removed: boolean;
        }>;
        logsBloom: string;
        status: number;
        transactionHash: string;
        transactionIndex: number;
        type: number;
      };
      input: string;
      nonce: number;
      hash: string;
      r: string;
      s: string;
      v: number;
      network: string;
      timestamp: Date;
    };
    lastTransactionCheck?: Date;
    lastTransactionCheckError?: string;
  };

  @IsOptional()
  @IsDateString()
  processedAt?: string;
}

export class UpdateRewardDto {
  @IsOptional()
  @IsEnum(RewardType)
  type?: RewardType;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RewardStatus)
  status?: RewardStatus;

  @IsOptional()
  @IsEnum(BlockchainStatus)
  blockchainStatus?: BlockchainStatus;

  @IsOptional()
  @IsString()
  transactionHash?: string;

  @IsOptional()
  @IsDateString()
  processedAt?: string;
}

export class RewardResponseDto {
  id: string;
  userId: string;
  type: RewardType;
  status: RewardStatus;
  blockchainStatus: BlockchainStatus;
  amount: number;
  description: string;
  milesDriven: number;
  carbonSaved: number;
  cycleId: number;
  submissionId: number;
  proofData?: any;
  blockchainData?: any;
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
    // Upload-specific metadata
    vehicleName?: string;
    uploadDate?: Date;
    processingTime?: number;
    ocrConfidence?: number;
    mileageDifference?: number;
    previousMileage?: number;
    // Transaction details
    transactionDetails?: {
      txid: string;
      blockNumber: number;
      blockTime: Date;
      from: string;
      to: string;
      value: string;
      gasUsed: number;
      gasPrice: string;
      status: "success" | "failed" | "pending";
      confirmations: number;
      receipt: {
        contractAddress?: string;
        cumulativeGasUsed: number;
        effectiveGasPrice: string;
        logs: Array<{
          address: string;
          topics: string[];
          data: string;
          logIndex: number;
          transactionIndex: number;
          blockNumber: number;
          blockHash: string;
          transactionHash: string;
          removed: boolean;
        }>;
        logsBloom: string;
        status: number;
        transactionHash: string;
        transactionIndex: number;
        type: number;
      };
      input: string;
      nonce: number;
      hash: string;
      r: string;
      s: string;
      v: number;
      network: string;
      timestamp: Date;
    };
    lastTransactionCheck?: Date;
    lastTransactionCheckError?: string;
  };
  transactionHash?: string;
  processedAt?: Date;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  failedAt?: Date;
  failureReason?: string;
  isPending: boolean;
  isProcessing: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isCancelled: boolean;
  isBlockchainPending: boolean;
  isBlockchainSent: boolean;
  isBlockchainConfirmed: boolean;
  isBlockchainFailed: boolean;
  canRetry: boolean;
  canBeRetried: boolean;
  formattedAmount: string;
  formattedMiles: string;
  formattedCarbonSaved: string;
  carbonSavedKg: number;
  formattedCarbonSavedKg: string;
  rewardPerMile: number;
  formattedRewardPerMile: string;
  carbonEfficiency: number;
  formattedCarbonEfficiency: string;
  processingTime: number;
  confirmationTime: number;
  totalProcessingTime: number;
  formattedProcessingTime: string;
  formattedConfirmationTime: string;
  formattedTotalProcessingTime: string;
  typeIcon: string;
  statusColor: string;
  blockchainStatusColor: string;
  canBeCancelled: boolean;
}

export class RewardQueryDto {
  @IsOptional()
  @IsEnum(RewardType)
  type?: RewardType;

  @IsOptional()
  @IsEnum(RewardStatus)
  status?: RewardStatus;

  @IsOptional()
  @IsEnum(BlockchainStatus)
  blockchainStatus?: BlockchainStatus;

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
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC";
}

export class RewardStatsDto {
  total: number;
  totalAmount: number;
  totalMiles: number;
  totalCarbonSaved: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byBlockchainStatus: Record<string, number>;
  averageAmount: number;
  averageMiles: number;
  averageCarbonSaved: number;
  mostActiveDay: string;
  mostActiveDayCount: number;
}

export class BatchRewardDto {
  @IsString()
  user: string;

  @IsNumber()
  miles: number;

  @IsNumber()
  amount: number;

  @IsString({ each: true })
  proofTypes: string[];

  @IsString({ each: true })
  proofValues: string[];

  @IsString({ each: true })
  impactCodes: string[];

  @IsNumber({}, { each: true })
  impactValues: number[];

  @IsString()
  description: string;
}
