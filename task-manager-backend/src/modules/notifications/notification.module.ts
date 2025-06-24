import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { PushSubscription, PushSubscriptionSchema } from './schemas/push-subscription.schema';
import { Task, TaskSchema } from '../tasks/schemas/task.schema';
import { NotificationService } from './services/notification.service';
import { PushService } from './services/push.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationCronService } from './services/notification-cron.service';
import { NotificationController } from './notification.controller';
import { UsersModule } from '../users/users.module';
import { TasksModule } from '../tasks/tasks.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: PushSubscription.name, schema: PushSubscriptionSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => TasksModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, PushService, NotificationGateway, NotificationCronService],
  exports: [NotificationService, PushService, NotificationGateway],
})
export class NotificationModule {}
