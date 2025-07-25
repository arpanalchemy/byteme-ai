import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import { ConfigService } from '@nestjs/config';
import { EmailTemplates } from '../helpers/email-templates.helper';
import { JwtService } from '@nestjs/jwt';
import { VeChainSignatureHelper } from '../../auth/helpers/vechain-signature.helper';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UserService {
  private readonly emailTransporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly vechainSignatureHelper: VeChainSignatureHelper
  ) {
    const emailUser = this.configService.get('EMAIL_USER', 'jaimin.tank@alchemytech.ca');
    const emailPass = this.configService.get('EMAIL_PASS');

    if (!emailUser || !emailPass) {
      console.error('Email credentials not properly configured');
      return;
    }

    // Create Gmail SMTP transporter
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    // Verify the connection
    this.emailTransporter.verify((error) => {
      if (error) {
        console.error('SMTP Connection Error:', error);
      } else {
        console.log('SMTP Server is ready to send emails');
      }
    });
  }

  async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    // if (!this.emailTransporter) {
    //   throw new BadRequestException('Email service not configured');
    // }

    const fromEmail = this.configService.get('EMAIL_USER', 'jaimin.tank@alchemytech.ca');

    try {
      await this.emailTransporter.sendMail({
        from: {
          name: 'B3TR EV Rewards',
          address: fromEmail
        },
        to,
        subject,
        html: htmlContent,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        }
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      if (error.code === 'EAUTH') {
        throw new BadRequestException('Email authentication failed. Please check SMTP credentials.');
      }
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }

  async loginWithEmail(email: string): Promise<{ message: string }> {
    let user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      // Create new user if not found
      user = this.userRepository.create({
        email,
        isActive: true,
        isVerified: false,
        totalMileage: 0,
        totalCarbonSaved: 0,
        totalPoints: 0,
        currentTier: 'bronze',
        b3trBalance: 0
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailOtp = otp;
    await this.userRepository.save(user);

    await this.sendEmail(
      email,
      'Your B3TR EV Rewards Login Code',
      EmailTemplates.getOTPEmailTemplate(otp, { configService: this.configService })
    );

    return { message: 'Login code sent to your email address' };
  }

  async validateOtp(email: string, otp: string): Promise<{ message: string; token: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.emailOtp || user.emailOtp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Clear the OTP after successful validation
    user.emailOtp = undefined;

    // Generate a random wallet address if not exists
    if (!user.walletAddress) {
      const walletAddress = '0x' + crypto.randomBytes(20).toString('hex');
      if (!this.vechainSignatureHelper.isValidAddress(walletAddress)) {
        throw new Error('Generated invalid wallet address');
      }
      user.walletAddress = walletAddress;
      user.walletType = 'sync2';
      user.isVerified = true;
    }

    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generate JWT token using the same payload structure as auth service
    const payload = {
      sub: user.id,
      walletAddress: user.walletAddress,
      email: user.email
    };
    
    const token = this.jwtService.sign(payload);

    return {
      message: 'OTP validated successfully',
      token
    };
  }
}