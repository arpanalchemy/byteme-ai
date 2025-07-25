import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { VehicleType } from '../../vehicles/entity/vehicle.entity';

export class UploadOdometerDto {
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ProcessOdometerDto {
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateVehicleFromUploadDto {
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  plateNumber?: string;

  @IsOptional()
  @IsNumber()
  emissionFactor?: number;
}

export class ValidateMileageDto {
  @IsNumber()
  extractedMileage: number;

  @IsNumber()
  confidence: number;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsNumber()
  previousMileage?: number;
}

export class OdometerUploadResponseDto {
  id: string;
  status: string;
  imageUrl: string;
  thumbnailUrl: string;
  extractedMileage?: number;
  confidence?: number;
  carbonSaved?: number;
  processingTime?: number;
  createdAt: Date;
}

export class VehicleMatchResultDto {
  matchedVehicle?: {
    id: string;
    displayName: string;
    vehicleType: string;
    confidence: number;
  };

  suggestedNewVehicle?: {
    vehicleType: string;
    make?: string;
    model?: string;
    confidence: number;
  };

  requiresUserInput: boolean;
}

export class ProcessingResultDto {
  uploadId: string;
  status: string;
  extractedMileage?: number;
  confidence?: number;
  vehicleMatch?: VehicleMatchResultDto;
  carbonSaved?: number;
  processingTime: number;
  validationNotes?: string;
}

export class UserStatsDto {
  totalUploads: number;
  approvedUploads: number;
  totalMileage: number;
  totalCarbonSaved: number;
  averageConfidence: number;
  totalVehicles: number;
  monthlyStats: {
    month: string;
    uploads: number;
    mileage: number;
    carbonSaved: number;
  }[];
  recentActivity: {
    uploadId: string;
    status: string;
    mileage?: number;
    carbonSaved?: number;
    createdAt: Date;
  }[];
}
