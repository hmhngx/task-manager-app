import { Controller, Post, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.model';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() body: { username: string; password: string }): Promise<User> {
    if (!body || !body.username || !body.password) {
      throw new BadRequestException('Username and password are required');
    }
    return await this.usersService.create(body.username, body.password);
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    if (!body || !body.username || !body.password) {
      throw new BadRequestException('Username and password are required');
    }
    const user: User | null = await this.authService.validateUser(body.username, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }
}
