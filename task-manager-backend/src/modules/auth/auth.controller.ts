import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  UseGuards,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService, LoginResponse } from './auth.service';
import { UsersService } from '../users/users.service';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
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
  async login(@Body(new ValidationPipe({ transform: true })) loginDto: LoginDto): Promise<LoginResponse> {
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
}
