import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  NotificationType,
  NotificationPriority,
} from '../../../shared/interfaces/notification.interface';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  data?: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'Task' })
  taskId?: Types.ObjectId;

  @Prop({ required: true, enum: NotificationPriority, default: NotificationPriority.MEDIUM })
  priority: NotificationPriority;

  @Prop({ default: false })
  read: boolean;

  @Prop({ default: false })
  sent: boolean;

  @Prop()
  readAt?: Date;

  @Prop()
  sentAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes for efficient queries
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ taskId: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ sent: 1, createdAt: 1 }); // For unsent notifications

// Compound index to help prevent duplicates (userId + type + taskId + recent timestamp)
NotificationSchema.index({ 
  userId: 1, 
  type: 1, 
  taskId: 1, 
  createdAt: -1 
});
