import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.schema';
import { Types } from 'mongoose';
import { UserRole } from '../users/user.schema';

export interface UserResponse {
  id: string;
  username: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  user: UserResponse;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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

  async validateUser(username: string, password: string): Promise<UserResponse | null> {
    this.logger.log(`Validating user: ${username}`);
    try {
      const user = await this.usersService.findByUsername(username);
      if (!user) {
        this.logger.warn(`User not found: ${username}`);
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user: ${username}`);
        return null;
      }

      this.logger.log(`User validated successfully: ${username}`);
      return {
        id: this.getIdString(user._id),
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
    this.logger.log(`Generating token for user: ${user.username}`);
    try {
      const payload = {
        username: user.username,
        sub: this.getIdString(user._id),
        role: user.role,
      };
      const token = await this.jwtService.signAsync(payload);
      this.logger.log(`Token generated successfully for user: ${user.username}`);
      return {
        access_token: token,
        user: {
          id: this.getIdString(user._id),
          username: user.username,
          role: user.role,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error generating token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new UnauthorizedException('Error generating token');
    }
  }
}
