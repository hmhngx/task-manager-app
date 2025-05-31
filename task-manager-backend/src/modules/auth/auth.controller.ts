import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  UseGuards,
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
  async register(@Body() registerDto: RegisterDto): Promise<LoginResponse> {
    // Check if user exists first
    const existingUser = await this.usersService.findByUsername(registerDto.username);
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    // Create new user
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
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
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
}
