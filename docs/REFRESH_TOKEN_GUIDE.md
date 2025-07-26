# Refresh Token Implementation Guide

## Overview

This document describes the refresh token mechanism implemented in the Drive & Earn API. The system uses JWT tokens with a dual-token approach: short-lived access tokens and longer-lived refresh tokens for enhanced security.

## Architecture

### Token Types

1. **Access Token**: Short-lived (default: 1 hour) for API access
2. **Refresh Token**: Long-lived (default: 7 days) for token renewal

### Security Features

- **Token Rotation**: Each refresh generates new access and refresh tokens
- **Token Revocation**: Refresh tokens can be revoked individually or globally
- **Redis Storage**: Refresh tokens are stored in Redis for fast access and revocation
- **JWT ID Tracking**: Each refresh token has a unique JWT ID for tracking

## API Endpoints

### Authentication Flow

#### 1. Initial Authentication
```http
POST /auth/connect-wallet
Content-Type: application/json

{
  "walletAddress": "0x1234567890abcdef...",
  "walletType": "veworld",
  "username": "user123",
  "email": "user@example.com"
}
```

#### 2. Signature Verification
```http
POST /auth/verify-signature
Content-Type: application/json

{
  "walletAddress": "0x1234567890abcdef...",
  "message": "nonce",
  "signature": "0xabcdef1234567890...",
  "certificate": "optional_certificate"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "refreshExpiresIn": 604800,
  "user": {
    "id": "user-uuid",
    "walletAddress": "0x1234567890abcdef...",
    "username": "user123",
    "email": "user@example.com",
    "isActive": true,
    "isVerified": true,
    "totalMileage": 1000.5,
    "totalCarbonSaved": 50.25,
    "totalPoints": 100,
    "currentTier": "silver",
    "b3trBalance": 10.5
  },
  "message": "Authentication successful"
}
```

#### 3. Token Refresh
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "refreshExpiresIn": 604800,
  "message": "Token refreshed successfully"
}
```

#### 4. Logout (All Devices)
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### 5. Logout (Specific Device)
```http
POST /auth/logout/device
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "tokenId": "refresh-token-jti"
}
```

**Response:**
```json
{
  "message": "Logged out from device successfully"
}
```

## Environment Configuration

### Required Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Redis Configuration (for token storage)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=optional_redis_password
```

### Token Expiry Formats

- `s` - seconds (e.g., `30s`)
- `m` - minutes (e.g., `30m`)
- `h` - hours (e.g., `1h`)
- `d` - days (e.g., `7d`)

## Frontend Integration

### Token Storage

Store tokens securely in your frontend application:

```typescript
// Store tokens
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('refreshToken', response.refreshToken);
localStorage.setItem('tokenExpiry', Date.now() + response.expiresIn * 1000);
```

### Automatic Token Refresh

Implement automatic token refresh when the access token expires:

```typescript
class TokenManager {
  private refreshPromise: Promise<any> | null = null;

  async getValidToken(): Promise<string> {
    const accessToken = localStorage.getItem('accessToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    // Check if token is expired or will expire soon (within 5 minutes)
    if (!accessToken || !tokenExpiry || Date.now() > parseInt(tokenExpiry) - 300000) {
      return this.refreshToken();
    }
    
    return accessToken;
  }

  private async refreshToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performRefresh(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      // Store new tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('tokenExpiry', Date.now() + data.expiresIn * 1000);
      
      return data.accessToken;
    } catch (error) {
      // Clear tokens on refresh failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
      
      // Redirect to login
      window.location.href = '/login';
      throw error;
    }
  }
}
```

### API Request Interceptor

```typescript
// Axios interceptor example
axios.interceptors.request.use(async (config) => {
  const tokenManager = new TokenManager();
  const token = await tokenManager.getValidToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token is invalid, redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Security Considerations

### Best Practices

1. **Secure Storage**: Store refresh tokens securely (HttpOnly cookies for web apps)
2. **Token Rotation**: Always use new refresh tokens after refresh
3. **Automatic Logout**: Logout users when refresh fails
4. **HTTPS Only**: Always use HTTPS in production
5. **Token Validation**: Validate token type and expiry on server

### Token Revocation

- **Individual Revocation**: Revoke specific refresh tokens
- **Global Revocation**: Revoke all user tokens on logout
- **Automatic Cleanup**: Expired tokens are automatically cleaned up

### Monitoring

Monitor token usage and suspicious activity:

```typescript
// Example monitoring metrics
interface TokenMetrics {
  activeRefreshTokens: number;
  revokedTokens: number;
  refreshAttempts: number;
  failedRefreshes: number;
}
```

## Error Handling

### Common Error Responses

```json
{
  "statusCode": 401,
  "message": "Invalid refresh token",
  "error": "Unauthorized"
}
```

```json
{
  "statusCode": 401,
  "message": "Refresh token is revoked or invalid",
  "error": "Unauthorized"
}
```

```json
{
  "statusCode": 401,
  "message": "User not found or inactive",
  "error": "Unauthorized"
}
```

### Error Recovery

1. **Invalid Token**: Clear stored tokens and redirect to login
2. **Revoked Token**: Clear stored tokens and redirect to login
3. **Network Error**: Retry with exponential backoff
4. **Server Error**: Show user-friendly error message

## Testing

### Test Scenarios

1. **Valid Refresh**: Refresh token with valid refresh token
2. **Expired Refresh**: Attempt refresh with expired token
3. **Revoked Refresh**: Attempt refresh with revoked token
4. **Invalid Token**: Attempt refresh with malformed token
5. **Concurrent Refresh**: Multiple simultaneous refresh requests
6. **Logout**: Verify token revocation on logout

### Example Test Cases

```typescript
describe('Refresh Token', () => {
  it('should refresh access token with valid refresh token', async () => {
    // Test implementation
  });

  it('should reject expired refresh token', async () => {
    // Test implementation
  });

  it('should reject revoked refresh token', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Common Issues

1. **Token Not Found**: Check Redis connection and token storage
2. **Invalid Token Type**: Ensure tokens have correct `type` field
3. **Expired Tokens**: Check token expiry configuration
4. **Redis Connection**: Verify Redis is running and accessible

### Debug Information

Enable debug logging to troubleshoot token issues:

```typescript
// Enable debug logging
this.logger.debug(`Token validation: ${JSON.stringify(payload)}`);
this.logger.debug(`Redis token data: ${JSON.stringify(tokenData)}`);
```

## Migration Guide

### From Single Token to Refresh Token

1. Update client to handle dual tokens
2. Implement automatic refresh logic
3. Update error handling for token refresh
4. Test all authentication flows
5. Monitor token usage and performance

### Backward Compatibility

The system maintains backward compatibility with existing single-token implementations while adding refresh token support. 