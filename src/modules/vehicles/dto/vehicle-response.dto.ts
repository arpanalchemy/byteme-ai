import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { VehicleType } from "../entity/vehicle.entity";

export class VehicleResponseDto {
  @ApiProperty({
    description: "Vehicle unique identifier",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Type of vehicle",
    enum: VehicleType,
    example: VehicleType.CAR,
  })
  vehicleType: VehicleType;

  @ApiPropertyOptional({
    description: "Custom name for the vehicle (user-defined)",
    example: "My Tesla",
  })
  customName?: string;

  @ApiPropertyOptional({
    description: "Vehicle manufacturer/brand",
    example: "Tesla",
  })
  make?: string;

  @ApiPropertyOptional({
    description: "Vehicle model name",
    example: "Model 3",
  })
  model?: string;

  @ApiPropertyOptional({
    description: "Vehicle manufacturing year",
    example: 2023,
  })
  year?: number;

  @ApiPropertyOptional({
    description: "Vehicle license plate number",
    example: "ABC123",
  })
  plateNumber?: string;

  @ApiProperty({
    description: "CO2 emission factor in kg per km",
    example: 0.2,
  })
  emissionFactor: number;

  @ApiProperty({
    description: "Total mileage for this vehicle",
    example: 15000.5,
  })
  totalMileage: number;

  @ApiProperty({
    description: "Total carbon saved by this vehicle",
    example: 3000.1,
  })
  totalCarbonSaved: number;

  @ApiProperty({
    description: "Whether this is the primary vehicle",
    example: true,
  })
  isPrimary: boolean;

  @ApiProperty({
    description: "Whether this vehicle is active",
    example: true,
  })
  isActive: boolean;

  @ApiPropertyOptional({
    description: "Vehicle image URL",
    example: "https://example.com/vehicle-image.jpg",
  })
  vehicleImageUrl?: string;

  @ApiPropertyOptional({
    description: "Last upload date for this vehicle",
    example: "2024-01-15T10:30:00Z",
  })
  lastUploadDate?: Date;

  @ApiProperty({
    description: "Vehicle creation date",
    example: "2024-01-01T00:00:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Vehicle last update date",
    example: "2024-01-15T10:30:00Z",
  })
  updatedAt: Date;

  @ApiProperty({
    description: "Display name for the vehicle",
    example: "Tesla Model 3",
  })
  displayName: string;

  @ApiProperty({
    description: "Formatted carbon saved string",
    example: "3000.10 kg CO₂",
  })
  carbonSavedFormatted: string;
}

export class VehicleStatsResponseDto {
  @ApiProperty({
    description: "Total number of vehicles",
    example: 3,
  })
  totalVehicles: number;

  @ApiProperty({
    description: "Total mileage across all vehicles",
    example: 45000.5,
  })
  totalMileage: number;

  @ApiProperty({
    description: "Total carbon saved across all vehicles",
    example: 9000.3,
  })
  totalCarbonSaved: number;

  @ApiProperty({
    description: "Average emission factor across all vehicles",
    example: 0.22,
  })
  averageEmissionFactor: number;
}

export class VehicleSearchResponseDto {
  @ApiProperty({
    description: "List of vehicles matching search criteria",
    type: [VehicleResponseDto],
  })
  vehicles: VehicleResponseDto[];

  @ApiProperty({
    description: "Total count of matching vehicles",
    example: 5,
  })
  total: number;

  @ApiProperty({
    description: "Current page number",
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: "Number of items per page",
    example: 10,
  })
  limit: number;
}
