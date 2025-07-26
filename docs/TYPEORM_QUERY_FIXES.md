# TypeORM Query Syntax Fixes

## Overview

This document summarizes the fixes applied to resolve MongoDB-style query syntax issues in TypeORM queries across the codebase. The main problem was the use of MongoDB-style operators like `$gte` and string literals with `as any` type assertions, which are incompatible with TypeORM and PostgreSQL.

## Problem Description

The codebase contained several instances where MongoDB-style query syntax was being used in TypeORM queries:

1. **MongoDB-style operators**: `{ $gte: value } as any`
2. **String literals for enums**: `{ status: "completed" as any }`
3. **Improper type assertions**: Using `as any` to bypass TypeScript type checking

These patterns caused runtime errors when TypeORM tried to execute queries against PostgreSQL, resulting in errors like:

```
invalid input syntax for type timestamp: "{"$gte":"2025-06-26T08:46:42.516Z"}"
```

## Files Fixed

### 1. `src/modules/admin/services/admin.service.ts`

**Issues Fixed:**

- MongoDB-style timestamp comparison: `{ $gte: thirtyDaysAgo } as any`
- String literal for status: `{ status: "pending" as any }`

**Changes Made:**

```typescript
// Before
import { Repository } from "typeorm";

const activeUsers = await this.userRepository.count({
  where: {
    lastLogin: { $gte: thirtyDaysAgo } as any,
  },
});

const pendingUploads = await this.odometerUploadRepository.count({
  where: { status: "pending" as any },
});

// After
import { Repository, MoreThanOrEqual } from "typeorm";
import {
  OdometerUpload,
  UploadStatus,
} from "../../odometer/entity/odometer-upload.entity";

const activeUsers = await this.userRepository.count({
  where: {
    lastLogin: MoreThanOrEqual(thirtyDaysAgo),
  },
});

const pendingUploads = await this.odometerUploadRepository.count({
  where: { status: UploadStatus.PENDING },
});
```

### 2. `src/modules/badges/services/badge.service.ts`

**Issues Fixed:**

- String literals for status in query builder: `{ status: "completed" as any }`

**Changes Made:**

```typescript
// Before
import { OdometerUpload } from "../../odometer/entity/odometer-upload.entity";

.andWhere("upload.status = :status", { status: "completed" as any })

// After
import { OdometerUpload, UploadStatus } from "../../odometer/entity/odometer-upload.entity";

.andWhere("upload.status = :status", { status: UploadStatus.COMPLETED })
```

### 3. `src/modules/leaderboard/services/leaderboard.service.ts`

**Issues Fixed:**

- String literals for status in query builder: `{ status: "completed" as any }`
- Non-existent enum value: `LeaderboardPeriod.YEARLY`

**Changes Made:**

```typescript
// Before
import { OdometerUpload } from "../../odometer/entity/odometer-upload.entity";

.andWhere("upload.status = :status", { status: "completed" as any })

case LeaderboardPeriod.YEARLY: // This enum value doesn't exist

// After
import { OdometerUpload, UploadStatus } from "../../odometer/entity/odometer-upload.entity";

.andWhere("upload.status = :status", { status: UploadStatus.COMPLETED })

// Removed YEARLY case as it doesn't exist in the enum
```

### 4. `src/modules/users/services/user.service.ts`

**Issues Fixed:**

- String literals for status in count queries and query builders
- Incorrect import paths and method calls

**Changes Made:**

```typescript
// Before
const uploadCount = await this.odometerUploadRepository.count({
  where: { userId, status: "completed" as any },
});

.andWhere("upload.status = :status", { status: "completed" as any })

// After
import { OdometerUpload, UploadStatus } from "../../odometer/entity/odometer-upload.entity";

const uploadCount = await this.odometerUploadRepository.count({
  where: { userId, status: UploadStatus.COMPLETED },
});

.andWhere("upload.status = :status", { status: UploadStatus.COMPLETED })
```

### 5. `src/modules/challenges/services/challenge.service.ts`

**Issues Fixed:**

- String literals for status in query builder: `{ status: "completed" as any }`
- Non-existent enum value: `UserChallengeStatus.ACTIVE`

**Changes Made:**

```typescript
// Before
import { OdometerUpload } from "../../odometer/entity/odometer-upload.entity";

.andWhere("upload.status = :status", { status: "completed" as any })

status: UserChallengeStatus.ACTIVE, // This enum value doesn't exist

// After
import { OdometerUpload, UploadStatus } from "../../odometer/entity/odometer-upload.entity";

.andWhere("upload.status = :status", { status: UploadStatus.COMPLETED })

status: UserChallengeStatus.JOINED, // Correct enum value
```

## Key Changes Summary

### 1. Import Statements

Added proper imports for TypeORM operators and enum types:

```typescript
import { Repository, MoreThanOrEqual } from "typeorm";
import {
  OdometerUpload,
  UploadStatus,
} from "../../odometer/entity/odometer-upload.entity";
```

### 2. TypeORM Operators

Replaced MongoDB-style operators with proper TypeORM operators:

```typescript
// MongoDB style (incorrect)
{ $gte: value } as any

// TypeORM style (correct)
MoreThanOrEqual(value)
```

### 3. Enum Usage

Replaced string literals with proper enum values:

```typescript
// String literal (incorrect)
{
  status: "completed" as any;
}

// Enum value (correct)
{
  status: UploadStatus.COMPLETED;
}
```

### 4. Query Builder Parameters

Updated query builder parameters to use enum values:

```typescript
// Before
.andWhere("upload.status = :status", { status: "completed" as any })

// After
.andWhere("upload.status = :status", { status: UploadStatus.COMPLETED })
```

## Benefits

1. **Type Safety**: Proper enum usage provides compile-time type checking
2. **Database Compatibility**: TypeORM queries now work correctly with PostgreSQL
3. **Maintainability**: Clear, explicit code that's easier to understand and maintain
4. **Error Prevention**: Eliminates runtime errors caused by invalid query syntax
5. **Consistency**: Standardized approach to database queries across the codebase

## Testing

All fixes have been verified through:

- ✅ TypeScript compilation (`npm run build`)
- ✅ No linter errors
- ✅ Proper enum value usage
- ✅ Correct import statements

## Prevention

To prevent similar issues in the future:

1. **Always use TypeORM operators** instead of MongoDB-style syntax
2. **Import and use proper enum values** instead of string literals
3. **Avoid `as any` type assertions** in database queries
4. **Use TypeScript strict mode** to catch type errors at compile time
5. **Follow TypeORM documentation** for proper query syntax

## Related Documentation

- [TypeORM Query Builder Documentation](https://typeorm.io/#/select-query-builder)
- [TypeORM Find Options](https://typeorm.io/#/find-options)
- [DTO Validation Fixes](./DTO_VALIDATION_FIXES.md)
- [Mnemonic Migration Guide](./MNEMONIC_MIGRATION_GUIDE.md)
