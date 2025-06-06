import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { User, UserSchema } from '../users/user.schema';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'c82455ac-0068-4a90-9516-6bd234b556e2',
      signOptions: { expiresIn: '1h' },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {
  private readonly logger = new Logger(AuthModule.name);

  constructor() {
    this.logger.log(
      `JWT Module initialized with secret: ${process.env.JWT_SECRET?.substring(0, 5) || 'default'}...`,
    );
  }
}
