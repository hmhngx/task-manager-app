import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';
import { NotificationPayload } from '../../../shared/interfaces/notification.interface';
import { PushService } from './push.service';
import { NotificationGateway } from '../../websocket/gateways/notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private pushService: PushService,
    @Inject(forwardRef(() => NotificationGateway))
    private notificationGateway: NotificationGateway,
  ) {}

  async createAndSendNotification(
    userId: string,
    payload: Omit<NotificationPayload, 'id' | 'read'>,
    sendPush = true,
  ): Promise<NotificationDocument> {
    this.logger.log(`Creating notification for user ${userId}: ${payload.title}`);
    this.logger.log(`Notification payload: ${JSON.stringify(payload)}`);

    // Extract taskId from data if present
    const taskId = payload.data?.taskId as string | undefined;

    // Check for recent duplicate notifications (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingNotification = await this.notificationModel.findOne({
      userId: new Types.ObjectId(userId),
      type: payload.type,
      taskId: taskId ? new Types.ObjectId(taskId) : undefined,
      createdAt: { $gte: fiveMinutesAgo },
    });

    if (existingNotification) {
      this.logger.log(
        `Duplicate notification found for user ${userId}, type ${payload.type}, task ${taskId}. Skipping creation.`,
      );
      return existingNotification;
    }

    const notification = new this.notificationModel({
      ...payload,
      userId: new Types.ObjectId(userId),
      taskId: taskId ? new Types.ObjectId(taskId) : undefined,
      commentId: payload.data?.commentId as string | undefined,
      attachmentId: payload.data?.attachmentId as string | undefined,
      read: false,
    });
    await notification.save();

    this.logger.log(
      `Notification saved to database with ID: ${(notification._id as Types.ObjectId).toString()}`,
    );

    // Create notification payload for WebSocket
    const notificationPayload: NotificationPayload = {
      ...payload,
      id: (notification._id as Types.ObjectId).toString(),
      read: false,
      userId: userId,
      taskId: taskId,
      timestamp: payload.timestamp || new Date(),
    };

    this.logger.log(`Prepared WebSocket payload: ${JSON.stringify(notificationPayload)}`);

    // Send via Push
    if (sendPush) {
      try {
        await this.pushService.sendNotificationToUser(userId, notificationPayload);
        this.logger.log(`Push notification sent to user ${userId}`);
      } catch (error) {
        this.logger.error(`Failed to send push notification to user ${userId}:`, error);
      }
    }

    // Send WebSocket notification
    try {
      this.logger.log(`Attempting to send WebSocket notification to user ${userId}`);
      this.notificationGateway.sendNotificationToUser(userId, notificationPayload);
      this.logger.log(`WebSocket notification sent to user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to send WebSocket notification to user ${userId}:`, error);
    }

    this.logger.log(`Notification process completed for user ${userId}: ${payload.title}`);

    return notification;
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await this.notificationModel.updateOne(
      { _id: notificationId, userId: new Types.ObjectId(userId) },
      { read: true, readAt: new Date() },
    );
  }

  async getUserNotifications(userId: string, limit = 20): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      read: false,
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), read: false },
      { read: true, readAt: new Date() },
    );
  }

  async clearNotification(userId: string, notificationId: string): Promise<void> {
    await this.notificationModel.deleteOne({
      _id: notificationId,
      userId: new Types.ObjectId(userId),
    });
  }

  async clearAllNotifications(userId: string): Promise<void> {
    await this.notificationModel.deleteMany({
      userId: new Types.ObjectId(userId),
    });
  }

  async clearReadNotifications(userId: string): Promise<void> {
    await this.notificationModel.deleteMany({
      userId: new Types.ObjectId(userId),
      read: true,
    });
  }
}
