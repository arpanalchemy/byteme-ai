# Detailed Project Workflow

## Overview

The Drive & Earn platform operates through several interconnected workflows that enable users to earn B3TR tokens by documenting their eco-friendly driving activities. This document outlines the key user journeys and system interactions.

## 1. User Authentication Workflow

### Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Service
    participant V as VeChain Wallet
    participant DB as Database
    participant J as JWT Service

    U->>F: Connect VeChain Wallet
    F->>V: Request Wallet Connection
    V->>F: Return Wallet Address & Certificate
    F->>A: POST /auth/verify-signature
    Note over A: Verify wallet signature
    A->>V: Validate Certificate
    V->>A: Certificate Validation Result
    alt Valid Certificate
        A->>DB: Check User Exists
        alt New User
            A->>DB: Create New User
            A->>DB: Initialize User Stats
        else Existing User
            A->>DB: Update Last Login
        end
        A->>J: Generate Access Token
        A->>J: Generate Refresh Token
        A->>F: Return Tokens + User Data
        F->>U: Authentication Success
    else Invalid Certificate
        A->>F: Authentication Failed
        F->>U: Show Error Message
    end
```

### Narrative Explanation

The authentication workflow begins when a user connects their VeChain wallet to the application. The system verifies the wallet's digital signature using VeChain's certificate system, ensuring the user owns the wallet address. If valid, the system either creates a new user account or authenticates an existing user, generating JWT tokens for secure API access.

**Critical Decision Points:**

- Wallet certificate validation
- New vs. existing user handling
- Token generation and security

## 2. Odometer Upload & Processing Workflow

### Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant O as Odometer Service
    participant S3 as AWS S3
    participant T as AWS Textract
    participant AI as OpenAI GPT-4
    participant DB as Database
    participant B as Blockchain Service

    U->>F: Upload Odometer Image
    F->>O: POST /odometer/upload
    O->>S3: Upload Original Image
    S3->>O: Return Image URL
    O->>S3: Generate Thumbnail
    S3->>O: Return Thumbnail URL
    O->>DB: Create Upload Record
    O->>F: Return Upload ID

    Note over O: Parallel Processing
    par OCR Processing
        O->>T: Extract Text from Image
        T->>O: Return OCR Results
    and AI Analysis
        O->>AI: Analyze Vehicle & Mileage
        AI->>O: Return Analysis Results
    end

    O->>DB: Update with Processing Results
    O->>F: Processing Complete Notification

    alt Valid Mileage Detected
        O->>DB: Calculate Carbon Savings
        O->>B: Mint B3TR Tokens
        B->>DB: Update User Balance
        O->>F: Reward Notification
    else Invalid/Unclear Mileage
        O->>F: Manual Review Required
    end
```

### Narrative Explanation

The odometer upload workflow is the core process of the platform. Users upload photos of their vehicle's odometer, which triggers parallel processing through AWS Textract for OCR and OpenAI GPT-4 for intelligent analysis. The system validates the mileage, calculates carbon savings, and automatically mints B3TR tokens to the user's wallet.

**Critical Decision Points:**

- Image quality assessment
- Mileage validation and confidence scoring
- Carbon savings calculation
- Token distribution logic

## 3. Vehicle Management Workflow

### Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant V as Vehicle Service
    participant DB as Database
    participant AI as OpenAI GPT-4

    U->>F: Add New Vehicle
    F->>V: POST /vehicles
    V->>DB: Validate Vehicle Data
    V->>DB: Check Plate Number Uniqueness
    alt Valid Vehicle Data
        V->>DB: Create Vehicle Record
        V->>DB: Update User Vehicle Count
        V->>F: Return Vehicle Details
        F->>U: Vehicle Added Successfully
    else Invalid Data
        V->>F: Validation Errors
        F->>U: Show Error Messages
    end

    Note over U,F: Vehicle Detection from Upload
    U->>F: Upload Odometer Image
    F->>AI: Detect Vehicle Type/Model
    AI->>F: Return Vehicle Detection
    F->>V: Suggest Vehicle Creation
    V->>DB: Auto-create Vehicle
    V->>F: Vehicle Created from Upload
```

### Narrative Explanation

The vehicle management workflow allows users to register and manage their vehicles. The system supports both manual vehicle registration and automatic vehicle detection from odometer uploads. Each vehicle is associated with emission factors that determine carbon savings calculations.

**Critical Decision Points:**

- Vehicle data validation
- Plate number uniqueness checking
- Automatic vehicle detection from images
- Emission factor assignment

## 4. Token Distribution & Blockchain Workflow

### Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Blockchain Service
    participant V as VeChain Network
    participant C as Smart Contract
    participant DB as Database
    participant N as Notification Service

    U->>F: Complete Odometer Upload
    F->>B: Request Token Distribution
    B->>DB: Get User Carbon Savings
    B->>B: Calculate Token Amount
    B->>V: Prepare Transaction
    B->>C: Call distributeRewards()
    C->>V: Execute Transaction
    V->>C: Transaction Confirmation
    C->>B: Return Transaction Hash
    B->>DB: Update User Balance
    B->>DB: Log Transaction
    B->>N: Send Reward Notification
    N->>F: Display Reward Alert
    F->>U: Show Token Balance Update

    Note over B,V: Batch Processing
    B->>B: Collect Pending Rewards
    B->>C: Batch Distribute Tokens
    C->>V: Execute Batch Transaction
    V->>B: Batch Confirmation
    B->>DB: Update All User Balances
```

### Narrative Explanation

The blockchain workflow handles the distribution of B3TR tokens based on verified carbon savings. The system uses VeChain's smart contracts to ensure transparent and immutable token distribution. Transactions are batched for efficiency and cost-effectiveness.

**Critical Decision Points:**

- Token calculation algorithms
- Transaction batching decisions
- Gas fee optimization
- Transaction confirmation handling

## 5. Challenge & Gamification Workflow

### Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant C as Challenge Service
    participant DB as Database
    participant B as Blockchain Service
    participant L as Leaderboard Service

    U->>F: View Available Challenges
    F->>C: GET /challenges
    C->>DB: Fetch Active Challenges
    C->>F: Return Challenge List
    F->>U: Display Challenges

    U->>F: Join Challenge
    F->>C: POST /challenges/:id/join
    C->>DB: Add User to Challenge
    C->>F: Challenge Joined

    Note over U,F: Challenge Progress Tracking
    loop Daily Progress Updates
        C->>DB: Check User Progress
        C->>C: Calculate Challenge Completion
        alt Challenge Completed
            C->>B: Distribute Challenge Rewards
            B->>DB: Update User Balance
            C->>L: Update Leaderboard
            C->>F: Challenge Completion Notification
        end
    end

    U->>F: View Leaderboard
    F->>L: GET /leaderboard
    L->>DB: Fetch Top Performers
    L->>F: Return Leaderboard Data
    F->>U: Display Rankings
```

### Narrative Explanation

The gamification workflow creates engaging challenges that encourage sustainable driving habits. Users can join various challenges, track their progress, and compete on leaderboards. Successful challenge completion triggers additional token rewards.

**Critical Decision Points:**

- Challenge difficulty balancing
- Progress tracking algorithms
- Reward distribution timing
- Leaderboard ranking calculations

## 6. Store & Token Redemption Workflow

### Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant S as Store Service
    participant DB as Database
    participant B as Blockchain Service
    participant E as Email Service

    U->>F: Browse Store Items
    F->>S: GET /store/products
    S->>DB: Fetch Available Products
    S->>F: Return Product List
    F->>U: Display Store Items

    U->>F: Purchase Item
    F->>S: POST /store/orders
    S->>DB: Check User Balance
    alt Sufficient Balance
        S->>DB: Create Order
        S->>B: Burn Tokens
        B->>DB: Update User Balance
        S->>E: Send Order Confirmation
        E->>U: Email Confirmation
        S->>F: Order Confirmed
        F->>U: Show Success Message
    else Insufficient Balance
        S->>F: Insufficient Balance Error
        F->>U: Show Error Message
    end

    Note over S,DB: Order Fulfillment
    S->>DB: Update Order Status
    S->>E: Send Shipping Notification
    E->>U: Shipping Update Email
```

### Narrative Explanation

The store workflow allows users to redeem their B3TR tokens for real-world rewards and products. The system validates token balances, processes orders, and manages the token burning process to maintain token economics.

**Critical Decision Points:**

- Token balance validation
- Order processing logic
- Token burning mechanisms
- Fulfillment tracking

## 7. Analytics & Reporting Workflow

### Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Analytics Service
    participant DB as Database
    participant C as Cache Service

    U->>F: Request Analytics Dashboard
    F->>A: GET /analytics/user-stats
    A->>C: Check Cache
    alt Cached Data Available
        C->>A: Return Cached Analytics
    else Cache Miss
        A->>DB: Aggregate User Data
        A->>DB: Calculate Carbon Metrics
        A->>DB: Fetch Historical Data
        A->>C: Cache Results
    end
    A->>F: Return Analytics Data
    F->>U: Display Dashboard

    Note over A,DB: Scheduled Analytics
    loop Daily Analytics Processing
        A->>DB: Process Global Statistics
        A->>DB: Update Leaderboards
        A->>DB: Generate Reports
        A->>C: Update Cache
    end
```

### Narrative Explanation

The analytics workflow provides users with comprehensive insights into their driving patterns, carbon savings, and token earnings. The system uses caching to optimize performance and processes global statistics on a scheduled basis.

**Critical Decision Points:**

- Data aggregation strategies
- Cache invalidation policies
- Real-time vs. batch processing
- Performance optimization

## 8. Error Handling & Recovery Workflow

### Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant S as Service Layer
    participant DB as Database
    participant L as Logger
    participant N as Notification Service

    U->>F: API Request
    F->>S: Process Request
    alt Successful Processing
        S->>DB: Database Operation
        DB->>S: Success Response
        S->>F: Return Success
        F->>U: Display Result
    else Database Error
        S->>L: Log Error
        S->>S: Retry Logic
        alt Retry Successful
            S->>F: Return Success
        else Retry Failed
            S->>N: Alert Administrators
            S->>F: Return Error Response
            F->>U: Show Error Message
        end
    else External Service Error
        S->>L: Log External Error
        S->>S: Fallback Logic
        S->>F: Return Fallback Response
        F->>U: Show Degraded Service
    end
```

### Narrative Explanation

The error handling workflow ensures system reliability and graceful degradation when issues occur. The system implements retry logic, fallback mechanisms, and comprehensive logging to maintain service quality.

**Critical Decision Points:**

- Retry strategy configuration
- Fallback service selection
- Error notification thresholds
- Graceful degradation policies

## Key Workflow Characteristics

### Performance Considerations

- **Parallel Processing**: OCR and AI analysis run concurrently
- **Caching Strategy**: Redis caching for frequently accessed data
- **Batch Operations**: Blockchain transactions are batched for efficiency
- **Async Processing**: Non-critical operations use background processing

### Security Measures

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Comprehensive validation at all entry points
- **Blockchain Security**: Immutable transaction records

### Scalability Features

- **Modular Architecture**: Independent service modules
- **Database Optimization**: Proper indexing and query optimization
- **Load Balancing**: Support for horizontal scaling
- **Microservices Ready**: Architecture supports service decomposition

This workflow documentation provides a comprehensive understanding of how the Drive & Earn platform operates, enabling stakeholders to understand the system's complexity and identify potential areas for optimization or enhancement.
