# Blockchain Contract Documentation

## Overview

This document provides comprehensive documentation for the blockchain integration in the Drive & Earn platform, focusing on VeChain blockchain integration, smart contract interactions, and token management.

## VeChain Integration

### What is VeChain?

**VeChain** is an enterprise-grade, highly scalable Layer-1 blockchain platform built for transparent, efficient, and low-carbon applications. Originally developed to transform supply chain and business process management, VeChain provides a robust environment for decentralized apps (dApps), including sustainable and real-world impact projects.

**Key Features:**

- **High Performance:** Fast block time (~10s) with very low energy consumption
- **Real-world Adoption:** Used by major global brands like Walmart China, BMW, and DNV
- **Proof-of-Authority (PoA):** Energy efficient and reliable consensus mechanism
- **Dual-token Model:** VET (main currency) and VTHO (for transaction fees)

### VeBetter DAO Integration

**VeBetter DAO** is a decentralized autonomous organization built on VeChain to incentivize positive, sustainability-focused actions in the real world.

**Key Features:**

- **Tokenized Sustainable Actions:** Each action can be recorded and rewarded with tokens
- **Transparent and Cost-effective:** Low overhead and auditable records
- **Governance:** Uses quadratic voting (QV) for fair, community-driven decision making

## Smart Contract Architecture

### EVDriveV2 Contract

The platform uses the **EVDriveV2** smart contract for managing sustainable mobility use-cases and reward distribution.

#### Contract Addresses

- **Testnet:** `0x...` (Configured via environment variables)
- **Mainnet:** `0x...` (Configured via environment variables)

#### Key Functions

##### View Functions

```solidity
// Get current reward cycle
function getCurrentCycle() external view returns (uint256)

// Get cycle information
function getCycleInfo(uint256 _cycleId) external view returns (
    uint256 allocation,
    uint256 distributed,
    uint256 remaining
)

// Get available funds for distribution
function getAvailableFunds() external view returns (uint256)

// Get user data
function getUserData(address user) external view returns (
    uint256 lastMiles,
    uint256 lastSubmissionDate,
    uint256 carbonFootprint,
    bool exists
)

// Get global statistics
function getGlobalStats() external view returns (
    uint256 _totalCarbon,
    uint256 _totalMilesDriven,
    uint256 _usersJoined,
    uint256 _totalRewardDistributed,
    uint256 _currentCycle
)
```

##### State-Changing Functions

```solidity
// Set reward amount for current cycle
function setRewardForCycle(uint256 _rewardAmount) external

// Distribute batch rewards
function distributeBatchRewards(BatchRewardInput[] memory batch) external
```

#### Events

```solidity
event BatchRewardsDistributed(
    uint256 indexed cycleId,
    uint256 usersCount,
    uint256 totalRewards,
    uint256 timestamp
);

event UserRewarded(
    address indexed user,
    uint256 miles,
    uint256 amount,
    uint256 timestamp
);
```

## Implementation Details

### Core Services

#### 1. VeChainService (`src/common/blockchain/vechain.service.ts`)

**Primary blockchain interaction service with the following capabilities:**

##### Initialization

```typescript
// Initialize VeChain connection
private initializeVeChain(): void {
    // Configure Thor client
    // Set up contract instance
    // Initialize wallet from mnemonic
}
```

##### Contract Interactions

```typescript
// Get current cycle
async getCurrentCycle(): Promise<number>

// Get cycle information
async getCycleInfo(cycleId: number): Promise<{
    allocation: number;
    distributed: number;
    remaining: number;
}>

// Get user data
async getUserData(userAddress: string): Promise<{
    lastMiles: number;
    lastSubmissionDate: number;
    carbonFootprint: number;
    exists: boolean;
}>

// Get global statistics
async getGlobalStats(): Promise<{
    totalCarbon: number;
    totalMilesDriven: number;
    usersJoined: number;
    totalRewardDistributed: number;
    currentCycle: number;
}>
```

##### Reward Distribution

```typescript
// Distribute rewards in batch
async distributeRewards(batchData: Array<{
    user: string;
    miles: number;
    amount: number;
    proofTypes: string[];
    proofValues: string[];
    impactCodes: string[];
    impactValues: number[];
    description: string;
}>): Promise<{
    txid: string;
    totalDistributed: number;
    batchCount: number;
    totalUsers: number;
}>
```

##### Transaction Management

```typescript
// Get transaction receipt
async getTransactionReceipt(txid: string): Promise<any>

// Check transaction confirmation
async isTransactionConfirmed(txid: string): Promise<boolean>

// Get detailed transaction information
async getTransactionDetails(txid: string): Promise<{
    txid: string;
    blockNumber: number;
    blockTime: Date;
    from: string;
    to: string;
    value: string;
    gasUsed: number;
    gasPrice: string;
    status: "success" | "failed" | "pending";
    confirmations: number;
    // ... additional fields
}>
```

#### 2. BlockchainService (`src/modules/blockchain/services/blockchain.service.ts`)

**High-level blockchain operations and business logic:**

##### Carbon Credit Tokenization

```typescript
async tokenizeCarbonSavings(
    userId: string,
    carbonAmount: number,
    metadata: any
): Promise<CarbonCreditToken>
```

##### Token Transfers

```typescript
async transferB3TRTokens(
    fromUserId: string,
    toUserId: string,
    amount: number,
    metadata?: any
): Promise<BlockchainTransaction>
```

##### Reward Claims

```typescript
async claimRewards(
    userId: string,
    rewardIds: string[]
): Promise<BlockchainTransaction[]>
```

##### Analytics and Monitoring

```typescript
// Get transaction monitoring
async getTransactionMonitoring(userId?: string): Promise<{
    pendingTransactions: BlockchainTransaction[];
    recentTransactions: BlockchainTransaction[];
    networkStats: {
        totalTransactions: number;
        averageGasPrice: number;
        networkLoad: number;
        blockTime: number;
    };
}>

// Get carbon credit marketplace data
async getCarbonCreditMarketplace(): Promise<CarbonCreditMarketplace>

// Get wallet analytics
async getWalletAnalytics(userId: string): Promise<WalletAnalytics>
```

#### 3. VeChainWalletService (`src/common/blockchain/vechain-wallet.service.ts`)

**Wallet management and authentication:**

```typescript
// Generate wallet from mnemonic
async generateWalletFromMnemonic(mnemonic: string): Promise<{
    address: string;
    privateKey: string;
    publicKey: string;
}>

// Sign message
async signMessage(message: string, privateKey: string): Promise<string>

// Verify signature
async verifySignature(
    message: string,
    signature: string,
    address: string
): Promise<boolean>
```

## API Endpoints

### Blockchain Controller (`src/modules/blockchain/controllers/blockchain.controller.ts`)

#### GET `/blockchain/status`

Get blockchain network status and health information.

#### GET `/blockchain/contract/stats`

Get smart contract statistics and global data.

#### GET `/blockchain/user/:userId/data`

Get user's blockchain data including balances and transaction history.

#### POST `/blockchain/rewards/distribute`

Distribute rewards to users based on their activities.

#### GET `/blockchain/transactions`

Get transaction monitoring and analytics.

#### GET `/blockchain/marketplace`

Get carbon credit marketplace data.

### VeChain Controller (`src/modules/blockchain/controllers/vechain.controller.ts`)

#### GET `/vechain/network/health`

Get VeChain network health status.

#### GET `/vechain/contract/cycle/:cycleId`

Get specific cycle information.

#### GET `/vechain/user/:address/data`

Get user data from smart contract.

#### POST `/vechain/rewards/batch`

Distribute batch rewards to multiple users.

## Configuration

### Environment Variables

```bash
# VeChain Configuration
VECHAIN_NODE_URL=https://testnet.vechain.org
VECHAIN_NETWORK=testnet
VECHAIN_CONTRACT_ADDRESS=0x...
VECHAIN_ADMIN_MNEMONIC="your mnemonic phrase here"

# Blockchain Configuration
BLOCKCHAIN_GAS_LIMIT=5000000
BLOCKCHAIN_CONFIRMATION_BLOCKS=12
BLOCKCHAIN_RETRY_ATTEMPTS=3
BLOCKCHAIN_RETRY_DELAY=5000
```

### Network Configuration

#### Testnet

- **Node URL:** `https://testnet.vechain.org`
- **Chain ID:** `1`
- **Block Time:** ~10 seconds
- **Gas Limit:** 5,000,000

#### Mainnet

- **Node URL:** `https://mainnet.vechain.org`
- **Chain ID:** `1`
- **Block Time:** ~10 seconds
- **Gas Limit:** 5,000,000

## Integration Patterns

### 1. Reward Distribution Flow

```typescript
// 1. Calculate rewards based on user activities
const rewards = await calculateUserRewards(userId);

// 2. Prepare batch data for smart contract
const batchData = rewards.map((reward) => ({
  user: reward.userAddress,
  miles: reward.miles,
  amount: reward.amount,
  proofTypes: reward.proofTypes,
  proofValues: reward.proofValues,
  impactCodes: reward.impactCodes,
  impactValues: reward.impactValues,
  description: reward.description,
}));

// 3. Distribute rewards via smart contract
const result = await vechainService.distributeRewards(batchData);

// 4. Monitor transaction
const isConfirmed = await vechainService.isTransactionConfirmed(result.txid);
```

### 2. Carbon Credit Tokenization

```typescript
// 1. Calculate carbon savings
const carbonSaved = calculateCarbonSavings(miles, vehicleType);

// 2. Tokenize carbon savings
const carbonToken = await blockchainService.tokenizeCarbonSavings(
  userId,
  carbonSaved,
  {
    vehicleType,
    routeOptimization: true,
    ecoFriendlyScore: 85,
    verificationMethod: "ai_ocr",
  }
);

// 3. Update user portfolio
await updateUserPortfolio(userId, carbonToken);
```

### 3. Transaction Monitoring

```typescript
// 1. Subscribe to smart contract events
await blockchainService.subscribeToSmartContractEvents(
  contractAddress,
  "BatchRewardsDistributed"
);

// 2. Monitor transaction status
const monitoring = await blockchainService.getTransactionMonitoring(userId);

// 3. Handle transaction updates
if (monitoring.pendingTransactions.length > 0) {
  // Update UI with pending transactions
}
```

## Error Handling

### Common Error Scenarios

#### 1. Network Errors

```typescript
try {
  const result = await vechainService.distributeRewards(batchData);
} catch (error) {
  if (error.code === "NETWORK_ERROR") {
    // Retry with exponential backoff
    await retryWithBackoff(() => vechainService.distributeRewards(batchData));
  }
}
```

#### 2. Gas Estimation Errors

```typescript
try {
  const txid = await vechainService.setRewardForCycle(rewardAmount);
} catch (error) {
  if (error.message.includes("gas estimation failed")) {
    // Use higher gas limit
    const txid = await vechainService.setRewardForCycle(rewardAmount, {
      gasLimit: 10000000,
    });
  }
}
```

#### 3. Transaction Failures

```typescript
const txid = await vechainService.distributeRewards(batchData);
const isConfirmed = await vechainService.isTransactionConfirmed(txid);

if (!isConfirmed) {
  // Handle failed transaction
  await handleFailedTransaction(txid);
}
```

## Security Considerations

### 1. Private Key Management

- **Mnemonic Storage:** Securely stored in environment variables
- **Key Derivation:** Uses BIP39/BIP44 standards
- **Access Control:** Limited to authorized services only

### 2. Transaction Validation

- **Input Validation:** All inputs validated before blockchain submission
- **Gas Estimation:** Proper gas estimation to prevent transaction failures
- **Confirmation Monitoring:** Wait for sufficient confirmations

### 3. Rate Limiting

- **API Rate Limits:** Implemented to prevent spam
- **Transaction Batching:** Batch multiple operations to reduce gas costs
- **Retry Logic:** Exponential backoff for failed transactions

## Testing

### Unit Tests

```bash
# Run blockchain service tests
npm run test src/modules/blockchain/services/blockchain.service.spec.ts

# Run VeChain service tests
npm run test src/common/blockchain/vechain.service.spec.ts
```

### Integration Tests

```bash
# Run blockchain integration tests
npm run test:e2e src/modules/blockchain/blockchain.e2e-spec.ts
```

### Test Scripts

```bash
# Test VeChain connection
node scripts/test-vechain-api.js

# Test wallet operations
node scripts/test-vechain-wallet.js

# Test encrypted wallet
node scripts/test-encrypted-wallet.js
```

## Monitoring and Analytics

### Key Metrics

- **Transaction Success Rate:** Monitor successful vs failed transactions
- **Gas Usage:** Track gas consumption patterns
- **Network Health:** Monitor VeChain network status
- **User Activity:** Track user engagement with blockchain features

### Logging

```typescript
// Log blockchain operations
this.logger.log("Distributing rewards", {
  batchSize: batchData.length,
  totalAmount: totalAmount,
  cycleId: currentCycle,
});

// Log errors with context
this.logger.error("Transaction failed", {
  txid,
  error: error.message,
  batchData: batchData.length,
});
```

## Best Practices

### 1. Gas Optimization

- **Batch Operations:** Group multiple operations into single transactions
- **Gas Estimation:** Always estimate gas before submitting transactions
- **Gas Price Strategy:** Use appropriate gas prices based on network conditions

### 2. Error Recovery

- **Retry Logic:** Implement exponential backoff for transient failures
- **Fallback Mechanisms:** Provide alternative paths when blockchain operations fail
- **User Feedback:** Clear error messages for users

### 3. Security

- **Input Validation:** Validate all inputs before blockchain submission
- **Access Control:** Implement proper authorization for blockchain operations
- **Audit Logging:** Log all blockchain operations for audit purposes

## Resources

- [VeChain Documentation](https://docs.vechain.org/)
- [VeBetter DAO](https://vebetterdao.org/)
- [Thor DevKit Documentation](https://docs.vechain.org/developer-resources/frameworks-and-tools/thor-devkit)
- [VeChain SDK Network](https://docs.vechain.org/developer-resources/frameworks-and-tools/vechain-sdk-network)

---

_This documentation reflects the current implementation as of the latest codebase. For the most up-to-date information, refer to the source code and official VeChain documentation._
