import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WebSocketAuthGuard } from '../guards/websocket-auth.guard';
import { NotificationService } from '../../notifications/services/notification.service';
import { NotificationPayload } from '../../../shared/interfaces/notification.interface';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
@UseGuards(WebSocketAuthGuard)
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Socket[]> = new Map();

  constructor(private notificationService: NotificationService) {}

  handleConnection(client: Socket) {
    const user = client.data.user;
    if (user) {
      const userId = user._id.toString();
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      this.userSockets.get(userId)?.push(client);
      client.join(`user:${userId}`);
      
      // Join admin room if user is admin
      if (user.role === 'admin') {
        client.join('admins');
      }
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      const userId = user._id.toString();
      const userSocketList = this.userSockets.get(userId);
      if (userSocketList) {
        const index = userSocketList.indexOf(client);
        if (index > -1) {
          userSocketList.splice(index, 1);
        }
        if (userSocketList.length === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
  }

  sendNotificationToUser(userId: string, notification: NotificationPayload): void {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  sendNotificationToUsers(userIds: string[], notification: NotificationPayload): void {
    userIds.forEach(userId => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  broadcastToAdmins(notification: NotificationPayload): void {
    this.server.to('admins').emit('notification', notification);
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(client: Socket, payload: { notificationId: string }) {
    const user = client.data.user;
    if (user) {
      await this.notificationService.markAsRead(user._id.toString(), payload.notificationId);
      client.emit('notificationRead', { notificationId: payload.notificationId });
    }
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(client: Socket) {
    const user = client.data.user;
    if (user) {
      await this.notificationService.markAllAsRead(user._id.toString());
      client.emit('allNotificationsRead');
    }
  }

  @SubscribeMessage('getNotifications')
  async handleGetNotifications(client: Socket, payload: { limit?: number }) {
    const user = client.data.user;
    if (user) {
      const notifications = await this.notificationService.getUserNotifications(
        user._id.toString(),
        payload.limit,
      );
      client.emit('notifications', notifications);
    }
  }

  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(client: Socket) {
    const user = client.data.user;
    if (user) {
      const count = await this.notificationService.getUnreadCount(user._id.toString());
      client.emit('unreadCount', { count });
    }
  }
} 