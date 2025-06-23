import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../schemas/notification.schema';
import { NotificationPayload } from '../../../shared/interfaces/notification.interface';
import { PushService } from './push.service';
import { NotificationGateway } from '../notification.gateway';

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
    const notification = new this.notificationModel({
      ...payload,
      userId: new Types.ObjectId(userId),
      read: false,
    });
    await notification.save();

    // Create notification payload for WebSocket
    const notificationPayload: NotificationPayload = {
      ...payload,
      id: notification._id.toString(),
      read: false,
      userId: userId,
      timestamp: (notification as any).createdAt,
    };

    // Send via WebSocket
    this.notificationGateway.sendNotificationToUser(userId, notificationPayload);

    // Send via Push
    if (sendPush) {
      await this.pushService.sendNotificationToUser(userId, notificationPayload);
    }

    this.logger.log(`Notification sent to user ${userId}: ${payload.title}`);

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
} 