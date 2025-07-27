# VeChain API Documentation

This document outlines all the available API endpoints for VeChain blockchain operations in the ByteMe AI application.

## Base URL

All VeChain endpoints are prefixed with `/vechain` and require JWT authentication.

## Authentication

All endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Service Status

**GET** `/vechain/status`

Get the current status and configuration of the VeChain service.

**Response:**

```json
{
  "isInitialized": true,
  "adminAddress": "0x1234567890abcdef",
  "contractAddress": "0xabcdef1234567890",
  "network": "testnet",
  "nodeUrl": "https://testnet.veblocks.net"
}
```

### 2. Current Cycle

**GET** `/vechain/cycle/current`

Get the current cycle number from the EVDriveV2 smart contract.

**Response:**

```json
{
  "currentCycle": 5
}
```

### 3. Cycle Information

**GET** `/vechain/cycle/:cycleId`

Get detailed information about a specific cycle.

**Parameters:**

- `cycleId` (path): The cycle ID to get information for

**Response:**

```json
{
  "allocation": 1000000,
  "distributed": 750000,
  "remaining": 250000
}
```

### 4. Available Funds

**GET** `/vechain/funds/available`

Get the available funds in the rewards pool.

**Response:**

```json
{
  "availableFunds": 1000000
}
```

### 5. User Data

**GET** `/vechain/user/:address`

Get user data from the EVDriveV2 contract.

**Parameters:**

- `address` (path): User wallet address

**Response:**

```json
{
  "lastMiles": 150.5,
  "lastSubmissionDate": 1640995200,
  "carbonFootprint": 25.3,
  "exists": true
}
```

### 6. Global Statistics

**GET** `/vechain/stats/global`

Get global statistics from the EVDriveV2 contract.

**Response:**

```json
{
  "totalCarbon": 50000,
  "totalMilesDriven": 1000000,
  "usersJoined": 500,
  "totalRewardDistributed": 2500000,
  "currentCycle": 5
}
```

### 7. Set Cycle Reward

**POST** `/vechain/cycle/reward`

Set the reward amount for the current cycle (Admin only).

**Request Body:**

```json
{
  "rewardAmount": 1000000
}
```

**Response:**

```json
{
  "txid": "0x1234567890abcdef",
  "message": "Reward amount 1000000 set for cycle successfully"
}
```

### 7.1. Set Reward for Active Challenge

**POST** `/vechain/cycle/reward/active-challenge`

Automatically set the reward amount for the current cycle based on the currently active challenge (Admin only).

**Response:**

```json
{
  "txid": "0x1234567890abcdef",
  "challengeId": "challenge-uuid",
  "rewardAmount": 5000,
  "message": "Reward set for challenge \"Weekly Carbon Challenge\""
}
```

### 8. Distribute Rewards

**POST** `/vechain/rewards/distribute`

Distribute rewards in batch to multiple users (Admin only). **Processes in batches of 100 users at a time and validates available funds before distribution.**

**Request Body:**

```json
{
  "batchData": [
    {
      "user": "0x1234567890abcdef",
      "miles": 150.5,
      "amount": 100.0,
      "proofTypes": ["odometer", "gps"],
      "proofValues": ["150.5", "150.3"],
      "impactCodes": ["carbon_saved", "fuel_efficiency"],
      "impactValues": [25.3, 15.2],
      "description": "Weekly reward for eco-friendly driving"
    }
  ]
}
```

**Response:**

```json
{
  "txid": "0x1234567890abcdef",
  "totalDistributed": 1000,
  "batchCount": 1,
  "totalUsers": 1
}
```

### 9. Transaction Receipt

**GET** `/vechain/transaction/:txid/receipt`

Get the receipt for a specific transaction.

**Parameters:**

- `txid` (path): Transaction ID

**Response:**

```json
{
  "txid": "0x1234567890abcdef",
  "reverted": false,
  "gasUsed": 100000,
  "blockNumber": 12345
}
```

### 10. Transaction Confirmation

**GET** `/vechain/transaction/:txid/confirmed`

Check if a transaction is confirmed.

**Parameters:**

- `txid` (path): Transaction ID

**Response:**

```json
{
  "txid": "0x1234567890abcdef",
  "confirmed": true
}
```

### 11. Wallet Balance

**GET** `/vechain/balance/:address`

Get the native token balance for a wallet address.

**Parameters:**

- `address` (path): Wallet address

**Response:**

```json
{
  "address": "0x1234567890abcdef",
  "balance": 1000
}
```

### 12. B3TR Token Balance

**GET** `/vechain/balance/:address/b3tr`

Get the B3TR token balance for a wallet address.

**Parameters:**

- `address` (path): Wallet address

**Response:**

```json
{
  "address": "0x1234567890abcdef",
  "b3trBalance": 500
}
```

### 13. Network Health

**GET** `/vechain/network/health`

Get comprehensive VeChain network health information.

**Response:**

```json
{
  "status": "healthy",
  "blockHeight": 12345678,
  "lastBlockTime": "2024-01-15T10:30:00.000Z",
  "averageBlockTime": 3.2,
  "activeValidators": 101,
  "totalStaked": 50000000,
  "networkLoad": 65.5,
  "gasPrice": {
    "slow": 1.2,
    "standard": 2.5,
    "fast": 4.8
  }
}
```

### 14. Token Transfer

**POST** `/vechain/transfer`

Transfer tokens between addresses.

**Request Body:**

```json
{
  "fromAddress": "0x1234567890abcdef",
  "toAddress": "0xabcdef1234567890",
  "amount": 100
}
```

**Response:**

```json
{
  "txid": "0x1234567890abcdef",
  "success": true,
  "from": "0x1234567890abcdef",
  "to": "0xabcdef1234567890",
  "amount": 100
}
```

### 15. Network Statistics

**GET** `/vechain/network/stats`

Get comprehensive network statistics.

**Response:**

```json
{
  "blockHeight": 12345678,
  "lastBlockTime": "2024-01-15T10:30:00.000Z",
  "averageBlockTime": 3.2,
  "activeValidators": 101,
  "totalStaked": 50000000,
  "networkLoad": 65.5,
  "gasPrice": {
    "slow": 1.2,
    "standard": 2.5,
    "fast": 4.8
  }
}
```

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "Validation failed"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## Usage Examples

### JavaScript/TypeScript

```javascript
const API_BASE = "http://localhost:3000/vechain";

// Get service status
const status = await fetch(`${API_BASE}/status`, {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

// Distribute rewards
const rewardData = {
  batchData: [
    {
      user: "0x1234567890abcdef",
      miles: 150.5,
      amount: 100.0,
      proofTypes: ["odometer"],
      proofValues: ["150.5"],
      impactCodes: ["carbon_saved"],
      impactValues: [25.3],
      description: "Weekly reward",
    },
  ],
};

const response = await fetch(`${API_BASE}/rewards/distribute`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(rewardData),
});
```

### cURL

```bash
# Get current cycle
curl -X GET "http://localhost:3000/vechain/cycle/current" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Set cycle reward
curl -X POST "http://localhost:3000/vechain/cycle/reward" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rewardAmount": 1000000}'
```

## Notes

1. **Admin Functions**: Some endpoints (like setting cycle rewards and distributing rewards) are admin-only functions and should be restricted to authorized administrators.

2. **Mock Implementations**: Some functions currently return mock data (like balance checks and network statistics) and will need to be connected to actual VeChain network calls in production.

3. **Transaction Monitoring**: The transaction receipt and confirmation endpoints currently return mock data and should be connected to actual VeChain transaction monitoring.

4. **Error Handling**: All endpoints include proper error handling and will return appropriate HTTP status codes and error messages.

5. **Rate Limiting**: Consider implementing rate limiting for these endpoints to prevent abuse.

6. **Logging**: All blockchain operations are logged for audit purposes.
