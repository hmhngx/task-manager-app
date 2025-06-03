import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from '../schemas/task.schema';
import { User, UserDocument } from '../../users/schemas/user.schema';
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

    await this.sendEmail(task.assignee.email, subject, html);
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

    if (task.assignee) {
      await this.sendEmail(task.assignee.email, subject, html);
    }
    if (task.creator) {
      await this.sendEmail(task.creator.email, subject, html);
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

    if (task.assignee) {
      await this.sendEmail(task.assignee.email, subject, html);
    }
    if (task.creator) {
      await this.sendEmail(task.creator.email, subject, html);
    }
  }
} 