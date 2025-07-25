# API Documentation

## Overview

The EV Odometer Rewards API provides endpoints for managing user accounts, odometer photo uploads, reward calculations, and blockchain transactions. The API follows RESTful principles and uses JSON for data exchange.

**Base URL**: `https://api.evodometer.com/v1`  
**Authentication**: Bearer Token (JWT) + Blockchain Wallet Signature  
**Content-Type**: `application/json`

## Authentication

### Blockchain Wallet Authentication

The API uses a hybrid authentication system combining JWT tokens with blockchain wallet signatures for enhanced security.

```typescript
// Authentication Header Format
Authorization: Bearer <jwt_token>
X-Wallet-Signature: <wallet_signature>
X-Wallet-Address: <wallet_address>
```

### Getting Started

1. **Connect Wallet**: User connects their VeChain wallet (VeWorld, Sync2, etc.)
2. **Sign Message**: User signs a challenge message with their wallet
3. **Get JWT Token**: Server validates signature and returns JWT token
4. **API Access**: Use JWT token for subsequent API calls

## Endpoints

### Authentication

#### POST /auth/connect-wallet

Connect a VeChain wallet and get authentication token.

**Request Body:**

```json
{
  "walletAddress": "0x1234567890abcdef...",
  "signature": "0xabcdef1234567890...",
  "message": "Connect to EV Odometer Rewards - Timestamp: 1640995200"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 123,
      "walletAddress": "0x1234567890abcdef...",
      "email": "user@example.com",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Wallet connected successfully"
}
```

#### POST /auth/refresh

Refresh the JWT token.

**Headers:**

```
Authorization: Bearer <current_jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token refreshed successfully"
}
```

### User Management

#### GET /user/profile

Get current user profile information.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "walletAddress": "0x1234567890abcdef...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "totalMileage": 15000,
    "totalRewards": 1500,
    "sustainabilityScore": 85,
    "createdAt": "2024-01-01T00:00:00Z",
    "lastUploadAt": "2024-01-15T10:30:00Z"
  },
  "message": "Profile retrieved successfully"
}
```

#### PUT /user/profile

Update user profile information.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "preferences": {
    "notifications": true,
    "privacy": "public"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "updatedAt": "2024-01-15T12:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

### Odometer Upload

#### POST /odometer/upload

Upload an odometer photo for mileage verification and reward calculation.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

```
photo: <image_file> (JPG, PNG, max 10MB)
notes: "Optional notes about the upload"
location: "Optional GPS coordinates"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 456,
    "userId": 123,
    "imageUrl": "https://storage.evodometer.com/uploads/456.jpg",
    "detectedMileage": 15250,
    "confidence": 0.95,
    "rewards": 25,
    "status": "verified",
    "createdAt": "2024-01-15T10:30:00Z",
    "verifiedAt": "2024-01-15T10:31:00Z",
    "blockchainTx": "0xabcdef1234567890..."
  },
  "message": "Odometer photo uploaded and verified successfully"
}
```

#### GET /odometer/uploads

Get user's odometer upload history.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `status` (string): Filter by status (pending, verified, rejected)
- `startDate` (string): Filter by start date (ISO format)
- `endDate` (string): Filter by end date (ISO format)

**Response:**

```json
{
  "success": true,
  "data": {
    "uploads": [
      {
        "id": 456,
        "imageUrl": "https://storage.evodometer.com/uploads/456.jpg",
        "detectedMileage": 15250,
        "confidence": 0.95,
        "rewards": 25,
        "status": "verified",
        "createdAt": "2024-01-15T10:30:00Z",
        "verifiedAt": "2024-01-15T10:31:00Z",
        "blockchainTx": "0xabcdef1234567890..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  },
  "message": "Uploads retrieved successfully"
}
```

#### GET /odometer/uploads/:id

Get specific odometer upload details.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 456,
    "userId": 123,
    "imageUrl": "https://storage.evodometer.com/uploads/456.jpg",
    "detectedMileage": 15250,
    "confidence": 0.95,
    "rewards": 25,
    "status": "verified",
    "notes": "Uploaded from mobile app",
    "location": "40.7128,-74.0060",
    "createdAt": "2024-01-15T10:30:00Z",
    "verifiedAt": "2024-01-15T10:31:00Z",
    "blockchainTx": "0xabcdef1234567890...",
    "aiAnalysis": {
      "modelVersion": "1.2.0",
      "processingTime": 2.5,
      "confidence": 0.95,
      "boundingBox": [100, 150, 300, 200]
    }
  },
  "message": "Upload details retrieved successfully"
}
```

### Rewards

#### GET /rewards/balance

Get user's current reward balance.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalEarned": 1500,
    "totalDistributed": 1200,
    "currentBalance": 300,
    "pendingRewards": 25,
    "currency": "B3TR",
    "lastUpdated": "2024-01-15T10:31:00Z"
  },
  "message": "Balance retrieved successfully"
}
```

#### GET /rewards/history

Get user's reward transaction history.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `type` (string): Filter by type (earned, distributed, pending)

**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 789,
        "type": "earned",
        "amount": 25,
        "currency": "B3TR",
        "description": "Odometer upload #456",
        "blockchainTx": "0xabcdef1234567890...",
        "status": "confirmed",
        "createdAt": "2024-01-15T10:31:00Z",
        "confirmedAt": "2024-01-15T10:32:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 30,
      "totalPages": 2
    }
  },
  "message": "Reward history retrieved successfully"
}
```

#### POST /rewards/withdraw

Withdraw rewards to user's wallet.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
{
  "amount": 100,
  "walletAddress": "0x1234567890abcdef..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 790,
    "amount": 100,
    "currency": "B3TR",
    "walletAddress": "0x1234567890abcdef...",
    "blockchainTx": "0xabcdef1234567890...",
    "status": "pending",
    "createdAt": "2024-01-15T12:00:00Z",
    "estimatedConfirmation": "2024-01-15T12:05:00Z"
  },
  "message": "Withdrawal initiated successfully"
}
```

### Analytics

#### GET /analytics/dashboard

Get user's dashboard analytics.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `period` (string): Time period (week, month, year, all)

**Response:**

```json
{
  "success": true,
  "data": {
    "totalMileage": 15000,
    "totalRewards": 1500,
    "sustainabilityScore": 85,
    "carbonOffset": 2.5,
    "uploadCount": 50,
    "streakDays": 15,
    "rank": 1250,
    "periodStats": {
      "mileage": [100, 150, 200, 180, 220, 190, 210],
      "rewards": [10, 15, 20, 18, 22, 19, 21],
      "dates": [
        "2024-01-09",
        "2024-01-10",
        "2024-01-11",
        "2024-01-12",
        "2024-01-13",
        "2024-01-14",
        "2024-01-15"
      ]
    },
    "achievements": [
      {
        "id": 1,
        "name": "First Upload",
        "description": "Upload your first odometer photo",
        "earnedAt": "2024-01-01T10:00:00Z"
      }
    ]
  },
  "message": "Dashboard analytics retrieved successfully"
}
```

#### GET /analytics/leaderboard

Get global leaderboard.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `period` (string): Time period (week, month, year, all)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

**Response:**

```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": 456,
        "walletAddress": "0xabcdef1234567890...",
        "totalMileage": 50000,
        "totalRewards": 5000,
        "sustainabilityScore": 95,
        "uploadCount": 150
      }
    ],
    "userRank": 1250,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10000,
      "totalPages": 500
    }
  },
  "message": "Leaderboard retrieved successfully"
}
```

### Blockchain

#### GET /blockchain/status

Get blockchain network status.

**Response:**

```json
{
  "success": true,
  "data": {
    "network": "mainnet",
    "blockHeight": 12345678,
    "gasPrice": "1000000000",
    "contractAddress": "0x1234567890abcdef...",
    "tokenSymbol": "B3TR",
    "tokenDecimals": 18,
    "lastUpdated": "2024-01-15T12:00:00Z"
  },
  "message": "Blockchain status retrieved successfully"
}
```

#### GET /blockchain/transaction/:txHash

Get blockchain transaction details.

**Response:**

```json
{
  "success": true,
  "data": {
    "txHash": "0xabcdef1234567890...",
    "blockNumber": 12345678,
    "from": "0x1234567890abcdef...",
    "to": "0xabcdef1234567890...",
    "value": "25000000000000000000",
    "gasUsed": 21000,
    "gasPrice": "1000000000",
    "status": "confirmed",
    "timestamp": "2024-01-15T10:32:00Z",
    "confirmations": 12
  },
  "message": "Transaction details retrieved successfully"
}
```

## Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

### Common Error Codes

| Code                  | HTTP Status | Description                    |
| --------------------- | ----------- | ------------------------------ |
| `UNAUTHORIZED`        | 401         | Authentication required        |
| `FORBIDDEN`           | 403         | Insufficient permissions       |
| `NOT_FOUND`           | 404         | Resource not found             |
| `VALIDATION_ERROR`    | 422         | Request validation failed      |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests              |
| `INTERNAL_ERROR`      | 500         | Internal server error          |
| `BLOCKCHAIN_ERROR`    | 503         | Blockchain service unavailable |
| `AI_SERVICE_ERROR`    | 503         | AI service unavailable         |

### Example Error Responses

#### Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "photo": "Image file is required",
      "photo.size": "Image size must be less than 10MB"
    }
  }
}
```

#### Blockchain Error

```json
{
  "success": false,
  "error": {
    "code": "BLOCKCHAIN_ERROR",
    "message": "Failed to process blockchain transaction",
    "details": {
      "reason": "Insufficient gas",
      "suggestedGas": "50000"
    }
  }
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Authentication endpoints**: 5 requests per minute
- **Upload endpoints**: 10 requests per hour
- **General endpoints**: 100 requests per minute
- **Analytics endpoints**: 30 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

The API supports webhooks for real-time notifications:

### Webhook Events

- `odometer.uploaded` - New odometer photo uploaded
- `odometer.verified` - Odometer photo verified by AI
- `rewards.earned` - New rewards earned
- `rewards.distributed` - Rewards distributed to wallet
- `user.registered` - New user registered

### Webhook Format

```json
{
  "event": "odometer.verified",
  "timestamp": "2024-01-15T10:31:00Z",
  "data": {
    "uploadId": 456,
    "userId": 123,
    "mileage": 15250,
    "rewards": 25
  },
  "signature": "sha256=..."
}
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install ev-odometer-sdk
```

```typescript
import { EVOdometerAPI } from "ev-odometer-sdk";

const api = new EVOdometerAPI({
  baseUrl: "https://api.evodometer.com/v1",
  walletAddress: "0x1234567890abcdef...",
});

// Upload odometer photo
const result = await api.uploadOdometerPhoto(file);
```

### Flutter/Dart

```yaml
dependencies:
  ev_odometer_sdk: ^1.0.0
```

```dart
import 'package:ev_odometer_sdk/ev_odometer_sdk.dart';

final api = EVOdometerAPI(
  baseUrl: 'https://api.evodometer.com/v1',
  walletAddress: '0x1234567890abcdef...',
);

// Upload odometer photo
final result = await api.uploadOdometerPhoto(file);
```

## Testing

### Test Environment

- **Base URL**: `https://test-api.evodometer.com/v1`
- **Test Wallet**: Use VeChain testnet wallets
- **Test Tokens**: Use test B3TR tokens

### Postman Collection

Download our Postman collection for easy API testing:
[EV Odometer API Collection](https://api.evodometer.com/postman-collection.json)

## Support

For API support and questions:

- **Documentation**: [https://docs.evodometer.com](https://docs.evodometer.com)
- **GitHub Issues**: [https://github.com/evodometer/api/issues](https://github.com/evodometer/api/issues)
- **Email**: api-support@evodometer.com
- **Discord**: [https://discord.gg/evodometer](https://discord.gg/evodometer)
