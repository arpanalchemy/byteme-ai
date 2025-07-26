# Token Migration Guide

## Overview

The authentication system has been updated to include a `type` field in JWT tokens for enhanced security and refresh token support. This guide explains the changes and how to handle existing tokens.

## What Changed

### Old Token Format

```json
{
  "sub": "user-id",
  "walletAddress": "0x...",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### New Token Format

```json
{
  "sub": "user-id",
  "walletAddress": "0x...",
  "isActive": true,
  "isVerified": true,
  "type": "access",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Key Changes

1. **Added `type` field**: Tokens now include a `type` field to distinguish between access and refresh tokens
2. **Added `isActive` and `isVerified` fields**: User status information is now included in tokens
3. **Removed `email` field**: Email is no longer included in tokens for security
4. **Backward compatibility**: The system still accepts old tokens during migration

## Migration Options

### Option 1: Use Migration Endpoint (Recommended)

If you have existing tokens, you can migrate them using the migration endpoint:

```http
POST /auth/migrate-token
Content-Type: application/json

{
  "token": "your-old-token-here"
}
```

**Response:**

```json
{
  "accessToken": "new-token-with-type-field",
  "message": "Token migrated successfully"
}
```

### Option 2: Re-authenticate

The simplest approach is to re-authenticate using the wallet signature flow:

1. Call `/auth/connect-wallet` to get a nonce
2. Sign the nonce with your wallet
3. Call `/auth/verify-signature` to get new tokens

### Option 3: Update Your Application

If you're generating tokens in your application, update the token generation to include the new fields:

```typescript
// Old way
const payload = {
  sub: user.id,
  walletAddress: user.walletAddress,
  email: user.email,
};

// New way
const payload = {
  sub: user.id,
  walletAddress: user.walletAddress || "",
  isActive: user.isActive,
  isVerified: user.isVerified,
  type: "access" as const,
};
```

## Error Handling

### "Invalid token type" Error

If you see this error:

```json
{
  "message": "Invalid token type",
  "error": "Unauthorized",
  "statusCode": 401
}
```

This means your token is missing the `type` field. Use one of the migration options above.

### Token Expiration

Old tokens will continue to work until they expire. After expiration, you'll need to re-authenticate or use the migration endpoint.

## Frontend Integration

### Automatic Token Migration

You can implement automatic token migration in your frontend:

```typescript
class TokenManager {
  async getValidToken(): Promise<string> {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      throw new Error("No token available");
    }

    try {
      // Try to use the token
      const response = await fetch("/api/protected-endpoint", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        return token;
      }

      // If we get "Invalid token type" error, try migration
      if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.message === "Invalid token type") {
          return await this.migrateToken(token);
        }
      }

      throw new Error("Token is invalid");
    } catch (error) {
      throw error;
    }
  }

  private async migrateToken(oldToken: string): Promise<string> {
    try {
      const response = await fetch("/auth/migrate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: oldToken }),
      });

      if (!response.ok) {
        throw new Error("Migration failed");
      }

      const data = await response.json();

      // Store the new token
      localStorage.setItem("accessToken", data.accessToken);

      return data.accessToken;
    } catch (error) {
      // If migration fails, redirect to login
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      throw error;
    }
  }
}
```

### Axios Interceptor Example

```typescript
// Add response interceptor for automatic token migration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "Invalid token type"
    ) {
      const oldToken = localStorage.getItem("accessToken");

      if (oldToken) {
        try {
          const migrationResponse = await axios.post("/auth/migrate-token", {
            token: oldToken,
          });

          // Update token
          localStorage.setItem(
            "accessToken",
            migrationResponse.data.accessToken
          );

          // Retry original request
          error.config.headers.Authorization = `Bearer ${migrationResponse.data.accessToken}`;
          return axios.request(error.config);
        } catch (migrationError) {
          // Migration failed, redirect to login
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);
```

## Testing

### Test Token Migration

1. **Get an old token**: Use the OTP verification flow to get a legacy token
2. **Test migration**: Call the migration endpoint with the old token
3. **Verify new token**: Use the new token to access protected endpoints

### Test Backward Compatibility

The system should still accept old tokens during the migration period. Test this by:

1. Using an old token to access protected endpoints
2. Verifying that the JWT strategy handles both formats correctly

## Timeline

- **Phase 1 (Current)**: Backward compatibility enabled, migration endpoint available
- **Phase 2 (Future)**: Deprecation warnings for old tokens
- **Phase 3 (Future)**: Old token format no longer supported

## Support

If you encounter issues during migration:

1. Check the token format using a JWT decoder
2. Verify the token hasn't expired
3. Use the migration endpoint to convert old tokens
4. Contact support if issues persist

## Security Notes

- Old tokens remain valid until expiration
- New tokens include additional security fields
- Migration endpoint is public but validates token authenticity
- Consider implementing rate limiting on migration endpoint in production
