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
import { TasksService } from '../../tasks/tasks.service';
import { UsersService } from '../../users/users.service';

@WebSocketGateway({
  namespace: '/admin',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
})
@UseGuards(WebSocketAuthGuard)
export class AdminGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private webSocketService: WebSocketService,
    private tasksService: TasksService,
    private usersService: UsersService,
  ) {}

  afterInit(server: Server) {
    this.webSocketService.setServer(server);
  }

  async handleConnection(client: Socket) {
    const user = client.data.user;
    if (!user || user.role !== 'admin') {
      client.disconnect();
      return;
    }

    // Join admin room
    await client.join('admin-room');
    console.log(`Admin ${user.username} connected to admin gateway`);
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user && user.role === 'admin') {
      console.log(`Admin ${user.username} disconnected from admin gateway`);
    }
  }

  /**
   * Subscribe to admin dashboard updates
   */
  @SubscribeMessage('subscribe:dashboard')
  async handleSubscribeToDashboard(client: Socket) {
    const user = client.data.user;
    if (!user || user.role !== 'admin') return;

    await client.join('admin-dashboard');
    console.log(`Admin ${user.username} subscribed to dashboard updates`);
  }

  /**
   * Subscribe to user activity monitoring
   */
  @SubscribeMessage('subscribe:user-activity')
  async handleSubscribeToUserActivity(client: Socket) {
    const user = client.data.user;
    if (!user || user.role !== 'admin') return;

    await client.join('user-activity');
    console.log(`Admin ${user.username} subscribed to user activity`);
  }

  /**
   * Subscribe to system statistics
   */
  @SubscribeMessage('subscribe:stats')
  async handleSubscribeToStats(client: Socket) {
    const user = client.data.user;
    if (!user || user.role !== 'admin') return;

    await client.join('admin-stats');
    console.log(`Admin ${user.username} subscribed to system stats`);
  }

  /**
   * Handle user login event
   */
  async handleUserLogin(userId: string, username: string) {
    this.webSocketService.broadcastToAdmins('admin:user_activity', {
      type: 'user_login',
      userId,
      username,
      timestamp: new Date(),
    });
  }

  /**
   * Handle user logout event
   */
  async handleUserLogout(userId: string, username: string) {
    this.webSocketService.broadcastToAdmins('admin:user_activity', {
      type: 'user_logout',
      userId,
      username,
      timestamp: new Date(),
    });
  }

  /**
   * Handle user registration event
   */
  async handleUserRegistered(user: any) {
    this.webSocketService.broadcastToAdmins('admin:user_activity', {
      type: 'user_registered',
      user,
      timestamp: new Date(),
    });
  }

  /**
   * Handle user role change event
   */
  async handleUserRoleChanged(userId: string, oldRole: string, newRole: string) {
    this.webSocketService.broadcastToAdmins('admin:user_management', {
      type: 'role_changed',
      userId,
      oldRole,
      newRole,
      timestamp: new Date(),
    });
  }

  /**
   * Handle user deletion event
   */
  async handleUserDeleted(userId: string, username: string) {
    this.webSocketService.broadcastToAdmins('admin:user_management', {
      type: 'user_deleted',
      userId,
      username,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast updated system statistics
   */
  async handleStatsUpdate(stats: any) {
    this.webSocketService.broadcastToAdmins('admin:system_stats', {
      stats,
      timestamp: new Date(),
    });
  }

  /**
   * Handle system-wide alerts
   */
  async handleSystemAlert(message: string, type: string = 'info', severity: string = 'medium') {
    this.webSocketService.broadcastToAdmins('admin:system_alert', {
      message,
      type,
      severity,
      timestamp: new Date(),
    });
  }

  /**
   * Handle performance metrics
   */
  async handlePerformanceMetrics(metrics: any) {
    this.webSocketService.broadcastToAdmins('admin:performance_metrics', {
      metrics,
      timestamp: new Date(),
    });
  }
} 