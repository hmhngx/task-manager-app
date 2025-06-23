import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards, Logger, Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WebSocketAuthGuard } from '../websocket/guards/websocket-auth.guard';
import { NotificationService } from './services/notification.service';
import { NotificationPayload, ServerToClientEvents, ClientToServerEvents, SocketData } from '../../shared/interfaces/notification.interface';

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

  constructor(
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
  ) {}

  async handleConnection(client: Socket & { data: SocketData }) {
    const user = client.data.user;
    if (!user) return;
    await client.join(user._id.toString());
    this.logger.log(`User ${user.username} connected to notifications`);
  }

  async handleDisconnect(client: Socket & { data: SocketData }) {
    const user = client.data.user;
    if (user) {
      this.logger.log(`User ${user.username} disconnected from notifications`);
    }
  }

  sendNotificationToUser(userId: string, notification: NotificationPayload) {
    this.server.to(userId).emit('notification', notification);
  }

  @SubscribeMessage('subscribe:notifications')
  async handleSubscribeToNotifications(client: Socket & { data: SocketData }) {
    const user = client.data.user;
    if (!user) return;
    await client.join(user._id.toString());
    this.logger.log(`User ${user.username} subscribed to notifications`);
  }

  @SubscribeMessage('mark:read')
  async handleMarkNotificationAsRead(client: Socket & { data: SocketData }, notificationId: string) {
    const user = client.data.user;
    if (!user) return;
    await this.notificationService.markAsRead(user._id, notificationId);
    this.logger.log(`User ${user.username} marked notification ${notificationId} as read`);
  }
} 