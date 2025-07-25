import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  Max,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { VehicleType } from "../entity/vehicle.entity";

export class UpdateVehicleDto {
  @ApiPropertyOptional({
    description: "Type of vehicle",
    enum: VehicleType,
  })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @ApiPropertyOptional({
    description: "Vehicle manufacturer/brand",
  })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({
    description: "Vehicle model name",
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: "Vehicle manufacturing year",
    minimum: 1900,
    maximum: 2030,
  })
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(2030)
  year?: number;

  @ApiPropertyOptional({
    description: "Vehicle license plate number",
  })
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @ApiPropertyOptional({
    description: "CO2 emission factor in kg per km",
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  emissionFactor?: number;

  @ApiPropertyOptional({
    description: "Whether this vehicle should be set as primary",
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: "Whether this vehicle is active",
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
