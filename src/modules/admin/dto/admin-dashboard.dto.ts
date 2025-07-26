import { ApiProperty } from "@nestjs/swagger";

export class AdminDashboardStatsDto {
  @ApiProperty({
    description: "Total number of users",
    example: 1250,
  })
  totalUsers: number;

  @ApiProperty({
    description: "Total active users (last 30 days)",
    example: 850,
  })
  activeUsers: number;

  @ApiProperty({
    description: "Total vehicles registered",
    example: 1800,
  })
  totalVehicles: number;

  @ApiProperty({
    description: "Total EV miles tracked",
    example: 450000.5,
  })
  totalEvMiles: number;

  @ApiProperty({
    description: "Total carbon saved in kg",
    example: 90000.25,
  })
  totalCarbonSaved: number;

  @ApiProperty({
    description: "Total B3TR tokens distributed",
    example: 45000.5,
  })
  totalTokensDistributed: number;

  @ApiProperty({
    description: "Total rewards distributed this week",
    example: 2500.75,
  })
  weeklyRewardsDistributed: number;

  @ApiProperty({
    description: "Total uploads processed",
    example: 15000,
  })
  totalUploads: number;

  @ApiProperty({
    description: "Pending uploads for review",
    example: 25,
  })
  pendingUploads: number;

  @ApiProperty({
    description: "Total orders in store",
    example: 350,
  })
  totalOrders: number;

  @ApiProperty({
    description: "Pending orders",
    example: 15,
  })
  pendingOrders: number;
}

export class AdminUserStatsDto {
  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "User wallet address",
    example: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  })
  walletAddress: string;

  @ApiProperty({
    description: "User email",
    example: "user@example.com",
  })
  email: string;

  @ApiProperty({
    description: "Total mileage",
    example: 15000.5,
  })
  totalMileage: number;

  @ApiProperty({
    description: "Total carbon saved",
    example: 3000.1,
  })
  totalCarbonSaved: number;

  @ApiProperty({
    description: "B3TR balance",
    example: 150.75,
  })
  b3trBalance: number;

  @ApiProperty({
    description: "Current tier",
    example: "silver",
  })
  currentTier: string;

  @ApiProperty({
    description: "Is user active",
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: "Registration date",
    example: "2024-01-01T00:00:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last login date",
    example: "2024-01-15T10:30:00Z",
  })
  lastLogin: Date;
}
