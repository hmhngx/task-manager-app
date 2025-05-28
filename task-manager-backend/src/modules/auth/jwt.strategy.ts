import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { Types } from 'mongoose';
import { UserRole } from '../users/user.schema';

interface JwtPayload {
  sub: string;
  username: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private usersService: UsersService) {
    const secret = process.env.JWT_SECRET || 'c82455ac-0068-4a90-9516-6bd234b556e2';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
    this.logger.log(`JWT Strategy initialized with secret: ${secret.substring(0, 5)}...`);
  }

  private getIdString(id: any): string {
    if (id instanceof Types.ObjectId) {
      return id.toHexString();
    }
    if (typeof id === 'string') {
      return id;
    }
    return String(id);
  }

  async validate(payload: JwtPayload): Promise<{ id: string; username: string; role: UserRole }> {
    this.logger.log(`Validating JWT payload: ${JSON.stringify(payload)}`);
    try {
      if (!Types.ObjectId.isValid(payload.sub)) {
        this.logger.error(`Invalid user ID format: ${payload.sub}`);
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        this.logger.error(`No user found with id: ${payload.sub}`);
        throw new UnauthorizedException('No user found');
      }

      // Verify that the username in the token matches the user
      if (user.username !== payload.username) {
        this.logger.error(`Username mismatch: token=${payload.username}, user=${user.username}`);
        throw new UnauthorizedException('Invalid token');
      }

      this.logger.log(`Successfully validated user: ${user.username}`);
      return {
        id: this.getIdString(user._id),
        username: user.username,
        role: payload.role,
      };
    } catch (error) {
      this.logger.error(
        `Error validating JWT payload: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new UnauthorizedException('Invalid token');
    }
  }
}
