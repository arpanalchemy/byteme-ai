import { ApiProperty } from '@nestjs/swagger';

export class UserDashboardDto {
  @ApiProperty({
    description: 'User wallet balance in B3TR tokens',
    example: 150.75,
  })
  walletBalance: number;

  @ApiProperty({
    description: 'Total rewards earned in B3TR tokens',
    example: 500.25,
  })
  totalRewards: number;

  @ApiProperty({
    description: 'Total carbon saved in kg',
    example: 3000.5,
  })
  totalCarbonSaved: number;

  @ApiProperty({
    description: 'Total EV miles tracked',
    example: 15000.75,
  })
  totalEvMiles: number;

  @ApiProperty({
    description: 'Current user tier',
    example: 'silver',
  })
  currentTier: string;

  @ApiProperty({
    description: 'Total points earned',
    example: 2500,
  })
  totalPoints: number;

  @ApiProperty({
    description: 'Number of vehicles registered',
    example: 3,
  })
  vehicleCount: number;

  @ApiProperty({
    description: 'Number of successful uploads',
    example: 45,
  })
  uploadCount: number;

  @ApiProperty({
    description: 'User rank in global leaderboard',
    example: 15,
  })
  globalRank: number;

  @ApiProperty({
    description: 'Weekly progress statistics',
  })
  weeklyStats: {
    milesThisWeek: number;
    carbonSavedThisWeek: number;
    rewardsEarnedThisWeek: number;
    uploadsThisWeek: number;
  };

  @ApiProperty({
    description: 'Monthly progress statistics',
  })
  monthlyStats: {
    milesThisMonth: number;
    carbonSavedThisMonth: number;
    rewardsEarnedThisMonth: number;
    uploadsThisMonth: number;
  };

  @ApiProperty({
    description: 'Recent activity',
  })
  recentActivity: Array<{
    id: string;
    type: 'upload' | 'reward' | 'badge' | 'challenge';
    description: string;
    amount?: number;
    date: Date;
  }>;
}

export class UserProfileDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User wallet address',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  })
  walletAddress: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Username',
    example: 'EcoDriver123',
  })
  username: string;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
  })
  profileImageUrl: string;

  @ApiProperty({
    description: 'User tier',
    example: 'silver',
  })
  currentTier: string;

  @ApiProperty({
    description: 'Total mileage',
    example: 15000.5,
  })
  totalMileage: number;

  @ApiProperty({
    description: 'Total carbon saved',
    example: 3000.1,
  })
  totalCarbonSaved: number;

  @ApiProperty({
    description: 'B3TR balance',
    example: 150.75,
  })
  b3trBalance: number;

  @ApiProperty({
    description: 'Total points',
    example: 2500,
  })
  totalPoints: number;

  @ApiProperty({
    description: 'Registration date',
    example: '2024-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last login date',
    example: '2024-01-15T10:30:00Z',
  })
  lastLogin: Date;
}

export class UpdateUserProfileDto {
  @ApiProperty({
    description: 'Username',
    example: 'EcoDriver123',
    required: false,
  })
  username?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  profileImageUrl?: string;
} 