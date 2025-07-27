# Development Guide

## Backend Development Setup

### Prerequisites

- **Node.js**: 18+ LTS version
- **PostgreSQL**: 14+
- **Redis**: 6+
- **VeChain Tools**: VeChainThor SDK, X-App template
- **Development Tools**: Git, VS Code/Cursor, Postman

### Environment Setup

#### 1. Backend Environment Variables

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/ev_odometer
REDIS_URL=redis://localhost:6379

# VeChain Blockchain Configuration
VECHAIN_NETWORK=testnet
VECHAIN_RPC_URL=https://testnet.vechain.org
VECHAIN_PRIVATE_KEY=your_private_key_here
VECHAIN_CONTRACT_ADDRESS=your_contract_address
VECHAIN_TOKEN_ADDRESS=your_token_address

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# File Storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name

# API Configuration
PORT=3001
NODE_ENV=development
```

#### 2. Database Setup

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run migrations
npm run migration:run

# Seed initial data
npm run seed
```

### Backend Project Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/              # Authentication & wallet integration
│   │   ├── users/             # User management
│   │   ├── odometer/          # Photo upload & AI processing
│   │   ├── rewards/           # Reward calculation & distribution
│   │   ├── blockchain/        # VeChain integration
│   │   └── analytics/         # Data aggregation
│   ├── common/
│   │   ├── guards/            # Authentication guards
│   │   ├── interceptors/      # Request/response handling
│   │   ├── pipes/             # Validation pipes
│   │   └── filters/           # Exception filters
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── blockchain.config.ts
│   │   └── app.config.ts
│   └── utils/
│       ├── blockchain.utils.ts
│       └── validation.utils.ts
├── test/                      # Test files
├── docs/                      # API documentation
└── docker/                    # Docker configuration
```

### Core Backend Modules

#### 1. Authentication Module

- **Purpose**: Handle wallet-based authentication
- **Key Features**: JWT tokens, wallet signature verification
- **Dependencies**: VeChainThor SDK, JWT

#### 2. Odometer Module

- **Purpose**: Process photo uploads and AI verification
- **Key Features**: Image processing, AI integration, upload management
- **Dependencies**: TensorFlow, image processing libraries

#### 3. Rewards Module

- **Purpose**: Calculate and distribute B3TR tokens
- **Key Features**: Reward calculation, blockchain transactions
- **Dependencies**: VeChain integration, smart contracts

#### 4. Blockchain Module

- **Purpose**: Handle all VeChain interactions
- **Key Features**: Smart contract calls, transaction management
- **Dependencies**: VeChainThor SDK, contract ABIs

## Blockchain Development Setup

### VeChain Configuration

#### 1. Network Setup

```typescript
// blockchain.config.ts
export const blockchainConfig = {
  // Testnet Configuration
  testnet: {
    networkId: 39,
    rpcUrl: "https://testnet.vechain.org",
    explorer: "https://explore-testnet.vechain.org",
    chainTag: 0x27,
  },

  // Mainnet Configuration
  mainnet: {
    networkId: 1,
    rpcUrl: "https://mainnet.veblocks.net",
    explorer: "https://explore.vechain.org",
    chainTag: 0x4a,
  },
};
```

#### 2. Smart Contract Deployment

```bash
# Deploy B3TR Token Contract
npx hardhat deploy --network testnet --contract B3TRToken

# Deploy Reward Distributor Contract
npx hardhat deploy --network testnet --contract RewardDistributor

# Verify contracts on explorer
npx hardhat verify --network testnet CONTRACT_ADDRESS
```

### Required Smart Contracts

#### 1. B3TR Token Contract

- **Purpose**: ERC-20 token for rewards
- **Features**: Minting, burning, transfer restrictions
- **Security**: Access control, blacklisting

#### 2. Reward Distributor Contract

- **Purpose**: Handle reward distribution logic
- **Features**: Automated distribution, upload verification
- **Security**: Owner controls, reentrancy protection

### Blockchain Integration Points

#### 1. Wallet Connection

- **VeWorld Integration**: Primary wallet connector
- **Sync2 Integration**: Alternative wallet option
- **X-App Template**: Standardized wallet integration

#### 2. Transaction Management

- **Gas Estimation**: Automatic gas calculation
- **Transaction Queue**: Handle high-volume transactions
- **Error Recovery**: Retry mechanisms for failed transactions

#### 3. Event Handling

- **Contract Events**: Listen for reward distributions
- **Transaction Confirmations**: Monitor transaction status
- **Error Notifications**: Alert on transaction failures

## Development Workflow

### 1. Local Development

```bash
# Start development servers
npm run start:dev

# Run tests
npm run test

# Check code quality
npm run lint
npm run format
```

### 2. Database Management

```bash
# Create migration
npm run migration:create -- src/migrations/CreateUsersTable

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### 3. Blockchain Testing

```bash
# Deploy to testnet
npm run deploy:testnet

# Run blockchain tests
npm run test:blockchain

# Verify contracts
npm run verify:contracts
```

## Testing Strategy

### 1. Unit Tests

- **Service Layer**: Test business logic
- **Blockchain Integration**: Mock VeChain interactions
- **Database Operations**: Test repository methods

### 2. Integration Tests

- **API Endpoints**: Test complete request flows
- **Database Integration**: Test with real database
- **Blockchain Integration**: Test with testnet

### 3. E2E Tests

- **User Workflows**: Complete user journeys
- **Blockchain Transactions**: End-to-end transaction flows
- **Error Scenarios**: Handle failure cases

## Deployment Preparation

### 1. Production Environment

```env
# Production Configuration
NODE_ENV=production
VECHAIN_NETWORK=mainnet
DATABASE_URL=production_db_url
REDIS_URL=production_redis_url
```

### 2. Docker Configuration

```dockerfile
# Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### 3. CI/CD Pipeline

```yaml
# GitHub Actions workflow
name: Deploy Backend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          npm install
          npm run build
          npm run deploy
```

## Key Development Considerations

### 1. Security

- **Private Key Management**: Secure storage of blockchain keys
- **Input Validation**: Validate all user inputs
- **Rate Limiting**: Prevent API abuse
- **Authentication**: Secure wallet-based auth

### 2. Performance

- **Database Optimization**: Proper indexing and queries
- **Caching Strategy**: Redis for frequently accessed data
- **Blockchain Optimization**: Batch transactions where possible
- **API Optimization**: Efficient response handling

### 3. Scalability

- **Horizontal Scaling**: Multiple API instances
- **Database Scaling**: Connection pooling and sharding
- **Blockchain Scaling**: Transaction queue management
- **Monitoring**: Performance and error tracking

### 4. Error Handling

- **Graceful Degradation**: Handle service failures
- **Retry Mechanisms**: Automatic retry for failed operations
- **Error Logging**: Comprehensive error tracking
- **User Feedback**: Clear error messages

## Development Tools

### 1. Code Quality

- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Jest**: Unit testing

### 2. Database Tools

- **TypeORM**: Database ORM
- **pgAdmin**: Database management
- **Redis Commander**: Redis management

### 3. Blockchain Tools

- **VeChainThor SDK**: Blockchain integration
- **Hardhat**: Smart contract development
- **VeChain Explorer**: Transaction monitoring
- **VeWorld**: Wallet testing

### 4. API Testing

- **Postman**: API testing and documentation
- **Swagger**: API documentation
- **Jest**: API endpoint testing

This development guide provides the essential setup and structure for backend and blockchain development, keeping it high-level and ready for the project approach.
