import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ConnectWalletDto } from './dto/connect-wallet.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { AuthResponseDto, NonceResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('connect-wallet')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connect wallet and get nonce for signature' })
  @ApiResponse({
    status: 200,
    description: 'Wallet connected successfully',
    type: NonceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid wallet address',
  })
  async connectWallet(
    @Body() connectWalletDto: ConnectWalletDto,
  ): Promise<NonceResponseDto> {
    return this.authService.connectWallet(connectWalletDto);
  }

  @Post('verify-signature')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify wallet signature and authenticate user' })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid signature or user not found',
  })
  async verifySignature(
    @Body() verifySignatureDto: VerifySignatureDto,
  ): Promise<AuthResponseDto> {
    return this.authService.verifySignature(verifySignatureDto);
  }

  @Post('disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect wallet and invalidate session' })
  @ApiResponse({
    status: 200,
    description: 'Wallet disconnected successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Wallet disconnected successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async disconnectWallet(@CurrentUser() user: any) {
    return this.authService.disconnectWallet(user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getCurrentUser(@CurrentUser() user: any) {
    const userData = await this.authService.validateUser(user.id);

    return {
      user: {
        id: userData.id,
        walletAddress: userData.walletAddress,
        username: userData.username,
        email: userData.email,
        isActive: userData.isActive,
        isVerified: userData.isVerified,
        totalMileage: Number(userData.totalMileage),
        totalCarbonSaved: Number(userData.totalCarbonSaved),
        totalPoints: userData.totalPoints,
        currentTier: userData.currentTier,
        b3trBalance: Number(userData.b3trBalance),
      },
      message: 'User information retrieved successfully',
    };
  }
}
