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

@Entity("rewards")
@Index(["userId", "type"])
@Index(["userId", "status"])
@Index(["blockchainStatus", "createdAt"])
@Index(["cycleId", "createdAt"])
export class Reward {
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
    enum: RewardType,
    nullable: false,
  })
  type: RewardType;

  @Column({
    type: "enum",
    enum: RewardStatus,
    default: RewardStatus.PENDING,
  })
  status: RewardStatus;

  @Column({
    name: "blockchain_status",
    type: "enum",
    enum: BlockchainStatus,
    default: BlockchainStatus.NOT_SENT,
  })
  blockchainStatus: BlockchainStatus;

  @Column({ type: "decimal", precision: 18, scale: 8, nullable: false })
  amount: number; // B3TR tokens amount

  @Column({
    name: "miles_driven",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  milesDriven: number; // Miles driven for this reward

  @Column({
    name: "carbon_saved",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  carbonSaved: number; // Carbon saved in grams

  @Column({ name: "cycle_id", nullable: true })
  cycleId: number; // Blockchain cycle ID

  @Column({ name: "submission_id", nullable: true })
  submissionId: number; // Blockchain submission ID

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ name: "proof_data", type: "json", nullable: true })
  proofData: {
    // Proof types and values for blockchain
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

  @Column({ name: "blockchain_data", type: "json", nullable: true })
  blockchainData: {
    // Blockchain transaction data
    txHash?: {
      txid: string;
      totalDistributed: number;
      batchCount: number;
      totalUsers: number;
    };
    blockNumber?: number;
    gasUsed?: number;
    gasPrice?: string;
    nonce?: number;
    error?: string;
    retryCount?: number;
    lastRetryAt?: Date;
    sentAt?: Date;
  };

  @Column({ type: "json", nullable: true })
  metadata: {
    // Additional metadata
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

  @Column({ name: "processed_at", nullable: true })
  processedAt: Date;

  @Column({ name: "confirmed_at", nullable: true })
  confirmedAt: Date;

  @Column({ name: "failed_at", nullable: true })
  failedAt: Date;

  @Column({ name: "failure_reason", type: "text", nullable: true })
  failureReason: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Virtual properties
  get isPending(): boolean {
    return this.status === RewardStatus.PENDING;
  }

  get isProcessing(): boolean {
    return this.status === RewardStatus.PROCESSING;
  }

  get isCompleted(): boolean {
    return this.status === RewardStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === RewardStatus.FAILED;
  }

  get isCancelled(): boolean {
    return this.status === RewardStatus.CANCELLED;
  }

  get isBlockchainPending(): boolean {
    return this.blockchainStatus === BlockchainStatus.NOT_SENT;
  }

  get isBlockchainSent(): boolean {
    return this.blockchainStatus === BlockchainStatus.SENT;
  }

  get isBlockchainConfirmed(): boolean {
    return this.blockchainStatus === BlockchainStatus.CONFIRMED;
  }

  get isBlockchainFailed(): boolean {
    return this.blockchainStatus === BlockchainStatus.FAILED;
  }

  get canRetry(): boolean {
    return (
      this.isBlockchainFailed &&
      (!this.blockchainData?.retryCount || this.blockchainData.retryCount < 3)
    );
  }

  get formattedAmount(): string {
    return `${this.amount.toFixed(8)} B3TR`;
  }

  get formattedMiles(): string {
    return `${this.milesDriven.toFixed(1)} miles`;
  }

  get formattedCarbonSaved(): string {
    return `${this.carbonSaved.toFixed(2)}g CO2`;
  }

  get carbonSavedKg(): number {
    return this.carbonSaved / 1000;
  }

  get formattedCarbonSavedKg(): string {
    return `${this.carbonSavedKg.toFixed(3)}kg CO2`;
  }

  get rewardPerMile(): number {
    return this.milesDriven > 0 ? this.amount / this.milesDriven : 0;
  }

  get formattedRewardPerMile(): string {
    return `${this.rewardPerMile.toFixed(6)} B3TR/mile`;
  }

  get carbonEfficiency(): number {
    return this.carbonSaved > 0 ? this.amount / this.carbonSavedKg : 0;
  }

  get formattedCarbonEfficiency(): string {
    return `${this.carbonEfficiency.toFixed(4)} B3TR/kg CO2`;
  }

  get processingTime(): number {
    if (this.processedAt && this.createdAt) {
      return this.processedAt.getTime() - this.createdAt.getTime();
    }
    return 0;
  }

  get confirmationTime(): number {
    if (this.confirmedAt && this.processedAt) {
      return this.confirmedAt.getTime() - this.processedAt.getTime();
    }
    return 0;
  }

  get totalProcessingTime(): number {
    if (this.confirmedAt && this.createdAt) {
      return this.confirmedAt.getTime() - this.createdAt.getTime();
    }
    return 0;
  }

  get formattedProcessingTime(): string {
    const time = this.processingTime;
    if (time < 1000) return `${time}ms`;
    if (time < 60000) return `${(time / 1000).toFixed(1)}s`;
    return `${(time / 60000).toFixed(1)}m`;
  }

  get formattedConfirmationTime(): string {
    const time = this.confirmationTime;
    if (time < 1000) return `${time}ms`;
    if (time < 60000) return `${(time / 1000).toFixed(1)}s`;
    return `${(time / 60000).toFixed(1)}m`;
  }

  get formattedTotalProcessingTime(): string {
    const time = this.totalProcessingTime;
    if (time < 1000) return `${time}ms`;
    if (time < 60000) return `${(time / 1000).toFixed(1)}s`;
    return `${(time / 60000).toFixed(1)}m`;
  }

  get typeIcon(): string {
    switch (this.type) {
      case RewardType.UPLOAD:
        return "📸";
      case RewardType.BADGE:
        return "🏆";
      case RewardType.CHALLENGE:
        return "🎯";
      case RewardType.MILESTONE:
        return "🎉";
      case RewardType.LEADERBOARD:
        return "📊";
      case RewardType.BONUS:
        return "🎁";
      case RewardType.REFERRAL:
        return "👥";
      default:
        return "💰";
    }
  }

  get statusColor(): string {
    switch (this.status) {
      case RewardStatus.PENDING:
        return "yellow";
      case RewardStatus.PROCESSING:
        return "blue";
      case RewardStatus.COMPLETED:
        return "green";
      case RewardStatus.FAILED:
        return "red";
      case RewardStatus.CANCELLED:
        return "gray";
      default:
        return "gray";
    }
  }

  get blockchainStatusColor(): string {
    switch (this.blockchainStatus) {
      case BlockchainStatus.NOT_SENT:
        return "gray";
      case BlockchainStatus.SENT:
        return "blue";
      case BlockchainStatus.CONFIRMED:
        return "green";
      case BlockchainStatus.FAILED:
        return "red";
      default:
        return "gray";
    }
  }

  get canBeCancelled(): boolean {
    return this.isPending && this.isBlockchainPending;
  }

  get canBeRetried(): boolean {
    return this.isBlockchainFailed && this.canRetry;
  }
}
