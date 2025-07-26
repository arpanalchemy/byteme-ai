import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class UserDto {
  @ApiProperty({
    description: "User unique identifier",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "User's wallet address",
    example: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  })
  walletAddress: string;

  @ApiPropertyOptional({
    description: "User's display name",
    example: "john_doe",
  })
  username?: string;

  @ApiPropertyOptional({
    description: "User's email address",
    example: "john@example.com",
  })
  email?: string;

  @ApiPropertyOptional({
    description: "User's profile image URL",
    example: "https://example.com/profile.jpg",
  })
  profileImageUrl?: string;

  @ApiProperty({
    description: "Whether the user account is active",
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: "Whether the user's wallet is verified",
    example: true,
  })
  isVerified: boolean;

  @ApiProperty({
    description: "Total mileage recorded by the user",
    example: 1000.5,
  })
  totalMileage: number;

  @ApiProperty({
    description: "Total carbon saved by the user",
    example: 50.25,
  })
  totalCarbonSaved: number;

  @ApiProperty({
    description: "Total points earned by the user",
    example: 100,
  })
  totalPoints: number;

  @ApiProperty({
    description: "User's current tier level",
    enum: ["bronze", "silver", "gold", "platinum"],
    example: "silver",
  })
  currentTier: string;

  @ApiProperty({
    description: "User's B3TR token balance",
    example: 10.5,
  })
  b3trBalance: number;
}

export class AuthResponseDto {
  @ApiProperty({
    description: "JWT access token",
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({
    description: "JWT refresh token",
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty({
    description: "Access token expiration time in seconds",
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: "Refresh token expiration time in seconds",
    example: 604800,
  })
  refreshExpiresIn: number;

  @ApiProperty({
    description: "User information",
    type: UserDto,
  })
  user: UserDto;

  @ApiProperty({
    description: "Message indicating the result",
    example: "Authentication successful",
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: "Refresh token",
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: "New JWT access token",
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({
    description: "New JWT refresh token",
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty({
    description: "Access token expiration time in seconds",
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: "Refresh token expiration time in seconds",
    example: 604800,
  })
  refreshExpiresIn: number;

  @ApiProperty({
    description: "Message indicating the result",
    example: "Token refreshed successfully",
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class LogoutDeviceDto {
  @ApiProperty({
    description: "Refresh token ID to revoke",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsString()
  @IsNotEmpty()
  tokenId: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: "Message indicating the result",
    example: "Logged out successfully",
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class UserInfoResponseDto {
  @ApiProperty({
    description: "User information",
    type: UserDto,
  })
  user: UserDto;

  @ApiProperty({
    description: "Message indicating the result",
    example: "User information retrieved successfully",
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
