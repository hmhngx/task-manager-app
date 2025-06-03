import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../schemas/comment.schema';
import { Task, TaskDocument } from '../schemas/task.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
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

    return comment;
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

    return this.commentModel.findByIdAndUpdate(
      commentId,
      {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
      { new: true },
    );
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

    return this.commentModel.findByIdAndDelete(commentId);
  }
} 