import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { ContactSupportDto } from '../dto/contact-support.dto';
import { EmailTemplates } from '../helpers/email-templates.helper';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);
  private readonly supportEmail: string;

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.supportEmail = this.configService.get('SUPPORT_EMAIL', 'jaimin.tank@alchemytech.ca');
  }

  private sanitizeInput(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async submitSupportRequest(supportRequest: ContactSupportDto): Promise<{ message: string }> {
    try {
      // Sanitize user input
      const sanitizedRequest = {
        ...supportRequest,
        fullName: this.sanitizeInput(supportRequest.fullName),
        subject: this.sanitizeInput(supportRequest.subject),
        message: this.sanitizeInput(supportRequest.message),
      };

      // Send email to support team
      try {
        await this.userService.sendEmail(
          this.supportEmail,
          `[B3TR Support] ${sanitizedRequest.category}: ${sanitizedRequest.subject}`,
          EmailTemplates.getSupportEmailTemplate(
            sanitizedRequest.category,
            sanitizedRequest.fullName,
            sanitizedRequest.emailAddress,
            sanitizedRequest.subject,
            sanitizedRequest.message,
          ),
        );
      } catch (error) {
        this.logger.error(`Failed to send support team email: ${error.message}`);
        throw new BadRequestException('Failed to process support request. Please try again later.');
      }

      // Send confirmation email to user
      try {
        await this.userService.sendEmail(
          sanitizedRequest.emailAddress,
          'We received your support request',
          EmailTemplates.getBaseTemplate().replace('{{content}}', `
            <div class="header">
              <h1 class="header-title">Support Request Received</h1>
            </div>
            
            <div class="content">
              <h2 class="title">Thank You for Contacting Us</h2>
              <p class="message">
                We have received your support request regarding "${sanitizedRequest.subject}" and our team will get back to you within 24 hours.
              </p>
              
              <div class="message" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Request Details:</strong></p>
                <p>Category: ${sanitizedRequest.category}</p>
                <p>Subject: ${sanitizedRequest.subject}</p>
              </div>

              <p class="message">
                If you need immediate assistance, you can also reach us through our live chat support available 24/7.
              </p>
            </div>

            <div class="footer">
              <p>This is an automated message, please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} B3TR - Powered by VeChain</p>
            </div>
          `),
        );
      } catch (error) {
        this.logger.error(`Failed to send confirmation email: ${error.message}`);
        // Don't throw here as the support request was already processed
        // Just log the error and continue
      }

      return { message: 'Support request submitted successfully' };
    } catch (error) {
      this.logger.error(`Failed to submit support request: ${error.message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('An error occurred while processing your request');
    }
  }
} 