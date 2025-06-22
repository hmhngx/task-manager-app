import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument, TaskStatus, TaskType, TaskPriority } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { WorkflowsService } from './services/workflows.service';
import { TaskGateway } from '../websocket/gateways/task.gateway';
import { startOfWeek, startOfMonth } from 'date-fns';

type DateFn = {
  (date: Date | number): Date;
  (date: Date | number, options?: { weekStartsOn?: number }): Date;
};

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    private readonly workflowsService: WorkflowsService,
    @Inject(forwardRef(() => TaskGateway))
    private readonly taskGateway: TaskGateway,
  ) {}

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
    await this.taskGateway.handleTaskCreated(task, creatorId);

    return task;
  }

  /**
   * Create a task request that requires admin approval
   */
  async createTaskRequest(createTaskDto: CreateTaskDto, requesterId: string) {
    const task = await this.taskModel.create({
      ...createTaskDto,
      creator: requesterId,
      userId: requesterId,
      status: TaskStatus.PENDING_APPROVAL,
      priority: createTaskDto.priority || TaskPriority.MEDIUM,
      requesters: [requesterId],
    });

    // Emit WebSocket event for task request
    await this.taskGateway.handleTaskCreated(task, requesterId);

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
    const updatedTask = await this.taskModel.findByIdAndUpdate(
      taskId,
      { status: newStatus },
      { new: true }
    ).populate('creator', 'username');

    // Notify the requester about the decision
    await this.taskGateway.handleTaskRequestResponse(
      updatedTask,
      task.creator.toString(),
      approved,
      adminId
    );

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
          updatedTask,
          oldStatus,
          updateTaskDto.status,
          userId,
        );
      }

      // Handle assignment change
      if (updateTaskDto.assignee !== undefined && updateTaskDto.assignee !== oldAssignee) {
        if (updateTaskDto.assignee) {
          await this.taskGateway.handleTaskAssigned(updatedTask, updateTaskDto.assignee, userId);
        }
      }

      // Emit general task update event
      await this.taskGateway.handleTaskUpdated(updatedTask, userId, changes);

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

    return this.taskModel.findByIdAndUpdate(
      taskId,
      { $push: { watchers: new Types.ObjectId(userId) } },
      { new: true },
    );
  }

  async removeWatcher(taskId: string, userId: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.taskModel.findByIdAndUpdate(
      taskId,
      { $pull: { watchers: new Types.ObjectId(userId) } },
      { new: true },
    );
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
        in_progress: tasks.filter((task) => task.status && task.status === TaskStatus.IN_PROGRESS).length,
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
          $or: [
            { createdAt: { $gte: startOfWeekDate } },
            { updatedAt: { $gte: startOfWeekDate } },
          ],
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
      const statusCounts = weeklyTasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
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
      const completedThisWeek = updatedThisWeek.filter(task => 
        task.status === TaskStatus.DONE && 
        (task as any).updatedAt >= startOfWeekDate
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
        }
      };
    } catch (error) {
      console.error('Error in getWeeklyStatsDetailed:', error);
      throw new BadRequestException('Failed to fetch detailed weekly stats');
    }
  }

  async getMonthlyStats(): Promise<{ todo: number; done: number; late: number; in_progress: number }> {
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

    // Add to watchers if not already present
    if (!task.watchers.some((watcher) => watcher.toString() === participantId)) {
      await this.taskModel.findByIdAndUpdate(taskId, {
        $push: { watchers: new Types.ObjectId(participantId) },
      });
    }

    // Notify the participant
    await this.taskGateway.handleParticipantChange(task, 'added', participantId, adminId);

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
    await this.taskGateway.handleParticipantChange(task, 'removed', participantId, adminId);

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
   * Check for overdue tasks and send notifications
   */
  async checkOverdueTasks() {
    const overdueTasks = await this.getOverdueTasks();
    
    for (const task of overdueTasks) {
      await this.taskGateway.handleOverdueTask(task);
    }
  }

  /**
   * Check for upcoming deadlines and send reminders
   */
  async checkUpcomingDeadlines() {
    const upcomingTasks = await this.getUpcomingDeadlineTasks();
    
    for (const task of upcomingTasks) {
      await this.taskGateway.handleDeadlineReminder(task);
    }
  }
}
