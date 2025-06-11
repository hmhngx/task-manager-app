import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from '../tasks/schemas/task.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
  ) {}

  async getFilteredTasks(startDate: Date, endDate: Date, type?: string) {
    const query: any = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (type && type !== 'All') {
      query.type = type;
    }

    return this.taskModel.find(query).sort({ createdAt: -1 }).exec();
  }
} 