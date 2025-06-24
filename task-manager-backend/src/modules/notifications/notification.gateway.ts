import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WebSocketAuthGuard } from '../websocket/guards/websocket-auth.guard';
import { NotificationPayload } from '../../shared/interfaces/notification.interface';

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
  private readonly logger = new Logger(NotificationGateway.name);

  async handleConnection(client: AuthenticatedSocket) {
    const user = client.data.user;
    if (!user) return;
    await client.join(user._id);
    this.logger.log(`User ${user.username} connected to notifications`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const user = client.data.user;
    if (user) {
      this.logger.log(`User ${user.username} disconnected from notifications`);
    }
  }

  sendNotificationToUser(userId: string, notification: NotificationPayload) {
    this.server.to(userId).emit('notification', notification);
  }

  @SubscribeMessage('subscribe:notifications')
  async handleSubscribeToNotifications(client: AuthenticatedSocket) {
    const user = client.data.user;
    if (!user) return;
    await client.join(user._id);
    this.logger.log(`User ${user.username} subscribed to notifications`);
  }

  @SubscribeMessage('mark:read')
  handleMarkNotificationAsRead(client: AuthenticatedSocket, notificationId: string) {
    const user = client.data.user;
    if (!user) return;
    // This will be handled by the service through a different mechanism
    this.logger.log(`User ${user.username} marked notification ${notificationId} as read`);
  }
}
