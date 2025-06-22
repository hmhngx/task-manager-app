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
import { WebSocketService } from '../services/websocket.service';

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

    await client.join('notifications');
    console.log(`User ${user.username} subscribed to notifications`);
  }

  /**
   * Mark notification as read
   */
  @SubscribeMessage('mark:read')
  async handleMarkAsRead(client: Socket, notificationId: string) {
    const user = client.data.user;
    if (!user) return;

    // Here you would typically update the notification in the database
    console.log(`User ${user.username} marked notification ${notificationId} as read`);
  }

  /**
   * Send deadline approaching notification
   */
  async handleDeadlineApproaching(task: any, userId: string) {
    this.webSocketService.broadcastToUser(userId, 'notification:deadline_approaching', {
      task,
      timestamp: new Date(),
    });
  }

  /**
   * Send approval required notification
   */
  async handleApprovalRequired(task: any, approverId: string, requesterId: string) {
    this.webSocketService.broadcastToUser(approverId, 'notification:approval_required', {
      task,
      requester: requesterId,
      timestamp: new Date(),
    });
  }

  /**
   * Send system notification
   */
  async handleSystemNotification(userId: string, message: string, type: string = 'info') {
    this.webSocketService.broadcastToUser(userId, 'notification:system', {
      message,
      type,
      timestamp: new Date(),
    });
  }

  /**
   * Send bulk notification to multiple users
   */
  async handleBulkNotification(userIds: string[], message: string, type: string = 'info') {
    userIds.forEach(userId => {
      this.webSocketService.broadcastToUser(userId, 'notification:system', {
        message,
        type,
        timestamp: new Date(),
      });
    });
  }
} 