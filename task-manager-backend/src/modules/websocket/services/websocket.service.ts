import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

export interface WebSocketEvent {
  type: string;
  data: any;
  room?: string;
  userId?: string;
  excludeUserId?: string;
}

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface TaskData {
  _id: string;
  title: string;
  description?: string;
  deadline?: Date;
  status?: string;
  priority?: string;
  assignee?: string;
  creator?: string;
  [key: string]: any; // Allow additional properties
}

@Injectable()
export class WebSocketService {
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  /**
   * Broadcast event to a specific room
   */
  broadcastToRoom(room: string, event: string, data: any, excludeUserId?: string) {
    if (!this.server) return;

    const roomSockets = this.server.in(room);
    if (excludeUserId) {
      roomSockets.except(excludeUserId).emit(event, data);
    } else {
      roomSockets.emit(event, data);
    }
  }

  /**
   * Broadcast event to a specific user
   */
  broadcastToUser(userId: string, event: string, data: any) {
    if (!this.server) return;
    this.server.to(userId).emit(event, data);
  }

  /**
   * Broadcast event to multiple users
   */
  broadcastToUsers(userIds: string[], event: string, data: any) {
    if (!this.server) return;
    userIds.forEach((userId) => {
      this.server.to(userId).emit(event, data);
    });
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcastToAll(event: string, data: any, excludeUserId?: string) {
    if (!this.server) return;

    if (excludeUserId) {
      this.server.except(excludeUserId).emit(event, data);
    } else {
      this.server.emit(event, data);
    }
  }

  /**
   * Broadcast event to admin users only
   */
  broadcastToAdmins(event: string, data: any) {
    if (!this.server) return;
    this.server.to('admin-room').emit(event, data);
  }

  /**
   * Send notification to specific user
   */
  sendNotification(userId: string, notification: NotificationData) {
    this.broadcastToUser(userId, 'notification:new', notification);
  }

  /**
   * Send notification to multiple users
   */
  sendNotificationToUsers(userIds: string[], notification: NotificationData) {
    this.broadcastToUsers(userIds, 'notification:new', notification);
  }

  /**
   * Send urgent notification to all users
   */
  sendUrgentNotification(notification: NotificationData, excludeUserId?: string) {
    if (!this.server) return;

    const eventData = { ...notification, priority: 'urgent' };
    if (excludeUserId) {
      this.server.except(excludeUserId).emit('notification:urgent', eventData);
    } else {
      this.server.emit('notification:urgent', eventData);
    }
  }

  /**
   * Send deadline reminder to specific users
   */
  sendDeadlineReminder(userIds: string[], taskData: TaskData) {
    const notification: NotificationData = {
      id: `deadline-${taskData._id}-${Date.now()}`,
      type: 'deadline_reminder',
      title: 'Deadline Reminder',
      message: `Task "${taskData.title}" is due ${taskData.deadline ? new Date(taskData.deadline).toLocaleDateString() : 'soon'}`,
      data: taskData,
      timestamp: new Date(),
      read: false,
      priority: 'high',
    };

    this.sendNotificationToUsers(userIds, notification);
  }

  /**
   * Send overdue notification to specific users
   */
  sendOverdueNotification(userIds: string[], taskData: TaskData) {
    const notification: NotificationData = {
      id: `overdue-${taskData._id}-${Date.now()}`,
      type: 'overdue_task',
      title: 'Overdue Task',
      message: `Task "${taskData.title}" is overdue!`,
      data: taskData,
      timestamp: new Date(),
      read: false,
      priority: 'urgent',
    };

    this.sendNotificationToUsers(userIds, notification);
  }

  /**
   * Send task request notification to admins
   */
  sendTaskRequestNotification(taskData: TaskData, requesterId: string) {
    const notification: NotificationData = {
      id: `request-${taskData._id}-${Date.now()}`,
      type: 'task_request',
      title: 'New Task Request',
      message: `User has requested a new task: "${taskData.title}"`,
      data: { task: taskData, requesterId },
      timestamp: new Date(),
      read: false,
      priority: 'medium',
    };

    this.broadcastToAdmins('notification:new', notification);
  }

  /**
   * Send task approval/rejection notification to requester
   */
  sendTaskRequestResponseNotification(
    requesterId: string,
    taskData: TaskData,
    approved: boolean,
    adminId: string,
  ) {
    const notification: NotificationData = {
      id: `response-${taskData._id}-${Date.now()}`,
      type: approved ? 'task_approved' : 'task_rejected',
      title: approved ? 'Task Approved' : 'Task Rejected',
      message: `Your task request "${taskData.title}" has been ${approved ? 'approved' : 'rejected'}`,
      data: { task: taskData, approved, adminId },
      timestamp: new Date(),
      read: false,
      priority: 'medium',
    };

    this.sendNotification(requesterId, notification);
  }

  /**
   * Send participant change notification
   */
  sendParticipantChangeNotification(
    taskData: TaskData,
    action: 'added' | 'removed',
    participantId: string,
    adminId: string,
  ) {
    const notification: NotificationData = {
      id: `participant-${taskData._id}-${Date.now()}`,
      type: 'participant_change',
      title: `User ${action} to task`,
      message: `You have been ${action} to task "${taskData.title}"`,
      data: { task: taskData, action, participantId, adminId },
      timestamp: new Date(),
      read: false,
      priority: 'medium',
    };

    this.sendNotification(participantId, notification);
  }

  /**
   * Get connected users count in a room
   */
  getRoomUserCount(roomName: string): number {
    if (!this.server) return 0;
    const room = this.server.sockets.adapter.rooms.get(roomName);
    return room ? room.size : 0;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    if (!this.server) return false;
    return this.server.sockets.adapter.rooms.has(userId);
  }

  /**
   * Get all connected user IDs
   */
  getConnectedUserIds(): string[] {
    if (!this.server) return [];
    const connectedUsers: string[] = [];
    this.server.sockets.adapter.rooms.forEach((_, roomName) => {
      // Check if room name is a user ID (not a special room)
      if (!roomName.startsWith('task:') && roomName !== 'admin-room' && roomName !== 'all-tasks') {
        connectedUsers.push(roomName);
      }
    });
    return connectedUsers;
  }
}
