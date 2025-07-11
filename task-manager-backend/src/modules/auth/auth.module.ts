import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailService } from './services/email.service';
import { UsersModule } from '../users/users.module';
import { NotificationModule } from '../notifications/notification.module';
import { JwtStrategy } from './jwt.strategy';
import { User, UserSchema } from '../users/user.schema';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';

@Module({
  imports: [
    UsersModule,
    NotificationModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'c82455ac-0068-4a90-9516-6bd234b556e2',
      signOptions: { expiresIn: '1h' },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST', 'smtp.gmail.com'),
          port: configService.get('SMTP_PORT', 587),
          secure: false, // true for 465, false for other ports
          auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASS'),
          },
        },
        defaults: {
          from: `"TaskFlow" <${configService.get('SMTP_USER')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, EmailService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, EmailService],
})
export class AuthModule {
  private readonly logger = new Logger(AuthModule.name);

  constructor() {
    this.logger.log(
      `JWT Module initialized with secret: ${process.env.JWT_SECRET?.substring(0, 5) || 'default'}...`,
    );
  }
}
