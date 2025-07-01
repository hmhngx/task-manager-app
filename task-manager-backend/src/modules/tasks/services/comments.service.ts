import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../schemas/comment.schema';
import { Task, TaskDocument } from '../schemas/task.schema';
import { TaskGateway } from '../../websocket/gateways/task.gateway';
import { NotificationService } from '../../notifications/services/notification.service';
import { NotificationGateway } from '../../websocket/gateways/notification.gateway';
import {
  NotificationType,
  NotificationPriority,
} from '../../../shared/interfaces/notification.interface';
import { CommentData } from '../../../shared/interfaces/websocket.interface';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @Inject(forwardRef(() => TaskGateway))
    private taskGateway: TaskGateway,
    private notificationService: NotificationService,
    @Inject(forwardRef(() => NotificationGateway))
    private notificationGateway: NotificationGateway,
  ) {}

  /**
   * Convert MongoDB Comment document to CommentData interface
   */
  private convertCommentToCommentData(comment: CommentDocument): CommentData {
    return {
      _id: comment._id.toString(),
      content: comment.content,
      author: comment.author.toString(),
      task: comment.task.toString(),
      mentions: comment.mentions?.map((id) => id.toString()) || [],
      attachments: comment.attachments?.map((id) => id.toString()) || [],
      isEdited: comment.isEdited || false,
      editedAt: comment.editedAt,
      createdAt: (comment as any).createdAt as Date,
      updatedAt: (comment as any).updatedAt as Date,
    };
  }

  async createComment(taskId: string, content: string, authorId: string, mentions: string[] = []) {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const comment = await this.commentModel.create({
      content,
      author: authorId,
      task: taskId,
      mentions,
    });

    await this.taskModel.findByIdAndUpdate(taskId, {
      $push: { comments: comment._id },
    });

    // Populate comment with author info for WebSocket event
    const populatedComment = await this.commentModel
      .findById(comment._id)
      .populate('author', 'username _id')
      .populate('mentions', 'username');

    // Emit WebSocket event for comment creation
    this.taskGateway.handleCommentAdded(
      this.convertCommentToCommentData(populatedComment),
      taskId,
      authorId,
    );

    // Notify task participants about the comment
    const participantIds = [
      task.assignee?.toString(),
      task.creator?.toString(),
      ...(task.watchers || []).map((w) => w.toString()),
    ].filter(Boolean);

    for (const participantId of participantIds) {
      if (participantId !== authorId) {
        await this.notificationService.createAndSendNotification(participantId, {
          title: 'New Comment Added',
          message: `A new comment was added to task "${task.title}"`,
          type: NotificationType.COMMENT_ADDED,
          priority: NotificationPriority.LOW,
          data: { taskId: task._id.toString(), commentId: comment._id.toString() },
          timestamp: new Date(),
        });

        // Send WebSocket notification
        this.notificationGateway.sendNotificationToUser(participantId, {
          id: comment._id.toString(),
          title: 'New Comment Added',
          message: `A new comment was added to task "${task.title}"`,
          type: NotificationType.COMMENT_ADDED,
          priority: NotificationPriority.LOW,
          data: { taskId: task._id.toString(), commentId: comment._id.toString() },
          read: false,
          timestamp: new Date(),
        });
      }
    }

    return populatedComment;
  }

  async getTaskComments(taskId: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.commentModel
      .find({ task: taskId })
      .populate('author', 'username _id')
      .populate('mentions', 'username')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateComment(commentId: string, content: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.toString() !== userId) {
      throw new Error('Not authorized to edit this comment');
    }

    const updatedComment = await this.commentModel
      .findByIdAndUpdate(
        commentId,
        {
          content,
          isEdited: true,
          editedAt: new Date(),
        },
        { new: true },
      )
      .populate('author', 'username _id')
      .populate('mentions', 'username');

    // Emit WebSocket event for comment edit
    this.taskGateway.handleCommentEdited(
      this.convertCommentToCommentData(updatedComment),
      comment.task.toString(),
      userId,
    );

    return updatedComment;
  }

  async deleteComment(commentId: string, userId: string, userRole?: string) {
    console.log(`[CommentsService] Attempting to delete comment:`, {
      commentId,
      userId,
      userRole,
    });

    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    console.log(`[CommentsService] Comment found:`, {
      commentId: comment._id,
      authorId: comment.author.toString(),
      userId,
      userRole,
      isAuthor: comment.author.toString() === userId,
      isAdmin: userRole === 'admin',
    });

    // Allow deletion if user is the author OR if user is admin
    if (comment.author.toString() !== userId && userRole !== 'admin') {
      console.log(
        `[CommentsService] Authorization failed: User ${userId} cannot delete comment by ${comment.author.toString()}`,
      );
      throw new Error('Not authorized to delete this comment');
    }

    console.log(`[CommentsService] Authorization successful, proceeding with deletion`);

    // Get task details for notifications
    const task = await this.taskModel.findById(comment.task);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Store comment author ID before deletion
    const commentAuthorId = comment.author.toString();
    const isAdminDeletion = userRole === 'admin' && commentAuthorId !== userId;

    await this.taskModel.findByIdAndUpdate(comment.task, {
      $pull: { comments: commentId },
    });

    await this.commentModel.findByIdAndDelete(commentId);

    // Emit WebSocket event for comment deletion
    this.taskGateway.handleCommentDeleted(commentId, comment.task.toString(), userId);

    // Notify comment author if their comment was deleted by admin
    if (isAdminDeletion) {
      console.log(
        `[CommentsService] Notifying comment author about admin deletion: ${commentAuthorId}`,
      );

      try {
        await this.notificationService.createAndSendNotification(commentAuthorId, {
          title: 'Comment Deleted by Admin',
          message: `Your comment on task "${task.title}" was deleted by an administrator`,
          type: NotificationType.COMMENT_DELETED,
          priority: NotificationPriority.MEDIUM,
          data: {
            taskId: task._id.toString(),
            commentId: commentId,
            deletedBy: userId,
            reason: 'admin_deletion',
          },
          timestamp: new Date(),
        });

        // Send WebSocket notification
        this.notificationGateway.sendNotificationToUser(commentAuthorId, {
          id: commentId,
          title: 'Comment Deleted by Admin',
          message: `Your comment on task "${task.title}" was deleted by an administrator`,
          type: NotificationType.COMMENT_DELETED,
          priority: NotificationPriority.MEDIUM,
          data: { 
            taskId: task._id.toString(), 
            commentId: commentId,
            deletedBy: userId,
            reason: 'admin_deletion'
          },
          read: false,
          timestamp: new Date(),
        });

        console.log(`[CommentsService] Successfully notified comment author about deletion`);
      } catch (error) {
        console.error(`[CommentsService] Failed to notify comment author about deletion:`, error);
      }
    }

    // Notify task participants about the comment deletion (excluding the deleter)
    const participantIds = [
      task.assignee?.toString(),
      task.creator?.toString(),
      ...(task.watchers || []).map((w) => w.toString()),
    ].filter(Boolean);

    for (const participantId of participantIds) {
      if (participantId !== userId && participantId !== commentAuthorId) {
        console.log(`[CommentsService] Notifying task participant about comment deletion: ${participantId}`);
        
        try {
          await this.notificationService.createAndSendNotification(participantId, {
            title: 'Comment Deleted',
            message: `A comment was deleted from task "${task.title}"`,
            type: NotificationType.COMMENT_DELETED,
            priority: NotificationPriority.LOW,
            data: { 
              taskId: task._id.toString(), 
              commentId: commentId,
              deletedBy: userId
            },
            timestamp: new Date(),
          });

          // Send WebSocket notification
          this.notificationGateway.sendNotificationToUser(participantId, {
            id: commentId,
            title: 'Comment Deleted',
            message: `A comment was deleted from task "${task.title}"`,
            type: NotificationType.COMMENT_DELETED,
            priority: NotificationPriority.LOW,
            data: { 
              taskId: task._id.toString(), 
              commentId: commentId,
              deletedBy: userId
            },
            read: false,
            timestamp: new Date(),
          });

          console.log(`[CommentsService] Successfully notified participant about comment deletion: ${participantId}`);
        } catch (error) {
          console.error(`[CommentsService] Failed to notify participant about comment deletion ${participantId}:`, error);
        }
      }
    }

    return { message: 'Comment deleted successfully' };
  }
}
