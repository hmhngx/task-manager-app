import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  UseGuards,
  Req,
  Post,
  Body,
  InternalServerErrorException,
  Delete,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationService } from './services/notification.service';
import {
  NotificationPayload,
  NotificationType,
  NotificationPriority,
} from '../../shared/interfaces/notification.interface';
import { UserRole } from '../users/user.schema';
import { NotificationDocument } from './schemas/notification.schema';
import { Request } from 'express';

// Define proper interfaces for type safety
interface AuthenticatedUser {
  id: string;
  username: string;
  role: UserRole;
}

interface AuthenticatedRequest {
  user: AuthenticatedUser;
}

interface RequestWithUser extends Request {
  user: {
    id: string;
    username: string;
    role: string;
  };
}

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getUserNotifications(
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: number,
  ): Promise<{ notifications: NotificationPayload[] }> {
    try {
      this.logger.log(`Getting notifications for user: ${JSON.stringify(req.user)}`);

      // Check if user object exists and has the expected properties
      if (!req.user) {
        throw new InternalServerErrorException('User object not found in request');
      }

      const userId = req.user.id;
      this.logger.log(`User ID extracted: ${userId}`);

      const notifications = await this.notificationService.getUserNotifications(userId, limit);

      this.logger.log(`Found ${notifications.length} notifications for user ${userId}`);

      return {
        notifications: notifications.map((notification: NotificationDocument) => ({
          id: notification._id.toString(),
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          data: notification.data,
          timestamp: (notification as any).createdAt,
          read: notification.read,
          userId: notification.userId.toString(),
          taskId: notification.taskId?.toString(),
        })),
      };
    } catch (error) {
      this.logger.error(
        `Error in getUserNotifications: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException(
        `Failed to get notifications: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @Req() req: AuthenticatedRequest,
    @Param('id') notificationId: string,
  ): Promise<{ success: boolean }> {
    try {
      const userId = req.user.id;
      if (!userId) {
        throw new InternalServerErrorException('User ID not found in user object');
      }

      await this.notificationService.markAsRead(userId, notificationId);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error in markAsRead: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException(
        `Failed to mark notification as read: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Req() req: AuthenticatedRequest): Promise<{ success: boolean }> {
    try {
      const userId = req.user.id;
      if (!userId) {
        throw new InternalServerErrorException('User ID not found in user object');
      }

      await this.notificationService.markAllAsRead(userId);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error in markAllAsRead: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException(
        `Failed to mark all notifications as read: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@Req() req: AuthenticatedRequest): Promise<{ count: number }> {
    try {
      const userId = req.user.id;
      if (!userId) {
        throw new InternalServerErrorException('User ID not found in user object');
      }

      const count = await this.notificationService.getUnreadCount(userId);
      return { count };
    } catch (error) {
      this.logger.error(
        `Error in getUnreadCount: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException(
        `Failed to get unread count: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Clear a specific notification' })
  @ApiResponse({ status: 200, description: 'Notification cleared successfully' })
  async clearNotification(
    @Req() req: AuthenticatedRequest,
    @Param('id') notificationId: string,
  ): Promise<{ success: boolean }> {
    try {
      const userId = req.user.id;
      if (!userId) {
        throw new InternalServerErrorException('User ID not found in user object');
      }

      await this.notificationService.clearNotification(userId, notificationId);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error in clearNotification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException(
        `Failed to clear notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all notifications' })
  @ApiResponse({ status: 200, description: 'All notifications cleared successfully' })
  async clearAllNotifications(@Req() req: AuthenticatedRequest): Promise<{ success: boolean }> {
    try {
      const userId = req.user.id;
      if (!userId) {
        throw new InternalServerErrorException('User ID not found in user object');
      }

      await this.notificationService.clearAllNotifications(userId);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error in clearAllNotifications: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException(
        `Failed to clear all notifications: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Delete('clear/read')
  @ApiOperation({ summary: 'Clear read notifications' })
  @ApiResponse({ status: 200, description: 'Read notifications cleared successfully' })
  async clearReadNotifications(@Req() req: AuthenticatedRequest): Promise<{ success: boolean }> {
    try {
      const userId = req.user.id;
      if (!userId) {
        throw new InternalServerErrorException('User ID not found in user object');
      }

      await this.notificationService.clearReadNotifications(userId);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error in clearReadNotifications: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException(
        `Failed to clear read notifications: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Post('test')
  @ApiOperation({ summary: 'Test notification (for debugging)' })
  @ApiResponse({ status: 200, description: 'Test notification sent' })
  async testNotification(@Req() req: AuthenticatedRequest): Promise<{ success: boolean }> {
    try {
      const userId = req.user.id;
      if (!userId) {
        throw new InternalServerErrorException('User ID not found in user object');
      }

      // Create a test notification
      await this.notificationService.createAndSendNotification(userId, {
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working',
        type: NotificationType.TASK_ASSIGNED,
        priority: NotificationPriority.MEDIUM,
        data: { taskId: 'test-task-id' },
        timestamp: new Date(),
      });

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error in testNotification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException(
        `Failed to send test notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Post('test/attachment')
  @ApiOperation({ summary: 'Test attachment notification (for debugging)' })
  @ApiResponse({ status: 200, description: 'Test attachment notification sent' })
  async testAttachmentNotification(
    @Req() req: AuthenticatedRequest,
  ): Promise<{ success: boolean }> {
    try {
      const userId = req.user.id;
      if (!userId) {
        throw new InternalServerErrorException('User ID not found in user object');
      }

      // Create a test attachment notification
      await this.notificationService.createAndSendNotification(userId, {
        title: 'Test Attachment Uploaded',
        message: 'This is a test attachment notification to verify the system is working',
        type: NotificationType.ATTACHMENT_UPLOADED,
        priority: NotificationPriority.MEDIUM,
        data: {
          taskId: 'test-task-id',
          fileName: 'test-file.jpg',
          action: 'uploaded',
          userId: userId,
        },
        timestamp: new Date(),
      });

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error in testAttachmentNotification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException(
        `Failed to send test attachment notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Post('test/task-deleted')
  @ApiOperation({ summary: 'Test task deletion notification (for debugging)' })
  @ApiResponse({ status: 200, description: 'Test task deletion notification sent' })
  async testTaskDeletedNotification(
    @Req() req: AuthenticatedRequest,
  ): Promise<{ success: boolean }> {
    try {
      const userId = req.user.id;
      if (!userId) {
        throw new InternalServerErrorException('User ID not found in user object');
      }

      // Create a test task deletion notification
      await this.notificationService.createAndSendNotification(userId, {
        title: 'Test Task Deleted',
        message: 'This is a test task deletion notification to verify the system is working',
        type: NotificationType.TASK_DELETED,
        priority: NotificationPriority.HIGH,
        data: {
          taskId: 'test-task-id',
        },
        timestamp: new Date(),
      });

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Error in testTaskDeletedNotification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : '',
      );
      throw new InternalServerErrorException(
        `Failed to send test task deletion notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
