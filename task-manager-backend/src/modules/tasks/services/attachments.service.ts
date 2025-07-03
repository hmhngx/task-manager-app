import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attachment, AttachmentDocument } from '../schemas/attachment.schema';
import { Task, TaskDocument } from '../schemas/task.schema';
import { Comment, CommentDocument } from '../schemas/comment.schema';
import { NotificationService } from '../../notifications/services/notification.service';
import {
  NotificationType,
  NotificationPriority,
} from '../../../shared/interfaces/notification.interface';
import { TaskGateway } from '../../websocket/gateways/task.gateway';
import * as sharp from 'sharp';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectModel(Attachment.name) private attachmentModel: Model<AttachmentDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
    @Inject(forwardRef(() => TaskGateway))
    private taskGateway: TaskGateway,
  ) {}

  async createAttachment(
    file: Express.Multer.File,
    uploadedBy: string,
    taskId?: string,
    commentId?: string,
  ) {
    console.log(`[AttachmentsService] Starting attachment creation`, {
      fileName: file.originalname,
      fileSize: file.size,
      uploadedBy,
      taskId,
      commentId,
    });

    if (!taskId && !commentId) {
      throw new BadRequestException('Either taskId or commentId must be provided');
    }

    try {
      if (!file.buffer) {
        throw new BadRequestException('File buffer is missing. Check upload configuration.');
      }
      // Process image if it's an image file
      let processedData = file.buffer;
      let width: number | undefined;
      let height: number | undefined;
      let thumbnail: string | undefined;

      if (file.mimetype.startsWith('image/')) {
        const image = sharp(file.buffer);
        const metadata = await image.metadata();
        width = metadata.width;
        height = metadata.height;

        // Create thumbnail for images
        const thumbnailBuffer = await image
          .resize(200, 200, { fit: 'inside' })
          .jpeg({ quality: 80 })
          .toBuffer();
        thumbnail = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;

        // Optimize main image
        processedData = await image.jpeg({ quality: 85 }).toBuffer();
      }

      const attachment = await this.attachmentModel.create({
        filename: `${Date.now()}-${file.originalname}`,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: processedData.length,
        data: processedData,
        width,
        height,
        thumbnail,
        uploadedBy: new Types.ObjectId(uploadedBy),
        task: taskId ? new Types.ObjectId(taskId) : undefined,
        comment: commentId ? new Types.ObjectId(commentId) : undefined,
      });

      console.log(`[AttachmentsService] Attachment created successfully`, {
        attachmentId: attachment._id,
        fileName: attachment.originalName,
        taskId,
        commentId,
      });

      if (taskId) {
        await this.taskModel.findByIdAndUpdate(taskId, {
          $push: { attachments: attachment._id },
        });
        console.log(`[AttachmentsService] Task updated with attachment reference`);
      }

      if (commentId) {
        await this.commentModel.findByIdAndUpdate(commentId, {
          $push: { attachments: attachment._id },
        });
        console.log(`[AttachmentsService] Comment updated with attachment reference`);
      }

      // Return attachment without binary data
      const { data: _unused, ...attachmentWithoutData } = attachment.toObject();
      const result = {
        ...attachmentWithoutData,
        url: `/api/tasks/attachments/${attachment._id.toString()}`,
      };

      // Notify all users about the attachment upload
      if (taskId) {
        console.log(`[AttachmentsService] Starting notification process for upload`, {
          taskId,
          fileName: attachment.originalName,
          uploadedBy,
        });
        
        await this.notifyAllUsersAboutAttachment(
          taskId,
          'uploaded',
          attachment.originalName,
          uploadedBy,
        );
        
        console.log(`[AttachmentsService] Notification process completed for upload`);
        
        // Emit WebSocket event
        console.log(`[AttachmentsService] Emitting WebSocket event for attachment upload`);
        this.taskGateway.handleAttachmentUploaded(result, taskId, uploadedBy);
        console.log(`[AttachmentsService] WebSocket event emitted successfully`);
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        console.error('[AttachmentService] Error in createAttachment:', error.message, error.stack);
      } else {
        console.error('[AttachmentService] Unknown error in createAttachment:', error);
      }
      throw error;
    }
  }

  async getTaskAttachments(taskId: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const attachments = await this.attachmentModel
      .find({ task: taskId })
      .select('-data') // Exclude binary data
      .populate('uploadedBy', 'username')
      .exec();

    return attachments.map((attachment) => ({
      ...attachment.toObject(),
      url: `/api/tasks/attachments/${attachment._id.toString()}`,
    }));
  }

  async getCommentAttachments(commentId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const attachments = await this.attachmentModel
      .find({ comment: commentId })
      .select('-data') // Exclude binary data
      .populate('uploadedBy', 'username')
      .exec();

    return attachments.map((attachment) => ({
      ...attachment.toObject(),
      url: `/api/tasks/attachments/${attachment._id.toString()}`,
    }));
  }

  async getAttachmentData(attachmentId: string) {
    try {
      const attachment = await this.attachmentModel.findById(attachmentId);
      if (!attachment) {
        throw new NotFoundException('Attachment not found');
      }
      console.log(`[AttachmentsService] Attachment downloaded`, { attachmentId });
      return {
        data: attachment.data,
        mimeType: attachment.mimeType,
      };
    } catch (error) {
      console.error('[AttachmentsService] Error in getAttachmentData:', error);
      throw error;
    }
  }

  async deleteAttachment(attachmentId: string, userId: string, userRole?: string) {
    console.log(`[AttachmentsService] Starting attachment deletion - DETAILED LOG`);
    console.log(`[AttachmentsService] Attachment ID: ${attachmentId}`);
    console.log(`[AttachmentsService] User ID: ${userId}`);
    console.log(`[AttachmentsService] User role: ${userRole}`);
    console.log(`[AttachmentsService] User role type: ${typeof userRole}`);
    console.log(`[AttachmentsService] User role === 'admin': ${userRole === 'admin'}`);

    try {
      const attachment = await this.attachmentModel.findById(attachmentId);
      if (!attachment) {
        console.log(`[AttachmentsService] Attachment not found for ID: ${attachmentId}`);
        throw new NotFoundException('Attachment not found');
      }
      
      console.log(`[AttachmentsService] Found attachment to delete`);
      console.log(`[AttachmentsService] Attachment details:`, {
        attachmentId: attachment._id,
        fileName: attachment.originalName,
        taskId: attachment.task,
        uploadedBy: attachment.uploadedBy,
        uploadedByType: typeof attachment.uploadedBy,
        uploadedByString: attachment.uploadedBy?.toString(),
      });
      
      // Allow admins to delete any attachment, regular users can only delete their own
      console.log(`[AttachmentsService] Authorization check:`);
      console.log(`[AttachmentsService] - userRole !== 'admin': ${userRole !== 'admin'}`);
      console.log(`[AttachmentsService] - attachment.uploadedBy.toString() !== userId: ${attachment.uploadedBy?.toString() !== userId}`);
      console.log(`[AttachmentsService] - userId: ${userId}`);
      console.log(`[AttachmentsService] - attachment.uploadedBy: ${attachment.uploadedBy}`);
      console.log(`[AttachmentsService] - attachment.uploadedBy.toString(): ${attachment.uploadedBy?.toString()}`);
      
      if (userRole !== 'admin' && attachment.uploadedBy?.toString() !== userId) {
        console.log(`[AttachmentsService] AUTHORIZATION FAILED - throwing BadRequestException`);
        console.log(`[AttachmentsService] - userRole: ${userRole}`);
        console.log(`[AttachmentsService] - userId: ${userId}`);
        console.log(`[AttachmentsService] - uploadedBy: ${attachment.uploadedBy}`);
        throw new BadRequestException('Not authorized to delete this attachment');
      }
      
      console.log(`[AttachmentsService] AUTHORIZATION PASSED - proceeding with deletion`);
      
      // Remove attachment references
      if (attachment.task) {
        await this.taskModel.findByIdAndUpdate(attachment.task, {
          $pull: { attachments: attachmentId },
        });
        console.log(`[AttachmentsService] Removed attachment reference from task`);
      }
      if (attachment.comment) {
        await this.commentModel.findByIdAndUpdate(attachment.comment, {
          $pull: { attachments: attachmentId },
        });
        console.log(`[AttachmentsService] Removed attachment reference from comment`);
      }
      
      // Notify all users about the attachment deletion
      if (attachment.task) {
        console.log(`[AttachmentsService] Starting notification process for deletion`, {
          taskId: attachment.task.toString(),
          fileName: attachment.originalName,
          userId,
        });
        
        console.log(`[AttachmentsService] Starting notification process for deletion`);
        try {
          await this.notifyAllUsersAboutAttachment(
            attachment.task.toString(),
            'deleted',
            attachment.originalName,
            userId,
          );
          console.log(`[AttachmentsService] Notification process completed for deletion`);
        } catch (notificationError) {
          console.error(`[AttachmentsService] Notification process failed:`, notificationError);
          console.error(`[AttachmentsService] But continuing with attachment deletion...`);
        }
        
        // Emit WebSocket event
        console.log(`[AttachmentsService] Starting WebSocket event emission for deletion`);
        try {
          this.taskGateway.handleAttachmentDeleted(
            attachmentId,
            attachment.task.toString(),
            userId,
            attachment.originalName,
          );
          console.log(`[AttachmentsService] WebSocket event emitted successfully for deletion`);
        } catch (websocketError) {
          console.error(`[AttachmentsService] WebSocket event emission failed:`, websocketError);
          console.error(`[AttachmentsService] But continuing with attachment deletion...`);
        }
      }

      console.log(`[AttachmentsService] About to delete attachment from database`);
      const deletedAttachment = await this.attachmentModel.findByIdAndDelete(attachmentId);
      console.log(`[AttachmentsService] Attachment deleted from database successfully`);
      console.log(`[AttachmentsService] Deleted attachment:`, deletedAttachment);
      console.log(`[AttachmentsService] Attachment deletion completed successfully`);
      return deletedAttachment;
    } catch (error) {
      console.error('[AttachmentsService] Error in deleteAttachment:', error);
      console.error('[AttachmentsService] Error type:', typeof error);
      console.error('[AttachmentsService] Error constructor:', error?.constructor?.name);
      if (error instanceof Error) {
        console.error('[AttachmentsService] Error message:', error.message);
        console.error('[AttachmentsService] Error stack:', error.stack);
      }
      throw error;
    }
  }

  async getAttachmentForDownload(attachmentId: string) {
    try {
      const attachment = await this.attachmentModel.findById(attachmentId);
      if (!attachment) {
        throw new NotFoundException('Attachment not found');
      }
      return {
        data: attachment.data,
        mimeType: attachment.mimeType,
        originalName: attachment.originalName,
      };
    } catch (error) {
      console.error('[AttachmentsService] Error in getAttachmentForDownload:', error);
      throw error;
    }
  }

  private async notifyAllUsersAboutAttachment(
    taskId: string,
    action: 'uploaded' | 'deleted',
    fileName: string,
    userId: string,
  ) {
    try {
      console.log(`[AttachmentsService] Starting notification process for attachment ${action}`, {
        taskId,
        fileName,
        userId,
        action
      });

      // Get the task to include task title in notification
      const task = await this.taskModel.findById(taskId).select('title');
      if (!task) {
        console.log(`[AttachmentsService] Task not found for ID: ${taskId}`);
        return;
      }

      // Get task with all participants (creator, assignee, and watchers)
      const taskWithParticipants = await this.taskModel.findById(taskId)
        .populate('assignee', 'username _id')
        .populate('creator', 'username _id')
        .populate('watchers', 'username _id');

      const participants = new Set<string>();
      
      // Add task creator
      if (taskWithParticipants.creator) {
        const creatorId = taskWithParticipants.creator._id.toString();
        participants.add(creatorId);
        console.log(`[AttachmentsService] Added creator to participants: ${creatorId}`);
      }
      
      // Add assigned users
      if (taskWithParticipants.assignee) {
        if (Array.isArray(taskWithParticipants.assignee)) {
          taskWithParticipants.assignee.forEach((user: any) => {
            const assigneeId = user._id.toString();
            participants.add(assigneeId);
            console.log(`[AttachmentsService] Added assignee to participants: ${assigneeId}`);
          });
        } else {
          const assigneeId = taskWithParticipants.assignee._id.toString();
          participants.add(assigneeId);
          console.log(`[AttachmentsService] Added assignee to participants: ${assigneeId}`);
        }
      }

      // Add watchers
      if (taskWithParticipants.watchers && Array.isArray(taskWithParticipants.watchers)) {
        taskWithParticipants.watchers.forEach((watcher: any) => {
          const watcherId = watcher._id.toString();
          participants.add(watcherId);
          console.log(`[AttachmentsService] Added watcher to participants: ${watcherId}`);
        });
      }

      const actionText = action === 'uploaded' ? 'uploaded' : 'deleted';
      const notificationType = action === 'uploaded' ? NotificationType.ATTACHMENT_UPLOADED : NotificationType.ATTACHMENT_DELETED;

      console.log(`[AttachmentsService] Total participants found: ${participants.size}`, {
        participants: Array.from(participants),
        actionText,
        notificationType
      });

      // Create notifications for all participants
      for (const participantId of participants) {
        if (participantId !== userId) { // Don't notify the user who performed the action
          console.log(`[AttachmentsService] Creating notification for participant: ${participantId}`);
          
          try {
            await this.notificationService.createAndSendNotification(
              participantId,
              {
                type: notificationType,
                title: `Attachment ${actionText}`,
                message: `A file "${fileName}" was ${actionText} to task "${task.title}"`,
                data: {
                  taskId,
                  fileName,
                  action,
                  userId,
                },
                timestamp: new Date(),
                priority: NotificationPriority.MEDIUM,
              },
            );
            console.log(`[AttachmentsService] Successfully created notification for participant: ${participantId}`);
          } catch (error) {
            console.error(`[AttachmentsService] Failed to create notification for participant ${participantId}:`, error);
          }
        } else {
          console.log(`[AttachmentsService] Skipping notification for user who performed action: ${participantId}`);
        }
      }

      console.log(`[AttachmentsService] Notification process completed for attachment ${action}`);
    } catch (error) {
      console.error('[AttachmentsService] Error notifying users about attachment:', error);
    }
  }
}
