# Core Components Deep Dive

## Overview

This document provides detailed technical documentation for the most critical components of the Drive & Earn platform. Each component is analyzed for its purpose, implementation details, API endpoints, data models, and error handling strategies.

## 1. Authentication Component

### Purpose

The Authentication component provides secure, wallet-based authentication using VeChain's certificate system. It handles user registration, login, token management, and session security.

### Key Files

- `src/modules/auth/auth.controller.ts` - API endpoints and request handling
- `src/modules/auth/auth.service.ts` - Business logic and authentication flow
- `src/modules/auth/guards/jwt-auth.guard.ts` - JWT authentication guard
- `src/modules/auth/helpers/vechain-signature.helper.ts` - VeChain signature verification
- `src/modules/auth/dto/verify-signature.dto.ts` - Request/response data structures
- `src/modules/auth/dto/auth-response.dto.ts` - Authentication response models

### API Endpoints

| Method | Path                      | Description                                   | Authentication |
| ------ | ------------------------- | --------------------------------------------- | -------------- |
| POST   | `/auth/verify-signature`  | Verify wallet signature and authenticate user | Public         |
| POST   | `/auth/refresh-token`     | Refresh access token using refresh token      | Public         |
| POST   | `/auth/logout`            | Logout user and invalidate tokens             | Required       |
| POST   | `/auth/logout-device`     | Logout from specific device                   | Required       |
| GET    | `/auth/me`                | Get current user information                  | Required       |
| POST   | `/auth/disconnect-wallet` | Disconnect wallet from user account           | Required       |

### Data Models

#### User Entity (Authentication Context)

```typescript
interface User {
  id: string; // UUID primary key
  walletAddress?: string; // VeChain wallet address
  walletType?: string; // Wallet type (veworld, sync2, etc.)
  nonce?: string; // Security nonce for signature verification
  isActive: boolean; // Account status
  isVerified: boolean; // Verification status
  lastLogin?: Date; // Last login timestamp
  // ... other user properties
}
```

#### JWT Payload Structure

```typescript
interface JWTPayload {
  sub: string; // User ID
  walletAddress?: string; // Wallet address
  isActive: boolean; // Account status
  isVerified: boolean; // Verification status
  emailVerified: boolean; // Email verification status
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}
```

### Error Handling

- **Invalid Signature**: Returns 401 Unauthorized with detailed error message
- **Expired Tokens**: Returns 401 with token refresh instructions
- **Invalid Certificate**: Returns 401 with certificate validation error
- **Rate Limiting**: Returns 429 Too Many Requests for excessive attempts
- **Database Errors**: Returns 500 Internal Server Error with logging

### Security Features

- VeChain certificate validation
- JWT token expiration management
- Refresh token rotation
- Rate limiting on authentication endpoints
- Secure session management
- Input validation and sanitization

## 2. Odometer Processing Component

### Purpose

The Odometer Processing component handles the core functionality of the platform - analyzing odometer images to extract mileage data, validate readings, and calculate carbon savings. It integrates multiple AI services for comprehensive image analysis.

### Key Files

- `src/modules/odometer/controllers/odometer.controller.ts` - API endpoints
- `src/modules/odometer/services/odometer.service.ts` - Processing logic
- `src/modules/odometer/entity/odometer-upload.entity.ts` - Data model
- `src/modules/odometer/dto/upload-odometer.dto.ts` - Request/response models
- `src/common/ai/openai.service.ts` - AI analysis integration
- `src/common/ocr/aws-textract.service.ts` - OCR processing

### API Endpoints

| Method | Path                            | Description                              | Authentication |
| ------ | ------------------------------- | ---------------------------------------- | -------------- |
| POST   | `/odometer/upload`              | Upload odometer image for processing     | Optional       |
| POST   | `/odometer/process`             | Process existing upload with AI analysis | Required       |
| GET    | `/odometer/uploads`             | Get user's upload history                | Required       |
| GET    | `/odometer/uploads/:id`         | Get specific upload details              | Optional       |
| GET    | `/odometer/stats`               | Get user upload statistics               | Required       |
| POST   | `/odometer/uploads/:id/vehicle` | Create vehicle from upload               | Required       |

### Data Models

#### Odometer Upload Entity

```typescript
interface OdometerUpload {
  id: string; // UUID primary key
  userId?: string; // Associated user
  vehicleId?: string; // Associated vehicle
  s3ImageUrl: string; // Original image URL
  s3ThumbnailUrl: string; // Thumbnail URL
  extractedMileage?: number; // OCR extracted mileage
  ocrConfidenceScore?: number; // OCR confidence (0-1)
  ocrRawText?: string; // Raw OCR text
  openaiAnalysis?: {
    // AI analysis results
    vehicleType: string;
    estimatedMake?: string;
    estimatedModel?: string;
    imageQuality: string;
    mileageReadable: boolean;
    confidenceScore: number;
    additionalInsights: string;
    vehicleFeatures: string[];
  };
  status: UploadStatus; // Processing status
  validationStatus: ValidationStatus; // Validation status
  finalMileage?: number; // Final validated mileage
  mileageDifference?: number; // Difference from previous reading
  carbonSaved: number; // Calculated carbon savings
  processingTimeMs?: number; // Processing duration
  createdAt: Date; // Upload timestamp
  processedAt?: Date; // Processing completion timestamp
}
```

### Processing Workflow

1. **Image Upload**: User uploads odometer image
2. **Storage**: Image stored in AWS S3 with thumbnail generation
3. **Parallel Processing**: OCR and AI analysis run concurrently
4. **Validation**: Results validated and confidence scored
5. **Carbon Calculation**: Carbon savings calculated based on mileage difference
6. **Token Distribution**: B3TR tokens distributed for verified savings

### Error Handling

- **Invalid File Type**: Returns 400 with supported format list
- **File Size Exceeded**: Returns 400 with size limit information
- **Processing Failure**: Returns 500 with retry instructions
- **Low Confidence**: Returns 200 with manual review flag
- **External Service Errors**: Returns 503 with fallback options

### AI Integration Features

- **GPT-4 Vision Analysis**: Vehicle detection and mileage validation
- **AWS Textract OCR**: Text extraction from images
- **Confidence Scoring**: Multi-level validation system
- **Fallback Mechanisms**: Graceful degradation when services unavailable

## 3. Blockchain Integration Component

### Purpose

The Blockchain Integration component manages all VeChain network interactions, including smart contract calls, token distribution, transaction monitoring, and wallet operations. It ensures secure and efficient blockchain operations.

### Key Files

- `src/modules/blockchain/controllers/blockchain.controller.ts` - API endpoints
- `src/modules/blockchain/services/blockchain.service.ts` - Business logic
- `src/modules/blockchain/services/smart-contract.service.ts` - Contract interactions
- `src/common/blockchain/vechain.service.ts` - VeChain SDK integration
- `src/common/blockchain/vechain-wallet.service.ts` - Wallet management

### API Endpoints

| Method | Path                                   | Description                   | Authentication |
| ------ | -------------------------------------- | ----------------------------- | -------------- |
| POST   | `/blockchain/tokenize-carbon/:userId`  | Tokenize carbon savings       | Required       |
| POST   | `/blockchain/transfer-b3tr`            | Transfer B3TR tokens          | Required       |
| POST   | `/blockchain/claim-rewards/:userId`    | Claim pending rewards         | Required       |
| GET    | `/blockchain/transactions`             | Get transaction monitoring    | Required       |
| GET    | `/blockchain/marketplace`              | Get carbon credit marketplace | Required       |
| GET    | `/blockchain/wallet/:userId/analytics` | Get wallet analytics          | Required       |
| GET    | `/blockchain/network/health`           | Get network health status     | Required       |
| GET    | `/blockchain/events/:contract/:event`  | Subscribe to contract events  | Required       |

### Data Models

#### Smart Contract Interface

```typescript
interface EVDriveV2Contract {
  // Core functions
  getCurrentCycle(): Promise<number>;
  getCycleInfo(cycleId: number): Promise<CycleInfo>;
  getAvailableFunds(): Promise<number>;
  getUserData(userAddress: string): Promise<UserData>;
  getGlobalStats(): Promise<GlobalStats>;

  // Reward distribution
  distributeRewards(batch: BatchRewardInput[]): Promise<string>;
  setRewardForCycle(rewardAmount: number): Promise<string>;

  // Token operations
  transfer(from: string, to: string, amount: number): Promise<string>;
  getBalance(walletAddress: string): Promise<number>;
}
```

#### Transaction Model

```typescript
interface BlockchainTransaction {
  hash: string; // Transaction hash
  from: string; // Sender address
  to: string; // Recipient address
  value: string; // Transaction value
  status: "pending" | "confirmed" | "failed";
  timestamp: Date; // Transaction timestamp
  type: string; // Transaction type
  gasUsed?: number; // Gas consumption
  blockNumber?: number; // Block number
  confirmations?: number; // Confirmation count
}
```

### Smart Contract Functions

#### Core Contract Functions

- **`getCurrentCycle()`**: Get current reward distribution cycle
- **`getCycleInfo(cycleId)`**: Get cycle allocation and distribution info
- **`getUserData(userAddress)`**: Get user's blockchain data
- **`distributeRewards(batch)`**: Distribute rewards to multiple users
- **`setRewardForCycle(amount)`**: Set reward amount for current cycle

#### Token Management

- **`transfer(from, to, amount)`**: Transfer B3TR tokens
- **`getBalance(address)`**: Get token balance for address
- **`mint(to, amount)`**: Mint new tokens (admin only)

### Error Handling

- **Network Errors**: Retry logic with exponential backoff
- **Transaction Failures**: Detailed error logging and user notification
- **Gas Estimation Errors**: Fallback gas estimation strategies
- **Contract Errors**: Specific error message mapping
- **Wallet Errors**: Secure error handling without exposing private keys

### Security Features

- **Private Key Management**: Secure storage and rotation
- **Transaction Signing**: Secure transaction signing process
- **Gas Optimization**: Efficient gas usage strategies
- **Batch Processing**: Cost-effective bulk operations
- **Error Recovery**: Comprehensive error recovery mechanisms

## 4. Vehicle Management Component

### Purpose

The Vehicle Management component handles vehicle registration, management, and analytics. It supports multiple vehicle types, automatic vehicle detection from images, and emission factor management for accurate carbon calculations.

### Key Files

- `src/modules/vehicles/controllers/vehicle.controller.ts` - API endpoints
- `src/modules/vehicles/services/vehicle.service.ts` - Business logic
- `src/modules/vehicles/entity/vehicle.entity.ts` - Data model
- `src/modules/vehicles/dto/create-vehicle.dto.ts` - Request models
- `src/modules/vehicles/dto/vehicle-response.dto.ts` - Response models

### API Endpoints

| Method | Path                              | Description                  | Authentication |
| ------ | --------------------------------- | ---------------------------- | -------------- |
| POST   | `/vehicles`                       | Create new vehicle           | Required       |
| GET    | `/vehicles`                       | Get user vehicles            | Required       |
| GET    | `/vehicles/primary`               | Get primary vehicle          | Required       |
| GET    | `/vehicles/:id`                   | Get specific vehicle         | Required       |
| PUT    | `/vehicles/:id`                   | Update vehicle               | Required       |
| DELETE | `/vehicles/:id`                   | Delete vehicle               | Required       |
| PUT    | `/vehicles/:id/primary`           | Set as primary vehicle       | Required       |
| GET    | `/vehicles/:id/analytics`         | Get vehicle analytics        | Required       |
| GET    | `/vehicles/search`                | Search vehicles              | Required       |
| GET    | `/vehicles/stats`                 | Get vehicle statistics       | Required       |
| POST   | `/vehicles/bulk/emission-factors` | Bulk update emission factors | Required       |

### Data Models

#### Vehicle Entity

```typescript
interface Vehicle {
  id: string; // UUID primary key
  userId: string; // Owner user ID
  vehicleType: string; // car, suv, motorcycle, etc.
  make?: string; // Manufacturer
  model?: string; // Model name
  year?: number; // Manufacturing year
  plateNumber?: string; // License plate
  emissionFactor: number; // CO2 emission factor
  fuelType?: string; // electric, hybrid, gasoline, etc.
  batteryCapacity?: number; // Battery capacity (kWh)
  rangeKm?: number; // Range in kilometers
  totalMileage: number; // Total mileage tracked
  totalCarbonSaved: number; // Total carbon savings
  isPrimary: boolean; // Primary vehicle flag
  isActive: boolean; // Active status
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
}
```

#### Vehicle Analytics

```typescript
interface VehicleAnalytics {
  vehicleId: string;
  totalMileage: number;
  totalCarbonSaved: number;
  averageMileagePerUpload: number;
  carbonEfficiency: number;
  lastActivity: Date;
  uploadCount: number;
  monthlyTrends: MonthlyTrend[];
  carbonSavingsByMonth: CarbonSavingsData[];
}
```

### Vehicle Types and Emission Factors

#### Supported Vehicle Types

- **Car**: Standard passenger vehicles
- **SUV**: Sport utility vehicles
- **Motorcycle**: Two-wheeled vehicles
- **Scooter**: Electric scooters
- **Truck**: Commercial trucks
- **Van**: Commercial vans
- **Other**: Miscellaneous vehicles

#### Emission Factors (kg CO2/km)

- **Electric**: 0.0 (varies by grid mix)
- **Hybrid**: 0.05-0.15
- **Gasoline**: 0.2-0.3
- **Diesel**: 0.25-0.35

### Error Handling

- **Validation Errors**: Detailed field-specific error messages
- **Duplicate Plate Numbers**: Unique constraint enforcement
- **Invalid Vehicle Data**: Comprehensive validation rules
- **Database Errors**: Transaction rollback and error logging
- **Image Processing Errors**: Graceful fallback for vehicle detection

### Features

- **Automatic Vehicle Detection**: AI-powered vehicle identification
- **Emission Factor Management**: Dynamic emission factor updates
- **Primary Vehicle Logic**: Smart primary vehicle selection
- **Analytics Integration**: Comprehensive vehicle performance tracking
- **Search and Filtering**: Advanced vehicle search capabilities

## 5. Rewards System Component

### Purpose

The Rewards System component manages the distribution of B3TR tokens based on verified carbon savings. It handles reward calculations, token distribution, challenge rewards, and token economics management.

### Key Files

- `src/modules/rewards/controllers/reward.controller.ts` - API endpoints
- `src/modules/rewards/services/reward.service.ts` - Business logic
- `src/modules/rewards/entity/reward.entity.ts` - Data model
- `src/modules/rewards/dto/reward.dto.ts` - Request/response models

### API Endpoints

| Method | Path                              | Description                  | Authentication |
| ------ | --------------------------------- | ---------------------------- | -------------- |
| POST   | `/rewards/distribute`             | Distribute rewards to users  | Required       |
| GET    | `/rewards/user/:userId`           | Get user rewards             | Required       |
| GET    | `/rewards/history`                | Get reward history           | Required       |
| POST   | `/rewards/challenge/:challengeId` | Distribute challenge rewards | Required       |
| GET    | `/rewards/analytics`              | Get reward analytics         | Required       |
| POST   | `/rewards/batch`                  | Batch reward distribution    | Required       |

### Data Models

#### Reward Entity

```typescript
interface Reward {
  id: string; // UUID primary key
  userId: string; // Recipient user ID
  amount: number; // Reward amount in B3TR
  type: RewardType; // Reward type
  source: RewardSource; // Reward source
  carbonSaved: number; // Associated carbon savings
  transactionHash?: string; // Blockchain transaction hash
  status: RewardStatus; // Distribution status
  metadata?: any; // Additional reward data
  createdAt: Date; // Creation timestamp
  distributedAt?: Date; // Distribution timestamp
}
```

#### Reward Calculation Model

```typescript
interface RewardCalculation {
  baseAmount: number; // Base reward amount
  carbonMultiplier: number; // Carbon savings multiplier
  challengeBonus: number; // Challenge completion bonus
  streakBonus: number; // Consecutive upload bonus
  totalAmount: number; // Final reward amount
  calculationFactors: {
    // Calculation breakdown
    carbonSavings: number;
    challengeMultiplier: number;
    streakMultiplier: number;
    baseRate: number;
  };
}
```

### Reward Types and Sources

#### Reward Types

- **CARBON_SAVINGS**: Rewards for verified carbon savings
- **CHALLENGE_COMPLETION**: Rewards for completing challenges
- **STREAK_BONUS**: Rewards for consecutive uploads
- **REFERRAL_BONUS**: Rewards for user referrals
- **SPECIAL_EVENT**: Rewards for special events

#### Reward Sources

- **ODOMETER_UPLOAD**: Rewards from odometer uploads
- **CHALLENGE**: Rewards from challenge completion
- **ADMIN**: Manual rewards from administrators
- **SYSTEM**: System-generated rewards

### Token Economics

#### Distribution Algorithm

1. **Base Calculation**: Carbon savings × base rate
2. **Multiplier Application**: Apply challenge and streak multipliers
3. **Bonus Addition**: Add any applicable bonuses
4. **Cap Enforcement**: Ensure rewards don't exceed daily/weekly caps
5. **Distribution**: Mint and distribute tokens via blockchain

#### Token Supply Management

- **Initial Supply**: Fixed initial token supply
- **Inflation Rate**: Controlled inflation through rewards
- **Burning Mechanism**: Token burning through store purchases
- **Circulation Control**: Dynamic supply based on usage

### Error Handling

- **Insufficient Funds**: Check available contract funds before distribution
- **Transaction Failures**: Retry logic for failed blockchain transactions
- **Calculation Errors**: Validation of reward calculations
- **Duplicate Rewards**: Prevention of duplicate reward distribution
- **Rate Limiting**: Enforcement of reward distribution limits

### Features

- **Dynamic Reward Rates**: Adjustable reward rates based on market conditions
- **Batch Processing**: Efficient bulk reward distribution
- **Analytics Integration**: Comprehensive reward analytics
- **Audit Trail**: Complete audit trail for all reward distributions
- **Multi-currency Support**: Support for different reward currencies

## 6. Analytics Component

### Purpose

The Analytics component provides comprehensive data analysis and reporting capabilities. It aggregates data from multiple sources to provide insights into user behavior, carbon savings, and platform performance.

### Key Files

- `src/modules/analytics/controllers/analytics.controller.ts` - API endpoints
- `src/modules/analytics/services/analytics.service.ts` - Business logic

### API Endpoints

| Method | Path                           | Description                       | Authentication |
| ------ | ------------------------------ | --------------------------------- | -------------- |
| GET    | `/analytics/user-stats`        | Get user analytics                | Required       |
| GET    | `/analytics/global-stats`      | Get global platform statistics    | Required       |
| GET    | `/analytics/carbon-savings`    | Get carbon savings analytics      | Required       |
| GET    | `/analytics/vehicle-analytics` | Get vehicle performance analytics | Required       |
| GET    | `/analytics/reward-analytics`  | Get reward distribution analytics | Required       |
| GET    | `/analytics/trends`            | Get trend analysis                | Required       |
| GET    | `/analytics/reports`           | Generate custom reports           | Required       |

### Data Models

#### User Analytics

```typescript
interface UserAnalytics {
  userId: string;
  totalMileage: number;
  totalCarbonSaved: number;
  totalRewards: number;
  averageMileagePerUpload: number;
  uploadFrequency: number;
  carbonEfficiency: number;
  rewardEfficiency: number;
  monthlyTrends: MonthlyTrend[];
  vehicleBreakdown: VehicleBreakdown[];
  challengeParticipation: ChallengeStats[];
}
```

#### Global Analytics

```typescript
interface GlobalAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalCarbonSaved: number;
  totalRewardsDistributed: number;
  averageCarbonPerUser: number;
  platformGrowth: GrowthMetrics;
  topPerformers: TopPerformer[];
  vehicleTypeDistribution: VehicleTypeStats[];
  geographicDistribution: GeographicStats[];
}
```

### Analytics Features

#### Real-time Analytics

- **Live Dashboard**: Real-time platform statistics
- **User Activity Tracking**: Live user activity monitoring
- **Performance Metrics**: Real-time performance indicators
- **Alert System**: Automated alerts for significant events

#### Historical Analytics

- **Trend Analysis**: Long-term trend identification
- **Seasonal Patterns**: Seasonal usage pattern analysis
- **Growth Metrics**: Platform growth and adoption metrics
- **Comparative Analysis**: Period-over-period comparisons

#### Predictive Analytics

- **Usage Forecasting**: Predict future usage patterns
- **Carbon Impact Projection**: Project carbon savings impact
- **User Behavior Prediction**: Predict user engagement patterns
- **Resource Planning**: Capacity and resource planning

### Error Handling

- **Data Aggregation Errors**: Graceful handling of missing data
- **Performance Issues**: Query optimization and caching
- **Cache Invalidation**: Proper cache management
- **External Service Errors**: Fallback mechanisms for external data sources

### Performance Optimization

- **Caching Strategy**: Multi-level caching for analytics data
- **Query Optimization**: Optimized database queries
- **Batch Processing**: Efficient data aggregation
- **Indexing Strategy**: Proper database indexing for analytics queries

This comprehensive deep dive into the core components provides technical stakeholders with detailed understanding of the platform's architecture, enabling effective development, maintenance, and enhancement of the Drive & Earn system.

## 7. Calculation Logic and Business Rules

### Purpose

This section documents the mathematical formulas, business rules, and assumptions used throughout the platform for calculating carbon savings, rewards, and other metrics.

### Carbon Savings Calculation

#### Distance-Based Carbon Calculation

The platform calculates carbon savings based on the distance traveled and vehicle type using emission factors.

```typescript
interface CarbonCalculation {
  distance: number; // Distance in kilometers
  vehicleType: VehicleType; // Type of vehicle
  emissionFactor: number; // CO2 emissions per km for vehicle type
  carbonSaved: number; // Calculated carbon savings
}

// Emission factors (grams CO2 per kilometer)
const EMISSION_FACTORS = {
  SCOOTER: 0, // Electric scooters have zero emissions
  BIKE: 0, // Electric bikes have zero emissions
  CAR: 120, // Average car emissions
  SUV: 180, // SUV emissions
  TRUCK: 250, // Truck emissions
  MOTORCYCLE: 103, // Motorcycle emissions
  BUS: 105, // Bus emissions
  TRAIN: 41, // Train emissions
  WALKING: 0, // Walking has zero emissions
  CYCLING: 0, // Cycling has zero emissions
};

function calculateCarbonSaved(distance: number, vehicleType: VehicleType): number {
  const emissionFactor = EMISSION_FACTORS[vehicleType];
  return distance * emissionFactor;
}
```

#### Alternative Transportation Calculation

When users choose alternative transportation methods, carbon savings are calculated as the difference between conventional and sustainable options.

```typescript
function calculateAlternativeTransportSavings(
  distance: number,
  conventionalMethod: VehicleType,
  sustainableMethod: VehicleType
): number {
  const conventionalEmissions = distance * EMISSION_FACTORS[conventionalMethod];
  const sustainableEmissions = distance * EMISSION_FACTORS[sustainableMethod];
  return conventionalEmissions - sustainableEmissions;
}
```

### Reward Calculation Logic

#### Base Reward Calculation

Rewards are calculated based on carbon savings and user tier multipliers.

```typescript
interface RewardCalculation {
  carbonSaved: number; // Carbon saved in grams
  userTier: UserTier; // User's current tier
  baseRewardRate: number; // Base reward rate per gram of CO2
  tierMultiplier: number; // Tier-based multiplier
  totalReward: number; // Final reward amount
}

const BASE_REWARD_RATE = 0.001; // B3TR tokens per gram of CO2 saved
const TIER_MULTIPLIERS = {
  BRONZE: 1.0,
  SILVER: 1.2,
  GOLD: 1.5,
  PLATINUM: 2.0,
  DIAMOND: 2.5,
};

function calculateReward(carbonSaved: number, userTier: UserTier): number {
  const tierMultiplier = TIER_MULTIPLIERS[userTier];
  return carbonSaved * BASE_REWARD_RATE * tierMultiplier;
}
```

#### Streak Bonus Calculation

Users receive additional rewards for maintaining consistent upload streaks.

```typescript
interface StreakBonus {
  currentStreak: number; // Current consecutive days
  baseReward: number; // Base reward amount
  streakMultiplier: number; // Streak-based multiplier
  bonusReward: number; // Additional bonus reward
}

const STREAK_MULTIPLIERS = {
  7: 1.1, // 10% bonus for 7-day streak
  14: 1.25, // 25% bonus for 14-day streak
  30: 1.5, // 50% bonus for 30-day streak
  60: 2.0, // 100% bonus for 60-day streak
  90: 3.0, // 200% bonus for 90-day streak
};

function calculateStreakBonus(baseReward: number, currentStreak: number): number {
  let maxMultiplier = 1.0;
  
  for (const [days, multiplier] of Object.entries(STREAK_MULTIPLIERS)) {
    if (currentStreak >= parseInt(days)) {
      maxMultiplier = Math.max(maxMultiplier, multiplier);
    }
  }
  
  return baseReward * (maxMultiplier - 1.0); // Only the bonus portion
}
```

### Mileage Validation Logic

#### Progressive Mileage Validation

The system validates that new mileage readings are progressive and reasonable.

```typescript
interface MileageValidation {
  previousMileage: number; // Previous recorded mileage
  newMileage: number; // New mileage reading
  maxDailyDistance: number; // Maximum reasonable daily distance
  isValid: boolean; // Validation result
  reason?: string; // Reason for rejection if invalid
}

const MAX_DAILY_DISTANCES = {
  SCOOTER: 100, // Maximum 100km per day for scooters
  BIKE: 150, // Maximum 150km per day for bikes
  CAR: 500, // Maximum 500km per day for cars
  SUV: 600, // Maximum 600km per day for SUVs
  TRUCK: 800, // Maximum 800km per day for trucks
};

function validateMileage(
  previousMileage: number,
  newMileage: number,
  vehicleType: VehicleType
): MileageValidation {
  const distance = newMileage - previousMileage;
  const maxDailyDistance = MAX_DAILY_DISTANCES[vehicleType];
  
  if (newMileage <= previousMileage) {
    return {
      previousMileage,
      newMileage,
      maxDailyDistance,
      isValid: false,
      reason: "New mileage must be greater than previous mileage"
    };
  }
  
  if (distance > maxDailyDistance) {
    return {
      previousMileage,
      newMileage,
      maxDailyDistance,
      isValid: false,
      reason: `Distance exceeds maximum daily limit of ${maxDailyDistance}km for ${vehicleType}`
    };
  }
  
  return {
    previousMileage,
    newMileage,
    maxDailyDistance,
    isValid: true
  };
}
```

### Tier Advancement Logic

#### Tier Calculation Based on Metrics

User tiers are calculated based on total distance, upload frequency, and carbon savings.

```typescript
interface TierRequirements {
  tier: UserTier;
  minTotalDistance: number; // Minimum total distance in km
  minTotalUploads: number; // Minimum total uploads
  minCarbonSaved: number; // Minimum carbon saved in grams
  minStreakDays: number; // Minimum consecutive days
}

const TIER_REQUIREMENTS: TierRequirements[] = [
  {
    tier: "BRONZE",
    minTotalDistance: 0,
    minTotalUploads: 0,
    minCarbonSaved: 0,
    minStreakDays: 0,
  },
  {
    tier: "SILVER",
    minTotalDistance: 100,
    minTotalUploads: 10,
    minCarbonSaved: 12000, // 12kg CO2
    minStreakDays: 7,
  },
  {
    tier: "GOLD",
    minTotalDistance: 500,
    minTotalUploads: 50,
    minCarbonSaved: 60000, // 60kg CO2
    minStreakDays: 14,
  },
  {
    tier: "PLATINUM",
    minTotalDistance: 1000,
    minTotalUploads: 100,
    minCarbonSaved: 120000, // 120kg CO2
    minStreakDays: 30,
  },
  {
    tier: "DIAMOND",
    minTotalDistance: 2000,
    minTotalUploads: 200,
    minCarbonSaved: 240000, // 240kg CO2
    minStreakDays: 60,
  },
];

function calculateUserTier(userStats: UserStats): UserTier {
  for (let i = TIER_REQUIREMENTS.length - 1; i >= 0; i--) {
    const requirement = TIER_REQUIREMENTS[i];
    
    if (
      userStats.totalKilometers >= requirement.minTotalDistance &&
      userStats.totalUploads >= requirement.minTotalUploads &&
      userStats.totalCarbonSaved >= requirement.minCarbonSaved &&
      userStats.currentStreak >= requirement.minStreakDays
    ) {
      return requirement.tier;
    }
  }
  
  return "BRONZE";
}
```

### Leaderboard Scoring Logic

#### Weekly Score Calculation

Leaderboard scores are calculated based on multiple factors with weighted importance.

```typescript
interface LeaderboardScore {
  userId: string;
  weeklyDistance: number; // Distance traveled this week
  weeklyCarbonSaved: number; // Carbon saved this week
  weeklyStreak: number; // Current streak days
  weeklyUploads: number; // Number of uploads this week
  consistencyBonus: number; // Bonus for consistent daily uploads
  totalScore: number; // Final calculated score
}

const SCORE_WEIGHTS = {
  distance: 0.4, // 40% weight for distance
  carbonSaved: 0.3, // 30% weight for carbon savings
  streak: 0.2, // 20% weight for streak
  uploads: 0.1, // 10% weight for upload frequency
};

function calculateLeaderboardScore(userStats: WeeklyUserStats): number {
  const distanceScore = userStats.weeklyDistance * SCORE_WEIGHTS.distance;
  const carbonScore = userStats.weeklyCarbonSaved * SCORE_WEIGHTS.carbonSaved;
  const streakScore = userStats.weeklyStreak * 100 * SCORE_WEIGHTS.streak;
  const uploadScore = userStats.weeklyUploads * 10 * SCORE_WEIGHTS.uploads;
  
  // Consistency bonus for daily uploads
  const consistencyBonus = userStats.weeklyStreak >= 7 ? 500 : 0;
  
  return distanceScore + carbonScore + streakScore + uploadScore + consistencyBonus;
}
```

## 8. Current Flow Assumptions

### Platform Assumptions

#### User Behavior Assumptions

1. **Upload Frequency**: Users upload odometer readings daily or every few days
2. **Image Quality**: Users provide clear, readable odometer images
3. **Honest Reporting**: Users report accurate mileage readings
4. **Consistent Usage**: Users maintain regular vehicle usage patterns
5. **Device Availability**: Users have access to smartphones for photo capture

#### Technical Assumptions

1. **Image Processing**: AI can accurately extract mileage from most odometer images
2. **Network Connectivity**: Users have stable internet for uploads
3. **Storage Capacity**: Sufficient storage for image processing and storage
4. **Processing Speed**: Real-time or near-real-time image processing
5. **Data Accuracy**: GPS and timestamp data are accurate

#### Business Assumptions

1. **Token Value**: B3TR tokens have stable or appreciating value
2. **User Motivation**: Users are motivated by environmental impact and rewards
3. **Platform Growth**: Steady user acquisition and retention
4. **Regulatory Compliance**: Platform complies with relevant regulations
5. **Partnership Stability**: External partnerships remain stable

#### Environmental Assumptions

1. **Emission Factors**: Current emission factors accurately represent real-world emissions
2. **Carbon Impact**: Calculated carbon savings represent actual environmental impact
3. **Vehicle Efficiency**: Assumed vehicle efficiency remains consistent
4. **Alternative Transport**: Users have access to sustainable transportation options
5. **Infrastructure**: Supporting infrastructure for sustainable transport exists

#### Blockchain Assumptions

1. **Network Stability**: VeChain network remains stable and accessible
2. **Transaction Costs**: VTHO costs remain reasonable for regular transactions
3. **Smart Contract Security**: Smart contracts are secure and function as intended
4. **Wallet Integration**: Wallet integration remains seamless
5. **Token Distribution**: Reward distribution mechanisms work reliably

### Risk Mitigation Strategies

#### Technical Risks

- **Image Processing Failures**: Fallback to manual verification
- **Network Issues**: Offline mode with sync when connectivity returns
- **Data Loss**: Regular backups and redundancy
- **Performance Issues**: Scalable architecture and caching

#### Business Risks

- **Token Volatility**: Diversified reward mechanisms
- **User Churn**: Engagement features and community building
- **Regulatory Changes**: Flexible compliance framework
- **Competition**: Continuous innovation and user experience improvement

#### Environmental Risks

- **Inaccurate Calculations**: Regular review and update of emission factors
- **Greenwashing Concerns**: Transparent calculation methods and verification
- **Impact Measurement**: Third-party verification of environmental impact
- **Scalability**: Ensuring platform growth doesn't compromise accuracy

This comprehensive documentation of calculation logic and assumptions provides transparency and enables stakeholders to understand the mathematical foundations of the platform's reward and impact measurement systems.
