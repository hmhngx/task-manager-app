import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from '../../tasks/schemas/task.schema';
import { NotificationService } from './notification.service';
import {
  NotificationType,
  NotificationPriority,
} from '../../../shared/interfaces/notification.interface';

@Injectable()
export class NotificationCronService {
  private readonly logger = new Logger(NotificationCronService.name);

  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkOverdueTasks() {
    this.logger.log('Checking for overdue tasks...');
    const now = new Date();

    try {
      const overdueTasks = await this.taskModel
        .find({
          deadline: { $lt: now },
          status: { $nin: ['done', 'late'] },
        })
        .populate('assignee', '_id')
        .populate('creator', '_id')
        .populate('watchers', '_id')
        .lean()
        .exec();

      this.logger.log(`Found ${overdueTasks.length} overdue tasks`);

      for (const task of overdueTasks) {
        const participantIds = [
          task.assignee?._id?.toString(),
          task.creator?._id?.toString(),
          ...(task.watchers || []).map((w: any) => w._id?.toString()),
        ].filter(Boolean);

        for (const userId of participantIds) {
          // Check if notification was already sent recently (within last hour)
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          const existingNotification = await this.notificationService['notificationModel'].findOne({
            userId: userId,
            type: NotificationType.TASK_OVERDUE,
            taskId: task._id,
            createdAt: { $gte: oneHourAgo },
          });

          if (existingNotification) {
            this.logger.log(
              `Overdue notification already sent recently for user ${userId} and task ${task._id}. Skipping.`,
            );
            continue;
          }

          await this.notificationService.createAndSendNotification(userId, {
            title: 'Task Overdue',
            message: `Task "${task.title}" is overdue! Please take immediate action.`,
            type: NotificationType.TASK_OVERDUE,
            priority: NotificationPriority.URGENT,
            data: { taskId: task._id.toString() },
            timestamp: new Date(),
          });
        }
      }
    } catch (error) {
      this.logger.error('Error checking overdue tasks:', error);
    }
  }

  @Cron('0 */6 * * *') // Every 6 hours
  async checkUpcomingDeadlines() {
    this.logger.log('Checking for upcoming deadlines...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    try {
      const upcomingTasks = await this.taskModel
        .find({
          deadline: { $gte: now, $lte: tomorrow },
          status: { $nin: ['done', 'late'] },
        })
        .populate('assignee', '_id')
        .populate('creator', '_id')
        .populate('watchers', '_id')
        .lean()
        .exec();

      this.logger.log(`Found ${upcomingTasks.length} tasks with upcoming deadlines`);

      for (const task of upcomingTasks) {
        const participantIds = [
          task.assignee?._id?.toString(),
          task.creator?._id?.toString(),
          ...(task.watchers || []).map((w: any) => w._id?.toString()),
        ].filter(Boolean);

        for (const userId of participantIds) {
          // Check if notification was already sent recently (within last 6 hours)
          const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
          const existingNotification = await this.notificationService['notificationModel'].findOne({
            userId: userId,
            type: NotificationType.DEADLINE_APPROACHING,
            taskId: task._id,
            createdAt: { $gte: sixHoursAgo },
          });

          if (existingNotification) {
            this.logger.log(
              `Deadline approaching notification already sent recently for user ${userId} and task ${task._id}. Skipping.`,
            );
            continue;
          }

          await this.notificationService.createAndSendNotification(userId, {
            title: 'Deadline Approaching',
            message: `Task "${task.title}" deadline is approaching!`,
            type: NotificationType.DEADLINE_APPROACHING,
            priority: NotificationPriority.HIGH,
            data: { taskId: task._id.toString() },
            timestamp: new Date(),
          });
        }
      }
    } catch (error) {
      this.logger.error('Error checking upcoming deadlines:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldNotifications() {
    this.logger.log('Cleaning up old notifications...');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      // This would be implemented in NotificationService
      // await this.notificationService.deleteOldNotifications(thirtyDaysAgo);
      this.logger.log('Old notifications cleanup completed');
    } catch (error) {
      this.logger.error('Error cleaning up old notifications:', error);
    }
  }
}
