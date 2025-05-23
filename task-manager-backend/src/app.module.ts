import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/task-manager'), // Replace with MongoDB Atlas URI
    TasksModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
