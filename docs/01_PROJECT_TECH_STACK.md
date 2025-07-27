# Project Tech Stack

## Overview

The Drive & Earn platform is a comprehensive sustainability application that combines blockchain technology, AI-powered image processing, and gamification to incentivize eco-friendly driving practices. The platform rewards users with B3TR tokens for their carbon-saving activities.

## Technology Stack

| Category                 | Technology            | Version       | Purpose                                                                                                                                     |
| ------------------------ | --------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend Framework**    | NestJS                | 11.0.1        | Progressive Node.js framework providing scalable server-side architecture with TypeScript support, dependency injection, and modular design |
| **Runtime Environment**  | Node.js               | 20.x          | JavaScript runtime for server-side execution with enhanced performance and modern ES features                                               |
| **Programming Language** | TypeScript            | 5.7.3         | Type-safe JavaScript superset providing better development experience, error catching, and code maintainability                             |
| **Database**             | PostgreSQL            | 14+           | Robust relational database for storing user data, vehicle information, odometer uploads, and transaction history                            |
| **ORM**                  | TypeORM               | 0.3.25        | Object-Relational Mapping library for database operations with entity management and migration support                                      |
| **Caching**              | Redis                 | 6+            | In-memory data structure store for session management, rate limiting, and performance optimization                                          |
| **Authentication**       | JWT (JSON Web Tokens) | -             | Stateless authentication mechanism for secure user sessions and API access                                                                  |
| **Blockchain**           | VeChain               | -             | Enterprise-grade blockchain platform for token distribution, smart contracts, and carbon credit management                                  |
| **AI/ML Services**       | OpenAI GPT-4 Vision   | -             | Advanced AI model for analyzing odometer images, vehicle detection, and mileage extraction                                                  |
| **OCR Services**         | AWS Textract          | -             | Cloud-based OCR service for extracting text and numbers from odometer images                                                                |
| **Cloud Storage**        | AWS S3                | -             | Scalable object storage for image uploads, thumbnails, and file management                                                                  |
| **Email Services**       | SendGrid              | 8.1.5         | Transactional email service for user notifications and support communications                                                               |
| **Image Processing**     | Sharp                 | 0.34.3        | High-performance image processing library for thumbnail generation and image optimization                                                   |
| **API Documentation**    | Swagger/OpenAPI       | 11.2.0        | Interactive API documentation with automatic endpoint discovery and testing capabilities                                                    |
| **Rate Limiting**        | NestJS Throttler      | 6.4.0         | Request throttling and rate limiting to prevent API abuse and ensure fair usage                                                             |
| **Validation**           | class-validator       | 0.14.2        | Decorator-based validation for request data with comprehensive error handling                                                               |
| **Serialization**        | class-transformer     | 0.5.1         | Object transformation and serialization for API responses and data mapping                                                                  |
| **Cryptography**         | bcryptjs              | 3.0.2         | Password hashing and security for user authentication and data protection                                                                   |
| **Blockchain SDK**       | VeChain SDK           | 1.0.0-beta.30 | Official VeChain development kit for blockchain interactions and smart contract calls                                                       |
| **Web3 Integration**     | Web3.js               | 1.10.4        | Ethereum-compatible JavaScript library for blockchain interactions and wallet integration                                                   |
| **Testing Framework**    | Jest                  | 29.7.0        | Comprehensive testing framework for unit tests, integration tests, and end-to-end testing                                                   |
| **Code Quality**         | ESLint                | 9.18.0        | Static code analysis and linting for maintaining code quality and consistency                                                               |
| **Code Formatting**      | Prettier              | 3.4.2         | Opinionated code formatter for consistent code style across the project                                                                     |
| **Process Management**   | PM2                   | -             | Production process manager for Node.js applications with clustering and monitoring                                                          |
| **Containerization**     | Docker                | -             | Containerization platform for consistent deployment across different environments                                                           |
| **Version Control**      | Git                   | -             | Distributed version control system for source code management and collaboration                                                             |

## Development Tools

| Tool                    | Purpose                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| **NestJS CLI**          | Command-line interface for generating modules, controllers, services, and other NestJS components |
| **TypeScript Compiler** | Compiles TypeScript code to JavaScript with type checking and modern JavaScript features          |
| **SWC**                 | Fast TypeScript/JavaScript compiler for improved build performance                                |
| **Supertest**           | HTTP assertion library for testing API endpoints and integration testing                          |

## Infrastructure & Deployment

| Service                       | Purpose                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------- |
| **DigitalOcean App Platform** | Cloud platform for hosting and deploying the application with automatic scaling |
| **AWS Services**              | Cloud infrastructure for storage (S3), AI services (Textract), and email (SES)  |
| **PostgreSQL Database**       | Managed database service for production data storage                            |
| **Redis Cache**               | Managed caching service for session storage and performance optimization        |

## Security Technologies

| Technology                | Purpose                                                        |
| ------------------------- | -------------------------------------------------------------- |
| **JWT Authentication**    | Secure token-based authentication with configurable expiration |
| **CORS Protection**       | Cross-Origin Resource Sharing configuration for API security   |
| **Rate Limiting**         | Protection against API abuse and DDoS attacks                  |
| **Input Validation**      | Comprehensive validation to prevent injection attacks          |
| **Environment Variables** | Secure configuration management for sensitive data             |
| **SSL/TLS**               | Encrypted communication for production deployments             |

## Monitoring & Logging

| Technology                 | Purpose                                                             |
| -------------------------- | ------------------------------------------------------------------- |
| **Winston**                | Structured logging library for application monitoring and debugging |
| **Health Check Endpoints** | Application health monitoring for deployment platforms              |
| **Error Tracking**         | Comprehensive error handling and logging for production debugging   |

## Key Technology Decisions

### Why NestJS?

- **Modular Architecture**: Perfect for large-scale applications with clear separation of concerns
- **TypeScript First**: Built-in TypeScript support for better development experience
- **Enterprise Ready**: Designed for scalable, maintainable applications
- **Rich Ecosystem**: Extensive middleware and plugin ecosystem

### Why VeChain?

- **Enterprise Focus**: Designed for business applications with high throughput
- **Carbon Credits**: Native support for sustainability and environmental applications
- **Low Transaction Costs**: Cost-effective for frequent micro-transactions
- **Regulatory Compliance**: Built with enterprise compliance in mind

### Why OpenAI GPT-4 Vision?

- **Advanced Image Analysis**: Superior image understanding capabilities
- **Context Awareness**: Can understand complex scenarios and provide detailed insights
- **Multi-modal Processing**: Handles both text and image analysis seamlessly
- **Continuous Learning**: Regular model updates improve accuracy over time

### Why PostgreSQL?

- **ACID Compliance**: Ensures data integrity for financial transactions
- **JSON Support**: Native JSON columns for flexible data storage
- **Scalability**: Handles large datasets and complex queries efficiently
- **Ecosystem**: Rich ecosystem of tools and extensions

This technology stack provides a robust, scalable, and secure foundation for the Drive & Earn platform, enabling efficient processing of user data, secure blockchain transactions, and advanced AI-powered features.
