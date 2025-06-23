import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as webpush from 'web-push';
import { PushSubscription, PushSubscriptionDocument } from '../schemas/push-subscription.schema';
import { NotificationPayload, NotificationPriority } from '../../../shared/interfaces/notification.interface';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(
    @InjectModel(PushSubscription.name)
    private pushSubscriptionModel: Model<PushSubscriptionDocument>,
  ) {
    this.initializeVapidKeys();
  }

  private initializeVapidKeys() {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) {
      this.logger.warn('VAPID keys not found. Web push notifications will not work.');
      return;
    }

    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_EMAIL || 'admin@taskmanager.com'}`,
      vapidPublicKey,
      vapidPrivateKey,
    );

    this.logger.log('VAPID keys initialized successfully');
  }

  async saveSubscription(
    userId: string,
    subscription: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    },
    userAgent?: string,
  ): Promise<PushSubscriptionDocument> {
    try {
      // Check if subscription already exists
      const existingSubscription = await this.pushSubscriptionModel.findOne({
        endpoint: subscription.endpoint,
      });

      if (existingSubscription) {
        // Update existing subscription
        existingSubscription.userId = new Types.ObjectId(userId);
        existingSubscription.p256dh = subscription.keys.p256dh;
        existingSubscription.auth = subscription.keys.auth;
        existingSubscription.userAgent = userAgent;
        existingSubscription.lastUsed = new Date();
        existingSubscription.isActive = true;
        return await existingSubscription.save();
      }

      // Create new subscription
      const newSubscription = new this.pushSubscriptionModel({
        userId: new Types.ObjectId(userId),
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
        lastUsed: new Date(),
        isActive: true,
      });

      return await newSubscription.save();
    } catch (error) {
      this.logger.error(`Failed to save push subscription for user ${userId}:`, error);
      throw error;
    }
  }

  async removeSubscription(endpoint: string): Promise<void> {
    try {
      await this.pushSubscriptionModel.findOneAndUpdate(
        { endpoint },
        { isActive: false },
        { new: true },
      );
      this.logger.log(`Push subscription deactivated: ${endpoint}`);
    } catch (error) {
      this.logger.error(`Failed to remove push subscription ${endpoint}:`, error);
      throw error;
    }
  }

  async sendNotificationToUser(
    userId: string,
    notification: NotificationPayload,
  ): Promise<void> {
    try {
      const subscriptions = await this.pushSubscriptionModel.find({
        userId: new Types.ObjectId(userId),
        isActive: true,
      });

      if (subscriptions.length === 0) {
        this.logger.debug(`No active push subscriptions found for user ${userId}`);
        return;
      }

      const payload = JSON.stringify({
        title: notification.title,
        body: notification.message,
        icon: '/logo192.png',
        badge: '/logo192.png',
        data: {
          notificationId: notification.id,
          taskId: notification.taskId,
          type: notification.type,
          url: notification.taskId ? `/tasks/${notification.taskId}` : '/',
        },
        actions: notification.taskId
          ? [
              {
                action: 'view',
                title: 'View Task',
                icon: '/logo192.png',
              },
            ]
          : undefined,
        requireInteraction: notification.priority === NotificationPriority.URGENT,
        tag: notification.type,
        renotify: true,
      });

      const promises = subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            payload,
          );

          // Update last used timestamp
          subscription.lastUsed = new Date();
          await subscription.save();

          this.logger.debug(
            `Push notification sent to user ${userId} via endpoint ${subscription.endpoint}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send push notification to endpoint ${subscription.endpoint}:`,
            error,
          );

          // If subscription is invalid, deactivate it
          if (error && typeof error === 'object' && 'statusCode' in error) {
            const statusCode = (error as any).statusCode;
            if (statusCode === 410 || statusCode === 404) {
              await this.removeSubscription(subscription.endpoint);
            }
          }
        }
      });

      await Promise.allSettled(promises);
    } catch (error) {
      this.logger.error(`Failed to send push notification to user ${userId}:`, error);
      throw error;
    }
  }

  async sendNotificationToMultipleUsers(
    userIds: string[],
    notification: NotificationPayload,
  ): Promise<void> {
    const promises = userIds.map((userId) =>
      this.sendNotificationToUser(userId, notification),
    );
    await Promise.allSettled(promises);
  }

  async getVapidPublicKey(): Promise<string> {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      throw new Error('VAPID public key not configured');
    }
    return vapidPublicKey;
  }

  async getUserSubscriptions(userId: string): Promise<PushSubscriptionDocument[]> {
    return this.pushSubscriptionModel.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });
  }

  async deactivateUserSubscriptions(userId: string): Promise<void> {
    await this.pushSubscriptionModel.updateMany(
      { userId: new Types.ObjectId(userId) },
      { isActive: false },
    );
    this.logger.log(`All push subscriptions deactivated for user ${userId}`);
  }
} 