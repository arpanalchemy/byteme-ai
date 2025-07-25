import { ApiProperty } from "@nestjs/swagger";
import { HistoryType, HistoryCategory } from "../entity/history.entity";

export class CreateHistoryDto {
  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  userId: string;

  @ApiProperty({
    description: "History type",
    enum: HistoryType,
    example: HistoryType.VEHICLE_UPLOAD,
  })
  type: HistoryType;

  @ApiProperty({
    description: "History category",
    enum: HistoryCategory,
    example: HistoryCategory.UPLOAD,
  })
  category: HistoryCategory;

  @ApiProperty({
    description: "History title",
    example: "Odometer Upload Successful",
  })
  title: string;

  @ApiProperty({
    description: "History description",
    example: "Uploaded 150 km for Tesla Model 3",
  })
  description: string;

  @ApiProperty({
    description: "History data",
    example: {
      vehicleId: "123e4567-e89b-12d3-a456-426614174000",
      vehicleName: "Tesla Model 3",
      uploadId: "456e7890-e89b-12d3-a456-426614174000",
      mileage: 150,
      carbonSaved: 25.5,
    },
    required: false,
  })
  data?: {
    vehicleId?: string;
    vehicleName?: string;
    uploadId?: string;
    mileage?: number;
    carbonSaved?: number;
    previousMileage?: number;
    mileageDifference?: number;
    rewardAmount?: number;
    rewardType?: string;
    previousBalance?: number;
    newBalance?: number;
    transactionType?: string;
    badgeId?: string;
    badgeName?: string;
    badgeType?: string;
    badgeRarity?: string;
    challengeId?: string;
    challengeName?: string;
    challengeType?: string;
    challengeDifficulty?: string;
    progress?: number;
    objectives?: any;
    orderId?: string;
    orderNumber?: string;
    productId?: string;
    productName?: string;
    quantity?: number;
    totalAmount?: number;
    orderStatus?: string;
    rank?: number;
    previousRank?: number;
    period?: string;
    score?: number;
    previousScore?: number;
    milestone?: string;
    milestoneType?: string;
    milestoneValue?: number;
    streakCount?: number;
    previousStreakCount?: number;
    streakType?: string;
    eventType?: string;
    systemMessage?: string;
    metadata?: any;
    actionUrl?: string;
    imageUrl?: string;
    deepLink?: string;
    tags?: string[];
  };

  @ApiProperty({
    description: "Numeric value for sorting/filtering",
    example: 150.5,
    required: false,
  })
  value?: number;

  @ApiProperty({
    description: "Previous value for comparison",
    example: 100.0,
    required: false,
  })
  previousValue?: number;

  @ApiProperty({
    description: "Whether the history entry is visible to user",
    example: true,
    required: false,
  })
  isVisible?: boolean;

  @ApiProperty({
    description: "Admin notes",
    example: "Automatic history entry",
    required: false,
  })
  notes?: string;
}

export class UpdateHistoryDto {
  @ApiProperty({
    description: "History title",
    required: false,
  })
  title?: string;

  @ApiProperty({
    description: "History description",
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: "History data",
    required: false,
  })
  data?: {
    vehicleId?: string;
    vehicleName?: string;
    uploadId?: string;
    mileage?: number;
    carbonSaved?: number;
    previousMileage?: number;
    mileageDifference?: number;
    rewardAmount?: number;
    rewardType?: string;
    previousBalance?: number;
    newBalance?: number;
    transactionType?: string;
    badgeId?: string;
    badgeName?: string;
    badgeType?: string;
    badgeRarity?: string;
    challengeId?: string;
    challengeName?: string;
    challengeType?: string;
    challengeDifficulty?: string;
    progress?: number;
    objectives?: any;
    orderId?: string;
    orderNumber?: string;
    productId?: string;
    productName?: string;
    quantity?: number;
    totalAmount?: number;
    orderStatus?: string;
    rank?: number;
    previousRank?: number;
    period?: string;
    score?: number;
    previousScore?: number;
    milestone?: string;
    milestoneType?: string;
    milestoneValue?: number;
    streakCount?: number;
    previousStreakCount?: number;
    streakType?: string;
    eventType?: string;
    systemMessage?: string;
    metadata?: any;
    actionUrl?: string;
    imageUrl?: string;
    deepLink?: string;
    tags?: string[];
  };

  @ApiProperty({
    description: "Numeric value for sorting/filtering",
    required: false,
  })
  value?: number;

  @ApiProperty({
    description: "Previous value for comparison",
    required: false,
  })
  previousValue?: number;

  @ApiProperty({
    description: "Whether the history entry is visible to user",
    required: false,
  })
  isVisible?: boolean;

  @ApiProperty({
    description: "Admin notes",
    required: false,
  })
  notes?: string;
}

export class HistoryResponseDto {
  @ApiProperty({
    description: "History ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  userId: string;

  @ApiProperty({
    description: "History type",
    enum: HistoryType,
    example: HistoryType.VEHICLE_UPLOAD,
  })
  type: HistoryType;

  @ApiProperty({
    description: "History category",
    enum: HistoryCategory,
    example: HistoryCategory.UPLOAD,
  })
  category: HistoryCategory;

  @ApiProperty({
    description: "History title",
    example: "Odometer Upload Successful",
  })
  title: string;

  @ApiProperty({
    description: "History description",
    example: "Uploaded 150 km for Tesla Model 3",
  })
  description: string;

  @ApiProperty({
    description: "History data",
  })
  data: {
    vehicleId?: string;
    vehicleName?: string;
    uploadId?: string;
    mileage?: number;
    carbonSaved?: number;
    previousMileage?: number;
    mileageDifference?: number;
    rewardAmount?: number;
    rewardType?: string;
    previousBalance?: number;
    newBalance?: number;
    transactionType?: string;
    badgeId?: string;
    badgeName?: string;
    badgeType?: string;
    badgeRarity?: string;
    challengeId?: string;
    challengeName?: string;
    challengeType?: string;
    challengeDifficulty?: string;
    progress?: number;
    objectives?: any;
    orderId?: string;
    orderNumber?: string;
    productId?: string;
    productName?: string;
    quantity?: number;
    totalAmount?: number;
    orderStatus?: string;
    rank?: number;
    previousRank?: number;
    period?: string;
    score?: number;
    previousScore?: number;
    milestone?: string;
    milestoneType?: string;
    milestoneValue?: number;
    streakCount?: number;
    previousStreakCount?: number;
    streakType?: string;
    eventType?: string;
    systemMessage?: string;
    metadata?: any;
    actionUrl?: string;
    imageUrl?: string;
    deepLink?: string;
    tags?: string[];
  };

  @ApiProperty({
    description: "Numeric value for sorting/filtering",
    example: 150.5,
  })
  value: number;

  @ApiProperty({
    description: "Previous value for comparison",
    example: 100.0,
  })
  previousValue: number;

  @ApiProperty({
    description: "Whether the history entry is visible to user",
    example: true,
  })
  isVisible: boolean;

  @ApiProperty({
    description: "Whether the history entry is deleted",
    example: false,
  })
  isDeleted: boolean;

  @ApiProperty({
    description: "When the history entry was deleted",
    example: "2024-01-15T10:30:00Z",
  })
  deletedAt: Date;

  @ApiProperty({
    description: "Admin notes",
    example: "Automatic history entry",
  })
  notes: string;

  @ApiProperty({
    description: "Creation date",
    example: "2024-01-15T10:30:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last update date",
    example: "2024-01-15T10:30:00Z",
  })
  updatedAt: Date;

  // Virtual properties
  @ApiProperty({
    description: "Whether the history entry is recent (within 24 hours)",
    example: true,
  })
  isRecent: boolean;

  @ApiProperty({
    description: "Whether the history entry is from today",
    example: true,
  })
  isToday: boolean;

  @ApiProperty({
    description: "Whether the history entry is from this week",
    example: true,
  })
  isThisWeek: boolean;

  @ApiProperty({
    description: "Whether the history entry is from this month",
    example: true,
  })
  isThisMonth: boolean;

  @ApiProperty({
    description: "Formatted value",
    example: "150.5 km",
  })
  formattedValue: string;

  @ApiProperty({
    description: "Value change from previous",
    example: 50.5,
  })
  valueChange: number;

  @ApiProperty({
    description: "Formatted value change",
    example: "+50.5 km",
  })
  formattedValueChange: string;

  @ApiProperty({
    description: "Whether the change is positive",
    example: true,
  })
  isPositiveChange: boolean;

  @ApiProperty({
    description: "Category icon",
    example: "📸",
  })
  categoryIcon: string;

  @ApiProperty({
    description: "Type icon",
    example: "📸",
  })
  typeIcon: string;

  @ApiProperty({
    description: "Formatted creation time",
    example: "2 hours ago",
  })
  formattedCreatedAt: string;

  @ApiProperty({
    description: "Whether the history entry can be deleted",
    example: true,
  })
  canBeDeleted: boolean;

  @ApiProperty({
    description: "Action button text",
    example: "View Upload",
  })
  actionButtonText: string;
}

export class HistoryQueryDto {
  @ApiProperty({
    description: "Page number",
    example: 1,
    required: false,
  })
  page?: number;

  @ApiProperty({
    description: "Items per page",
    example: 20,
    required: false,
  })
  limit?: number;

  @ApiProperty({
    description: "History type filter",
    enum: HistoryType,
    required: false,
  })
  type?: HistoryType;

  @ApiProperty({
    description: "History category filter",
    enum: HistoryCategory,
    required: false,
  })
  category?: HistoryCategory;

  @ApiProperty({
    description: "Search term",
    example: "Tesla",
    required: false,
  })
  search?: string;

  @ApiProperty({
    description: "Start date filter",
    example: "2024-01-01",
    required: false,
  })
  startDate?: string;

  @ApiProperty({
    description: "End date filter",
    example: "2024-01-31",
    required: false,
  })
  endDate?: string;

  @ApiProperty({
    description: "Sort by field",
    example: "createdAt",
    required: false,
  })
  sortBy?: string;

  @ApiProperty({
    description: "Sort order",
    example: "DESC",
    required: false,
  })
  sortOrder?: "ASC" | "DESC";
}

export class HistoryStatsDto {
  @ApiProperty({
    description: "Total history entries",
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: "History entries by category",
    example: {
      upload: 50,
      rewards: 30,
      achievements: 20,
      challenges: 15,
      orders: 10,
      vehicles: 10,
      leaderboard: 10,
      system: 5,
    },
  })
  byCategory: Record<string, number>;

  @ApiProperty({
    description: "History entries by type",
    example: {
      vehicle_upload: 50,
      reward_earned: 25,
      badge_earned: 20,
      challenge_completed: 15,
      order_placed: 10,
      vehicle_added: 10,
      leaderboard_rank: 10,
      milestone_reached: 10,
    },
  })
  byType: Record<string, number>;

  @ApiProperty({
    description: "Recent history entries (last 24 hours)",
    example: 5,
  })
  recent: number;

  @ApiProperty({
    description: "Today history entries",
    example: 3,
  })
  today: number;

  @ApiProperty({
    description: "This week history entries",
    example: 15,
  })
  thisWeek: number;

  @ApiProperty({
    description: "This month history entries",
    example: 45,
  })
  thisMonth: number;

  @ApiProperty({
    description: "Total value across all entries",
    example: 5000.5,
  })
  totalValue: number;

  @ApiProperty({
    description: "Average value per entry",
    example: 33.3,
  })
  averageValue: number;

  @ApiProperty({
    description: "Most active day",
    example: "2024-01-15",
  })
  mostActiveDay: string;

  @ApiProperty({
    description: "Most active day count",
    example: 8,
  })
  mostActiveDayCount: number;
}
