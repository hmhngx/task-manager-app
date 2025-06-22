import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WebSocketAuthGuard } from '../guards/websocket-auth.guard';
import { WebSocketService, NotificationData } from '../services/websocket.service';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
})
@UseGuards(WebSocketAuthGuard)
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private webSocketService: WebSocketService) {}

  afterInit(server: Server) {
    this.webSocketService.setServer(server);
  }

  async handleConnection(client: Socket) {
    const user = client.data.user;
    if (!user) return;

    // Join user's personal notification room
    await client.join(user._id.toString());
    
    // Join admin notification room if user is admin
    if (user.role === 'admin') {
      await client.join('admin-notifications');
    }

    console.log(`User ${user.username} connected to notification gateway`);
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      console.log(`User ${user.username} disconnected from notification gateway`);
    }
  }

  /**
   * Subscribe to all notifications
   */
  @SubscribeMessage('subscribe:notifications')
  async handleSubscribeToNotifications(client: Socket) {
    const user = client.data.user;
    if (!user) return;

    await client.join('all-notifications');
    console.log(`User ${user.username} subscribed to all notifications`);
  }

  /**
   * Unsubscribe from all notifications
   */
  @SubscribeMessage('unsubscribe:notifications')
  async handleUnsubscribeFromNotifications(client: Socket) {
    const user = client.data.user;
    if (!user) return;

    await client.leave('all-notifications');
    console.log(`User ${user.username} unsubscribed from all notifications`);
  }

  /**
   * Mark notification as read
   */
  @SubscribeMessage('mark-read')
  async handleMarkNotificationAsRead(client: Socket, notificationId: string) {
    const user = client.data.user;
    if (!user) return;

    // Emit to user that notification was marked as read
    this.webSocketService.broadcastToUser(user._id.toString(), 'notification:marked_read', {
      notificationId,
      timestamp: new Date(),
    });
  }

  /**
   * Mark all notifications as read
   */
  @SubscribeMessage('mark-all-read')
  async handleMarkAllNotificationsAsRead(client: Socket) {
    const user = client.data.user;
    if (!user) return;

    // Emit to user that all notifications were marked as read
    this.webSocketService.broadcastToUser(user._id.toString(), 'notification:all_marked_read', {
      timestamp: new Date(),
    });
  }

  /**
   * Get notification count
   */
  @SubscribeMessage('get-count')
  async handleGetNotificationCount(client: Socket) {
    const user = client.data.user;
    if (!user) return;

    // This would typically query the database for unread notifications
    // For now, we'll emit a placeholder response
    this.webSocketService.broadcastToUser(user._id.toString(), 'notification:count', {
      count: 0, // This should be calculated from the database
      timestamp: new Date(),
    });
  }

  /**
   * Send urgent notification to all users
   */
  async sendUrgentNotification(notification: NotificationData, excludeUserId?: string) {
    this.webSocketService.sendUrgentNotification(notification, excludeUserId);
  }

  /**
   * Send notification to specific user
   */
  async sendNotificationToUser(userId: string, notification: NotificationData) {
    this.webSocketService.sendNotification(userId, notification);
  }

  /**
   * Send notification to multiple users
   */
  async sendNotificationToUsers(userIds: string[], notification: NotificationData) {
    this.webSocketService.sendNotificationToUsers(userIds, notification);
  }

  /**
   * Send notification to all admin users
   */
  async sendNotificationToAdmins(notification: NotificationData) {
    this.webSocketService.broadcastToAdmins('notification:admin', notification);
  }

  /**
   * Send deadline reminder
   */
  async sendDeadlineReminder(userIds: string[], taskData: any) {
    this.webSocketService.sendDeadlineReminder(userIds, taskData);
  }

  /**
   * Send overdue notification
   */
  async sendOverdueNotification(userIds: string[], taskData: any) {
    this.webSocketService.sendOverdueNotification(userIds, taskData);
  }

  /**
   * Send task request notification
   */
  async sendTaskRequestNotification(taskData: any, requesterId: string) {
    this.webSocketService.sendTaskRequestNotification(taskData, requesterId);
  }

  /**
   * Send task request response notification
   */
  async sendTaskRequestResponseNotification(requesterId: string, taskData: any, approved: boolean, adminId: string) {
    this.webSocketService.sendTaskRequestResponseNotification(requesterId, taskData, approved, adminId);
  }

  /**
   * Send participant change notification
   */
  async sendParticipantChangeNotification(taskData: any, action: 'added' | 'removed', participantId: string, adminId: string) {
    this.webSocketService.sendParticipantChangeNotification(taskData, action, participantId, adminId);
  }
} 