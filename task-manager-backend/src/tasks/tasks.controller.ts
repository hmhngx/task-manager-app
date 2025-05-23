import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './task.schema';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: { id: string; username: string };
}

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  getAllTasks(@Request() req: RequestWithUser): Promise<Task[]> {
    return this.tasksService.getAllTasks(req.user.id);
  }

  @Get(':id')
  getTaskById(
    @Param('id') id: string,
    @Request() req: RequestWithUser
  ): Promise<Task> {
    return this.tasksService.getTaskById(id, req.user.id);
  }

  @Post()
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: RequestWithUser
  ): Promise<Task> {
    return this.tasksService.createTask(createTaskDto, req.user.id);
  }

  @Patch(':id')
  updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: RequestWithUser
  ): Promise<Task> {
    return this.tasksService.updateTask(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  deleteTask(
    @Param('id') id: string,
    @Request() req: RequestWithUser
  ): Promise<void> {
    return this.tasksService.deleteTask(id, req.user.id);
  }
}
