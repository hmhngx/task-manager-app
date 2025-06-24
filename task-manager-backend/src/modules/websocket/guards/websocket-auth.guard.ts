import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UsersService } from '../../users/users.service';

@Injectable()
export class WebSocketAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractTokenFromHeader(client);

      if (!token) {
        throw new WsException('Unauthorized access');
      }

      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new WsException('User not found');
      }

      // Attach user to socket for later use
      (client as any).data = {
        user: {
          _id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        },
      };
      return true;
    } catch {
      throw new WsException('Unauthorized access');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const auth =
      (client.handshake.auth as any).token || (client.handshake.headers as any).authorization;
    if (!auth) return undefined;

    const [type, token] = auth.split(' ');
    return type === 'Bearer' ? token : auth;
  }
}
