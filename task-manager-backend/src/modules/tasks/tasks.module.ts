import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task, TaskSchema } from './schemas/task.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { Attachment, AttachmentSchema } from './schemas/attachment.schema';
import { Workflow, WorkflowSchema } from './schemas/workflow.schema';
import { CommentsService } from './services/comments.service';
import { AttachmentsService } from './services/attachments.service';
import { WorkflowsService } from './services/workflows.service';
import { NotificationsService } from './services/notifications.service';
import { WebSocketModule } from '../websocket/websocket.module';
import { UsersModule } from '../users/users.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Attachment.name, schema: AttachmentSchema },
      { name: Workflow.name, schema: WorkflowSchema },
    ]),
    forwardRef(() => WebSocketModule),
    forwardRef(() => UsersModule),
    forwardRef(() => NotificationModule),
  ],
  controllers: [TasksController],
  providers: [
    TasksService,
    CommentsService,
    AttachmentsService,
    WorkflowsService,
    NotificationsService,
  ],
  exports: [
    TasksService,
    CommentsService,
    AttachmentsService,
    WorkflowsService,
    NotificationsService,
  ],
})
export class TasksModule {}
