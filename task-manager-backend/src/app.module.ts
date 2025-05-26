import { Module, DynamicModule, Type } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { getMongoConfig } from './config/database.config';
import { TasksModule } from './modules/tasks/tasks.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      useFactory: getMongoConfig,
    }),
    TasksModule,
    UsersModule,
    AuthModule,
  ] as Array<DynamicModule | Type<any>>,
})
export class AppModule {}
