import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConnectWalletDto {
  @ApiProperty({
    description: 'Wallet address to connect',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiPropertyOptional({
    description: 'Type of wallet being connected',
    enum: ['veworld', 'sync2', 'walletconnect'],
    example: 'veworld',
  })
  @IsOptional()
  @IsString()
  @IsIn(['veworld', 'sync2', 'walletconnect'])
  walletType?: 'veworld' | 'sync2' | 'walletconnect';

  @ApiPropertyOptional({
    description: 'Username for the account (optional)',
    example: 'john_doe',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Email address (optional)',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;
}
