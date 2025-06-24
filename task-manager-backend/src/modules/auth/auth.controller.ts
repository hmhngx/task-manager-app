import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  UseGuards,
  Logger,
  ValidationPipe,
  Get,
  Delete,
  Param,
  Request,
} from '@nestjs/common';
import { AuthService, LoginResponse } from './auth.service';
import { UsersService } from '../users/users.service';
import { PushService } from '../notifications/services/push.service';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly pushService: PushService,
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

  @Post('register')
  async register(@Body(new ValidationPipe({ transform: true })) registerDto: RegisterDto) {
    this.logger.log(`Registration attempt for username: ${registerDto.username}`);

    // Check if username already exists
    const existingUser = await this.usersService.findByUsername(registerDto.username);
    if (existingUser) {
      this.logger.warn(`Username already exists: ${registerDto.username}`);
      throw new BadRequestException('Username already exists');
    }

    // Create new regular user (not admin)
    await this.usersService.create(registerDto.username, registerDto.password);

    // Fetch the full user object
    const user = await this.usersService.findByUsername(registerDto.username);
    if (!user) {
      throw new BadRequestException('Failed to create user');
    }

    return this.authService.login(user);
  }

  @Post('register/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async registerAdmin(@Body() registerDto: RegisterDto): Promise<LoginResponse> {
    // Check if user exists first
    const existingUser = await this.usersService.findByUsername(registerDto.username);
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    // Create new admin user
    await this.usersService.createAdmin(registerDto.username, registerDto.password);

    // Fetch the full user object
    const user = await this.usersService.findByUsername(registerDto.username);
    if (!user) {
      throw new BadRequestException('Failed to create admin user');
    }

    return this.authService.login(user);
  }

  @Post('login')
  async login(
    @Body(new ValidationPipe({ transform: true })) loginDto: LoginDto,
  ): Promise<LoginResponse> {
    const user = await this.usersService.findByUsername(loginDto.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @Post('refresh')
  async refreshTokens(@Body('refresh_token') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Body('refresh_token') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    await this.authService.logout(refreshToken);
    return { message: 'Logged out successfully' };
  }

  // Push Subscription Endpoints
  @ApiOperation({ summary: 'Get VAPID public key for push notifications' })
  @ApiResponse({ status: 200, description: 'VAPID public key retrieved successfully' })
  @Get('push/vapid-public-key')
  async getVapidPublicKey() {
    try {
      const publicKey = await this.pushService.getVapidPublicKey();
      return { publicKey };
    } catch (error) {
      this.logger.error('Failed to get VAPID public key:', error);
      throw new BadRequestException('VAPID keys not configured');
    }
  }

  @ApiOperation({ summary: 'Register push subscription' })
  @ApiResponse({ status: 201, description: 'Push subscription registered successfully' })
  @ApiBearerAuth()
  @Post('push/subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribeToPush(
    @Request() req,
    @Body()
    subscription: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    },
  ) {
    try {
      const userId = req.user._id;
      const userAgent = req.headers['user-agent'];

      const savedSubscription = await this.pushService.saveSubscription(
        userId,
        subscription,
        userAgent,
      );

      this.logger.log(`Push subscription registered for user ${userId}`);
      return {
        message: 'Push subscription registered successfully',
        subscriptionId: savedSubscription._id,
      };
    } catch (error) {
      this.logger.error('Failed to register push subscription:', error);
      throw new BadRequestException('Failed to register push subscription');
    }
  }

  @ApiOperation({ summary: 'Get user push subscriptions' })
  @ApiResponse({ status: 200, description: 'User subscriptions retrieved successfully' })
  @ApiBearerAuth()
  @Get('push/subscriptions')
  @UseGuards(JwtAuthGuard)
  async getUserSubscriptions(@Request() req) {
    try {
      const userId = req.user._id;
      const subscriptions = await this.pushService.getUserSubscriptions(userId);
      return { subscriptions };
    } catch (error) {
      this.logger.error('Failed to get user subscriptions:', error);
      throw new BadRequestException('Failed to get user subscriptions');
    }
  }

  @ApiOperation({ summary: 'Unregister push subscription' })
  @ApiResponse({ status: 200, description: 'Push subscription unregistered successfully' })
  @ApiBearerAuth()
  @Delete('push/unsubscribe/:endpoint')
  @UseGuards(JwtAuthGuard)
  async unsubscribeFromPush(@Request() req, @Param('endpoint') endpoint: string) {
    try {
      await this.pushService.removeSubscription(endpoint);
      this.logger.log(`Push subscription unregistered for user ${req.user._id}`);
      return { message: 'Push subscription unregistered successfully' };
    } catch (error) {
      this.logger.error('Failed to unregister push subscription:', error);
      throw new BadRequestException('Failed to unregister push subscription');
    }
  }

  @ApiOperation({ summary: 'Deactivate all user push subscriptions' })
  @ApiResponse({ status: 200, description: 'All push subscriptions deactivated successfully' })
  @ApiBearerAuth()
  @Delete('push/subscriptions')
  @UseGuards(JwtAuthGuard)
  async deactivateAllSubscriptions(@Request() req) {
    try {
      const userId = req.user._id;
      await this.pushService.deactivateUserSubscriptions(userId);
      this.logger.log(`All push subscriptions deactivated for user ${userId}`);
      return { message: 'All push subscriptions deactivated successfully' };
    } catch (error) {
      this.logger.error('Failed to deactivate user subscriptions:', error);
      throw new BadRequestException('Failed to deactivate user subscriptions');
    }
  }
}
