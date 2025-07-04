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
    @Inject(forwardRef(() => NotificationService))
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
      parentComment: comment.parentComment?.toString(),
      mentions: comment.mentions?.map((id) => id.toString()) || [],
      attachments: comment.attachments?.map((id) => id.toString()) || [],
      isEdited: comment.isEdited || false,
      editedAt: comment.editedAt,
      createdAt: (comment as any).createdAt,
      updatedAt: (comment as any).updatedAt,
      votes: comment.votes ? Object.fromEntries(comment.votes) : {},
    };
  }

  async createComment(
    taskId: string,
    content: string,
    authorId: string,
    mentions: string[] = [],
    parentCommentId?: string,
  ) {
    console.log('[CommentsService] Creating comment:', {
      taskId,
      content,
      authorId,
      mentions,
      parentCommentId,
    });

    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // If this is a reply, verify the parent comment exists and belongs to the same task
    if (parentCommentId) {
      console.log('[CommentsService] Verifying parent comment:', parentCommentId);
      const parentComment = await this.commentModel.findById(parentCommentId);
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }
      if (parentComment.task.toString() !== taskId) {
        throw new NotFoundException('Parent comment does not belong to this task');
      }
      console.log('[CommentsService] Parent comment verified successfully');
    }

    const comment = await this.commentModel.create({
      content,
      author: authorId,
      task: taskId,
      parentComment: parentCommentId,
      mentions,
    });

    console.log('[CommentsService] Comment created:', {
      commentId: comment._id,
      parentComment: comment.parentComment,
      isReply: !!parentCommentId,
    });

    // Only add to task comments if it's a root comment (not a reply)
    if (!parentCommentId) {
      await this.taskModel.findByIdAndUpdate(taskId, {
        $push: { comments: comment._id },
      });
    }

    // Populate comment with author info for WebSocket event
    const populatedComment = await this.commentModel
      .findById(comment._id)
      .populate('author', 'username _id')
      .populate('mentions', 'username');

    // Emit WebSocket event for comment creation
    if (parentCommentId) {
      // This is a reply
      this.taskGateway.handleCommentReplied(
        this.convertCommentToCommentData(populatedComment),
        taskId,
        authorId,
        parentCommentId,
      );
    } else {
      // This is a new comment
      this.taskGateway.handleCommentAdded(
        this.convertCommentToCommentData(populatedComment),
        taskId,
        authorId,
      );
    }

    // Handle notifications based on whether this is a reply or a new comment
    if (parentCommentId) {
      console.log('[CommentsService] This is a reply, parentCommentId:', parentCommentId);

      // This is a reply - notify the parent comment's author
      const parentComment = await this.commentModel
        .findById(parentCommentId)
        .populate('author', 'username _id');
      console.log('[CommentsService] Found parent comment:', parentComment);

      if (parentComment && parentComment.author) {
        // Handle both populated and unpopulated author
        const parentAuthorId =
          typeof parentComment.author === 'object' && parentComment.author !== null
            ? (parentComment.author as any)._id.toString()
            : parentComment.author.toString();
        const parentAuthorUsername =
          typeof parentComment.author === 'object' && parentComment.author !== null
            ? (parentComment.author as any).username
            : 'Unknown User';

        // Skip if it's a self-reply
        if (parentAuthorId === authorId) {
          console.log(
            '[CommentsService] Self-reply detected, skipping notification. Parent author:',
            parentAuthorId,
            'Reply author:',
            authorId,
          );
          return populatedComment;
        }

        console.log('[CommentsService] Sending reply notification to parent comment author:', {
          parentAuthorId,
          parentAuthorUsername,
          replyAuthorId: authorId,
          taskTitle: task.title,
        });

        await this.notificationService.createAndSendNotification(parentAuthorId, {
          title: 'New Reply to Your Comment',
          message: `Someone replied to your comment on task "${task.title}"`,
          type: NotificationType.COMMENT_REPLIED,
          priority: NotificationPriority.MEDIUM,
          data: {
            taskId: task._id.toString(),
            commentId: comment._id.toString(),
            parentCommentId: parentCommentId,
            taskTitle: task.title,
          },
          timestamp: new Date(),
        });

        // Send WebSocket notification
        this.notificationGateway.sendNotificationToUser(parentAuthorId, {
          id: comment._id.toString(),
          title: 'New Reply to Your Comment',
          message: `Someone replied to your comment on task "${task.title}"`,
          type: NotificationType.COMMENT_REPLIED,
          priority: NotificationPriority.MEDIUM,
          data: {
            taskId: task._id.toString(),
            commentId: comment._id.toString(),
            parentCommentId: parentCommentId,
            taskTitle: task.title,
          },
          read: false,
          timestamp: new Date(),
        });
      } else {
        if (!parentComment) {
          console.log('[CommentsService] Parent comment not found for ID:', parentCommentId);
        } else if (!parentComment.author) {
          console.log('[CommentsService] Parent comment has no author:', parentComment);
        }
      }
    } else {
      // This is a new comment - notify task participants
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
    }

    return populatedComment;
  }

  async getTaskComments(taskId: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    console.log('[CommentsService] Getting comments for taskId:', taskId);

    // Get all comments for this task
    const allComments = await this.commentModel
      .find({ task: taskId })
      .populate('author', 'username _id')
      .populate('mentions', 'username')
      .sort({ createdAt: -1 })
      .exec();

    console.log('[CommentsService] Found comments:', allComments.length);
    console.log(
      '[CommentsService] All comments:',
      allComments.map((c) => ({
        id: c._id,
        content: c.content,
        parentComment: c.parentComment,
        author: c.author,
      })),
    );

    // Build nested structure
    const commentMap = new Map();
    const rootComments = [];

    // First pass: create a map of all comments
    allComments.forEach((comment) => {
      commentMap.set(comment._id.toString(), {
        ...comment.toObject(),
        replies: [],
      });
    });

    // Second pass: build the tree structure
    allComments.forEach((comment) => {
      const commentObj = commentMap.get(comment._id.toString());

      if (comment.parentComment) {
        // This is a reply
        console.log(
          '[CommentsService] Found reply:',
          comment._id,
          '-> parent:',
          comment.parentComment,
        );
        const parent = commentMap.get(comment.parentComment.toString());
        if (parent) {
          parent.replies.push(commentObj);
          console.log('[CommentsService] Added reply to parent:', comment.parentComment);
        } else {
          console.log('[CommentsService] Parent not found for reply:', comment.parentComment);
        }
      } else {
        // This is a root comment
        rootComments.push(commentObj);
        console.log('[CommentsService] Added root comment:', comment._id);
      }
    });

    console.log(
      '[CommentsService] Final nested structure:',
      rootComments.map((c) => ({
        id: c._id,
        content: c.content,
        repliesCount: c.replies.length,
      })),
    );

    return rootComments;
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

    // Only remove from task comments if it's a root comment (not a reply)
    if (!comment.parentComment) {
      await this.taskModel.findByIdAndUpdate(comment.task, {
        $pull: { comments: commentId },
      });
    }

    // Delete the comment and all its replies
    await this.commentModel.deleteMany({
      $or: [{ _id: commentId }, { parentComment: commentId }],
    });

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
            reason: 'admin_deletion',
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
        console.log(
          `[CommentsService] Notifying task participant about comment deletion: ${participantId}`,
        );

        try {
          await this.notificationService.createAndSendNotification(participantId, {
            title: 'Comment Deleted',
            message: `A comment was deleted from task "${task.title}"`,
            type: NotificationType.COMMENT_DELETED,
            priority: NotificationPriority.LOW,
            data: {
              taskId: task._id.toString(),
              commentId: commentId,
              deletedBy: userId,
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
              deletedBy: userId,
            },
            read: false,
            timestamp: new Date(),
          });

          console.log(
            `[CommentsService] Successfully notified participant about comment deletion: ${participantId}`,
          );
        } catch (error) {
          console.error(
            `[CommentsService] Failed to notify participant about comment deletion ${participantId}:`,
            error,
          );
        }
      }
    }

    return { message: 'Comment deleted successfully' };
  }

  async voteComment(commentId: string, userId: string, voteType: 'up' | 'down') {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Get current vote for this user
    const currentVote = comment.votes?.get(userId);

    let updateOperation: any;

    if (currentVote === voteType) {
      // User is clicking the same vote type, so remove the vote
      updateOperation = { $unset: { [`votes.${userId}`]: 1 } };
    } else {
      // User is changing vote or voting for the first time
      updateOperation = { $set: { [`votes.${userId}`]: voteType } };
    }

    const updatedComment = await this.commentModel
      .findByIdAndUpdate(commentId, updateOperation, { new: true })
      .populate('author', 'username _id')
      .populate('mentions', 'username');

    // Emit WebSocket event for comment vote
    this.taskGateway.handleCommentVoted(
      this.convertCommentToCommentData(updatedComment),
      comment.task.toString(),
      userId,
      voteType,
    );

    return updatedComment;
  }
}
