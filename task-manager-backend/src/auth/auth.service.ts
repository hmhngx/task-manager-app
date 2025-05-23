import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(
    username: string,
    password: string
  ): Promise<{ id: string; username: string } | null> {
    const user = (await this.usersService.findByUsername(username)) as User;
    if (user && user._id && (await bcrypt.compare(password, user.password))) {
      return { id: user._id.toHexString(), username: user.username };
    }
    return null;
  }

  login(user: { id: string; username: string }): { access_token: string } {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
