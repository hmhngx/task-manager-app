import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument, TaskStatus, TaskType, TaskPriority } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { WorkflowsService } from './services/workflows.service';
import { NotificationsService } from './services/notifications.service';
import { TaskGateway } from '../websocket/gateways/task.gateway';
import { NotificationService } from '../notifications/services/notification.service';
import { NotificationGateway } from '../websocket/gateways/notification.gateway';
import { UsersService } from '../users/users.service';
import { startOfWeek, startOfMonth } from 'date-fns';
import {
  NotificationType,
  NotificationPriority,
} from '../../shared/interfaces/notification.interface';
import { TaskData } from '../../shared/interfaces/websocket.interface';

type DateFn = {
  (date: Date | number): Date;
  (date: Date | number, options?: { weekStartsOn?: number }): Date;
};

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    private readonly workflowsService: WorkflowsService,
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => TaskGateway))
    private readonly taskGateway: TaskGateway,
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Convert MongoDB Task document to TaskData interface
   */
  private convertTaskToTaskData(task: TaskDocument): TaskData {
    return {
      _id: task._id.toString(),
      title: task.title,
      description: task.description,
      type: task.type,
      priority: task.priority,
      labels: task.labels,
      deadline: task.deadline,
      status: task.status,
      userId: task.userId.toString(),
      assignee: task.assignee?.toString(),
      creator: task.creator.toString(),
      parentTask: task.parentTask?.toString(),
      subtasks: task.subtasks.map((id) => id.toString()),
      comments: task.comments.map((id) => id.toString()),
      attachments: task.attachments.map((id) => id.toString()),
      progress: task.progress,
      watchers: task.watchers?.map((id) => id.toString()),
      requesters: task.requesters?.map((id) => id.toString()),
      workflow: task.workflow,
      createdAt: (task as any).createdAt,
      updatedAt: (task as any).updatedAt,
    };
  }

  async createTask(createTaskDto: CreateTaskDto, creatorId: string) {
    const task = await this.taskModel.create({
      ...createTaskDto,
      creator: creatorId,
      userId: creatorId,
      status: TaskStatus.TODO,
      priority: createTaskDto.priority || TaskPriority.MEDIUM,
    });

    if (createTaskDto.parentTask) {
      await this.taskModel.findByIdAndUpdate(createTaskDto.parentTask, {
        $push: { subtasks: task._id },
      });
    }

    // Emit WebSocket event for task creation
    await this.taskGateway.handleTaskCreated(this.convertTaskToTaskData(task), creatorId);

    // Notify all users (broadcast)
    const allUsers = await this.usersService.findAll();
    for (const user of allUsers) {
      if (user._id.toString() !== creatorId) {
        await this.notificationService.createAndSendNotification(user._id.toString(), {
          title: 'New Task Created',
          message: `Task "${task.title}" was created`,
          type: NotificationType.TASK_CREATED,
          priority: NotificationPriority.MEDIUM,
          data: { taskId: task._id.toString() },
          timestamp: new Date(),
        });
      }
    }

    return task;
  }

  /**
   * Create a task request that requires admin approval
   */
  async createTaskRequest(createTaskDto: CreateTaskDto, requesterId: string) {
    this.logger.log(`🔄 Creating task request for user ${requesterId}`);
    this.logger.log(`📋 Task title: ${createTaskDto.title}`);
    this.logger.log(`📝 Task description: ${createTaskDto.description}`);
    this.logger.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    
    const task = await this.taskModel.create({
      ...createTaskDto,
      creator: requesterId,
      userId: requesterId,
      status: TaskStatus.PENDING_APPROVAL,
      priority: createTaskDto.priority || TaskPriority.MEDIUM,
      requesters: [], // Don't add creator to requesters - they are the owner
    });

    this.logger.log(`✅ Task created with ID: ${task._id.toString()}`);
    this.logger.log(`✅ Task status set to: ${TaskStatus.PENDING_APPROVAL}`);

    // Emit WebSocket event for task request
    this.taskGateway.handleTaskCreated(this.convertTaskToTaskData(task), requesterId);
    this.logger.log(`📡 WebSocket event emitted for task creation`);

    // Get requester details for personalized notifications
    const requester = await this.usersService.findById(requesterId);
    this.logger.log(`👤 Requester details retrieved: ${requester?.username || 'Unknown'}`);

    // Send confirmation notification to the requester
    await this.notificationService.createAndSendNotification(requesterId, {
      title: 'Task Request Submitted',
      message: `You have requested the "${task.title}" task`,
      type: NotificationType.TASK_REQUEST_CONFIRMATION,
      priority: NotificationPriority.MEDIUM,
      data: { taskId: task._id.toString() },
      timestamp: new Date(),
    });
    this.logger.log(`📧 Confirmation notification sent to requester ${requesterId}`);

    // Send email notification using NotificationsService (for admins)
    await this.notificationsService.notifyTaskRequest(task._id.toString());
    this.logger.log(`📧 Email notification sent to admins`);

    // Notify all admins about the request with requester name
    const adminUsers = await this.usersService.findAdmins();
    this.logger.log(`👨‍💼 Found ${adminUsers.length} admin users to notify`);
    
    for (const admin of adminUsers) {
      await this.notificationService.createAndSendNotification(admin._id.toString(), {
        title: 'New Task Request',
        message: `"${requester.username}" has requested for "${task.title}" task`,
        type: NotificationType.TASK_REQUEST,
        priority: NotificationPriority.MEDIUM,
        data: { taskId: task._id.toString() },
        timestamp: new Date(),
      });
      this.logger.log(`📧 Admin notification sent to ${admin.username} (${admin._id.toString()})`);
    }

    this.logger.log(`✅ Task request creation completed successfully`);
    return task;
  }

  /**
   * Approve or reject a task request
   */
  async handleTaskRequest(taskId: string, approved: boolean, adminId: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.status !== TaskStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Task is not pending approval');
    }

    const newStatus = approved ? TaskStatus.TODO : TaskStatus.LATE; // Use LATE as rejected status
    const updatedTask = await this.taskModel
      .findByIdAndUpdate(taskId, { status: newStatus }, { new: true })
      .populate('creator', 'username');

    // Send email notification using NotificationsService
    await this.notificationsService.notifyTaskRequestResponse(
      taskId,
      task.creator.toString(),
      approved,
    );

    // Notify the requester about the decision
    this.taskGateway.handleTaskRequestResponse(
      this.convertTaskToTaskData(updatedTask),
      task.creator.toString(),
      approved,
      adminId,
    );

    // Notify requester
    await this.notificationService.createAndSendNotification(task.creator.toString(), {
      title: `Task Request ${approved ? 'Approved' : 'Rejected'}`,
      message: `Your task request "${task.title}" was ${approved ? 'approved' : 'rejected'}`,
      type: NotificationType.TASK_REQUEST_RESPONSE,
      priority: NotificationPriority.MEDIUM,
      data: { taskId: task._id.toString() },
      timestamp: new Date(),
    });

    return updatedTask;
  }

  async getAllTasks(filters: any = {}): Promise<TaskDocument[]> {
    try {
      const query = this.taskModel.find(filters);
      const populatedQuery = query
        .populate({
          path: 'assignee',
          select: 'username',
          options: { lean: true },
        })
        .populate({
          path: 'creator',
          select: 'username',
          options: { lean: true },
        })
        .populate({
          path: 'parentTask',
          options: { lean: true },
        })
        .populate({
          path: 'subtasks',
          options: { lean: true },
        })
        .populate({
          path: 'comments',
          options: { lean: true },
        })
        .populate({
          path: 'attachments',
          options: { lean: true },
        })
        .populate({
          path: 'watchers',
          select: 'username',
          options: { lean: true },
        })
        .populate({
          path: 'requesters',
          select: 'username',
          options: { lean: true },
        });

      const tasks = await populatedQuery.sort({ createdAt: -1 }).exec();
      return tasks;
    } catch (error) {
      console.error('Error in getAllTasks:', error);
      throw new BadRequestException('Failed to fetch tasks');
    }
  }

  async getTaskById(id: string) {
    const task = await this.taskModel
      .findById(id)
      .populate('assignee', 'username')
      .populate('creator', 'username')
      .populate('parentTask')
      .populate('subtasks')
      .populate('comments')
      .populate('attachments')
      .populate('watchers', 'username')
      .populate('requesters', 'username');

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto, userId: string, userRole?: string) {
    try {
      console.log('[TasksService] updateTask called', { id, updateTaskDto, userId, userRole });
      const task = await this.taskModel.findById(id);
      if (!task) {
        throw new NotFoundException('Task not found');
      }

      // Store old values for comparison
      const oldStatus = task.status;
      const oldAssignee = task.assignee?.toString();

      // Allow admins to update any task
      const isAdmin = userRole === 'admin';
      const isCreator = task.creator.toString() === userId;
      const isAssignee = task.assignee?.toString() === userId;
      if (!isAdmin && !isCreator && !isAssignee) {
        throw new BadRequestException(
          `Not authorized to update this task. UserId: ${userId}, Creator: ${task.creator.toString()}, Assignee: ${task.assignee?.toString()}`,
        );
      }

      // If status is being updated, validate the transition
      if (updateTaskDto.status && updateTaskDto.status !== task.status) {
        // Prevent setting status to pending_approval for done/late tasks
        if (updateTaskDto.status === TaskStatus.PENDING_APPROVAL) {
          if (task.status === TaskStatus.DONE || task.status === TaskStatus.LATE) {
            throw new BadRequestException(
              `Cannot set status to 'pending_approval' for a task that is ${task.status}. Only tasks in 'todo' or 'in_progress' status can be set to pending approval.`,
            );
          }
        }

        // Prevent changing status of done/late tasks to pending_approval
        if ((task.status === TaskStatus.DONE || task.status === TaskStatus.LATE) && 
            updateTaskDto.status === TaskStatus.PENDING_APPROVAL) {
          throw new BadRequestException(
            `Cannot change status of a ${task.status} task to pending_approval.`,
          );
        }

        // Defensive: Only validate if workflowId is present and valid
        let workflowId: string | undefined;
        const workflowObj = task.workflow as { _id?: string } | string | undefined;
        if (typeof workflowObj === 'string') {
          workflowId = workflowObj;
        } else if (
          workflowObj &&
          typeof workflowObj === 'object' &&
          typeof workflowObj._id === 'string'
        ) {
          workflowId = workflowObj._id;
        }
        let isValid = true;
        let requiresApproval = false;
        if (workflowId && typeof workflowId === 'string' && workflowId.match(/^[a-f\d]{24}$/i)) {
          ({ isValid, requiresApproval } = await this.workflowsService.validateTransition(
            workflowId,
            task.status,
            updateTaskDto.status,
            userRole || 'user',
          ));
        }
        if (!isValid) {
          throw new BadRequestException('Invalid status transition');
        }
        if (requiresApproval) {
          throw new BadRequestException('This transition requires approval');
        }
      }

      // Allow unassigning by setting assignee to null
      if (
        Object.prototype.hasOwnProperty.call(updateTaskDto, 'assignee') &&
        !updateTaskDto.assignee
      ) {
        updateTaskDto.assignee = null;
      }

      const updatedTask = await this.taskModel
        .findByIdAndUpdate(id, updateTaskDto, { new: true })
        .populate('assignee', 'username')
        .populate('creator', 'username')
        .populate('parentTask')
        .populate('subtasks');

      // Update parent task progress if this is a subtask
      if (task.parentTask) {
        await this.updateParentTaskProgress(task.parentTask.toString());
      }

      // Emit WebSocket events based on what changed
      const changes = { ...updateTaskDto };

      // Handle status change
      if (updateTaskDto.status && updateTaskDto.status !== oldStatus) {
        await this.taskGateway.handleTaskStatusChanged(
          this.convertTaskToTaskData(updatedTask),
          oldStatus,
          updateTaskDto.status,
          userId,
        );
        // Send notification for status change
        await this.notificationsService.notifyTaskStatusChanged(task._id.toString());
      }

      // Handle assignment change
      if (updateTaskDto.assignee !== undefined && updateTaskDto.assignee !== oldAssignee) {
        if (updateTaskDto.assignee) {
          await this.taskGateway.handleTaskAssigned(
            this.convertTaskToTaskData(updatedTask),
            updateTaskDto.assignee,
            userId,
          );
          // Send notification to the newly assigned user
          await this.notificationsService.notifyTaskAssigned(task._id.toString());
        } else if (oldAssignee) {
          // Handle assignment removal - notify the user who was removed
          await this.notificationService.createAndSendNotification(oldAssignee, {
            title: 'Task Assignment Removed',
            message: `You have been removed from task: "${task.title}"`,
            type: NotificationType.TASK_ASSIGNED,
            priority: NotificationPriority.MEDIUM,
            data: { taskId: task._id.toString() },
            timestamp: new Date(),
          });
          
          // Emit WebSocket event for assignment removal
          await this.taskGateway.handleTaskAssignmentRemoved(
            this.convertTaskToTaskData(updatedTask),
            oldAssignee,
            userId,
          );
        }
      }

      // Emit general task update event
      await this.taskGateway.handleTaskUpdated(
        this.convertTaskToTaskData(updatedTask),
        userId,
        changes,
      );

      // Notify all participants (assignee, creator, watchers)
      const participantIds = [
        task.assignee?.toString(),
        task.creator?.toString(),
        ...(task.watchers || []).map((w) => w.toString()),
      ].filter(Boolean);
      for (const userId of participantIds) {
        await this.notificationService.createAndSendNotification(userId, {
          type: NotificationType.TASK_STATUS_CHANGED,
          title: 'Task Status Changed',
          message: `Task "${task.title}" status changed to ${updateTaskDto.status}`,
          taskId: task._id.toString(),
          priority: NotificationPriority.MEDIUM,
          timestamp: new Date(),
        });
      }

      return updatedTask;
    } catch (error: any) {
      if (error instanceof Error) {
        console.error('[TasksService] Error in updateTask:', error.message, error.stack);
      } else {
        console.error('[TasksService] Unknown error in updateTask:', error);
      }
      throw error;
    }
  }

  async deleteTask(id: string, userId: string) {
    const task = await this.taskModel.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.creator.toString() !== userId) {
      throw new BadRequestException('Not authorized to delete this task');
    }

    // Remove task from parent's subtasks if it's a subtask
    if (task.parentTask) {
      await this.taskModel.findByIdAndUpdate(task.parentTask, {
        $pull: { subtasks: task._id },
      });
    }

    await this.taskModel.findByIdAndDelete(id);

    // Emit WebSocket event for task deletion
    await this.taskGateway.handleTaskDeleted(id, userId);

    // Notify all participants (assignee, creator, watchers)
    const participantIds = [
      task.assignee?.toString(),
      task.creator?.toString(),
      ...(task.watchers || []).map((w) => w.toString()),
    ].filter(Boolean);
    for (const userId of participantIds) {
      await this.notificationService.createAndSendNotification(userId, {
        type: NotificationType.TASK_DELETED,
        title: 'Task Deleted',
        message: `Task "${task.title}" was deleted`,
        taskId: task._id.toString(),
        priority: NotificationPriority.MEDIUM,
        timestamp: new Date(),
      });
    }

    return { message: 'Task deleted successfully' };
  }

  async addWatcher(taskId: string, userId: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.watchers.some((watcher) => watcher.toString() === userId)) {
      throw new BadRequestException('User is already watching this task');
    }

    const updatedTask = await this.taskModel.findByIdAndUpdate(
      taskId,
      { $push: { watchers: new Types.ObjectId(userId) } },
      { new: true },
    );

    // Notify the user that they are now watching this task
    await this.notificationService.createAndSendNotification(userId, {
      title: 'Added as Watcher',
      message: `You are now watching task "${task.title}"`,
      type: NotificationType.PARTICIPANT_ADDED,
      priority: NotificationPriority.LOW,
      data: { taskId: task._id.toString() },
      timestamp: new Date(),
    });

    return updatedTask;
  }

  async removeWatcher(taskId: string, userId: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const updatedTask = await this.taskModel.findByIdAndUpdate(
      taskId,
      { $pull: { watchers: new Types.ObjectId(userId) } },
      { new: true },
    );

    // Notify the user that they are no longer watching this task
    await this.notificationService.createAndSendNotification(userId, {
      title: 'Removed as Watcher',
      message: `You are no longer watching task "${task.title}"`,
      type: NotificationType.PARTICIPANT_REMOVED,
      priority: NotificationPriority.LOW,
      data: { taskId: task._id.toString() },
      timestamp: new Date(),
    });

    return updatedTask;
  }

  private async updateParentTaskProgress(parentTaskId: string) {
    const parentTask = await this.taskModel.findById(parentTaskId).populate('subtasks');
    if (!parentTask) return;

    const subtasks = parentTask.subtasks as unknown as TaskDocument[];
    if (subtasks.length === 0) return;

    const totalProgress = subtasks.reduce((sum, subtask) => sum + (subtask.progress || 0), 0);
    const averageProgress = Math.round(totalProgress / subtasks.length);

    await this.taskModel.findByIdAndUpdate(parentTaskId, {
      progress: averageProgress,
    });
  }

  async getTasksByAssignee(assigneeId: string) {
    return this.taskModel
      .find({ assignee: assigneeId })
      .populate('creator', 'username')
      .populate('parentTask')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getTasksByCreator(creatorId: string) {
    return this.taskModel
      .find({ creator: creatorId })
      .populate('assignee', 'username')
      .populate('parentTask')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getTasksByStatus(status: TaskStatus) {
    return this.taskModel
      .find({ status })
      .populate('assignee', 'username')
      .populate('creator', 'username')
      .populate('parentTask')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getTasksByPriority(priority: TaskPriority) {
    return this.taskModel
      .find({ priority })
      .populate('assignee', 'username')
      .populate('creator', 'username')
      .populate('parentTask')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getTasksByType(type: TaskType) {
    return this.taskModel
      .find({ type })
      .populate('assignee', 'username')
      .populate('creator', 'username')
      .populate('parentTask')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getTaskStats() {
    try {
      const tasks = await this.taskModel.find().lean().exec();
      console.log('Fetched tasks for stats:', tasks);
      return {
        todo: tasks.filter((task) => task.status && task.status === TaskStatus.TODO).length,
        done: tasks.filter((task) => task.status && task.status === TaskStatus.DONE).length,
        late: tasks.filter((task) => task.status && task.status === TaskStatus.LATE).length,
        in_progress: tasks.filter((task) => task.status && task.status === TaskStatus.IN_PROGRESS)
          .length,
      };
    } catch (error) {
      console.error('[TasksService] Error in getTaskStats:', error);
      throw new BadRequestException('Failed to fetch task stats');
    }
  }

  async getWeeklyStats(): Promise<{
    todo: number;
    done: number;
    late: number;
    in_progress: number;
  }> {
    try {
      const startOfWeekFn = startOfWeek as DateFn;
      const startOfWeekDate = startOfWeekFn(new Date());
      const currentDate = new Date();
      console.log('[TasksService] getWeeklyStats - currentDate:', currentDate);
      console.log('[TasksService] getWeeklyStats - startOfWeekDate:', startOfWeekDate);

      // Get all tasks for comparison
      const allTasks = await this.taskModel.find().lean().exec();
      console.log('[TasksService] getWeeklyStats - all tasks count:', allTasks.length);

      // Get tasks that were either created this week OR updated this week
      const weeklyTasks = await this.taskModel
        .find({
          $or: [{ createdAt: { $gte: startOfWeekDate } }, { updatedAt: { $gte: startOfWeekDate } }],
        })
        .lean()
        .exec();

      console.log('[TasksService] getWeeklyStats - weekly tasks found:', weeklyTasks.length);
      console.log(
        '[TasksService] getWeeklyStats - weekly tasks:',
        weeklyTasks.map((t) => ({
          id: t._id,
          status: t.status,
          createdAt: (t as any).createdAt,
          updatedAt: (t as any).updatedAt,
          title: t.title,
        })),
      );

      // Check status distribution
      const statusCounts = weeklyTasks.reduce(
        (acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
      console.log('[TasksService] getWeeklyStats - status counts:', statusCounts);

      const result = {
        todo: weeklyTasks.filter((t) => t.status === TaskStatus.TODO).length,
        done: weeklyTasks.filter((t) => t.status === TaskStatus.DONE).length,
        late: weeklyTasks.filter((t) => t.status === TaskStatus.LATE).length,
        in_progress: weeklyTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      };

      console.log('[TasksService] getWeeklyStats - result:', result);
      return result;
    } catch (error) {
      console.error('Error in getWeeklyStats:', error);
      throw new BadRequestException('Failed to fetch weekly stats');
    }
  }

  // Alternative method for more accurate weekly stats
  async getWeeklyStatsDetailed(): Promise<{
    currentStatus: { todo: number; done: number; late: number; in_progress: number };
    weeklyActivity: { created: number; completed: number; updated: number };
  }> {
    try {
      const startOfWeekFn = startOfWeek as DateFn;
      const startOfWeekDate = startOfWeekFn(new Date());

      // Get all current tasks (regardless of when they were created)
      const allTasks = await this.taskModel.find().lean().exec();

      // Get tasks created this week
      const createdThisWeek = await this.taskModel
        .find({ createdAt: { $gte: startOfWeekDate } })
        .lean()
        .exec();

      // Get tasks updated this week
      const updatedThisWeek = await this.taskModel
        .find({ updatedAt: { $gte: startOfWeekDate } })
        .lean()
        .exec();

      // Get tasks completed this week (status changed to DONE)
      const completedThisWeek = updatedThisWeek.filter(
        (task) => task.status === TaskStatus.DONE && (task as any).updatedAt >= startOfWeekDate,
      );

      return {
        currentStatus: {
          todo: allTasks.filter((t) => t.status === TaskStatus.TODO).length,
          done: allTasks.filter((t) => t.status === TaskStatus.DONE).length,
          late: allTasks.filter((t) => t.status === TaskStatus.LATE).length,
          in_progress: allTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
        },
        weeklyActivity: {
          created: createdThisWeek.length,
          completed: completedThisWeek.length,
          updated: updatedThisWeek.length,
        },
      };
    } catch (error) {
      console.error('Error in getWeeklyStatsDetailed:', error);
      throw new BadRequestException('Failed to fetch detailed weekly stats');
    }
  }

  async getMonthlyStats(): Promise<{
    todo: number;
    done: number;
    late: number;
    in_progress: number;
  }> {
    try {
      const startOfMonthFn = startOfMonth as DateFn;
      const startOfMonthDate = startOfMonthFn(new Date());
      const tasks = await this.taskModel
        .find({
          createdAt: { $gte: startOfMonthDate },
        })
        .lean()
        .exec();

      return {
        todo: tasks.filter((t) => t.status === TaskStatus.TODO).length,
        done: tasks.filter((t) => t.status === TaskStatus.DONE).length,
        late: tasks.filter((t) => t.status === TaskStatus.LATE).length,
        in_progress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      };
    } catch (error) {
      console.error('Error in getMonthlyStats:', error);
      throw new BadRequestException('Failed to fetch monthly stats');
    }
  }

  /**
   * Add a participant to a task
   */
  async addParticipant(taskId: string, participantId: string, adminId: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Add to watchers
    await this.taskModel.findByIdAndUpdate(taskId, {
      $addToSet: { watchers: new Types.ObjectId(participantId) },
    });

    // Notify the participant
    await this.taskGateway.handleParticipantChange(
      this.convertTaskToTaskData(task),
      'added',
      participantId,
      adminId,
    );

    // Notify the participant (this will automatically send WebSocket notification)
    await this.notificationService.createAndSendNotification(participantId, {
      title: 'Participant Added',
      message: `You have been added to task "${task.title}"`,
      type: NotificationType.PARTICIPANT_ADDED,
      priority: NotificationPriority.MEDIUM,
      data: { taskId: task._id.toString() },
      timestamp: new Date(),
    });
    this.logger.log(`Push notification sent to participant ${participantId} for add event on task ${task._id}`);

    return this.taskModel.findById(taskId).populate('watchers', 'username');
  }

  /**
   * Remove a participant from a task
   */
  async removeParticipant(taskId: string, participantId: string, adminId: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Remove from watchers
    await this.taskModel.findByIdAndUpdate(taskId, {
      $pull: { watchers: new Types.ObjectId(participantId) },
    });

    // Notify the participant
    await this.taskGateway.handleParticipantChange(
      this.convertTaskToTaskData(task),
      'removed',
      participantId,
      adminId,
    );

    // Notify the participant (this will automatically send WebSocket notification)
    await this.notificationService.createAndSendNotification(participantId, {
      title: 'Participant Removed',
      message: `You have been removed from task "${task.title}"`,
      type: NotificationType.PARTICIPANT_REMOVED,
      priority: NotificationPriority.MEDIUM,
      data: { taskId: task._id.toString() },
      timestamp: new Date(),
    });
    this.logger.log(`Push notification sent to participant ${participantId} for remove event on task ${task._id}`);

    return this.taskModel.findById(taskId).populate('watchers', 'username');
  }

  /**
   * Get tasks that are overdue
   */
  async getOverdueTasks() {
    const now = new Date();
    return this.taskModel
      .find({
        deadline: { $lt: now },
        status: { $nin: [TaskStatus.DONE, TaskStatus.LATE] },
      })
      .populate('assignee', 'username')
      .populate('creator', 'username')
      .sort({ deadline: 1 })
      .exec();
  }

  /**
   * Get tasks with upcoming deadlines (within 24 hours)
   */
  async getUpcomingDeadlineTasks() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return this.taskModel
      .find({
        deadline: { $gte: now, $lte: tomorrow },
        status: { $nin: [TaskStatus.DONE, TaskStatus.LATE] },
      })
      .populate('assignee', 'username')
      .populate('creator', 'username')
      .sort({ deadline: 1 })
      .exec();
  }

  /**
   * Check for upcoming deadlines and send reminders
   */
  async checkUpcomingDeadlines() {
    const upcomingTasks = await this.getUpcomingDeadlineTasks();

    for (const task of upcomingTasks) {
      this.taskGateway.handleDeadlineReminder(this.convertTaskToTaskData(task));
      // Send email notification using NotificationsService
      await this.notificationsService.notifyTaskDeadlineApproaching(task._id.toString());
    }
  }

  // Example for task assignment:
  async assignTask(taskId: string, assigneeId: string, assignerId: string) {
    const task = await this.taskModel.findByIdAndUpdate(
      taskId,
      { assignee: assigneeId },
      { new: true },
    );
    if (!task) throw new NotFoundException('Task not found');

    // Send email and in-app notification using NotificationsService
    await this.notificationsService.notifyTaskAssigned(taskId);

    return task;
  }

  // Example for status change:
  async updateTaskStatus(taskId: string, newStatus: TaskStatus, updaterId: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');

    // Validate status transition
    if (newStatus === TaskStatus.PENDING_APPROVAL) {
      if (task.status === TaskStatus.DONE || task.status === TaskStatus.LATE) {
        throw new BadRequestException(
          `Cannot set status to 'pending_approval' for a task that is ${task.status}. Only tasks in 'todo' or 'in_progress' status can be set to pending approval.`,
        );
      }
    }

    // Prevent changing status of done/late tasks to pending_approval
    if ((task.status === TaskStatus.DONE || task.status === TaskStatus.LATE) && 
        newStatus === TaskStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        `Cannot change status of a ${task.status} task to pending_approval.`,
      );
    }

    const updatedTask = await this.taskModel.findByIdAndUpdate(
      taskId,
      { status: newStatus },
      { new: true },
    );

    // Send email and in-app notification using NotificationsService
    await this.notificationsService.notifyTaskStatusChanged(taskId);

    return updatedTask;
  }
}
