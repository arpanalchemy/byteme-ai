# Cursor Prompts and Setup Guide

## Overview

This document outlines the key prompts and setup instructions used to develop the Drive & Earn platform using Cursor AI. It serves as a reference for developers who want to understand how the project was structured and how to follow the established patterns.

## Project Setup and Development Guidelines

### .cursorrules File

The project includes a comprehensive `.cursorrules` file that defines coding standards, architecture patterns, and development guidelines. **Always follow these rules when developing new features or modifying existing code.**

Key areas covered in `.cursorrules`:

- **AI Assistant Role**: Principal Engineer mindset with focus on system architecture
- **Project Context**: VeChain-based EV Odometer Photo Upload for Rewards system
- **Core Technologies**: NestJS, TypeScript, PostgreSQL, VeChain, AI/ML integration
- **Architecture Patterns**: Modular structure, dependency injection, error handling
- **Coding Standards**: TypeScript guidelines, NestJS patterns, security practices
- **Testing Standards**: Unit tests, E2E tests, AI-generated testing
- **Documentation Requirements**: README standards, API documentation
- **Security Guidelines**: Authentication, data protection, input validation

## Prompt 1: Initial Project Setup

### Purpose

This prompt was used to generate the complete NestJS project structure with all modules, entities, and services.

### The Prompt

```
Act as an expert backend developer specializing in NestJS, blockchain integration, and microservice architecture.

Your task is to generate a complete, production-ready, and scalable NestJS project based on the detailed scope document provided below. The project should follow NestJS best practices, including a modular structure, clear separation of concerns, and robust error handling.

Please generate the entire project, including the file structure and the code for each file.

Project Name: b3tr-rewards-api

1. Core Project Setup
Framework: Use the latest stable version of NestJS.
Language: TypeScript.
Package Manager: Use pnpm or npm.
Database ORM: Use TypeORM to connect with the PostgreSQL database.
Configuration: Use the @nestjs/config module for environment variable management (.env file).
Validation: Use class-validator and class-transformer for all DTOs.
API Documentation: Integrate nestjs/swagger and add decorators (@ApiOperation, @ApiResponse, @ApiTags, @ApiProperty) to all controllers and DTOs to automatically generate OpenAPI documentation.

2. Detailed Project Structure & Modules
Please generate the following modular structure inside the src/ directory. For each module, create the standard NestJS files: module.ts, controller.ts, service.ts, and corresponding DTO and Entity folders.

a. app.module.ts (Root Module)
Import all feature modules.
Configure ConfigModule.forRoot({ isGlobal: true }).
Configure TypeOrmModule.forRootAsync({}) to read database credentials from environment variables.
Configure ScheduleModule.forRoot() for cron jobs.

b. auth Module
Goal: Handle wallet-based authentication.
Controller:
POST /auth/login: Takes a signed message and wallet address.
POST /auth/logout: Invalidates the session.
Service:
Implement logic to verify a VeChain wallet signature.
Generate a JWT (@nestjs/jwt) upon successful validation.
Strategy: Use @nestjs/passport with a custom WalletStrategy for signature verification and a JwtStrategy to protect authenticated routes.

c. users and tiers Modules
Goal: Manage user profiles and their tier status.
Entities:
User Entity: id, walletAddress (unique), email (optional), tierId, createdAt. Relations: one-to-many with Vehicles, one-to-one with UserStats.
Tier Entity: id, name, minDistance, minUploads, storeDiscountPercentage.
UserStats Entity: totalKilometers, totalUploads, currentStreak.
users Service: Basic CRUD for user profiles, logic to update user stats.
tiers Service: Logic to check and assign a user to a tier based on their stats. This should be called by the weekly cron job.

d. vehicles Module
Goal: Manage user vehicles.
Entity: Vehicle Entity: id, userId, type (enum: SCOOTER, BIKE, SUV, etc.), numberPlate (optional, encrypted), createdAt. Relation: many-to-one with User.
Controller: CRUD endpoints for vehicles, protected by the JWT guard.

e. odometer Module
Goal: Handle odometer photo uploads and OCR processing.
Controller:
POST /odometer/upload: Accepts multipart/form-data with an image file and vehicleId.
Service (OdometerService):
Receive the image buffer.
Pass the buffer to a separate OcrService.
Receive the extracted mileage and a confidence score from OcrService.
If confidence is low, throw a BadRequestException.
If high, pass the data to the MileageLogService.
Service (OcrService):
Create a placeholder service with a method extractMileage(image: Buffer): Promise<{ mileage: number; confidence: number; }>. Simulate a delay and return a mock value. This is where TensorFlow.js logic would go.

f. mileage-logs Module
Goal: Validate and store mileage history.
Entity: MileageLog Entity: id, vehicleId, mileage, carbonOffset, isVerified, createdAt.
Service:
createLog(vehicleId, newMileage):
Fetch the latest log for the vehicleId.
Validation: Throw an error if newMileage is less than or equal to the last recorded mileage (regressive/duplicate check).
Flag unusually large spikes for admin review.
Calculate the distance traveled (newMileage - lastMileage).
Calculate CO₂ saved based on vehicle type (create a constants file for emission factors).
Save the new MileageLog.
Update the UserStats for the user.

g. rewards and leaderboard Modules
Goal: Manage scoring, leaderboards, and token distribution.
Entities:
Leaderboard Entity: id, userId, weeklyScore, rank, round.
RewardPool Entity: id, totalAmount, distributedAmount, round.
leaderboard Service: Logic to calculate scores (total valid km) and update ranks.
rewards Service:
Logic to calculate the token payout for each user based on their leaderboard rank and the 75/25 split.
Interact with the VeChainService to trigger the smart contract payout.

h. blockchain Module
Goal: Abstract all VeChain interactions.
Service (VeChainService):
Use thor-devkit to interact with the VeChainThor network.
constructor(): Initialize connection to a VeChain node (URL from .env).
triggerBatchPayout(payouts: { recipient: string; amount: string }[]):
Placeholder function to demonstrate how you would call a smart contract function (e.g., batchPay).
Use an admin/organization wallet private key (from .env) to sign the transaction.

i. badges Module
Goal: Manage the badge achievement system.
Entities:
Badge Entity: id, name, description, imageUrl, conditions (JSONB), isPublished.
UserBadge Entity: id, userId, badgeId, earnedAt.
Service:
Logic to evaluate if a user meets badge conditions after a relevant action (e.g., after a mileage log is created).
A method checkAllUsersForBadge(badgeId) for manual awarding.
Implement the edit/publish logic: a badge's conditions can only be edited if isPublished is false or if no UserBadge entries exist for it.

j. store Module
Goal: Manage the token redemption store.
Entities:
Product Entity: id, name, description, priceInBTR, stock.
Order Entity: id, userId, productId, amountPaid, status (enum: PENDING, SHIPPED).
Controller: Endpoints to list products and create an order.
Service: Logic to handle redemptions, checking user token balance (this would be a call to the VeChain service to check a contract state), applying tier discounts, and updating stock.

k. admin Module
Goal: Provide administrative functionalities.
Controller:
Create a separate controller with the /admin prefix.
Protect all endpoints with a RoleGuard (only role: 'admin').
Endpoints to manage users, view logs, create/edit badges and tiers, and manage store products.
Service: Business logic for the admin operations.

l. scheduling Module
Goal: House all scheduled tasks (cron jobs).
Service (TasksService):
Use the @Cron() decorator from @nestjs/schedule.
Weekly Leaderboard Cron (@Cron(CronExpression.SUNDAY_AT_MIDNIGHT)):
Call leaderboardService.calculateScoresForCurrentRound().
Call rewardsService.distributeRewards().
Call tierService.updateAllUserTiers().
Reset weekly scores for the new round.

3. Final Generation Request
Please now generate the entire NestJS project based on these instructions. Start by creating the folder and file structure, and then populate each file with well-commented, production-quality code that fulfills the requirements outlined above. Ensure all DTOs, Entities, and module imports are correctly set up.
```

### Key Outcomes from Prompt 1

- Complete NestJS project structure with all modules
- Database entities and relationships
- Authentication system with VeChain wallet integration
- Odometer photo upload and OCR processing
- Reward calculation and blockchain integration
- Admin panel and scheduling system

## Prompt 2: Documentation Generation

### Purpose

This prompt was used to create comprehensive client-facing documentation for the project.

### The Prompt

```
Act as a senior technical writer and solution architect. Your task is to create a comprehensive and client-facing documentation suite for a software project. You have complete access to the project's codebase, including all flows, graphs, and other backend details.

The documentation should be clear, concise, and professionally formatted. It needs to be easily understood by both technical and semi-technical audiences.

Please generate the following documents:

1. Project Tech Stack
Objective: Provide a clear overview of the technologies used in this project.
Format: A markdown table.
Content:
Category: (e.g., Frontend, Backend, Database, Cloud Services, AI/ML)
Technology: (e.g., React, Node.js, PostgreSQL, AWS S3, OpenAI GPT-4)
Version (if applicable): (e.g., 18.2.0, 16.17.1)
Purpose: (A brief explanation of why this technology was chosen and its role in the project).

2. Detailed Project Workflow
Objective: Illustrate the end-to-end operational flow of the project.
Format: A mermaid.js sequence diagram embedded in a markdown file. If the workflow is too complex for a single diagram, create multiple diagrams for different user journeys or processes.
Content:
Clearly label all actors (users, systems, services).
Show the sequence of interactions and data flow between components.
Include annotations to explain critical steps or decision points.
Provide a brief narrative explanation of the workflow below the diagram.

3. Modular Architecture Overview
Objective: Describe the high-level modular structure of the project.
Format: A markdown document with a high-level block diagram (you can use ASCII art or describe the components for me to create a diagram).
Content:
Identify and list all major modules.
For each module, provide:
Name: A clear and descriptive name.
Responsibilities: A bulleted list of its core functionalities.
Key Dependencies: Other modules or external services it interacts with.

4. Core Components Deep Dive
Objective: Provide detailed documentation for the most critical components of the project.
Format: A separate markdown file for each core component.
Content (for each component):
Component Name:
Purpose: A detailed explanation of what the component does.
Key Files: A list of the primary source code files related to this component.
API Endpoints (if applicable): A table with columns for Method (GET, POST, etc.), Path, and Description.
Data Models: A description of the primary data structures or database schemas it uses.
Error Handling: An overview of how errors are handled within the component.

5. AI and External Services Integration
Objective: Explain how AI and other third-party services are utilized within the project.
Format: A markdown document.
Content:
Service Name: (e.g., OpenAI, AWS Rekognition, Stripe)
Purpose: Why and how the service is used.
Integration Points: Which modules or components interact with this service.
Data Exchange: What data is sent to and received from the service.
Authentication/Authorization: A high-level overview of the security mechanisms in place for these integrations.

General Instructions:
Tone: Professional and clear.
Audience: A client who is technically literate but may not be a developer.
Formatting: Use markdown for all documents. Use headings, subheadings, lists, and tables to structure the information effectively.
Code References: Where appropriate, refer to specific file names or functions, but do not include large blocks of code unless absolutely necessary for illustration.
```

### Key Outcomes from Prompt 2

- Comprehensive project documentation suite
- Technical architecture documentation
- Workflow diagrams and process flows
- Component deep-dive documentation
- External service integration guides

## Additional Development Prompts

### For New Features

When adding new features to the project, use prompts that follow the `.cursorrules` guidelines:

1. **Always mention the project context**: VeChain-based EV Odometer Photo Upload for Rewards system
2. **Reference the modular architecture**: Follow the established module structure
3. **Include security considerations**: Authentication, validation, error handling
4. **Follow coding standards**: TypeScript, NestJS patterns, testing requirements
5. **Consider blockchain integration**: How the feature interacts with VeChain
6. **Include documentation**: Update relevant documentation files

### Example Feature Development Prompt

```
As a Principal Engineer working on the Drive & Earn platform, I need to add a new feature that [describe feature].

Please follow the established patterns in the codebase:
- Use the modular architecture structure
- Follow TypeScript and NestJS best practices
- Include proper error handling and validation
- Add comprehensive unit tests
- Update relevant documentation
- Consider blockchain integration if applicable
- Follow the security guidelines in .cursorrules

The feature should integrate with [list relevant modules] and follow the established patterns for [specific requirements].
```

## Best Practices for Using Cursor with This Project

### 1. Always Reference .cursorrules

- The `.cursorrules` file contains comprehensive guidelines
- Follow the Principal Engineer mindset
- Consider long-term maintainability and scalability
- Focus on code quality, security, and performance

### 2. Use Modular Architecture

- Follow the established module structure
- Use dependency injection for all services
- Implement proper error handling
- Follow the established naming conventions

### 3. Consider Blockchain Integration

- Always think about VeChain integration
- Consider smart contract interactions
- Implement proper transaction handling
- Follow security best practices for blockchain operations

### 4. Include Testing and Documentation

- Write unit tests for all business logic
- Update relevant documentation
- Follow the established testing patterns
- Include API documentation with Swagger decorators

### 5. Security First

- Validate all inputs using DTOs
- Implement proper authentication and authorization
- Follow the security guidelines in `.cursorrules`
- Consider data protection and privacy

## Conclusion

These prompts and guidelines ensure consistent development practices across the Drive & Earn platform. Always refer to the `.cursorrules` file for comprehensive development guidelines and follow the established patterns for maintainable, scalable, and secure code.

For new developers joining the project, start by reading the `.cursorrules` file and understanding the modular architecture before making any changes to the codebase.
