import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  Max,
  IsNotEmpty,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { VehicleType } from "../entity/vehicle.entity";

export class CreateVehicleDto {
  @ApiProperty({
    description: "Type of vehicle",
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
    description: "Vehicle manufacturer/brand",
    example: "Tesla",
  })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({
    description: "Vehicle model name",
    example: "Model 3",
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: "Vehicle manufacturing year",
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
    description: "Vehicle license plate number",
    example: "ABC123",
  })
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @ApiPropertyOptional({
    description: "CO2 emission factor in kg per km",
    example: 0.2,
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
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: "Fuel type of the vehicle",
    enum: ["electric", "hybrid", "gasoline", "diesel", "other"],
    example: "electric",
  })
  @IsOptional()
  @IsString()
  fuelType?: "electric" | "hybrid" | "gasoline" | "diesel" | "other";

  @ApiPropertyOptional({
    description: "Battery capacity in kWh (for electric vehicles)",
    example: 75,
  })
  @IsOptional()
  @IsNumber()
  batteryCapacity?: number;

  @ApiPropertyOptional({
    description: "Range in kilometers",
    example: 400,
  })
  @IsOptional()
  @IsNumber()
  rangeKm?: number;

  @ApiPropertyOptional({
    description: "Manufacturing country",
    example: "USA",
  })
  @IsOptional()
  @IsString()
  manufacturingCountry?: string;

  @ApiPropertyOptional({
    description: "Vehicle color",
    example: "Red",
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: "Vehicle Identification Number (VIN)",
    example: "1HGBH41JXMN109186",
  })
  @IsOptional()
  @IsString()
  vin?: string;
}
