import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { emailConfig } from '../../../config/email.config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly isEmailConfigured: boolean;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    // Check if email is properly configured
    this.isEmailConfigured = !!(
      this.configService.get('SMTP_USER') && this.configService.get('SMTP_PASS')
    );

    if (!this.isEmailConfigured) {
      this.logger.warn(
        'Email service is not configured. SMTP_USER and SMTP_PASS environment variables are required.',
      );
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    username?: string,
  ): Promise<void> {
    if (!this.isEmailConfigured) {
      this.logger.warn(`Email not configured. Skipping password reset email to ${email}`);
      return;
    }

    try {
      const resetUrl = `${emailConfig.frontendUrl}/reset-password?token=${resetToken}&email=${email}`;

      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset Request',
        template: 'password-reset',
        context: {
          username: username || email,
          resetUrl,
          resetToken,
          email,
        },
      });

      this.logger.log(`Password reset email sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(email: string, username?: string): Promise<void> {
    if (!this.isEmailConfigured) {
      this.logger.warn(`Email not configured. Skipping welcome email to ${email}`);
      return;
    }

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to TaskFlow',
        template: 'welcome',
        context: {
          username: username || email,
          email,
          frontendUrl: emailConfig.frontendUrl,
        },
      });

      this.logger.log(`Welcome email sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      // Don't throw error for welcome email as it's not critical
    }
  }
}
