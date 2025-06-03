import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Attachment.name, schema: AttachmentSchema },
      { name: Workflow.name, schema: WorkflowSchema },
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService, CommentsService, AttachmentsService, WorkflowsService],
  exports: [TasksService, CommentsService, AttachmentsService, WorkflowsService],
})
export class TasksModule {}
