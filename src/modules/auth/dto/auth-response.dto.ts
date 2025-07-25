import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User information',
  })
  user: {
    id: string;
    walletAddress: string;
    username?: string;
    email?: string;
    isActive: boolean;
    isVerified: boolean;
    totalMileage: number;
    totalCarbonSaved: number;
    totalPoints: number;
    currentTier: string;
    b3trBalance: number;
  };

  @ApiProperty({
    description: 'Message indicating the result',
    example: 'Wallet connected successfully',
  })
  message: string;
}

export class NonceResponseDto {
  @ApiProperty({
    description: 'Nonce for wallet signature',
    example: '1234567890',
  })
  nonce: string;

  @ApiProperty({
    description: 'Message to sign',
    example: 'Sign this message to authenticate with Drive & Earn: 1234567890',
  })
  message: string;

  @ApiProperty({
    description: 'Wallet address',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  })
  walletAddress: string;
}
