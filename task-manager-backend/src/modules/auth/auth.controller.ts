import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.schema';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../users/user.schema';

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

interface RegisterResponse {
  id: string;
  username: string;
}

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
  async register(
    @Body() registerDto: { username: string; password: string },
  ): Promise<LoginResponse> {
    const user = await this.usersService.create(registerDto.username, registerDto.password);
    const fullUser = await this.usersService.findByUsername(user.username);
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }
    return this.authService.login(fullUser);
  }

  @Post('register/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async registerAdmin(
    @Body() registerDto: { username: string; password: string },
  ): Promise<LoginResponse> {
    const user = await this.usersService.createAdmin(registerDto.username, registerDto.password);
    const fullUser = await this.usersService.findByUsername(user.username);
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }
    return this.authService.login(fullUser);
  }

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }): Promise<LoginResponse> {
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
