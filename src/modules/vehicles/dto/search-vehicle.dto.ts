import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { VehicleType } from "../entity/vehicle.entity";

export class SearchVehicleDto {
  @ApiPropertyOptional({
    description: "Vehicle type to filter by",
    enum: VehicleType,
  })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @ApiPropertyOptional({
    description: "Vehicle manufacturer/brand to search for",
  })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({
    description: "Vehicle model to search for",
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: "Page number for pagination",
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page",
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "Sort by field",
    enum: ["createdAt", "updatedAt", "totalMileage", "totalCarbonSaved"],
    default: "createdAt",
  })
  @IsOptional()
  @IsString()
  sortBy?: "createdAt" | "updatedAt" | "totalMileage" | "totalCarbonSaved" =
    "createdAt";

  @ApiPropertyOptional({
    description: "Sort order",
    enum: ["ASC", "DESC"],
    default: "DESC",
  })
  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC" = "DESC";
}
