import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WebSocketAuthGuard } from '../guards/websocket-auth.guard';
import { NotificationPayload } from '../../../shared/interfaces/notification.interface';

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      _id: string;
      username: string;
      email: string;
      role: string;
    };
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/notifications',
})
@UseGuards(WebSocketAuthGuard)
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Socket[]> = new Map();
  private readonly logger = new Logger(NotificationGateway.name);

  constructor() {}

  handleConnection(client: AuthenticatedSocket) {
    const user = client.data.user;
    if (user) {
      const userId = user._id.toString();
      this.logger.log(`User ${user.username} (${userId}) connected to notifications`);
      
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      this.userSockets.get(userId)?.push(client);
      client.join(`user:${userId}`);

      // Join admin room if user is admin
      if (user.role === 'admin') {
        client.join('admins');
        this.logger.log(`Admin user ${user.username} joined admin room`);
      }
      
      this.logger.log(`User ${user.username} joined room user:${userId}`);
      this.logger.log(`Total connected users: ${this.userSockets.size}`);
    } else {
      this.logger.warn('User data not found in socket connection');
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
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
    this.logger.log(`Attempting to send notification to user ${userId}: ${notification.title}`);
    this.logger.log(`Notification payload: ${JSON.stringify(notification)}`);
    this.logger.log(`User sockets count: ${this.userSockets.get(userId)?.length || 0}`);
    this.logger.log(`Available user IDs: ${Array.from(this.userSockets.keys()).join(', ')}`);
    
    // Check if user has any connected sockets
    const userSocketList = this.userSockets.get(userId);
    if (!userSocketList || userSocketList.length === 0) {
      this.logger.warn(`No connected sockets found for user ${userId}`);
      return;
    }
    
    // Only emit to the room - this will automatically send to all user's connected sockets
    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.log(`Notification emitted to room user:${userId}`);
  }

  sendNotificationToUsers(userIds: string[], notification: NotificationPayload): void {
    userIds.forEach((userId) => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  broadcastToAdmins(notification: NotificationPayload): void {
    this.server.to('admins').emit('notification', notification);
  }

  @SubscribeMessage('subscribe:notifications')
  async handleSubscribeToNotifications(client: AuthenticatedSocket) {
    const user = client.data.user;
    if (user) {
      const userId = user._id.toString();
      await client.join(`user:${userId}`);

      // Join admin room if user is admin
      if (user.role === 'admin') {
        client.join('admins');
      }
    }
  }

  @SubscribeMessage('mark:read')
  handleMarkNotificationAsRead(client: AuthenticatedSocket, notificationId: string) {
    const user = client.data.user;
    if (user) {
      this.logger.log(`User ${user.username} marked notification ${notificationId} as read`);
      client.emit('notificationRead', { notificationId });
    }
  }

  @SubscribeMessage('markAllAsRead')
  handleMarkAllAsRead(client: AuthenticatedSocket) {
    const user = client.data.user;
    if (user) {
      this.logger.log(`User ${user.username} marked all notifications as read`);
      client.emit('allNotificationsRead');
    }
  }

  @SubscribeMessage('getNotifications')
  handleGetNotifications(client: AuthenticatedSocket) {
    const user = client.data.user;
    if (user) {
      this.logger.log(`User ${user.username} requested notifications`);
      // This will be handled by the service through a different mechanism
      client.emit('notifications', []);
    }
  }

  @SubscribeMessage('getUnreadCount')
  handleGetUnreadCount(client: AuthenticatedSocket) {
    const user = client.data.user;
    if (user) {
      this.logger.log(`User ${user.username} requested unread count`);
      // This will be handled by the service through a different mechanism
      client.emit('unreadCount', { count: 0 });
    }
  }
}
