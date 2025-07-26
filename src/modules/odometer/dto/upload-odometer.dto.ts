import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
  Min,
  Max,
  IsUUID,
} from "class-validator";
import { VehicleType } from "../../vehicles/entity/vehicle.entity";

export class UploadOdometerDto {
  @ApiPropertyOptional({
    description: "Vehicle ID",
    example: "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional({
    description: "Upload notes",
    example: "Morning commute",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ProcessOdometerDto {
  @ApiProperty({
    description: "Image URL",
    example: "https://example.com/odometer-image.jpg",
  })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({
    description: "Vehicle ID",
    example: "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional({
    description: "Processing notes",
    example: "Highway trip",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateVehicleFromUploadDto {
  @ApiProperty({
    description: "Vehicle type",
    enum: VehicleType,
    example: VehicleType.CAR,
  })
  @IsEnum(VehicleType)
  @IsNotEmpty()
  vehicleType: VehicleType;

  @ApiPropertyOptional({
    description: "Custom name for the vehicle (user-defined)",
    example: "My Tesla",
  })
  @IsOptional()
  @IsString()
  customName?: string;

  @ApiPropertyOptional({
    description: "Vehicle manufacturer",
    example: "Tesla",
  })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({ description: "Vehicle model", example: "Model 3" })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: "Vehicle year",
    example: 2023,
    minimum: 1900,
    maximum: 2030,
  })
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(2030)
  year?: number;

  @ApiPropertyOptional({
    description: "License plate number",
    example: "ABC123",
  })
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @ApiPropertyOptional({
    description: "Emission factor",
    example: 0.2,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  emissionFactor?: number;
}

export class ValidateMileageDto {
  @ApiProperty({
    description: "Extracted mileage",
    example: 15000.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  extractedMileage: number;

  @ApiProperty({
    description: "OCR confidence score",
    example: 85.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  confidence: number;

  @ApiPropertyOptional({
    description: "Vehicle ID",
    example: "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional({
    description: "Previous mileage",
    example: 14950.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  previousMileage?: number;
}

export class OdometerUploadResponseDto {
  @ApiProperty({
    description: "Upload ID",
    example: "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  })
  id: string;

  @ApiProperty({ description: "Upload status", example: "processed" })
  status: string;

  @ApiProperty({
    description: "Image URL",
    example: "https://example.com/odometer-image.jpg",
  })
  imageUrl: string;

  @ApiProperty({
    description: "Thumbnail URL",
    example: "https://example.com/odometer-thumbnail.jpg",
  })
  thumbnailUrl: string;

  @ApiPropertyOptional({ description: "Extracted mileage", example: 15000.5 })
  extractedMileage?: number;

  @ApiPropertyOptional({ description: "OCR confidence score", example: 85.5 })
  confidence?: number;

  @ApiPropertyOptional({ description: "Carbon saved", example: 25.5 })
  carbonSaved?: number;

  @ApiPropertyOptional({
    description: "Processing time in seconds",
    example: 2.5,
  })
  processingTime?: number;

  @ApiProperty({
    description: "Creation date",
    example: "2024-01-15T10:30:00Z",
  })
  createdAt: Date;
}

export class VehicleMatchResultDto {
  @ApiPropertyOptional({
    description: "Matched vehicle",
    type: "object",
    additionalProperties: true,
  })
  matchedVehicle?: {
    id: string;
    displayName: string;
    vehicleType: string;
    confidence: number;
  };

  @ApiPropertyOptional({
    description: "Suggested new vehicle",
    type: "object",
    additionalProperties: true,
  })
  suggestedNewVehicle?: {
    vehicleType: string;
    make?: string;
    model?: string;
    confidence: number;
  };

  @ApiProperty({ description: "Whether user input is required", example: true })
  requiresUserInput: boolean;
}

export class ProcessingResultDto {
  @ApiProperty({
    description: "Upload ID",
    example: "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  })
  uploadId: string;

  @ApiProperty({ description: "Processing status", example: "completed" })
  status: string;

  @ApiPropertyOptional({ description: "Extracted mileage", example: 15000.5 })
  extractedMileage?: number;

  @ApiPropertyOptional({ description: "OCR confidence score", example: 85.5 })
  confidence?: number;

  @ApiPropertyOptional({
    description: "Vehicle match result",
    type: VehicleMatchResultDto,
  })
  vehicleMatch?: VehicleMatchResultDto;

  @ApiPropertyOptional({ description: "Carbon saved", example: 25.5 })
  carbonSaved?: number;

  @ApiProperty({ description: "Processing time in seconds", example: 2.5 })
  processingTime: number;

  @ApiPropertyOptional({
    description: "Validation notes",
    example: "Mileage seems reasonable",
  })
  validationNotes?: string;
}

export class UserStatsDto {
  @ApiProperty({ description: "Total uploads", example: 45 })
  totalUploads: number;

  @ApiProperty({ description: "Approved uploads", example: 42 })
  approvedUploads: number;

  @ApiProperty({ description: "Total mileage", example: 15000.5 })
  totalMileage: number;

  @ApiProperty({ description: "Total carbon saved", example: 2500.1 })
  totalCarbonSaved: number;

  @ApiProperty({ description: "Average confidence score", example: 87.5 })
  averageConfidence: number;

  @ApiProperty({ description: "Total vehicles", example: 3 })
  totalVehicles: number;

  @ApiProperty({
    description: "Monthly statistics",
    type: "array",
    items: { type: "object", additionalProperties: true },
  })
  monthlyStats: {
    month: string;
    uploads: number;
    mileage: number;
    carbonSaved: number;
  }[];

  @ApiProperty({
    description: "Recent activity",
    type: "array",
    items: { type: "object", additionalProperties: true },
  })
  recentActivity: {
    uploadId: string;
    status: string;
    mileage?: number;
    carbonSaved?: number;
    createdAt: Date;
  }[];
}
