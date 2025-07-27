import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
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

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @Index()
  @Column({ name: "user_id", nullable: true })
  userId?: string;

  @ManyToOne(() => Vehicle, { onDelete: "SET NULL" })
  vehicle: Vehicle;

  @Index()
  @Column({ name: "vehicle_id", nullable: true })
  vehicleId?: string;

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
}
