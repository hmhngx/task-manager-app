import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskStatus, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<TaskDocument> {
    try {
      // Validate deadline is in the future
      if (createTaskDto.deadline < new Date()) {
        throw new BadRequestException('Deadline must be in the future');
      }

      const task = new this.taskModel({
        ...createTaskDto,
        userId: userId,
        status: TaskStatus.TODO,
      });
      return await task.save();
    } catch (error) {
      this.logger.error(
        `Error creating task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findAll(userId: string): Promise<TaskDocument[]> {
    try {
      return await this.taskModel.find({ userId: userId }).sort({ deadline: 1 }).exec();
    } catch (error) {
      this.logger.error(
        `Error finding tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findOne(id: string, userId: string): Promise<TaskDocument> {
    try {
      const task = await this.taskModel.findOne({ _id: id, userId: userId }).exec();
      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      return task;
    } catch (error) {
      this.logger.error(
        `Error finding task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<TaskDocument> {
    try {
      const task = await this.findOne(id, userId);

      // If task is being marked as done
      if (updateTaskDto.status === TaskStatus.DONE) {
        task.status = TaskStatus.DONE;
      } else if (updateTaskDto.deadline) {
        // Validate new deadline is in the future
        if (updateTaskDto.deadline < new Date()) {
          throw new BadRequestException('Deadline must be in the future');
        }
        // Check if task is late
        if (updateTaskDto.deadline < new Date() && task.status !== TaskStatus.DONE) {
          task.status = TaskStatus.LATE;
        }
      }

      Object.assign(task, updateTaskDto);
      return await task.save();
    } catch (error) {
      this.logger.error(
        `Error updating task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const result = await this.taskModel.deleteOne({ _id: id, userId: userId }).exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
    } catch (error) {
      this.logger.error(
        `Error removing task: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async getWeeklyStats(userId: string): Promise<{ todo: number; done: number; late: number }> {
    try {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));

      const tasks = await this.taskModel
        .find({
          userId: userId,
          deadline: { $gte: startOfWeek, $lte: endOfWeek },
        })
        .exec();

      return {
        todo: tasks.filter((task) => task.status === TaskStatus.TODO).length,
        done: tasks.filter((task) => task.status === TaskStatus.DONE).length,
        late: tasks.filter((task) => task.status === TaskStatus.LATE).length,
      };
    } catch (error) {
      this.logger.error(
        `Error getting weekly stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async getMonthlyStats(userId: string): Promise<{ todo: number; done: number; late: number }> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const tasks = await this.taskModel
        .find({
          userId: userId,
          deadline: { $gte: startOfMonth, $lte: endOfMonth },
        })
        .exec();

      return {
        todo: tasks.filter((task) => task.status === TaskStatus.TODO).length,
        done: tasks.filter((task) => task.status === TaskStatus.DONE).length,
        late: tasks.filter((task) => task.status === TaskStatus.LATE).length,
      };
    } catch (error) {
      this.logger.error(
        `Error getting monthly stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
