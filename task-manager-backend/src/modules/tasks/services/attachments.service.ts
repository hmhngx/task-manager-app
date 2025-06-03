import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attachment, AttachmentDocument } from '../schemas/attachment.schema';
import { Task, TaskDocument } from '../schemas/task.schema';
import { Comment, CommentDocument } from '../schemas/comment.schema';
import * as sharp from 'sharp';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectModel(Attachment.name) private attachmentModel: Model<AttachmentDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async createAttachment(
    file: Express.Multer.File,
    uploadedBy: string,
    taskId?: string,
    commentId?: string,
  ) {
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
        processedData = await image
          .jpeg({ quality: 85 })
          .toBuffer();
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

      if (taskId) {
        await this.taskModel.findByIdAndUpdate(taskId, {
          $push: { attachments: attachment._id },
        });
      }

      if (commentId) {
        await this.commentModel.findByIdAndUpdate(commentId, {
          $push: { attachments: attachment._id },
        });
      }

      // Return attachment without binary data
      const { data, ...attachmentWithoutData } = attachment.toObject();
      return {
        ...attachmentWithoutData,
        url: `/api/tasks/attachments/${attachment._id}`,
      };
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

    return attachments.map(attachment => ({
      ...attachment.toObject(),
      url: `/api/tasks/attachments/${attachment._id}`,
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

    return attachments.map(attachment => ({
      ...attachment.toObject(),
      url: `/api/tasks/attachments/${attachment._id}`,
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

  async deleteAttachment(attachmentId: string, userId: string) {
    try {
      const attachment = await this.attachmentModel.findById(attachmentId);
      if (!attachment) {
        throw new NotFoundException('Attachment not found');
      }
      if (attachment.uploadedBy.toString() !== userId) {
        throw new BadRequestException('Not authorized to delete this attachment');
      }
      // Remove attachment references
      if (attachment.task) {
        await this.taskModel.findByIdAndUpdate(attachment.task, {
          $pull: { attachments: attachmentId },
        });
      }
      if (attachment.comment) {
        await this.commentModel.findByIdAndUpdate(attachment.comment, {
          $pull: { attachments: attachmentId },
        });
      }
      console.log(`[AttachmentsService] Attachment deleted`, { attachmentId, userId });
      return this.attachmentModel.findByIdAndDelete(attachmentId);
    } catch (error) {
      console.error('[AttachmentsService] Error in deleteAttachment:', error);
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
} 