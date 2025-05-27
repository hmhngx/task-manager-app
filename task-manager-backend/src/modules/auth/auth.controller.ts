import { Controller, Post, Body, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';
import { Types } from 'mongoose';

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
  };
}

interface RegisterResponse {
  id: string;
  username: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
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
  async register(@Body() body: { username: string; password: string }): Promise<RegisterResponse> {
    if (!body || !body.username || !body.password) {
      throw new BadRequestException('Username and password are required');
    }
    const user = (await this.usersService.create(body.username, body.password)) as User;
    return {
      id: this.getIdString(user._id),
      username: user.username,
    };
  }

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }): Promise<LoginResponse> {
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const fullUser = (await this.usersService.findByUsername(loginDto.username)) as User;
    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }
    return this.authService.login(fullUser);
  }
}
