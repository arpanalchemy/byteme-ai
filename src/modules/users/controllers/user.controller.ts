import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UserService } from "../services/user.service";
import {
  UserDashboardDto,
  UserProfileDto,
  UpdateUserProfileDto,
} from "../dto/user-dashboard.dto";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import {
  VeChainWalletService,
  VeChainWallet,
} from "../../../common/blockchain/vechain-wallet.service";
import { UserWalletService } from "../services/user-wallet.service";
import { LoginDto } from "../dto/login.dto";
import { VerifyOtpDto } from "../dto/verify-otp.dto";
import { Public } from "../../../common/decorators/public.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";

@ApiTags("Users")
@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly vechainWalletService: VeChainWalletService,
    private readonly userWalletService: UserWalletService,
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
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
          description: "Access token (expires in 3 minutes)",
        },
        refreshToken: {
          type: "string",
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          description: "Refresh token (expires in 7 days)",
        },
        expiresIn: {
          type: "number",
          example: 180,
          description: "Access token expiry time in seconds",
        },
        refreshExpiresIn: {
          type: "number",
          example: 604800,
          description: "Refresh token expiry time in seconds",
        },
        walletCreated: {
          type: "boolean",
          example: false,
          description: "Whether a new wallet was created",
        },
        wallet: {
          type: "object",
          description: "Wallet details (only if walletCreated is true)",
          properties: {
            address: { type: "string" },
            mnemonic: { type: "string" },
            privateKey: { type: "string" },
            publicKey: { type: "string" },
            backupRequired: { type: "boolean" },
            backupInstructions: { type: "string" },
          },
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
  @ApiOperation({ summary: "Get user dashboard data" })
  @ApiResponse({
    status: 200,
    description: "Dashboard data retrieved successfully",
    type: UserDashboardDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "User not found" })
  async getUserDashboard(@CurrentUser() user: any): Promise<UserDashboardDto> {
    return this.userService.getUserDashboard(user.id);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user profile" })
  @ApiResponse({
    status: 200,
    description: "Profile retrieved successfully",
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "User not found" })
  async getUserProfile(@CurrentUser() user: any): Promise<UserProfileDto> {
    return this.userService.getUserProfile(user.id);
  }

  @Put("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user profile" })
  @ApiResponse({
    status: 200,
    description: "Profile updated successfully",
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "User not found" })
  async updateUserProfile(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    return this.userService.updateUserProfile(user.id, updateDto);
  }

  @Post("generate-wallet")
  @ApiOperation({ summary: "Generate a new VeChain wallet (for testing)" })
  @ApiResponse({ status: 201, description: "Wallet generated successfully" })
  async generateWallet(): Promise<{
    message: string;
    wallet: Omit<VeChainWallet, "privateKey">;
    privateKey: string; // Only for testing - remove in production
  }> {
    const wallet = this.vechainWalletService.generateWallet();

    return {
      message: "VeChain wallet generated successfully",
      wallet: this.vechainWalletService.getWalletInfo(wallet),
      privateKey: wallet.privateKey, // Only for testing - remove in production
    };
  }

  @Post("generate-wallet-from-mnemonic")
  @ApiOperation({ summary: "Generate wallet from mnemonic (for testing)" })
  @ApiResponse({ status: 201, description: "Wallet generated successfully" })
  async generateWalletFromMnemonic(
    @Body("mnemonic") mnemonic: string,
    @Body("index") index: number = 0,
  ): Promise<{
    message: string;
    wallet: Omit<VeChainWallet, "privateKey">;
    privateKey: string; // Only for testing - remove in production
  }> {
    const wallet = this.vechainWalletService.generateWalletFromMnemonic(
      mnemonic,
      index,
    );

    return {
      message: "VeChain wallet generated from mnemonic successfully",
      wallet: this.vechainWalletService.getWalletInfo(wallet),
      privateKey: wallet.privateKey, // Only for testing - remove in production
    };
  }

  @Post("validate-address")
  @ApiOperation({ summary: "Validate VeChain address" })
  @ApiResponse({ status: 200, description: "Address validation result" })
  async validateAddress(@Body("address") address: string): Promise<{
    isValid: boolean;
    message: string;
  }> {
    const isValid = this.vechainWalletService.isValidAddress(address);

    return {
      isValid,
      message: isValid ? "Valid VeChain address" : "Invalid VeChain address",
    };
  }

  @Post("sign-message")
  @ApiOperation({ summary: "Sign a message with private key (for testing)" })
  @ApiResponse({ status: 200, description: "Message signed successfully" })
  async signMessage(
    @Body("message") message: string,
    @Body("privateKey") privateKey: string,
  ): Promise<{
    message: string;
    signature: string;
    address: string;
  }> {
    const signature = this.vechainWalletService.signMessage(
      message,
      privateKey,
    );
    const wallet =
      this.vechainWalletService.generateWalletFromPrivateKey(privateKey);

    return {
      message: "Message signed successfully",
      signature,
      address: wallet.address,
    };
  }

  @Post("verify-signature")
  @ApiOperation({ summary: "Verify message signature" })
  @ApiResponse({ status: 200, description: "Signature verification result" })
  async verifySignature(
    @Body("message") message: string,
    @Body("signature") signature: string,
    @Body("address") address: string,
  ): Promise<{
    isValid: boolean;
    message: string;
  }> {
    const isValid = this.vechainWalletService.verifySignature(
      message,
      signature,
      address,
    );

    return {
      isValid,
      message: isValid ? "Signature is valid" : "Signature is invalid",
    };
  }

  // === User Wallet Management Endpoints ===

  @Get("wallet")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user wallet information" })
  @ApiResponse({
    status: 200,
    description: "Wallet information retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Wallet not found" })
  async getUserWallet(@CurrentUser() user: any): Promise<{
    address: string;
    walletType: string;
    isBackedUp: boolean;
    backedUpAt?: Date;
    createdAt: Date;
  }> {
    const wallet = await this.userWalletService.getUserWallet(user.id);

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    return {
      address: wallet.walletAddress,
      walletType: wallet.walletType,
      isBackedUp: wallet.isBackedUp,
      backedUpAt: wallet.backedUpAt,
      createdAt: wallet.createdAt,
    };
  }

  @Post("wallet/backup")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mark wallet as backed up" })
  @ApiResponse({
    status: 200,
    description: "Wallet marked as backed up successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async markWalletAsBackedUp(@CurrentUser() user: any): Promise<{
    message: string;
    backedUpAt: Date;
  }> {
    await this.userWalletService.markWalletAsBackedUp(user.id);

    return {
      message: "Wallet marked as backed up successfully",
      backedUpAt: new Date(),
    };
  }

  @Post("wallet/sign-message")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Sign a message with user wallet" })
  @ApiResponse({ status: 200, description: "Message signed successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async signMessageWithWallet(
    @CurrentUser() user: any,
    @Body("message") message: string,
  ): Promise<{
    message: string;
    signature: string;
    address: string;
  }> {
    const result = await this.userWalletService.signMessage(user.id, message);

    return {
      message: "Message signed successfully",
      signature: result.signature,
      address: result.address,
    };
  }

  @Get("wallet/stats")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get wallet statistics (admin only)" })
  @ApiResponse({
    status: 200,
    description: "Wallet statistics retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getWalletStats(): Promise<{
    totalWallets: number;
    backedUpWallets: number;
    notBackedUpWallets: number;
  }> {
    return this.userWalletService.getWalletStats();
  }
}
