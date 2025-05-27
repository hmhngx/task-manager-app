import { JwtModuleOptions } from '@nestjs/jwt';

export const getJwtConfig = (): JwtModuleOptions => ({
  secret: process.env.JWT_SECRET || 'c82455ac-0068-4a90-9516-6bd234b556e2',
  signOptions: { 
    expiresIn: process.env.JWT_EXPIRATION || '24h',
  },
});
