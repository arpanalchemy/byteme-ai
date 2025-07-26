import { Controller, Post, Get, Put, Body, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UserService } from "../services/user.service";
import { LoginDto } from "../dto/login.dto";
import { VerifyOtpDto } from "../dto/verify-otp.dto";
import {
  UpdateUserProfileDto,
  UserDashboardDto,
  UserProfileDto,
} from "../dto/user-dashboard.dto";
import { Public } from "src/common/decorators/public.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { User } from "../entity/user.entity";

@ApiTags("Users")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post("login")
  @ApiOperation({
    summary: "Request login OTP",
    description:
      "Sends a 6-digit OTP to the provided email address for login verification",
  })
  @ApiResponse({ status: 200, description: "OTP sent successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  async login(@Body() loginDto: LoginDto) {
    return this.userService.loginWithEmail(loginDto.email);
  }

  @Public()
  @Post("verify-otp")
  @ApiOperation({
    summary: "Verify OTP code",
    description:
      "Validates the OTP code sent to user email and returns an authentication token",
  })
  @ApiResponse({
    status: 200,
    description: "OTP validated successfully",
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          example: "OTP validated successfully",
        },
        token: {
          type: "string",
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Invalid OTP" })
  @ApiResponse({ status: 404, description: "User not found" })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.userService.validateOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  @Get("dashboard")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get user dashboard data",
    description:
      "Retrieves user dashboard with wallet balance, rewards, carbon saved, and statistics",
  })
  @ApiResponse({
    status: 200,
    description: "User dashboard data retrieved successfully",
    type: UserDashboardDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getUserDashboard(@CurrentUser() user: User): Promise<UserDashboardDto> {
    return this.userService.getUserDashboard(user.id);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get user profile",
    description: "Retrieves user profile information",
  })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully",
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getUserProfile(@CurrentUser() user: User): Promise<UserProfileDto> {
    return this.userService.getUserProfile(user.id);
  }

  @Put("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update user profile",
    description: "Updates user profile information",
  })
  @ApiResponse({
    status: 200,
    description: "User profile updated successfully",
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async updateUserProfile(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateUserProfileDto
  ): Promise<UserProfileDto> {
    return this.userService.updateUserProfile(user.id, updateDto);
  }
}
