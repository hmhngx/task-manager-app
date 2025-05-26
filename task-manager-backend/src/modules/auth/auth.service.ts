import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<{ id: string; username: string } | null> {
    try {
      const user = await this.usersService.findByUsername(username);
      if (!user || !user._id) {
        return null;
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return null;
      }
      return { id: user._id.toHexString(), username: user.username };
    } catch {
      return null;
    }
  }

  login(user: { id: string; username: string }): { access_token: string } {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
