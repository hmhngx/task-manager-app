import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from './services/email.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.schema';
import { Types } from 'mongoose';
import { UserRole } from '../users/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshToken } from './schemas/refresh-token.schema';
import { randomBytes } from 'crypto';

export interface UserResponse {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: UserResponse;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>,
  ) {}

  private getIdString(id: any): string {
    if (id instanceof Types.ObjectId) {
      return id.toHexString();
    }
    if (typeof id === 'string') {
      return id;
    }
    return String(id);
  }

  private async generateRefreshToken(userId: Types.ObjectId): Promise<string> {
    const token = randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    await this.refreshTokenModel.create({
      userId,
      token,
      expiresAt,
    });

    // Store refresh token in user document
    await this.usersService.updateRefreshToken(this.getIdString(userId), token);

    return token;
  }

  private async revokeRefreshToken(token: string, replacedByToken?: string): Promise<void> {
    await this.refreshTokenModel.updateOne({ token }, { isRevoked: true, replacedByToken });
  }

  async validateUser(email: string, password: string): Promise<UserResponse | null> {
    this.logger.log(`Validating user: ${email}`);
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        this.logger.warn(`User not found: ${email}`);
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user: ${email}`);
        return null;
      }

      this.logger.log(`User validated successfully: ${email}`);
      return {
        id: this.getIdString(user._id),
        email: user.email,
        username: user.username,
        role: user.role,
      };
    } catch (error) {
      this.logger.error(
        `Error validating user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async login(user: User): Promise<LoginResponse> {
    this.logger.log(`Generating tokens for user: ${user.email}`);
    try {
      const payload = {
        email: user.email,
        sub: this.getIdString(user._id),
        role: user.role,
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload),
        this.generateRefreshToken(user._id),
      ]);

      this.logger.log(`Tokens generated successfully for user: ${user.email}`);
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: this.getIdString(user._id),
          email: user.email,
          username: user.username,
          role: user.role,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error generating tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new UnauthorizedException('Error generating tokens');
    }
  }

  async registerAndLogin(user: User): Promise<LoginResponse> {
    // Send welcome email for new registrations (don't fail if email fails)
    try {
      await this.emailService.sendWelcomeEmail(user.email, user.username);
    } catch (error) {
      this.logger.warn(
        `Failed to send welcome email to ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Don't throw error for welcome email as it's not critical
    }

    // Generate login tokens
    return this.login(user);
  }

  async refreshTokens(refreshToken: string): Promise<LoginResponse> {
    try {
      const tokenDoc = await this.refreshTokenModel.findOne({
        token: refreshToken,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      });

      if (!tokenDoc) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findById(this.getIdString(tokenDoc.userId));
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const newTokens = await this.login(user);

      // Revoke the old refresh token
      await this.revokeRefreshToken(refreshToken, newTokens.refresh_token);

      return newTokens;
    } catch (error) {
      this.logger.error(
        `Error refreshing tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new UnauthorizedException('Error refreshing tokens');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.revokeRefreshToken(refreshToken);
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const resetToken = await this.usersService.createPasswordResetToken(email);
      const user = await this.usersService.findByEmail(email);

      if (user) {
        await this.emailService.sendPasswordResetEmail(email, resetToken, user.username);
      }
    } catch (error) {
      this.logger.error(
        `Error in forgot password: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Don't reveal if email exists or not for security
      throw new UnauthorizedException('If the email exists, a password reset link has been sent');
    }
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    try {
      await this.usersService.resetPassword(email, token, newPassword);
      await this.usersService.clearPasswordResetToken(email);
    } catch (error) {
      this.logger.error(
        `Error in reset password: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }
}
