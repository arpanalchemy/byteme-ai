# Technical Architecture

## System Overview

The EV Odometer Rewards system is a distributed, microservices-based architecture designed to handle blockchain transactions, AI-powered image recognition, and real-time reward distribution. The system prioritizes scalability, security, and sustainability.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Web Dashboard (NextJS)  │  Mobile App (Flutter)  │  API Gateway │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Load Balancer  │  Rate Limiting  │  Authentication  │  Caching  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  User Service  │  Odometer Service  │  Reward Service  │  AI Service │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Infrastructure Layer                       │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis  │  VeChain  │  AI Services  │  Storage  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Frontend Layer

#### Web Dashboard (NextJS)

- **Framework**: Next.js 14 with React 18
- **State Management**: Zustand for global state
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Chart.js for data visualization
- **Blockchain Integration**: VeChain wallet connectors

**Key Components:**

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── dashboard/             # Dashboard-specific components
│   ├── blockchain/            # Wallet integration components
│   └── charts/                # Data visualization components
├── pages/
│   ├── dashboard/             # Main dashboard
│   ├── upload/                # Photo upload interface
│   ├── rewards/               # Reward management
│   └── analytics/             # Analytics and leaderboards
├── hooks/
│   ├── useWallet.ts           # Wallet connection hook
│   ├── useOdometer.ts         # Odometer upload hook
│   └── useRewards.ts          # Rewards management hook
├── services/
│   ├── api.ts                 # API client
│   ├── blockchain.ts          # VeChain integration
│   └── storage.ts             # File storage service
└── utils/
    ├── validation.ts          # Form validation
    ├── formatting.ts          # Data formatting
    └── constants.ts           # App constants
```

#### Mobile App (Flutter)

- **Framework**: Flutter 3.x with Dart
- **State Management**: Provider/Riverpod
- **Local Storage**: Hive for offline data
- **Camera Integration**: Camera plugin with image capture
- **AI Processing**: TensorFlow Lite for on-device processing

**Key Components:**

```
lib/
├── screens/
│   ├── auth/                  # Authentication screens
│   ├── dashboard/             # Main dashboard
│   ├── upload/                # Photo upload
│   └── rewards/               # Reward tracking
├── widgets/
│   ├── common/                # Reusable widgets
│   ├── camera/                # Camera widgets
│   └── charts/                # Data visualization
├── services/
│   ├── api_service.dart       # API client
│   ├── blockchain_service.dart # VeChain integration
│   ├── camera_service.dart    # Camera operations
│   └── ai_service.dart        # TensorFlow Lite integration
├── models/
│   ├── user.dart              # User model
│   ├── odometer_upload.dart   # Upload model
│   └── reward.dart            # Reward model
└── utils/
    ├── constants.dart          # App constants
    ├── helpers.dart            # Utility functions
    └── validators.dart         # Validation logic
```

### 2. Backend Layer

#### API Gateway (NestJS)

- **Framework**: NestJS with TypeScript
- **Authentication**: JWT + Blockchain wallet verification
- **Rate Limiting**: Redis-based rate limiting
- **Caching**: Redis for response caching
- **Documentation**: Swagger/OpenAPI

**Module Structure:**

```
src/
├── modules/
│   ├── auth/                  # Authentication module
│   ├── users/                 # User management
│   ├── odometer/              # Odometer uploads
│   ├── rewards/               # Reward management
│   ├── analytics/             # Analytics and reporting
│   └── blockchain/            # VeChain integration
├── common/
│   ├── guards/                # Authentication guards
│   ├── interceptors/          # Request/response interceptors
│   ├── pipes/                 # Validation pipes
│   ├── filters/               # Exception filters
│   └── decorators/            # Custom decorators
├── config/
│   ├── database.config.ts     # Database configuration
│   ├── blockchain.config.ts   # VeChain configuration
│   └── ai.config.ts           # AI service configuration
└── utils/
    ├── blockchain.utils.ts    # Blockchain utilities
    ├── ai.utils.ts            # AI processing utilities
    └── validation.utils.ts    # Validation utilities
```

#### Core Services

**User Service:**

- User registration and authentication
- Profile management
- Wallet integration
- Session management

**Odometer Service:**

- Photo upload handling
- Image validation and processing
- AI integration for mileage detection
- Upload history management

**Reward Service:**

- Reward calculation logic
- Blockchain transaction management
- Reward distribution
- Transaction history

**Analytics Service:**

- Data aggregation and reporting
- Leaderboard calculations
- Sustainability metrics
- Performance analytics

### 3. Infrastructure Layer

#### Database (PostgreSQL)

- **Primary Database**: PostgreSQL 14+
- **ORM**: TypeORM with query builders
- **Migrations**: Automated schema migrations
- **Backup**: Automated daily backups

**Schema Design:**

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    total_mileage INTEGER DEFAULT 0,
    total_rewards DECIMAL(18,8) DEFAULT 0,
    sustainability_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Odometer uploads table
CREATE TABLE odometer_uploads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    image_url VARCHAR(500) NOT NULL,
    detected_mileage INTEGER NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    rewards DECIMAL(18,8) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    location VARCHAR(100),
    blockchain_tx VARCHAR(66),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

-- Reward transactions table
CREATE TABLE reward_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    upload_id INTEGER REFERENCES odometer_uploads(id),
    type VARCHAR(20) NOT NULL, -- 'earned', 'distributed', 'withdrawn'
    amount DECIMAL(18,8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'B3TR',
    blockchain_tx VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);
```

#### Caching (Redis)

- **Session Storage**: User sessions and authentication
- **Rate Limiting**: API rate limiting data
- **Response Caching**: Frequently accessed data
- **Queue Management**: Background job queues

#### File Storage

- **Cloud Storage**: AWS S3 / Google Cloud Storage
- **Image Processing**: Automatic resizing and optimization
- **CDN**: Global content delivery network
- **Backup**: Automated backup and versioning

### 4. Blockchain Integration

#### VeChain Integration

- **Network**: VeChain Thor mainnet/testnet
- **SDK**: VeChainThor SDK
- **Smart Contracts**: Solidity contracts for reward distribution
- **Wallet Integration**: X-App template for wallet connectivity

**Smart Contract Architecture:**

```solidity
// B3TR Token Contract
contract B3TRToken is ERC20 {
    address public owner;
    mapping(address => bool) public authorizedMinters;

    constructor() ERC20("B3TR Token", "B3TR") {
        owner = msg.sender;
    }

    function mint(address to, uint256 amount) external {
        require(authorizedMinters[msg.sender], "Not authorized");
        _mint(to, amount);
    }
}

// Reward Distribution Contract
contract RewardDistributor {
    B3TRToken public token;
    address public owner;

    constructor(address _token) {
        token = B3TRToken(_token);
        owner = msg.sender;
    }

    function distributeReward(address user, uint256 amount) external {
        require(msg.sender == owner, "Not authorized");
        token.mint(user, amount);
    }
}
```

### 5. AI/ML Integration

#### Image Recognition Pipeline

- **Framework**: TensorFlow Lite for mobile, TensorFlow for backend
- **Model**: Custom CNN for odometer digit recognition
- **Preprocessing**: Image enhancement and normalization
- **Post-processing**: Confidence scoring and validation

**AI Processing Flow:**

```
1. Image Upload → 2. Preprocessing → 3. Model Inference → 4. Post-processing → 5. Validation
```

## Data Flow Architecture

### 1. Photo Upload Flow

```
User → Mobile App → API Gateway → Odometer Service → AI Service → Database → Blockchain → User
```

**Detailed Flow:**

1. **User captures photo** using mobile app camera
2. **Image preprocessing** on device (TensorFlow Lite)
3. **Upload to backend** via secure API
4. **Server-side AI processing** for verification
5. **Database storage** of upload record
6. **Reward calculation** based on mileage
7. **Blockchain transaction** for reward distribution
8. **Confirmation** sent back to user

### 2. Authentication Flow

```
User → Wallet Connection → Signature Verification → JWT Token → API Access
```

**Detailed Flow:**

1. **User connects wallet** (VeWorld, Sync2, etc.)
2. **Challenge message** generated by server
3. **User signs message** with private key
4. **Signature verification** on server
5. **JWT token generation** for session management
6. **Token validation** for subsequent requests

### 3. Reward Distribution Flow

```
Upload Verification → Reward Calculation → Smart Contract → Blockchain → User Wallet
```

**Detailed Flow:**

1. **Upload verification** by AI service
2. **Reward calculation** (1 B3TR per 10km)
3. **Smart contract call** to distribute tokens
4. **Transaction confirmation** on VeChain
5. **Database update** with transaction details
6. **User notification** of successful reward

## Security Architecture

### 1. Authentication & Authorization

- **Multi-factor authentication**: JWT + Blockchain signature
- **Session management**: Secure session handling
- **Role-based access**: Different permission levels
- **Token refresh**: Automatic token renewal

### 2. Data Protection

- **Encryption at rest**: Database encryption
- **Encryption in transit**: TLS 1.3 for all communications
- **Input validation**: Comprehensive input sanitization
- **SQL injection prevention**: Parameterized queries

### 3. Blockchain Security

- **Private key management**: Secure key storage
- **Transaction signing**: Secure transaction creation
- **Gas estimation**: Proper gas calculation
- **Error handling**: Graceful failure handling

### 4. AI Security

- **Model validation**: Input validation for AI models
- **Confidence thresholds**: Minimum confidence requirements
- **Fallback mechanisms**: Manual verification options
- **Model versioning**: Secure model updates

## Scalability Architecture

### 1. Horizontal Scaling

- **Load balancing**: Multiple API instances
- **Database sharding**: Horizontal database scaling
- **CDN distribution**: Global content delivery
- **Microservices**: Independent service scaling

### 2. Performance Optimization

- **Caching strategy**: Multi-layer caching
- **Database indexing**: Optimized query performance
- **Image optimization**: Automatic image compression
- **API optimization**: Efficient API design

### 3. Monitoring & Observability

- **Application monitoring**: Performance metrics
- **Error tracking**: Comprehensive error logging
- **User analytics**: Usage pattern analysis
- **Blockchain monitoring**: Transaction tracking

## Deployment Architecture

### 1. Environment Strategy

- **Development**: Local development environment
- **Staging**: Pre-production testing environment
- **Production**: Live production environment
- **Testing**: Automated testing environment

### 2. Container Strategy

- **Docker containers**: Application containerization
- **Kubernetes orchestration**: Container orchestration
- **Service mesh**: Inter-service communication
- **Auto-scaling**: Automatic resource scaling

### 3. CI/CD Pipeline

- **Source control**: Git-based version control
- **Automated testing**: Comprehensive test suite
- **Deployment automation**: Automated deployment
- **Rollback strategy**: Quick rollback capabilities

## Disaster Recovery

### 1. Backup Strategy

- **Database backups**: Daily automated backups
- **File backups**: Cloud storage backups
- **Configuration backups**: Environment configuration
- **Code backups**: Source code version control

### 2. Recovery Procedures

- **Data recovery**: Database restoration procedures
- **Service recovery**: Service restart procedures
- **Communication plan**: Stakeholder communication
- **Testing procedures**: Regular recovery testing

## Compliance & Governance

### 1. Data Privacy

- **GDPR compliance**: European data protection
- **Data retention**: Automated data cleanup
- **User consent**: Explicit user consent management
- **Data portability**: User data export capabilities

### 2. Financial Compliance

- **Transaction tracking**: Complete audit trail
- **Regulatory reporting**: Compliance reporting
- **Risk management**: Financial risk assessment
- **Security audits**: Regular security assessments

This architecture provides a robust, scalable, and secure foundation for the EV Odometer Rewards system, ensuring reliable operation while maintaining high performance and security standards.
