import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards, Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WebSocketAuthGuard } from '../guards/websocket-auth.guard';
import { WebSocketService } from '../services/websocket.service';
import { TasksService } from '../../tasks/tasks.service';
import { CommentsService } from '../../tasks/services/comments.service';
import { NotificationsService } from '../../tasks/services/notifications.service';

@WebSocketGateway({
  namespace: '/tasks',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
})
@UseGuards(WebSocketAuthGuard)
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private webSocketService: WebSocketService,
    @Inject(forwardRef(() => TasksService))
    private tasksService: TasksService,
    @Inject(forwardRef(() => CommentsService))
    private commentsService: CommentsService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  afterInit(server: Server) {
    this.webSocketService.setServer(server);
  }

  async handleConnection(client: Socket) {
    const user = client.data.user;
    if (!user) return;

    // Join user's personal room for notifications
    await client.join(user._id.toString());
    
    // Join admin room if user is admin
    if (user.role === 'admin') {
      await client.join('admin-room');
    }

    console.log(`User ${user.username} connected to task gateway`);
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      console.log(`User ${user.username} disconnected from task gateway`);
    }
  }

  /**
   * Subscribe to task updates
   */
  @SubscribeMessage('subscribe:task')
  async handleSubscribeToTask(client: Socket, taskId: string) {
    const user = client.data.user;
    if (!user) return;

    await client.join(`task:${taskId}`);
    console.log(`User ${user.username} subscribed to task ${taskId}`);
  }

  /**
   * Unsubscribe from task updates
   */
  @SubscribeMessage('unsubscribe:task')
  async handleUnsubscribeFromTask(client: Socket, taskId: string) {
    const user = client.data.user;
    if (!user) return;

    await client.leave(`task:${taskId}`);
    console.log(`User ${user.username} unsubscribed from task ${taskId}`);
  }

  /**
   * Subscribe to all tasks for admin dashboard
   */
  @SubscribeMessage('subscribe:all-tasks')
  async handleSubscribeToAllTasks(client: Socket) {
    const user = client.data.user;
    if (!user || user.role !== 'admin') return;

    await client.join('all-tasks');
    console.log(`Admin ${user.username} subscribed to all tasks`);
  }

  /**
   * Handle task creation event
   */
  async handleTaskCreated(task: any, creatorId: string) {
    // Broadcast to all task subscribers
    this.webSocketService.broadcastToAll('task:created', {
      task,
      creator: creatorId,
      timestamp: new Date(),
    });

    // Broadcast to admin room
    this.webSocketService.broadcastToAdmins('admin:task_activity', {
      type: 'task_created',
      task,
      creator: creatorId,
      timestamp: new Date(),
    });
  }

  /**
   * Handle task update event
   */
  async handleTaskUpdated(task: any, updaterId: string, changes: any) {
    // Broadcast to task-specific room
    this.webSocketService.broadcastToRoom(`task:${task._id}`, 'task:updated', {
      task,
      updater: updaterId,
      changes,
      timestamp: new Date(),
    }, updaterId);

    // Broadcast to admin room
    this.webSocketService.broadcastToAdmins('admin:task_activity', {
      type: 'task_updated',
      task,
      updater: updaterId,
      changes,
      timestamp: new Date(),
    });
  }

  /**
   * Handle task assignment event
   */
  async handleTaskAssigned(task: any, assigneeId: string, assignerId: string) {
    // Broadcast to task room
    this.webSocketService.broadcastToRoom(`task:${task._id}`, 'task:assigned', {
      task,
      assignee: assigneeId,
      assigner: assignerId,
      timestamp: new Date(),
    });

    // Send notification to assignee
    this.webSocketService.broadcastToUser(assigneeId, 'notification:task_assigned', {
      task,
      assigner: assignerId,
      timestamp: new Date(),
    });

    // Broadcast to admin room
    this.webSocketService.broadcastToAdmins('admin:task_activity', {
      type: 'task_assigned',
      task,
      assignee: assigneeId,
      assigner: assignerId,
      timestamp: new Date(),
    });
  }

  /**
   * Handle task status change event
   */
  async handleTaskStatusChanged(task: any, oldStatus: string, newStatus: string, updaterId: string) {
    // Broadcast to task room
    this.webSocketService.broadcastToRoom(`task:${task._id}`, 'task:status_changed', {
      task,
      oldStatus,
      newStatus,
      updater: updaterId,
      timestamp: new Date(),
    }, updaterId);

    // Send notifications to relevant users
    if (task.assignee && task.assignee.toString() !== updaterId) {
      this.webSocketService.broadcastToUser(task.assignee.toString(), 'notification:status_change', {
        task,
        oldStatus,
        newStatus,
        updater: updaterId,
        timestamp: new Date(),
      });
    }

    if (task.creator.toString() !== updaterId) {
      this.webSocketService.broadcastToUser(task.creator.toString(), 'notification:status_change', {
        task,
        oldStatus,
        newStatus,
        updater: updaterId,
        timestamp: new Date(),
      });
    }

    // Broadcast to admin room
    this.webSocketService.broadcastToAdmins('admin:task_activity', {
      type: 'task_status_changed',
      task,
      oldStatus,
      newStatus,
      updater: updaterId,
      timestamp: new Date(),
    });
  }

  /**
   * Handle comment added event
   */
  async handleCommentAdded(comment: any, taskId: string, authorId: string) {
    // Broadcast to task room
    this.webSocketService.broadcastToRoom(`task:${taskId}`, 'comment:added', {
      comment,
      taskId,
      author: authorId,
      timestamp: new Date(),
    }, authorId);

    // Handle mentions
    if (comment.mentions && comment.mentions.length > 0) {
      comment.mentions.forEach((mentionId: string) => {
        if (mentionId !== authorId) {
          this.webSocketService.broadcastToUser(mentionId, 'notification:mention', {
            comment,
            taskId,
            author: authorId,
            timestamp: new Date(),
          });
        }
      });
    }

    // Broadcast to admin room
    this.webSocketService.broadcastToAdmins('admin:task_activity', {
      type: 'comment_added',
      comment,
      taskId,
      author: authorId,
      timestamp: new Date(),
    });
  }

  /**
   * Handle comment edited event
   */
  async handleCommentEdited(comment: any, taskId: string, editorId: string) {
    this.webSocketService.broadcastToRoom(`task:${taskId}`, 'comment:edited', {
      comment,
      taskId,
      editor: editorId,
      timestamp: new Date(),
    }, editorId);
  }

  /**
   * Handle comment deleted event
   */
  async handleCommentDeleted(commentId: string, taskId: string, deleterId: string) {
    this.webSocketService.broadcastToRoom(`task:${taskId}`, 'comment:deleted', {
      commentId,
      taskId,
      deleter: deleterId,
      timestamp: new Date(),
    }, deleterId);
  }

  /**
   * Handle task deletion event
   */
  async handleTaskDeleted(taskId: string, deleterId: string) {
    this.webSocketService.broadcastToAll('task:deleted', {
      taskId,
      deleter: deleterId,
      timestamp: new Date(),
    }, deleterId);

    this.webSocketService.broadcastToAdmins('admin:task_activity', {
      type: 'task_deleted',
      taskId,
      deleter: deleterId,
      timestamp: new Date(),
    });
  }
} 