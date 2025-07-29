import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entity/user.entity";
import { Vehicle } from "../../vehicles/entity/vehicle.entity";

export enum UploadStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  REJECTED = "rejected",
}

export enum ValidationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  FLAGGED = "flagged",
}

@Entity("odometer_uploads")
export class OdometerUpload {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "user_id" })
  @Index()
  user: User;

  @ManyToOne(() => Vehicle, {
    onDelete: "SET NULL",
    nullable: true,
  })
  @JoinColumn({ name: "vehicle_id" })
  @Index()
  vehicle: Vehicle;
  // Image URLs
  @Column({ name: "s3_image_url" })
  s3ImageUrl: string;

  @Column({ name: "s3_thumbnail_url" })
  s3ThumbnailUrl: string;

  @Column({ name: "image_hash", nullable: true })
  imageHash?: string;

  // OCR Results
  @Column({
    name: "extracted_mileage",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  extractedMileage?: number;

  @Column({
    name: "ocr_confidence_score",
    type: "decimal",
    precision: 3,
    scale: 2,
    nullable: true,
  })
  ocrConfidenceScore?: number;

  @Column({ name: "ocr_raw_text", nullable: true })
  ocrRawText?: string;

  // OpenAI Analysis
  @Column({ name: "openai_analysis", type: "json", nullable: true })
  openaiAnalysis?: {
    vehicleType: string;
    estimatedMake?: string;
    estimatedModel?: string;
    imageQuality: string;
    mileageReadable: boolean;
    confidenceScore: number;
    additionalInsights: string;
    vehicleFeatures: string[];
  };

  @Column({ name: "vehicle_detected", type: "json", nullable: true })
  vehicleDetected?: {
    vehicleType: string;
    make?: string;
    model?: string;
    year?: number;
    features: string[];
    confidence: number;
  };

  @Column({ name: "ai_validation_result", type: "json", nullable: true })
  aiValidationResult?: {
    isValid: boolean;
    confidence: number;
    suggestedMileage?: string;
    reasoning?: string;
  };

  // Validation and Status
  @Column({
    type: "enum",
    enum: UploadStatus,
    default: UploadStatus.PENDING,
  })
  status: UploadStatus;

  @Column({
    name: "validation_status",
    type: "enum",
    enum: ValidationStatus,
    default: ValidationStatus.PENDING,
  })
  validationStatus: ValidationStatus;

  @Column({ name: "validation_notes", nullable: true })
  validationNotes?: string;

  @Column({ name: "is_approved", default: false })
  isApproved: boolean;

  // Mileage and Carbon Data
  @Column({
    name: "final_mileage",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  finalMileage?: number;

  @Column({
    name: "mileage_difference",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  mileageDifference?: number;

  @Column({
    name: "carbon_saved",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  carbonSaved: number;

  @Column({
    name: "emission_factor_used",
    type: "decimal",
    precision: 10,
    scale: 4,
    nullable: true,
  })
  emissionFactorUsed?: number;

  // Processing Metadata
  @Column({ name: "processing_time_ms", nullable: true })
  processingTimeMs?: number;

  @Column({ name: "ocr_processing_time_ms", nullable: true })
  ocrProcessingTimeMs?: number;

  @Column({ name: "ai_processing_time_ms", nullable: true })
  aiProcessingTimeMs?: number;

  @Column({ name: "file_size_bytes", nullable: true })
  fileSizeBytes?: number;

  @Column({ name: "image_dimensions", nullable: true })
  imageDimensions?: string; // "1920x1080"

  // Timestamps
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @Column({ name: "processed_at", nullable: true })
  processedAt?: Date;

  // Virtual properties
  get isProcessed(): boolean {
    return this.status === UploadStatus.COMPLETED;
  }

  get isRejected(): boolean {
    return (
      this.status === UploadStatus.REJECTED ||
      this.validationStatus === ValidationStatus.REJECTED
    );
  }

  get isPending(): boolean {
    return this.status === UploadStatus.PENDING;
  }

  get isProcessing(): boolean {
    return this.status === UploadStatus.PROCESSING;
  }

  get isFailed(): boolean {
    return this.status === UploadStatus.FAILED;
  }

  get isValidationApproved(): boolean {
    return this.validationStatus === ValidationStatus.APPROVED;
  }

  get isFlagged(): boolean {
    return this.validationStatus === ValidationStatus.FLAGGED;
  }

  get processingTimeSeconds(): number {
    return this.processingTimeMs ? this.processingTimeMs / 1000 : 0;
  }

  get carbonSavedFormatted(): string {
    return `${this.carbonSaved.toFixed(2)} kg CO₂`;
  }

  get mileageFormatted(): string {
    return this.finalMileage ? `${this.finalMileage.toFixed(1)} km` : "N/A";
  }

  get imageUrl(): string {
    return this.s3ImageUrl;
  }

  get thumbnailUrl(): string {
    return this.s3ThumbnailUrl;
  }

  get hasUser(): boolean {
    return !!this.user;
  }

  get userId(): string {
    return this.user?.id;
  }

  get vehicleId(): string {
    return this.vehicle?.id;
  }

  get hasVehicle(): boolean {
    return !!this.vehicle;
  }

  get isAnonymous(): boolean {
    return !this.user;
  }

  get canBeLinked(): boolean {
    return this.isAnonymous && this.status === UploadStatus.COMPLETED;
  }

  get totalProcessingTime(): number {
    const ocrTime = this.ocrProcessingTimeMs || 0;
    const aiTime = this.aiProcessingTimeMs || 0;
    return ocrTime + aiTime;
  }

  get totalProcessingTimeSeconds(): number {
    return this.totalProcessingTime / 1000;
  }

  get mileageDifferenceFormatted(): string {
    if (!this.mileageDifference) return "N/A";
    return `${this.mileageDifference.toFixed(1)} km`;
  }

  get extractedMileageFormatted(): string {
    if (!this.extractedMileage) return "N/A";
    return `${this.extractedMileage.toFixed(1)} km`;
  }

  get confidenceScorePercentage(): number {
    if (!this.ocrConfidenceScore) return 0;
    return Math.round(this.ocrConfidenceScore * 100);
  }

  get aiConfidenceScorePercentage(): number {
    if (!this.aiValidationResult?.confidence) return 0;
    return Math.round(this.aiValidationResult.confidence * 100);
  }

  // Business logic methods
  canBeProcessed(): boolean {
    return this.status === UploadStatus.PENDING && !!this.s3ImageUrl;
  }

  canBeApproved(): boolean {
    return (
      this.status === UploadStatus.COMPLETED &&
      this.validationStatus === ValidationStatus.PENDING &&
      !!this.finalMileage &&
      this.finalMileage > 0
    );
  }

  canBeRejected(): boolean {
    return (
      this.status === UploadStatus.COMPLETED &&
      this.validationStatus === ValidationStatus.PENDING
    );
  }

  hasValidMileage(): boolean {
    return (
      !!this.finalMileage &&
      this.finalMileage > 0 &&
      this.finalMileage <= 999999
    );
  }

  hasValidCarbonData(): boolean {
    return this.carbonSaved >= 0;
  }

  getProcessingStatus(): string {
    if (this.isFailed) return "Failed";
    if (this.isRejected) return "Rejected";
    if (this.isProcessed) return "Completed";
    if (this.isProcessing) return "Processing";
    if (this.isPending) return "Pending";
    return "Unknown";
  }

  getValidationStatus(): string {
    if (this.isValidationApproved) return "Approved";
    if (this.isRejected) return "Rejected";
    if (this.isFlagged) return "Flagged";
    return "Pending";
  }

  getFormattedFileSize(): string {
    if (!this.fileSizeBytes) return "Unknown";
    const bytes = this.fileSizeBytes;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  getImageDimensions(): { width: number; height: number } | null {
    if (!this.imageDimensions) return null;
    const [width, height] = this.imageDimensions.split("x").map(Number);
    return { width, height };
  }

  getVehicleInfo(): string {
    if (this.vehicleDetected) {
      const { make, model, year } = this.vehicleDetected;
      return [year, make, model].filter(Boolean).join(" ") || "Unknown Vehicle";
    }
    return "Unknown Vehicle";
  }

  getAIAnalysisSummary(): string {
    if (!this.openaiAnalysis) return "No AI analysis available";
    const { vehicleType, imageQuality, mileageReadable, confidenceScore } =
      this.openaiAnalysis;
    return `${vehicleType} - ${imageQuality} quality - Mileage ${mileageReadable ? "readable" : "not readable"} (${Math.round(confidenceScore * 100)}% confidence)`;
  }
}
