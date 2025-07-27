# Modular Architecture Overview

## High-Level Architecture

The Drive & Earn platform follows a modular, microservices-ready architecture built on NestJS. The system is designed with clear separation of concerns, enabling independent development, testing, and deployment of different modules.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API Gateway Layer                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Global Guards  │  Rate Limiting  │  CORS  │  Validation  │  Error Handling │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Core Modules Layer                             │
├─────────────────────────────────────────────────────────────────────────────┤
│   Auth   │  Users  │ Odometer │ Vehicles │ Blockchain │ Rewards │ Analytics │
├─────────────────────────────────────────────────────────────────────────────┤
│  Admin   │ Store   │Challenges│Badges    │Notifications│History  │Leaderboard│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Shared Services Layer                             │
├─────────────────────────────────────────────────────────────────────────────┤
│   AI/ML   │  File Upload  │  Email  │  Cache  │  Encryption  │  Validation  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Infrastructure Layer                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ PostgreSQL │  Redis  │  VeChain  │  AWS S3  │  AWS Textract │  OpenAI API  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Module Descriptions

### 1. Authentication Module (`auth`)

**Name**: Authentication & Authorization Service

**Responsibilities**:

- Wallet-based authentication using VeChain certificates
- JWT token generation and management
- Refresh token handling
- User session management
- Token migration utilities
- Signature verification

**Key Dependencies**:

- VeChain blockchain service
- JWT service
- User module
- Redis (for session storage)

**Key Files**:

- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/auth.service.ts`
- `src/modules/auth/guards/jwt-auth.guard.ts`
- `src/modules/auth/helpers/vechain-signature.helper.ts`

### 2. User Management Module (`users`)

**Name**: User Profile & Management Service

**Responsibilities**:

- User profile management
- User statistics tracking
- Email verification
- Support ticket management
- User wallet integration
- Profile image handling

**Key Dependencies**:

- Authentication module
- Blockchain module
- Email service
- File upload service

**Key Files**:

- `src/modules/users/controllers/user.controller.ts`
- `src/modules/users/services/user.service.ts`
- `src/modules/users/entity/user.entity.ts`
- `src/modules/users/services/user-wallet.service.ts`

### 3. Odometer Processing Module (`odometer`)

**Name**: Odometer Image Processing & Analysis Service

**Responsibilities**:

- Image upload and storage
- OCR processing using AWS Textract
- AI-powered image analysis
- Mileage validation and extraction
- Carbon savings calculation
- Processing status management

**Key Dependencies**:

- AWS S3 service
- AWS Textract service
- OpenAI service
- Vehicle module
- User module

**Key Files**:

- `src/modules/odometer/controllers/odometer.controller.ts`
- `src/modules/odometer/services/odometer.service.ts`
- `src/modules/odometer/entity/odometer-upload.entity.ts`
- `src/modules/odometer/dto/upload-odometer.dto.ts`

### 4. Vehicle Management Module (`vehicles`)

**Name**: Vehicle Registration & Management Service

**Responsibilities**:

- Vehicle registration and management
- Vehicle type detection
- Emission factor management
- Vehicle analytics
- Plate number validation
- Primary vehicle designation

**Key Dependencies**:

- User module
- Odometer module
- AI service (for vehicle detection)

**Key Files**:

- `src/modules/vehicles/controllers/vehicle.controller.ts`
- `src/modules/vehicles/services/vehicle.service.ts`
- `src/modules/vehicles/entity/vehicle.entity.ts`
- `src/modules/vehicles/dto/create-vehicle.dto.ts`

### 5. Blockchain Integration Module (`blockchain`)

**Name**: VeChain Blockchain & Smart Contract Service

**Responsibilities**:

- VeChain network integration
- Smart contract interactions
- Token distribution and management
- Transaction monitoring
- Carbon credit tokenization
- Wallet balance management

**Key Dependencies**:

- VeChain SDK
- Smart contract ABIs
- Database for transaction logging

**Key Files**:

- `src/modules/blockchain/controllers/blockchain.controller.ts`
- `src/modules/blockchain/services/blockchain.service.ts`
- `src/modules/blockchain/services/smart-contract.service.ts`
- `src/common/blockchain/vechain.service.ts`

### 6. Rewards System Module (`rewards`)

**Name**: Token Rewards & Distribution Service

**Responsibilities**:

- B3TR token distribution
- Reward calculation algorithms
- Challenge reward management
- Token balance tracking
- Reward history management
- Token economics management

**Key Dependencies**:

- Blockchain module
- User module
- Odometer module
- Challenge module

**Key Files**:

- `src/modules/rewards/controllers/reward.controller.ts`
- `src/modules/rewards/services/reward.service.ts`
- `src/modules/rewards/entity/reward.entity.ts`
- `src/modules/rewards/dto/reward.dto.ts`

### 7. Analytics Module (`analytics`)

**Name**: Data Analytics & Reporting Service

**Responsibilities**:

- User analytics and insights
- Carbon savings reporting
- Performance metrics
- Data aggregation
- Statistical analysis
- Report generation

**Key Dependencies**:

- User module
- Odometer module
- Vehicle module
- Cache service

**Key Files**:

- `src/modules/analytics/controllers/analytics.controller.ts`
- `src/modules/analytics/services/analytics.service.ts`

### 8. Challenge & Gamification Module (`challenges`)

**Name**: Gamification & Challenge Management Service

**Responsibilities**:

- Challenge creation and management
- Progress tracking
- Challenge completion validation
- Reward distribution for challenges
- Challenge analytics
- User engagement metrics

**Key Dependencies**:

- User module
- Rewards module
- Analytics module
- Notification module

**Key Files**:

- `src/modules/challenges/controllers/challenge.controller.ts`
- `src/modules/challenges/services/challenge.service.ts`
- `src/modules/challenges/entity/challenge.entity.ts`

### 9. Store & Redemption Module (`store`)

**Name**: Token Redemption & Store Service

**Responsibilities**:

- Product catalog management
- Order processing
- Token redemption
- Order fulfillment tracking
- Store analytics
- Inventory management

**Key Dependencies**:

- User module
- Blockchain module (for token burning)
- Email service
- Payment processing

**Key Files**:

- `src/modules/store/controllers/store.controller.ts`
- `src/modules/store/services/store.service.ts`
- `src/modules/store/entity/product.entity.ts`
- `src/modules/store/entity/order.entity.ts`

### 10. Leaderboard Module (`leaderboard`)

**Name**: Competition & Ranking Service

**Responsibilities**:

- User ranking calculations
- Leaderboard management
- Competition tracking
- Performance metrics
- Ranking algorithms
- Leaderboard analytics

**Key Dependencies**:

- User module
- Analytics module
- Cache service

**Key Files**:

- `src/modules/leaderboard/controllers/leaderboard.controller.ts`
- `src/modules/leaderboard/services/leaderboard.service.ts`
- `src/modules/leaderboard/entity/leaderboard.entity.ts`

### 11. Badge System Module (`badges`)

**Name**: Achievement & Badge Management Service

**Responsibilities**:

- Badge creation and management
- Achievement tracking
- Badge assignment logic
- User achievement history
- Badge analytics
- Achievement notifications

**Key Dependencies**:

- User module
- Notification module
- Analytics module

**Key Files**:

- `src/modules/badges/controllers/badge.controller.ts`
- `src/modules/badges/services/badge.service.ts`
- `src/modules/badges/entity/badge.entity.ts`

### 12. Notification Module (`notifications`)

**Name**: Notification & Communication Service

**Responsibilities**:

- Push notification management
- Email notification handling
- In-app notification system
- Notification preferences
- Notification delivery tracking
- Communication templates

**Key Dependencies**:

- Email service
- User module
- Cache service

**Key Files**:

- `src/modules/notifications/controllers/notification.controller.ts`
- `src/modules/notifications/services/notification.service.ts`
- `src/modules/notifications/entity/notification.entity.ts`

### 13. History Module (`history`)

**Name**: Transaction & Activity History Service

**Responsibilities**:

- Transaction history tracking
- Activity logging
- Historical data management
- Audit trail maintenance
- Data archival
- History analytics

**Key Dependencies**:

- User module
- Database service
- Cache service

**Key Files**:

- `src/modules/history/controllers/history.controller.ts`
- `src/modules/history/services/history.service.ts`
- `src/modules/history/entity/history.entity.ts`

### 14. Admin Module (`admin`)

**Name**: Administrative & Management Service

**Responsibilities**:

- Administrative dashboard
- User management
- System monitoring
- Content management
- Analytics and reporting
- System configuration

**Key Dependencies**:

- All other modules
- Analytics module
- User module

**Key Files**:

- `src/modules/admin/controllers/admin.controller.ts`
- `src/modules/admin/services/admin.service.ts`
- `src/modules/admin/dto/admin-dashboard.dto.ts`

### 15. Health Check Module (`healthcheck`)

**Name**: System Health & Monitoring Service

**Responsibilities**:

- System health monitoring
- Service availability checks
- Performance metrics
- Error tracking
- System diagnostics
- Health reporting

**Key Dependencies**:

- Database service
- External service monitoring

**Key Files**:

- `src/modules/healthcheck/healthcheck.controller.ts`
- `src/modules/healthcheck/healthcheck.module.ts`

## Shared Services

### AI/ML Services (`common/ai`)

- **OpenAI Service**: GPT-4 Vision integration for image analysis
- **Purpose**: Vehicle detection, mileage validation, image quality assessment

### File Upload Services (`common/upload`)

- **S3 Service**: AWS S3 integration for file storage
- **Purpose**: Image upload, thumbnail generation, file management

### Blockchain Services (`common/blockchain`)

- **VeChain Service**: VeChain network integration
- **VeChain Wallet Service**: Wallet management and operations
- **Purpose**: Blockchain transactions, smart contract interactions

### Cache Services (`common/cache`)

- **Redis Service**: Redis integration for caching
- **Purpose**: Session storage, data caching, performance optimization

### OCR Services (`common/ocr`)

- **AWS Textract Service**: OCR processing for image text extraction
- **Purpose**: Mileage extraction from odometer images

### Encryption Services (`common/encryption`)

- **Encryption Service**: Data encryption and security
- **Purpose**: Sensitive data protection, secure storage

## Module Interaction Patterns

### 1. Synchronous Communication

- Direct service method calls within the same application
- Used for immediate data access and validation

### 2. Asynchronous Communication

- Event-driven communication using NestJS EventEmitter
- Used for non-critical operations and notifications

### 3. External Service Integration

- REST API calls to external services (AWS, OpenAI, VeChain)
- Used for specialized functionality and third-party integrations

### 4. Database Integration

- Shared database with module-specific entities
- Used for data persistence and relationship management

## Scalability Considerations

### Horizontal Scaling

- Each module can be deployed independently
- Load balancing across multiple instances
- Database connection pooling

### Vertical Scaling

- Resource allocation per module
- Performance monitoring and optimization
- Caching strategies

### Microservices Migration Path

- Current modular architecture enables easy migration
- API gateway pattern already implemented
- Service discovery ready

## Security Architecture

### Authentication & Authorization

- JWT-based authentication
- Role-based access control
- Module-level security guards

### Data Protection

- Input validation at all entry points
- SQL injection prevention
- XSS protection
- CSRF protection

### Blockchain Security

- Secure key management
- Transaction signing
- Smart contract security

## Performance Optimization

### Caching Strategy

- Redis for session and data caching
- Database query optimization
- API response caching

### Database Optimization

- Proper indexing strategies
- Query optimization
- Connection pooling

### External Service Optimization

- Request batching
- Rate limiting
- Fallback mechanisms

This modular architecture provides a solid foundation for the Drive & Earn platform, enabling efficient development, testing, and deployment while maintaining scalability and maintainability.
