import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TasksService } from './tasks.service';
import { Task } from './task.schema';
import { NotFoundException } from '@nestjs/common';

interface MockModel {
  find: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  findOneAndUpdate: jest.Mock;
  deleteOne: jest.Mock;
}

describe('TasksService', () => {
  let service: TasksService;
  let model: MockModel;

  const mockTask = {
    _id: '1',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    userId: 'user1',
    category: 'Work',
  };

  beforeEach(async () => {
    const mockModel = {
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockTask]),
      }),
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      }),
      create: jest.fn().mockResolvedValue(mockTask),
      findOneAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      }),
      deleteOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: getModelToken(Task.name), useValue: mockModel }],
    }).compile();

    service = module.get<TasksService>(TasksService);
    model = module.get(getModelToken(Task.name));
  });

  it('should create a task', async () => {
    const createTaskDto = {
      title: 'Test Task',
      description: 'Test Description',
    };
    const task = await service.createTask(createTaskDto, 'user1');
    expect(task).toEqual(mockTask);
  });

  it('should get all tasks for a user', async () => {
    const tasks = await service.getAllTasks('user1');
    expect(tasks).toEqual([mockTask]);
  });

  it('should throw NotFoundException for invalid task ID', async () => {
    model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.getTaskById('invalid', 'user1')).rejects.toThrow(NotFoundException);
  });
});
