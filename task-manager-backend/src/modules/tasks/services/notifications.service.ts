import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from '../schemas/task.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';
import { NotificationService } from '../../notifications/services/notification.service';
import {
  NotificationType,
  NotificationPriority,
} from '../../../shared/interfaces/notification.interface';
import * as nodemailer from 'nodemailer';

interface PopulatedUser {
  _id: Types.ObjectId;
  email: string;
  username: string;
}

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
  }

  async notifyTaskAssigned(taskId: string) {
    const task = await this.taskModel
      .findById(taskId)
      .populate<{ assignee: PopulatedUser }>('assignee', 'email username')
      .lean()
      .exec();

    if (!task || !task.assignee) return;

    const subject = `Task Assigned: ${task.title}`;
    const html = `
      <h1>Task Assignment</h1>
      <p>You have been assigned to the following task:</p>
      <h2>${task.title}</h2>
      <p>${task.description}</p>
      <p>Priority: ${task.priority}</p>
      <p>Deadline: ${task.deadline?.toLocaleDateString()}</p>
    `;

    // Send email notification
    await this.sendEmail(task.assignee.email, subject, html);

    // Create in-app notification
    await this.notificationService.createAndSendNotification(task.assignee._id.toString(), {
      title: 'Task Assigned',
      message: `You have been assigned to task: ${task.title}`,
      type: NotificationType.TASK_ASSIGNED,
      priority: this.mapPriorityToNotificationPriority(task.priority),
      data: { taskId: task._id.toString() },
      timestamp: new Date(),
    });
  }

  async notifyTaskStatusChanged(taskId: string) {
    const task = await this.taskModel
      .findById(taskId)
      .populate<{ assignee: PopulatedUser; creator: PopulatedUser }>([
        { path: 'assignee', select: 'email username' },
        { path: 'creator', select: 'email username' },
      ])
      .lean()
      .exec();

    if (!task) return;

    const subject = `Task Status Updated: ${task.title}`;
    const html = `
      <h1>Task Status Update</h1>
      <p>The status of the following task has been updated:</p>
      <h2>${task.title}</h2>
      <p>New Status: ${task.status}</p>
      <p>Priority: ${task.priority}</p>
      <p>Deadline: ${task.deadline?.toLocaleDateString()}</p>
    `;

    // Send email notifications
    if (task.assignee) {
      await this.sendEmail(task.assignee.email, subject, html);
    }
    if (task.creator) {
      await this.sendEmail(task.creator.email, subject, html);
    }

    // Create in-app notifications
    if (task.assignee) {
      await this.notificationService.createAndSendNotification(task.assignee._id.toString(), {
        title: 'Task Status Updated',
        message: `Task "${task.title}" status changed to ${task.status}`,
        type: NotificationType.TASK_STATUS_CHANGED,
        priority: this.mapPriorityToNotificationPriority(task.priority),
        data: { taskId: task._id.toString() },
        timestamp: new Date(),
      });
    }
    if (task.creator) {
      await this.notificationService.createAndSendNotification(task.creator._id.toString(), {
        title: 'Task Status Updated',
        message: `Task "${task.title}" status changed to ${task.status}`,
        type: NotificationType.TASK_STATUS_CHANGED,
        priority: this.mapPriorityToNotificationPriority(task.priority),
        data: { taskId: task._id.toString() },
        timestamp: new Date(),
      });
    }
  }

  async notifyTaskDeadlineApproaching(taskId: string) {
    const task = await this.taskModel
      .findById(taskId)
      .populate<{ assignee: PopulatedUser; creator: PopulatedUser }>([
        { path: 'assignee', select: 'email username' },
        { path: 'creator', select: 'email username' },
      ])
      .lean()
      .exec();

    if (!task) return;

    const subject = `Task Deadline Approaching: ${task.title}`;
    const html = `
      <h1>Task Deadline Reminder</h1>
      <p>The following task is approaching its deadline:</p>
      <h2>${task.title}</h2>
      <p>Current Status: ${task.status}</p>
      <p>Priority: ${task.priority}</p>
      <p>Deadline: ${task.deadline?.toLocaleDateString()}</p>
    `;

    // Send email notifications
    if (task.assignee) {
      await this.sendEmail(task.assignee.email, subject, html);
    }
    if (task.creator) {
      await this.sendEmail(task.creator.email, subject, html);
    }

    // Create in-app notifications
    if (task.assignee) {
      await this.notificationService.createAndSendNotification(task.assignee._id.toString(), {
        title: 'Deadline Approaching',
        message: `Task "${task.title}" deadline is approaching`,
        type: NotificationType.DEADLINE_APPROACHING,
        priority: NotificationPriority.HIGH,
        data: { taskId: task._id.toString() },
        timestamp: new Date(),
      });
    }
    if (task.creator) {
      await this.notificationService.createAndSendNotification(task.creator._id.toString(), {
        title: 'Deadline Approaching',
        message: `Task "${task.title}" deadline is approaching`,
        type: NotificationType.DEADLINE_APPROACHING,
        priority: NotificationPriority.HIGH,
        data: { taskId: task._id.toString() },
        timestamp: new Date(),
      });
    }
  }

  async notifyOverdueTask(taskId: string) {
    const task = await this.taskModel
      .findById(taskId)
      .populate<{ assignee: PopulatedUser; creator: PopulatedUser }>([
        { path: 'assignee', select: 'email username' },
        { path: 'creator', select: 'email username' },
      ])
      .lean()
      .exec();

    if (!task) return;

    const subject = `URGENT: Overdue Task - ${task.title}`;
    const html = `
      <h1>Overdue Task Alert</h1>
      <p>The following task is overdue:</p>
      <h2>${task.title}</h2>
      <p>Current Status: ${task.status}</p>
      <p>Priority: ${task.priority}</p>
      <p>Deadline: ${task.deadline?.toLocaleDateString()}</p>
      <p style="color: red; font-weight: bold;">Please take immediate action!</p>
    `;

    // Send email notifications
    if (task.assignee) {
      await this.sendEmail(task.assignee.email, subject, html);
    }
    if (task.creator) {
      await this.sendEmail(task.creator.email, subject, html);
    }

    // Create in-app notifications
    if (task.assignee) {
      await this.notificationService.createAndSendNotification(task.assignee._id.toString(), {
        title: 'Task Overdue',
        message: `Task "${task.title}" is overdue! Please take immediate action.`,
        type: NotificationType.TASK_OVERDUE,
        priority: NotificationPriority.URGENT,
        data: { taskId: task._id.toString() },
        timestamp: new Date(),
      });
    }
    if (task.creator) {
      await this.notificationService.createAndSendNotification(task.creator._id.toString(), {
        title: 'Task Overdue',
        message: `Task "${task.title}" is overdue! Please take immediate action.`,
        type: NotificationType.TASK_OVERDUE,
        priority: NotificationPriority.URGENT,
        data: { taskId: task._id.toString() },
        timestamp: new Date(),
      });
    }
  }

  async notifyTaskRequest(taskId: string) {
    const task = await this.taskModel
      .findById(taskId)
      .populate<{ creator: PopulatedUser }>('creator', 'email username')
      .lean()
      .exec();

    if (!task) return;

    const subject = `New Task Request: ${task.title}`;
    const html = `
      <h1>New Task Request</h1>
      <p>A new task has been requested:</p>
      <h2>${task.title}</h2>
      <p>Description: ${task.description}</p>
      <p>Priority: ${task.priority}</p>
      <p>Requester: ${task.creator?.username}</p>
      <p>Please review and approve/reject this request.</p>
    `;

    // Send email to all admin users
    const adminUsers = await this.userModel.find({ role: 'admin' }).lean().exec();
    for (const admin of adminUsers) {
      await this.sendEmail(admin.email, subject, html);

      // Create in-app notification for admin
      await this.notificationService.createAndSendNotification(admin._id.toString(), {
        title: 'New Task Request',
        message: `New task request: "${task.title}" from ${task.creator?.username}`,
        type: NotificationType.TASK_REQUEST,
        priority: this.mapPriorityToNotificationPriority(task.priority),
        data: { taskId: task._id.toString() },
        timestamp: new Date(),
      });
    }
  }

  async notifyTaskRequestResponse(taskId: string, requesterId: string, approved: boolean) {
    const task = await this.taskModel
      .findById(taskId)
      .populate<{ creator: PopulatedUser }>('creator', 'email username')
      .lean()
      .exec();

    if (!task) return;

    const requester = await this.userModel.findById(requesterId).lean().exec();
    if (!requester) return;

    const subject = `Task Request ${approved ? 'Approved' : 'Rejected'}: ${task.title}`;
    const html = `
      <h1>Task Request ${approved ? 'Approved' : 'Rejected'}</h1>
      <p>Your task request has been ${approved ? 'approved' : 'rejected'}:</p>
      <h2>${task.title}</h2>
      <p>Description: ${task.description}</p>
      <p>Priority: ${task.priority}</p>
      <p>Status: ${approved ? 'Approved - Ready to work on' : 'Rejected'}</p>
    `;

    // Send email notification
    await this.sendEmail(requester.email, subject, html);

    // Create in-app notification
    await this.notificationService.createAndSendNotification(requester._id.toString(), {
      title: `Task Request ${approved ? 'Approved' : 'Rejected'}`,
      message: `Your task request "${task.title}" was ${approved ? 'approved' : 'rejected'}`,
      type: NotificationType.TASK_REQUEST_RESPONSE,
      priority: this.mapPriorityToNotificationPriority(task.priority),
      data: { taskId: task._id.toString() },
      timestamp: new Date(),
    });
  }

  /**
   * Check for overdue tasks every hour
   */
  async checkOverdueTasks() {
    console.log('Checking for overdue tasks...');
    const now = new Date();

    const overdueTasks = await this.taskModel
      .find({
        deadline: { $lt: now },
        status: { $nin: ['done', 'late'] },
      })
      .populate('assignee', 'email username')
      .populate('creator', 'email username')
      .lean()
      .exec();

    for (const task of overdueTasks) {
      await this.notifyOverdueTask(task._id.toString());
    }

    console.log(`Found ${overdueTasks.length} overdue tasks`);
  }

  /**
   * Check for upcoming deadlines every 6 hours
   */
  async checkUpcomingDeadlines() {
    console.log('Checking for upcoming deadlines...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingTasks = await this.taskModel
      .find({
        deadline: { $gte: now, $lte: tomorrow },
        status: { $nin: ['done', 'late'] },
      })
      .populate('assignee', 'email username')
      .populate('creator', 'email username')
      .lean()
      .exec();

    for (const task of upcomingTasks) {
      await this.notifyTaskDeadlineApproaching(task._id.toString());
    }

    console.log(`Found ${upcomingTasks.length} tasks with upcoming deadlines`);
  }

  /**
   * Helper method to map task priority to notification priority
   */
  private mapPriorityToNotificationPriority(taskPriority: string): NotificationPriority {
    switch (taskPriority) {
      case 'urgent':
        return NotificationPriority.URGENT;
      case 'high':
        return NotificationPriority.HIGH;
      case 'medium':
        return NotificationPriority.MEDIUM;
      case 'low':
        return NotificationPriority.LOW;
      default:
        return NotificationPriority.MEDIUM;
    }
  }
}
