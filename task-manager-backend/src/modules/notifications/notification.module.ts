import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { PushSubscription, PushSubscriptionSchema } from './schemas/push-subscription.schema';
import { Task, TaskSchema } from '../tasks/schemas/task.schema';
import { NotificationService } from './services/notification.service';
import { PushService } from './services/push.service';
import { NotificationCronService } from './services/notification-cron.service';
import { NotificationController } from './notification.controller';
import { UsersModule } from '../users/users.module';
import { TasksModule } from '../tasks/tasks.module';
import { AuthModule } from '../auth/auth.module';
import { WebSocketModule } from '../websocket/websocket.module';

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
    forwardRef(() => WebSocketModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, PushService, NotificationCronService],
  exports: [NotificationService, PushService],
})
export class NotificationModule {}
