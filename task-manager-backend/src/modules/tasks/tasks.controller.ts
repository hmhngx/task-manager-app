import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    id: string;
    username: string;
    role: UserRole;
  };
}

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.ADMIN)
  create(@Body() createTaskDto: CreateTaskDto, @Req() req: RequestWithUser) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  findAll(@Req() req: RequestWithUser) {
    if (req.user.role === UserRole.ADMIN) {
      return this.tasksService.findAll(req.user.id);
    }
    return this.tasksService.findByUserId(req.user.id);
  }

  @Get('stats/weekly')
  getWeeklyStats(@Req() req: RequestWithUser) {
    return this.tasksService.getWeeklyStats(req.user.id);
  }

  @Get('stats/monthly')
  getMonthlyStats(@Req() req: RequestWithUser) {
    return this.tasksService.getMonthlyStats(req.user.id);
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  async getAllTasksForAdmin(): Promise<any[]> {
    try {
      return await this.tasksService.getAllTasks();
    } catch (err) {
      console.error('Error in getAllTasksForAdmin:', err);
      throw err;
    }
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    if (req.user.role === UserRole.ADMIN) {
      return this.tasksService.findOne(id, req.user.id);
    }
    return this.tasksService.findOneByUserId(id, req.user.id);
  }

  @Patch(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.role === UserRole.ADMIN) {
      return this.tasksService.update(id, updateTaskDto, req.user.id);
    }
    return this.tasksService.updateByUserId(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    if (req.user.role === UserRole.ADMIN) {
      return this.tasksService.remove(id, req.user.id);
    }
    return this.tasksService.removeByUserId(id, req.user.id);
  }
}
