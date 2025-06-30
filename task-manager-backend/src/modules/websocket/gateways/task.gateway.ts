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
import { TaskData, CommentData, TaskChanges } from '../../../shared/interfaces/websocket.interface';

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

  async handleConnection(client: AuthenticatedSocket) {
    const user = client.data.user;
    if (!user) return;

    // Join user's personal room for notifications
    await client.join(user._id);

    // Join admin room if user is admin
    if (user.role === 'admin') {
      await client.join('admin-room');
    }

    console.log(`User ${user.username} connected to task gateway`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const user = client.data.user;
    if (user) {
      console.log(`User ${user.username} disconnected from task gateway`);
    }
  }

  /**
   * Subscribe to task updates
   */
  @SubscribeMessage('subscribe:task')
  async handleSubscribeToTask(client: AuthenticatedSocket, taskId: string) {
    const user = client.data.user;
    if (!user) return;

    await client.join(`task:${taskId}`);
    console.log(`User ${user.username} subscribed to task ${taskId}`);
  }

  /**
   * Unsubscribe from task updates
   */
  @SubscribeMessage('unsubscribe:task')
  async handleUnsubscribeFromTask(client: AuthenticatedSocket, taskId: string) {
    const user = client.data.user;
    if (!user) return;

    await client.leave(`task:${taskId}`);
    console.log(`User ${user.username} unsubscribed from task ${taskId}`);
  }

  /**
   * Subscribe to all tasks for admin dashboard
   */
  @SubscribeMessage('subscribe:all-tasks')
  async handleSubscribeToAllTasks(client: AuthenticatedSocket) {
    const user = client.data.user;
    if (!user || user.role !== 'admin') return;

    await client.join('all-tasks');
    console.log(`Admin ${user.username} subscribed to all tasks`);
  }

  /**
   * Handle task creation event
   */
  handleTaskCreated(task: TaskData, creatorId: string) {
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

    // If task requires approval, notify admins
    if (task.status === 'pending_approval') {
      this.webSocketService.sendTaskRequestNotification(task, creatorId);
    }
  }

  /**
   * Handle task update event
   */
  handleTaskUpdated(task: TaskData, updaterId: string, changes: TaskChanges) {
    // Broadcast to task-specific room
    this.webSocketService.broadcastToRoom(
      `task:${task._id}`,
      'task:updated',
      {
        task,
        updater: updaterId,
        changes,
        timestamp: new Date(),
      },
      updaterId,
    );

    // Broadcast to admin room
    this.webSocketService.broadcastToAdmins('admin:task_activity', {
      type: 'task_updated',
      task,
      updater: updaterId,
      changes,
      timestamp: new Date(),
    });

    // Check for deadline changes and send reminders
    if (changes.deadline) {
      this.handleDeadlineChange(task, updaterId);
    }
  }

  /**
   * Handle task assignment event
   */
  handleTaskAssigned(task: TaskData, assigneeId: string, assignerId: string) {
    // Broadcast to task room
    this.webSocketService.broadcastToRoom(`task:${task._id}`, 'task:assigned', {
      task,
      assignee: assigneeId,
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
   * Handle task assignment removal event
   */
  handleTaskAssignmentRemoved(task: TaskData, removedAssigneeId: string, removerId: string) {
    // Broadcast to task room
    this.webSocketService.broadcastToRoom(`task:${task._id}`, 'task:assignment_removed', {
      task,
      removedAssignee: removedAssigneeId,
      remover: removerId,
      timestamp: new Date(),
    });

    // Broadcast to admin room
    this.webSocketService.broadcastToAdmins('admin:task_activity', {
      type: 'task_assignment_removed',
      task,
      removedAssignee: removedAssigneeId,
      remover: removerId,
      timestamp: new Date(),
    });
  }

  /**
   * Handle task status change event
   */
  handleTaskStatusChanged(task: TaskData, oldStatus: string, newStatus: string, updaterId: string) {
    // Broadcast to task room
    this.webSocketService.broadcastToRoom(`task:${task._id}`, 'task:status_changed', {
      task,
      oldStatus,
      newStatus,
      updater: updaterId,
      timestamp: new Date(),
    });

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
   * Handle comment addition event
   */
  handleCommentAdded(comment: CommentData, taskId: string, authorId: string) {
    // Broadcast to task room
    this.webSocketService.broadcastToRoom(`task:${taskId}`, 'comment:added', {
      comment,
      taskId,
      author: authorId,
      timestamp: new Date(),
    });

    // Broadcast to admin room
    this.webSocketService.broadcastToAdmins('admin:task_activity', {
      type: 'comment_added',
      task: { _id: taskId },
      user: authorId,
      timestamp: new Date(),
    });
  }

  /**
   * Handle comment edit event
   */
  handleCommentEdited(comment: CommentData, taskId: string, editorId: string) {
    // Broadcast to task room
    this.webSocketService.broadcastToRoom(`task:${taskId}`, 'comment:edited', {
      comment,
      taskId,
      editor: editorId,
      timestamp: new Date(),
    });

    // Broadcast to admin room
    this.webSocketService.broadcastToAdmins('admin:task_activity', {
      type: 'comment_edited',
      task: { _id: taskId },
      user: editorId,
      timestamp: new Date(),
    });
  }

  /**
   * Handle comment deletion event
   */
  handleCommentDeleted(commentId: string, taskId: string, deleterId: string) {
    // Broadcast to task room
    this.webSocketService.broadcastToRoom(`task:${taskId}`, 'comment:deleted', {
      commentId,
      taskId,
      deleter: deleterId,
      timestamp: new Date(),
    });

    // Broadcast to admin room
    this.webSocketService.broadcastToAdmins('admin:task_activity', {
      type: 'comment_deleted',
      task: { _id: taskId },
      user: deleterId,
      timestamp: new Date(),
    });
  }

  /**
   * Handle task deletion event
   */
  handleTaskDeleted(taskId: string, deleterId: string) {
    // Broadcast to all task subscribers
    this.webSocketService.broadcastToAll('task:deleted', {
      taskId,
      deleter: deleterId,
      timestamp: new Date(),
    });

    // Broadcast to admin room
    this.webSocketService.broadcastToAdmins('admin:task_activity', {
      type: 'task_deleted',
      task: { _id: taskId },
      user: deleterId,
      timestamp: new Date(),
    });
  }

  /**
   * Handle task request response event
   */
  handleTaskRequestResponse(
    task: TaskData,
    requesterId: string,
    approved: boolean,
    adminId: string,
  ) {
    // Broadcast to admin room
    this.webSocketService.broadcastToAdmins('admin:task_activity', {
      type: 'task_request_response',
      task,
      requester: requesterId,
      admin: adminId,
      approved,
      timestamp: new Date(),
    });
  }

  /**
   * Handle participant change event
   */
  handleParticipantChange(
    task: TaskData,
    action: 'added' | 'removed',
    participantId: string,
    adminId: string,
  ) {
    // Broadcast to admin room
    this.webSocketService.broadcastToAdmins('admin:task_activity', {
      type: `participant_${action}`,
      task,
      participant: participantId,
      admin: adminId,
      timestamp: new Date(),
    });
  }

  /**
   * Handle deadline change event
   */
  handleDeadlineChange(task: TaskData, updaterId: string) {
    // Broadcast to admin room
    this.webSocketService.broadcastToAdmins('admin:task_activity', {
      type: 'deadline_changed',
      task,
      updater: updaterId,
      timestamp: new Date(),
    });
  }

  /**
   * Handle overdue task event
   */
  handleOverdueTask(task: TaskData) {
    // Broadcast to admin room
    this.webSocketService.broadcastToAdmins('admin:task_activity', {
      type: 'task_overdue',
      task,
      timestamp: new Date(),
    });
  }

  /**
   * Handle deadline reminder event
   */
  handleDeadlineReminder(task: TaskData) {
    // Broadcast to admin room
    this.webSocketService.broadcastToAdmins('admin:task_activity', {
      type: 'deadline_approaching',
      task,
      timestamp: new Date(),
    });
  }
}
