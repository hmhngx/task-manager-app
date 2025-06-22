import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.schema';
import { Request, Response } from 'express';
import { CommentsService } from './services/comments.service';
import { AttachmentsService } from './services/attachments.service';
import { WorkflowsService } from './services/workflows.service';
import { TaskStatus, TaskType, TaskPriority } from './schemas/task.schema';

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
  constructor(
    private readonly tasksService: TasksService,
    private readonly commentsService: CommentsService,
    private readonly attachmentsService: AttachmentsService,
    private readonly workflowsService: WorkflowsService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createTaskDto: CreateTaskDto, @Req() req: RequestWithUser) {
    return this.tasksService.createTask(createTaskDto, req.user.id);
  }

  @Get()
  getAll(@Query() query: any) {
    return this.tasksService.getAllTasks(query);
  }

  @Get('my-tasks')
  getMyTasks(@Req() req: RequestWithUser) {
    return this.tasksService.getTasksByAssignee(req.user.id);
  }

  @Get('created-by-me')
  getCreatedByMe(@Req() req: RequestWithUser) {
    return this.tasksService.getTasksByCreator(req.user.id);
  }

  @Get('status/:status')
  getByStatus(@Param('status') status: TaskStatus) {
    return this.tasksService.getTasksByStatus(status);
  }

  @Get('priority/:priority')
  getByPriority(@Param('priority') priority: TaskPriority) {
    return this.tasksService.getTasksByPriority(priority);
  }

  @Get('type/:type')
  getByType(@Param('type') type: TaskType) {
    return this.tasksService.getTasksByType(type);
  }

  @Get('stats')
  async getTaskStats() {
    try {
      return await this.tasksService.getTaskStats();
    } catch (error) {
      if (error instanceof Error) {
        console.error('[TasksController] Error in /tasks/stats:', error.message, error.stack);
      } else {
        console.error('[TasksController] Unknown error in /tasks/stats:', error);
      }
      throw new BadRequestException('Failed to fetch task stats');
    }
  }

  @Get('stats/weekly')
  async getWeeklyStats() {
    try {
      return await this.tasksService.getWeeklyStats();
    } catch (error) {
      if (error instanceof Error) {
        console.error('[TasksController] Error in /tasks/stats/weekly:', error.message, error.stack);
      } else {
        console.error('[TasksController] Unknown error in /tasks/stats/weekly:', error);
      }
      throw new BadRequestException('Failed to fetch weekly stats');
    }
  }

  @Get('stats/weekly/detailed')
  async getWeeklyStatsDetailed() {
    try {
      return await this.tasksService.getWeeklyStatsDetailed();
    } catch (error) {
      if (error instanceof Error) {
        console.error('[TasksController] Error in /tasks/stats/weekly/detailed:', error.message, error.stack);
      } else {
        console.error('[TasksController] Unknown error in /tasks/stats/weekly/detailed:', error);
      }
      throw new BadRequestException('Failed to fetch detailed weekly stats');
    }
  }

  @Get('stats/monthly')
  async getMonthlyStats() {
    try {
      return await this.tasksService.getMonthlyStats();
    } catch (error) {
      if (error instanceof Error) {
        console.error('[TasksController] Error in /tasks/stats/monthly:', error.message, error.stack);
      } else {
        console.error('[TasksController] Unknown error in /tasks/stats/monthly:', error);
      }
      throw new BadRequestException('Failed to fetch monthly stats');
    }
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.tasksService.getTaskById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: RequestWithUser,
  ) {
    console.log('[TasksController] PATCH /tasks/:id', {
      id,
      updateTaskDto,
      userId: req.user.id,
      userRole: req.user.role,
    });
    try {
      return await this.tasksService.updateTask(id, updateTaskDto, req.user.id, req.user.role);
    } catch (error) {
      if (error instanceof Error) {
        console.error('[TasksController] Error updating task:', error.message, error.stack);
      } else {
        console.error('[TasksController] Unknown error updating task:', error);
      }
      throw error;
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.tasksService.deleteTask(id, req.user.id);
  }

  // Comments endpoints
  @Post(':id/comments')
  createComment(
    @Param('id') taskId: string,
    @Body('content') content: string,
    @Body('mentions') mentions: string[],
    @Req() req: RequestWithUser,
  ) {
    return this.commentsService.createComment(taskId, content, req.user.id, mentions);
  }

  @Get(':id/comments')
  getComments(@Param('id') taskId: string) {
    return this.commentsService.getTaskComments(taskId);
  }

  @Patch('comments/:commentId')
  updateComment(
    @Param('commentId') commentId: string,
    @Body('content') content: string,
    @Req() req: RequestWithUser,
  ) {
    return this.commentsService.updateComment(commentId, content, req.user.id);
  }

  @Delete('comments/:commentId')
  deleteComment(@Param('commentId') commentId: string, @Req() req: RequestWithUser) {
    return this.commentsService.deleteComment(commentId, req.user.id);
  }

  // Attachments endpoints
  @Post(':id/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        // Allow images and common document types
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('File type not allowed'), false);
        }
      },
    }),
  )
  async uploadAttachment(
    @Param('id') taskId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    try {
      return await this.attachmentsService.createAttachment(file, req.user.id, taskId);
    } catch (error) {
      if (error instanceof Error) {
        console.error('[uploadAttachment] Error uploading attachment:', error.message, error.stack);
      } else {
        console.error('[uploadAttachment] Unknown error:', error);
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(`Attachment upload failed: ${errorMessage}`);
    }
  }

  @Get('attachments/:id')
  async getAttachment(
    @Param('id') attachmentId: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: RequestWithUser,
  ) {
    try {
      console.log(`[TasksController] Downloading attachment`, { attachmentId, user: req.user });
      const { data, mimeType } = await this.attachmentsService.getAttachmentData(attachmentId);
      res.set({
        'Content-Type': mimeType,
        'Content-Length': data.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      });
      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('[getAttachment] Error retrieving attachment:', error.message, error.stack);
      } else {
        console.error('[getAttachment] Unknown error:', error);
      }
      throw new BadRequestException('Failed to retrieve attachment');
    }
  }

  @Get(':id/attachments')
  getAttachments(@Param('id') taskId: string) {
    return this.attachmentsService.getTaskAttachments(taskId);
  }

  @Delete('attachments/:attachmentId')
  async deleteAttachment(@Param('attachmentId') attachmentId: string, @Req() req: RequestWithUser) {
    try {
      console.log(`[TasksController] Deleting attachment`, { attachmentId, user: req.user });
      return await this.attachmentsService.deleteAttachment(attachmentId, req.user.id);
    } catch (error) {
      if (error instanceof Error) {
        console.error('[deleteAttachment] Error deleting attachment:', error.message, error.stack);
      } else {
        console.error('[deleteAttachment] Unknown error:', error);
      }
      throw new BadRequestException('Failed to delete attachment');
    }
  }

  @Get('attachments/:id/download')
  async downloadAttachment(
    @Param('id') attachmentId: string,
    @Res() res: Response,
  ) {
    try {
      const attachment: { data: Buffer; mimeType: string; originalName: string } = await this.attachmentsService.getAttachmentForDownload(attachmentId);
      res.set({
        'Content-Type': attachment.mimeType,
        'Content-Length': attachment.data.length,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(attachment.originalName)}"`,
        'Cache-Control': 'no-cache',
      });
      res.send(attachment.data);
    } catch (error) {
      if (error instanceof Error) {
        console.error('[downloadAttachment] Error downloading attachment:', error.message, error.stack);
      } else {
        console.error('[downloadAttachment] Unknown error:', error);
      }
      res.status(400).json({ message: 'Failed to download attachment' });
    }
  }

  // Workflow endpoints
  @Post(':id/request')
  requestTask(@Param('id') taskId: string, @Req() req: RequestWithUser) {
    return this.workflowsService.requestApproval(taskId, req.user.id);
  }

  @Post(':id/approve/:requesterId')
  @Roles(UserRole.ADMIN)
  approveRequest(
    @Param('id') taskId: string,
    @Param('requesterId') requesterId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.workflowsService.approveRequest(taskId, req.user.id, requesterId);
  }

  @Post(':id/reject/:requesterId')
  @Roles(UserRole.ADMIN)
  rejectRequest(@Param('id') taskId: string, @Param('requesterId') requesterId: string) {
    return this.workflowsService.rejectRequest(taskId, requesterId);
  }

  // Watchers endpoints
  @Post(':id/watchers')
  addWatcher(@Param('id') taskId: string, @Req() req: RequestWithUser) {
    return this.tasksService.addWatcher(taskId, req.user.id);
  }

  @Delete(':id/watchers')
  removeWatcher(@Param('id') taskId: string, @Req() req: RequestWithUser) {
    return this.tasksService.removeWatcher(taskId, req.user.id);
  }
}
