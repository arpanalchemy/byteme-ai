import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entity/user.entity';
import { ConnectWalletDto } from './dto/connect-wallet.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { AuthResponseDto, NonceResponseDto } from './dto/auth-response.dto';
import { VeChainSignatureHelper } from './helpers/vechain-signature.helper';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly vechainSignatureHelper: VeChainSignatureHelper,
  ) {}

  async generateNonce(walletAddress: string): Promise<NonceResponseDto> {
    this.logger.log(`Generating nonce for wallet: ${walletAddress}`);

    // Validate wallet address format
    if (!this.vechainSignatureHelper.isValidAddress(walletAddress)) {
      throw new UnauthorizedException('Invalid wallet address format');
    }

    // Check if user exists
    let user = await this.userRepository.findOne({
      where: { walletAddress },
    });

    // Generate a random nonce
    const nonce = crypto.randomBytes(16).toString('hex');
    const message = `${nonce}`;

    if (user) {
      // Update existing user's nonce
      user.nonce = nonce;
      await this.userRepository.save(user);
    } else {
      // Create new user with nonce
      user = this.userRepository.create({
        walletAddress,
        nonce,
      });
      await this.userRepository.save(user);
    }

    return {
      nonce,
      message,
      walletAddress,
    };
  }

  async verifySignature(
    verifySignatureDto: VerifySignatureDto,
  ): Promise<AuthResponseDto> {
    const { walletAddress, message, signature } = verifySignatureDto;
    this.logger.log(`Verifying signature for wallet: ${walletAddress}`);

    // Validate inputs
    if (!this.vechainSignatureHelper.isValidAddress(walletAddress)) {
      throw new UnauthorizedException('Invalid wallet address format');
    }

    if (!this.vechainSignatureHelper.isValidSignature(signature)) {
      throw new UnauthorizedException('Invalid signature format');
    }

    // Find user by wallet address
    const user = await this.userRepository.findOne({
      where: { walletAddress },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.nonce) {
      throw new UnauthorizedException('No nonce found for this wallet');
    }

    // Verify the message format
    const expectedMessage = `${user.nonce}`;

    if (message !== expectedMessage) {
      throw new UnauthorizedException('Invalid message format');
    }

    // Verify VeChain signature
    const isValidSignature =
      await this.vechainSignatureHelper.verifyPersonalSignature(
        message,
        signature,
        walletAddress,
      );

    if (!isValidSignature) {
      this.logger.warn(`Invalid signature for wallet: ${walletAddress}`);
      throw new UnauthorizedException('Invalid signature');
    }

    // Update user's last login and clear nonce
    user.lastLogin = new Date();
    user.nonce = undefined;
    await this.userRepository.save(user);

    // Generate JWT token
    const payload = user.jwtPayload;
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        walletAddress: user.walletAddress || '',
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        isVerified: user.isVerified,
        totalMileage: Number(user.totalMileage),
        totalCarbonSaved: Number(user.totalCarbonSaved),
        totalPoints: user.totalPoints,
        currentTier: user.currentTier,
        b3trBalance: Number(user.b3trBalance),
      },
      message: 'Authentication successful',
    };
  }

  async connectWallet(
    connectWalletDto: ConnectWalletDto,
  ): Promise<NonceResponseDto> {
    const { walletAddress, walletType, username, email } = connectWalletDto;
    this.logger.log(`Connecting wallet: ${walletAddress}`);

    // Validate wallet address format
    if (!this.vechainSignatureHelper.isValidAddress(walletAddress)) {
      throw new UnauthorizedException('Invalid wallet address format');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { walletAddress },
    });

    if (existingUser) {
      // Update wallet type if provided
      if (walletType) {
        existingUser.walletType = walletType;
      }

      // Update username/email if provided and not already set
      if (username && !existingUser.username) {
        existingUser.username = username;
      }
      if (email && !existingUser.email) {
        existingUser.email = email;
      }

      await this.userRepository.save(existingUser);
    }

    // Generate nonce for signature
    return this.generateNonce(walletAddress);
  }

  async disconnectWallet(userId: string): Promise<{ message: string }> {
    this.logger.log(`Disconnecting wallet for user: ${userId}`);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Clear nonce and update last login
    user.nonce = undefined;
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    return { message: 'Wallet disconnected successfully' };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}
