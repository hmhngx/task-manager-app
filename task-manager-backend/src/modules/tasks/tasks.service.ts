import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument, TaskStatus } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { startOfWeek, startOfMonth } from 'date-fns';

type DateFn = {
  (date: Date | number): Date;
  (date: Date | number, options?: { weekStartsOn?: number }): Date;
};

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<TaskDocument> {
    const createdTask = new this.taskModel({
      ...createTaskDto,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await createdTask.save();
  }

  async findAll(userId: string): Promise<TaskDocument[]> {
    return this.taskModel.find({ userId }).exec();
  }

  async findByUserId(userId: string): Promise<TaskDocument[]> {
    return this.taskModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: string): Promise<TaskDocument> {
    const task = await this.taskModel.findOne({ _id: id, userId }).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async findOneByUserId(id: string, userId: string): Promise<TaskDocument> {
    const task = await this.taskModel.findOne({ _id: id, userId }).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<TaskDocument> {
    const updatedTask = await this.taskModel
      .findOneAndUpdate(
        { _id: id, userId },
        { ...updateTaskDto, updatedAt: new Date() },
        { new: true },
      )
      .exec();
    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return updatedTask;
  }

  async updateByUserId(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<TaskDocument> {
    const updatedTask = await this.taskModel
      .findOneAndUpdate(
        { _id: id, userId },
        { ...updateTaskDto, updatedAt: new Date() },
        { new: true },
      )
      .exec();
    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return updatedTask;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.taskModel.deleteOne({ _id: id, userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  async removeByUserId(id: string, userId: string): Promise<void> {
    const result = await this.taskModel.deleteOne({ _id: id, userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  async getWeeklyStats(userId: string): Promise<{ todo: number; done: number; late: number }> {
    const startOfWeekFn = startOfWeek as DateFn;
    const startOfWeekDate = startOfWeekFn(new Date());
    const tasks = await this.taskModel
      .find({
        userId,
        createdAt: { $gte: startOfWeekDate },
      })
      .exec();

    return {
      todo: tasks.filter((t) => t.status === TaskStatus.TODO).length,
      done: tasks.filter((t) => t.status === TaskStatus.DONE).length,
      late: tasks.filter((t) => t.status === TaskStatus.LATE).length,
    };
  }

  async getMonthlyStats(userId: string): Promise<{ todo: number; done: number; late: number }> {
    const startOfMonthFn = startOfMonth as DateFn;
    const startOfMonthDate = startOfMonthFn(new Date());
    const tasks = await this.taskModel
      .find({
        userId,
        createdAt: { $gte: startOfMonthDate },
      })
      .exec();

    return {
      todo: tasks.filter((t) => t.status === TaskStatus.TODO).length,
      done: tasks.filter((t) => t.status === TaskStatus.DONE).length,
      late: tasks.filter((t) => t.status === TaskStatus.LATE).length,
    };
  }

  async getAllTasks(): Promise<any[]> {
    return this.taskModel.find().lean().exec();
  }
}
