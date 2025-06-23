import { Controller, Get, Put, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationService } from './services/notification.service';
import { NotificationPayload } from '../../shared/interfaces/notification.interface';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getUserNotifications(
    @Request() req,
    @Query('limit') limit?: number,
  ): Promise<{ notifications: NotificationPayload[] }> {
    const userId = req.user._id.toString();
    const notifications = await this.notificationService.getUserNotifications(userId, limit);
    
    return {
      notifications: notifications.map(notification => ({
        id: notification._id.toString(),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        data: notification.data,
        timestamp: (notification as any).createdAt,
        read: notification.read,
        userId: notification.userId.toString(),
      })),
    };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @Request() req,
    @Param('id') notificationId: string,
  ): Promise<{ success: boolean }> {
    const userId = req.user._id.toString();
    await this.notificationService.markAsRead(userId, notificationId);
    return { success: true };
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Request() req): Promise<{ success: boolean }> {
    const userId = req.user._id.toString();
    await this.notificationService.markAllAsRead(userId);
    return { success: true };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@Request() req): Promise<{ count: number }> {
    const userId = req.user._id.toString();
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }
} 