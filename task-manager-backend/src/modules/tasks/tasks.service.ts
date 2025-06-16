import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument, TaskStatus, TaskType, TaskPriority } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { WorkflowsService } from './services/workflows.service';
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

    return task;
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
        $pull: { subtasks: id },
      });
    }

    // Delete all subtasks
    if (task.subtasks.length > 0) {
      await this.taskModel.deleteMany({ _id: { $in: task.subtasks } });
    }

    return this.taskModel.findByIdAndDelete(id);
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

  async getWeeklyStats(): Promise<{ todo: number; done: number; late: number; in_progress: number }> {
    try {
    const startOfWeekFn = startOfWeek as DateFn;
    const startOfWeekDate = startOfWeekFn(new Date());
    const tasks = await this.taskModel
      .find({
        createdAt: { $gte: startOfWeekDate },
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
      console.error('Error in getWeeklyStats:', error);
      throw new BadRequestException('Failed to fetch weekly stats');
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
}
