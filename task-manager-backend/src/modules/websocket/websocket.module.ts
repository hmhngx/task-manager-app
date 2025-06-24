import { Module, forwardRef } from '@nestjs/common';
import { TaskGateway } from './gateways/task.gateway';
import { NotificationGateway } from './gateways/notification.gateway';
import { AdminGateway } from './gateways/admin.gateway';
import { WebSocketService } from './services/websocket.service';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    forwardRef(() => TasksModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationModule),
  ],
  providers: [TaskGateway, NotificationGateway, AdminGateway, WebSocketService],
  exports: [WebSocketService, TaskGateway, NotificationGateway, AdminGateway],
})
export class WebSocketModule {}
