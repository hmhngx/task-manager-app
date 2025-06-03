import { Injectable, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserRole } from '../../users/user.schema';

interface JwtUser {
  id: string;
  username: string;
  role: UserRole;
}

interface RequestWithAuth extends Request {
  headers: {
    authorization?: string;
  };
  user?: JwtUser;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    this.logger.log('JWT Auth Guard activated');
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    this.logger.log(`Request path: ${request.path}`);
    this.logger.log(`Auth header: ${request.headers.authorization?.substring(0, 20)}...`);
    return super.canActivate(context);
  }

  handleRequest<TUser = JwtUser>(err: Error | null, user: TUser | null): TUser {
    if (err) {
      this.logger.error(`JWT Auth Guard error: ${err.message}`);
      throw new UnauthorizedException(err.message);
    }
    if (!user) {
      this.logger.error('JWT Auth Guard: No user found');
      throw new UnauthorizedException('Invalid token or user not found');
    }

    // Transform the user object to include userId and role
    const transformedUser = {
      ...user,
      id: (user as JwtUser).id,
      role: (user as JwtUser).role,
    };

    this.logger.log(`JWT Auth Guard validated user: ${(user as JwtUser).username}`);
    return transformedUser as TUser;
  }
}
