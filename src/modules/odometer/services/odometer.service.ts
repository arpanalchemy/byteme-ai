import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { S3Service } from "../../../common/upload/s3.service";
import { OpenAIService } from "../../../common/ai/openai.service";
import { RedisService } from "../../../common/cache/redis.service";
import { AwsTextractService } from "../../../common/ocr/aws-textract.service";

import {
  OdometerUpload,
  UploadStatus,
  ValidationStatus,
} from "../entity/odometer-upload.entity";
import { Vehicle } from "../../vehicles/entity/vehicle.entity";
import { User } from "../../users/entity/user.entity";
import {
  UploadOdometerDto,
  VehicleMatchResultDto,
  ProcessingResultDto,
  UserStatsDto,
} from "../dto/upload-odometer.dto";

@Injectable()
export class OdometerService {
  private readonly logger = new Logger(OdometerService.name);

  constructor(
    @InjectRepository(OdometerUpload)
    private readonly odometerUploadRepository: Repository<OdometerUpload>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly s3Service: S3Service,
    private readonly openaiService: OpenAIService,
    private readonly redisService: RedisService,
    private readonly awsTextractService: AwsTextractService,
  ) {}

  /**
   * Upload and process odometer image
   */
  async uploadOdometer(
    file: Express.Multer.File,
    userId: string,
    uploadDto: UploadOdometerDto,
  ): Promise<ProcessingResultDto> {
    const startTime = Date.now();

    try {
      this.logger.log(`Starting odometer upload for user: ${userId}`);

      // Validate file
      this.validateUploadFile(file);

      // Upload to S3
      const uploadResult = await this.s3Service.uploadImage(
        file,
        userId,
        uploadDto.vehicleId,
      );

      // Create upload record
      const upload = this.odometerUploadRepository.create({
        userId,
        vehicleId: uploadDto.vehicleId,
        s3ImageUrl: uploadResult.url,
        s3ThumbnailUrl: uploadResult.thumbnailUrl,
        imageHash: this.redisService.generateImageHash(uploadResult.url),
        status: UploadStatus.PROCESSING,
        fileSizeBytes: file.size,
        imageDimensions: `${file.buffer.length}x${file.buffer.length}`, // Placeholder
      });

      const savedUpload = await this.odometerUploadRepository.save(upload);

      // Process the upload asynchronously
      void this.processUploadAsync(savedUpload.id);

      const processingTime = Date.now() - startTime;

      return {
        uploadId: savedUpload.id,
        status: UploadStatus.PROCESSING,
        processingTime,
      };
    } catch (error) {
      this.logger.error(`Upload failed for user ${userId}: ${error.message}`);
      throw new BadRequestException("Upload failed: " + error.message);
    }
  }

  /**
   * Process upload asynchronously
   */
  private async processUploadAsync(uploadId: string): Promise<void> {
    try {
      this.logger.log(`Processing upload: ${uploadId}`);

      const upload = await this.odometerUploadRepository.findOne({
        where: { id: uploadId },
      });
      if (!upload) {
        throw new NotFoundException("Upload not found");
      }

      const startTime = Date.now();

      // Step 1: OCR Processing (placeholder for now)
      const ocrStartTime = Date.now();
      const ocrResult = await this.processOcr(upload);
      const ocrTime = Date.now() - ocrStartTime;

      // Step 2: OpenAI Analysis
      const aiStartTime = Date.now();
      const aiResults = await this.processAiAnalysis(upload);
      const aiTime = Date.now() - aiStartTime;

      // Step 3: Vehicle Matching
      const vehicleMatch = await this.matchVehicle(
        upload,
        aiResults.vehicleDetection,
      );

      // Step 4: Mileage Validation
      const validationResult = await this.validateMileage(upload, ocrResult);

      // Step 5: Calculate carbon savings
      const carbonSaved = await this.calculateCarbonSaved(
        upload,
        validationResult.finalMileage,
      );

      // Update upload with results
      await this.updateUploadWithResults(upload, {
        ocrResult,
        aiResults,
        vehicleMatch,
        validationResult,
        carbonSaved,
        processingTime: Date.now() - startTime,
        ocrTime,
        aiTime,
      });

      this.logger.log(`Upload ${uploadId} processed successfully`);
    } catch (error) {
      this.logger.error(
        `Failed to process upload ${uploadId}: ${error.message}`,
      );
      await this.markUploadAsFailed(uploadId, error.message);
    }
  }

  /**
   * Process OCR on image
   */
  private async processOcr(upload: OdometerUpload): Promise<{
    extractedMileage: number;
    confidence: number;
    rawText: string;
    extractedNumbers: string[];
  }> {
    try {
      this.logger.log("Processing OCR using AWS Textract");

      // Download image from S3
      const imageBuffer = await this.downloadImageFromS3(upload.s3ImageUrl);

      // Process with AWS Textract
      const ocrResult =
        await this.awsTextractService.extractOdometerReading(imageBuffer);

      this.logger.log(
        `OCR completed: ${ocrResult.mileage} miles (confidence: ${ocrResult.confidence}%)`,
      );

      return {
        extractedMileage: ocrResult.mileage,
        confidence: ocrResult.confidence / 100, // Convert percentage to decimal
        rawText: ocrResult.rawText,
        extractedNumbers: [ocrResult.rawText],
      };
    } catch (error) {
      this.logger.error(`OCR processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process AI analysis
   */
  private async processAiAnalysis(upload: OdometerUpload): Promise<{
    analysis: any;
    vehicleDetection: any;
  }> {
    try {
      const imageHash = this.redisService.generateImageHash(upload.s3ImageUrl);

      // Check cache first
      let analysis = await this.redisService.getAnalysisCache(imageHash);
      let vehicleDetection =
        await this.redisService.getVehicleDetectionCache(imageHash);

      if (!analysis) {
        analysis = await this.openaiService.analyzeOdometerImage(
          upload.s3ImageUrl,
        );
        await this.redisService.setAnalysisCache(imageHash, analysis);
      }

      if (!vehicleDetection) {
        vehicleDetection = await this.openaiService.detectVehicle(
          upload.s3ImageUrl,
        );
        await this.redisService.setVehicleDetectionCache(
          imageHash,
          vehicleDetection,
        );
      }

      return { analysis, vehicleDetection };
    } catch (error) {
      this.logger.error(`AI analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Match vehicle or suggest new one
   */
  private async matchVehicle(
    upload: OdometerUpload,
    vehicleDetection: any,
  ): Promise<VehicleMatchResultDto> {
    try {
      // If user already specified a vehicle, use it
      if (upload.vehicleId) {
        const vehicle = await this.vehicleRepository.findOne({
          where: { id: upload.vehicleId },
        });
        if (vehicle) {
          return {
            matchedVehicle: {
              id: vehicle.id,
              displayName: vehicle.displayName,
              vehicleType: vehicle.vehicleType,
              confidence: 1.0,
            },
            requiresUserInput: false,
          };
        }
      }

      // Try to match with existing vehicles
      const userVehicles = await this.vehicleRepository.find({
        where: { userId: upload.userId, isActive: true },
      });

      let bestMatch: Vehicle | null = null;
      let bestConfidence = 0;

      for (const vehicle of userVehicles) {
        const confidence = this.calculateVehicleMatchConfidence(
          vehicle,
          vehicleDetection,
        );
        if (confidence > bestConfidence && confidence > 0.7) {
          bestMatch = vehicle;
          bestConfidence = confidence;
        }
      }

      if (bestMatch) {
        return {
          matchedVehicle: {
            id: bestMatch.id,
            displayName: bestMatch.displayName,
            vehicleType: bestMatch.vehicleType,
            confidence: bestConfidence,
          },
          requiresUserInput: false,
        };
      }

      // Suggest new vehicle
      return {
        suggestedNewVehicle: {
          vehicleType: vehicleDetection.vehicleType,
          make: vehicleDetection.make,
          model: vehicleDetection.model,
          confidence: vehicleDetection.confidence,
        },
        requiresUserInput: true,
      };
    } catch (error) {
      this.logger.error(`Vehicle matching failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate vehicle match confidence
   */
  private calculateVehicleMatchConfidence(
    vehicle: Vehicle,
    detection: any,
  ): number {
    let confidence = 0;

    // Vehicle type match
    if (vehicle.vehicleType === detection.vehicleType) {
      confidence += 0.4;
    }

    // Make match
    if (
      vehicle.make &&
      detection.make &&
      vehicle.make.toLowerCase() === detection.make.toLowerCase()
    ) {
      confidence += 0.3;
    }

    // Model match
    if (
      vehicle.model &&
      detection.model &&
      vehicle.model.toLowerCase() === detection.model.toLowerCase()
    ) {
      confidence += 0.3;
    }

    return confidence;
  }

  /**
   * Validate mileage
   */
  private async validateMileage(
    upload: OdometerUpload,
    ocrResult: any,
  ): Promise<any> {
    try {
      const previousMileage = await this.getPreviousMileage(
        upload.userId,
        upload.vehicleId,
      );

      // Placeholder validation - will be replaced with actual validation later
      const validation = {
        isValid: true,
        reason: "Placeholder validation - OCR service not available",
      };

      // AI validation if available
      let aiValidation: any = null;
      if (upload.s3ImageUrl) {
        try {
          aiValidation = await this.openaiService.validateOcrResult(
            upload.s3ImageUrl,
            ocrResult.extractedMileage.toString(),
          );
        } catch (error) {
          this.logger.warn(`AI validation failed: ${error.message}`);
        }
      }

      const finalMileage = aiValidation?.suggestedMileage
        ? parseFloat(aiValidation.suggestedMileage)
        : ocrResult.extractedMileage;

      const finalConfidence = aiValidation
        ? (ocrResult.confidence + aiValidation.confidence) / 2
        : ocrResult.confidence;

      return {
        isValid: validation.isValid,
        confidence: finalConfidence,
        finalMileage,
        previousMileage,
        mileageDifference: previousMileage ? finalMileage - previousMileage : 0,
        validationNotes: validation.reason,
        aiValidation,
      };
    } catch (error) {
      this.logger.error(`Mileage validation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get previous mileage for user/vehicle
   */
  private async getPreviousMileage(
    userId: string,
    vehicleId?: string,
  ): Promise<number | undefined> {
    try {
      const query = this.odometerUploadRepository
        .createQueryBuilder("upload")
        .where("upload.userId = :userId", { userId })
        .andWhere("upload.isApproved = :isApproved", { isApproved: true })
        .orderBy("upload.createdAt", "DESC")
        .limit(1);

      if (vehicleId) {
        query.andWhere("upload.vehicleId = :vehicleId", { vehicleId });
      }

      const lastUpload = await query.getOne();
      return lastUpload?.finalMileage;
    } catch (error) {
      this.logger.error(`Failed to get previous mileage: ${error.message}`);
      return undefined;
    }
  }

  /**
   * Calculate carbon saved
   */
  private async calculateCarbonSaved(
    upload: OdometerUpload,
    mileage: number,
  ): Promise<number> {
    try {
      if (!mileage || !upload.vehicleId) {
        return 0;
      }

      const vehicle = await this.vehicleRepository.findOne({
        where: { id: upload.vehicleId },
      });

      if (!vehicle) {
        return 0;
      }

      const previousMileage = await this.getPreviousMileage(
        upload.userId,
        upload.vehicleId,
      );
      if (!previousMileage) {
        return 0;
      }

      const distance = mileage - previousMileage;
      return distance * vehicle.emissionFactor;
    } catch (error) {
      this.logger.error(`Carbon calculation failed: ${error.message}`);
      return 0;
    }
  }

  /**
   * Update upload with processing results
   */
  private async updateUploadWithResults(
    upload: OdometerUpload,
    results: any,
  ): Promise<void> {
    try {
      upload.status = UploadStatus.COMPLETED;
      upload.validationStatus = results.validationResult.isValid
        ? ValidationStatus.APPROVED
        : ValidationStatus.REJECTED;
      upload.isApproved = results.validationResult.isValid;

      upload.extractedMileage = results.ocrResult.extractedMileage;
      upload.ocrConfidenceScore = results.ocrResult.confidence;
      upload.ocrRawText = results.ocrResult.rawText;

      upload.openaiAnalysis = results.aiResults.analysis;
      upload.vehicleDetected = results.aiResults.vehicleDetection;
      upload.aiValidationResult = results.validationResult.aiValidation;

      upload.finalMileage = results.validationResult.finalMileage;
      upload.mileageDifference = results.validationResult.mileageDifference;
      upload.carbonSaved = results.carbonSaved;

      upload.processingTimeMs = results.processingTime;
      upload.ocrProcessingTimeMs = results.ocrTime;
      upload.aiProcessingTimeMs = results.aiTime;

      upload.processedAt = new Date();
      upload.validationNotes = results.validationResult.validationNotes;

      await this.odometerUploadRepository.save(upload);
    } catch (error) {
      this.logger.error(`Failed to update upload results: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mark upload as failed
   */
  private async markUploadAsFailed(
    uploadId: string,
    errorMessage: string,
  ): Promise<void> {
    try {
      await this.odometerUploadRepository.update(uploadId, {
        status: UploadStatus.FAILED,
        validationStatus: ValidationStatus.REJECTED,
        validationNotes: errorMessage,
      });
    } catch (error) {
      this.logger.error(`Failed to mark upload as failed: ${error.message}`);
    }
  }

  /**
   * Validate upload file
   */
  private validateUploadFile(file: Express.Multer.File): void {
    if (!this.s3Service.validateFileType(file.mimetype)) {
      throw new BadRequestException(
        "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
      );
    }

    if (!this.s3Service.validateFileSize(file.size)) {
      throw new BadRequestException("File too large. Maximum size is 10MB.");
    }
  }

  /**
   * Download image from S3 (placeholder - would need S3 client implementation)
   */
  private async downloadImageFromS3(_url: string): Promise<Buffer> {
    // This is a placeholder - in production you would implement S3 download
    // For now, we'll return a dummy buffer
    return Buffer.from("dummy image data");
  }

  /**
   * Get upload by ID
   */
  async getUploadById(
    uploadId: string,
    userId?: string,
  ): Promise<OdometerUpload> {
    const whereClause: any = { id: uploadId };
    if (userId) {
      whereClause.userId = userId;
    }
    const upload = await this.odometerUploadRepository.findOne({
      where: whereClause,
    });

    if (!upload) {
      throw new NotFoundException("Upload not found");
    }

    return upload;
  }

  /**
   * Get user uploads
   */
  async getUserUploads(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<OdometerUpload[]> {
    return this.odometerUploadRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserStatsDto> {
    try {
      // Get total uploads
      const totalUploads = await this.odometerUploadRepository.count({
        where: { userId },
      });

      // Get approved uploads
      const approvedUploads = await this.odometerUploadRepository.count({
        where: { userId, isApproved: true },
      });

      // Get total mileage and carbon saved
      const mileageStats = await this.odometerUploadRepository
        .createQueryBuilder("upload")
        .select([
          "SUM(upload.finalMileage) as totalMileage",
          "SUM(upload.carbonSaved) as totalCarbonSaved",
          "AVG(upload.ocrConfidenceScore) as averageConfidence",
        ])
        .where("upload.userId = :userId", { userId })
        .andWhere("upload.isApproved = :isApproved", { isApproved: true })
        .getRawOne();

      // Get total vehicles
      const totalVehicles = await this.vehicleRepository.count({
        where: { userId, isActive: true },
      });

      // Get monthly stats for the last 6 months
      const monthlyStats = await this.odometerUploadRepository
        .createQueryBuilder("upload")
        .select([
          'DATE_FORMAT(upload.createdAt, "%Y-%m") as month',
          "COUNT(*) as uploads",
          "SUM(upload.finalMileage) as mileage",
          "SUM(upload.carbonSaved) as carbonSaved",
        ])
        .where("upload.userId = :userId", { userId })
        .andWhere("upload.createdAt >= :sixMonthsAgo", {
          sixMonthsAgo: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
        })
        .groupBy("month")
        .orderBy("month", "DESC")
        .getRawMany();

      // Get recent activity (last 10 uploads)
      const recentActivity = await this.odometerUploadRepository.find({
        where: { userId },
        select: ["id", "status", "finalMileage", "carbonSaved", "createdAt"],
        order: { createdAt: "DESC" },
        take: 10,
      });

      return {
        totalUploads,
        approvedUploads,
        totalMileage: parseFloat(mileageStats?.totalMileage || "0"),
        totalCarbonSaved: parseFloat(mileageStats?.totalCarbonSaved || "0"),
        averageConfidence: parseFloat(mileageStats?.averageConfidence || "0"),
        totalVehicles,
        monthlyStats: monthlyStats.map((stat) => ({
          month: stat.month,
          uploads: parseInt(stat.uploads),
          mileage: parseFloat(stat.mileage || "0"),
          carbonSaved: parseFloat(stat.carbonSaved || "0"),
        })),
        recentActivity: recentActivity.map((activity) => ({
          uploadId: activity.id,
          status: activity.status,
          mileage: activity.finalMileage,
          carbonSaved: activity.carbonSaved,
          createdAt: activity.createdAt,
        })),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get user stats for ${userId}: ${error.message}`,
      );
      throw new BadRequestException("Failed to retrieve user statistics");
    }
  }
}
