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
      .populate('author', 'username')
      .populate('mentions', 'username');

    // Emit WebSocket event for comment creation
    await this.taskGateway.handleCommentAdded(populatedComment, taskId, authorId);

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
      .populate('author', 'username')
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
      .populate('author', 'username')
      .populate('mentions', 'username');

    // Emit WebSocket event for comment edit
    await this.taskGateway.handleCommentEdited(updatedComment, comment.task.toString(), userId);

    return updatedComment;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.toString() !== userId) {
      throw new Error('Not authorized to delete this comment');
    }

    await this.taskModel.findByIdAndUpdate(comment.task, {
      $pull: { comments: commentId },
    });

    await this.commentModel.findByIdAndDelete(commentId);

    // Emit WebSocket event for comment deletion
    await this.taskGateway.handleCommentDeleted(commentId, comment.task.toString(), userId);

    return { message: 'Comment deleted successfully' };
  }
} 