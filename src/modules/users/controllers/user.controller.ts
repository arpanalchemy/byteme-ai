import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { LoginDto } from '../dto/login.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Request login OTP',
    description: 'Sends a 6-digit OTP to the provided email address for login verification'
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async login(@Body() loginDto: LoginDto) {
    return this.userService.loginWithEmail(loginDto.email);
  }

  @Public()
  @Post('verify-otp')
  @ApiOperation({
    summary: 'Verify OTP code',
    description: 'Validates the OTP code sent to user email and returns an authentication token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OTP validated successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'OTP validated successfully'
        },
        token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid OTP' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.userService.validateOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }
}