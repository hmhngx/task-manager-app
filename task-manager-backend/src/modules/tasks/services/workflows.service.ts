import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workflow, WorkflowDocument, WorkflowTransition } from '../schemas/workflow.schema';
import { Task, TaskDocument, TaskStatus } from '../schemas/task.schema';
import { NotificationService } from '../../notifications/services/notification.service';
import {
  NotificationType,
  NotificationPriority,
} from '../../../shared/interfaces/notification.interface';
import { TaskGateway } from '../../websocket/gateways/task.gateway';
import { TaskData } from '../../../shared/interfaces/websocket.interface';
import { UsersService } from '../../users/users.service';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    @InjectModel(Workflow.name) private workflowModel: Model<WorkflowDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
    @Inject(forwardRef(() => TaskGateway))
    private taskGateway: TaskGateway,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async createWorkflow(
    name: string,
    description: string,
    statuses: string[],
    transitions: WorkflowTransition[],
    createdBy: string,
    approvers: string[] = [],
  ) {
    const existingWorkflow = await this.workflowModel.findOne({ name });
    if (existingWorkflow) {
      throw new BadRequestException('Workflow with this name already exists');
    }

    return this.workflowModel.create({
      name,
      description,
      statuses,
      transitions,
      createdBy,
      approvers,
    });
  }

  async getWorkflows() {
    return this.workflowModel
      .find()
      .populate('createdBy', 'username')
      .populate('approvers', 'username')
      .exec();
  }

  async getWorkflow(id: string) {
    const workflow = await this.workflowModel
      .findById(id)
      .populate('createdBy', 'username')
      .populate('approvers', 'username');

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return workflow;
  }

  async updateWorkflow(id: string, updates: Partial<Workflow>, userId: string) {
    const workflow = await this.workflowModel.findById(id);
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    if (workflow.createdBy.toString() !== userId) {
      throw new BadRequestException('Not authorized to update this workflow');
    }

    return this.workflowModel.findByIdAndUpdate(id, updates, { new: true });
  }

  async deleteWorkflow(id: string, userId: string) {
    const workflow = await this.workflowModel.findById(id);
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    if (workflow.createdBy.toString() !== userId) {
      throw new BadRequestException('Not authorized to delete this workflow');
    }

    // Check if workflow is in use
    const tasksUsingWorkflow = await this.taskModel.findOne({ workflow: id });
    if (tasksUsingWorkflow) {
      throw new BadRequestException('Cannot delete workflow that is in use by tasks');
    }

    return this.workflowModel.findByIdAndDelete(id);
  }

  async validateTransition(
    workflowId: string,
    fromStatus: string,
    toStatus: string,
    userRole: string,
  ) {
    // Defensive check: skip validation if workflowId is missing or invalid
    if (!workflowId || typeof workflowId !== 'string' || !workflowId.match(/^[a-f\d]{24}$/i)) {
      // If no workflow, allow all transitions
      return { isValid: true, requiresApproval: false };
    }
    const workflow = await this.workflowModel.findById(workflowId);
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const transition = workflow.transitions.find((t) => t.from === fromStatus && t.to === toStatus);

    if (!transition) {
      throw new BadRequestException('Invalid transition');
    }

    if (transition.allowedRoles.length > 0 && !transition.allowedRoles.includes(userRole)) {
      throw new BadRequestException('User role not allowed for this transition');
    }

    return {
      isValid: true,
      requiresApproval: transition.requiresApproval,
    };
  }

  async requestApproval(taskId: string, userId: string) {
    this.logger.log(`🔄 User ${userId} requesting approval for task ${taskId}`);
    this.logger.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      this.logger.error(`❌ Task ${taskId} not found for approval request`);
      throw new NotFoundException('Task not found');
    }

    this.logger.log(`📋 Task title: ${task.title}`);
    this.logger.log(
      `👤 Current requesters: ${task.requesters.map((r) => r.toString()).join(', ')}`,
    );
    this.logger.log(`📊 Current status: ${task.status}`);
    this.logger.log(
      `👤 Current assignee: ${task.assignee ? task.assignee.toString() : 'Unassigned'}`,
    );
    this.logger.log(`👤 Task creator: ${task.creator.toString()}`);

    // Check if task is in a state that allows requests
    if (task.status === TaskStatus.DONE || task.status === TaskStatus.LATE) {
      this.logger.warn(`⚠️ Task ${taskId} is in ${task.status} status and cannot be requested`);
      throw new BadRequestException(
        `Cannot request a task that is ${task.status}. Only tasks in 'todo' or 'in_progress' status can be requested.`,
      );
    }

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      this.logger.error(`❌ Invalid user ID format: ${userId}`);
      throw new BadRequestException('Invalid user ID format');
    }

    const userIdObj = new Types.ObjectId(userId);
    
    // Check if user is the creator of the task
    if (task.creator.toString() === userIdObj.toString()) {
      this.logger.warn(`⚠️ User ${userId} is the creator of task ${taskId}`);
      throw new BadRequestException('You cannot request your own task');
    }
    
    // Check if user is already assigned to the task
    if (task.assignee && task.assignee.toString() === userIdObj.toString()) {
      this.logger.warn(`⚠️ User ${userId} is already assigned to task ${taskId}`);
      throw new BadRequestException('You are already assigned to this task');
    }
    
    // Check if user has already requested this task
    if (task.requesters.some((requester) => requester.toString() === userIdObj.toString())) {
      this.logger.warn(`⚠️ User ${userId} has already requested task ${taskId}`);
      throw new BadRequestException('You have already requested this task');
    }

    this.logger.log(`✅ Adding user ${userId} to requesters for task ${taskId}`);
    
    // Store the old status for WebSocket event
    const oldStatus = task.status;
    
    // Only change status to pending_approval if task is currently in todo status
    // Otherwise, preserve the current status
    const updateData: any = {
      $push: { requesters: userIdObj },
    };
    
    if (task.status === TaskStatus.TODO) {
      updateData.status = TaskStatus.PENDING_APPROVAL;
      this.logger.log(`✅ Task status updated to pending_approval`);
    } else {
      this.logger.log(`✅ Task status preserved as ${task.status}`);
    }
    
    const updatedTask = await this.taskModel.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true },
    );

    this.logger.log(`✅ User ${userId} successfully added to requesters`);
    
    // Emit WebSocket events if status changed
    if (oldStatus !== updatedTask.status) {
      this.logger.log(`📡 Emitting WebSocket event for status change from ${oldStatus} to ${updatedTask.status}`);
      this.taskGateway.handleTaskStatusChanged(
        this.convertTaskToTaskData(updatedTask),
        oldStatus,
        updatedTask.status,
        userId
      );
    }
    
    // Emit task updated event
    this.taskGateway.handleTaskUpdated(
      this.convertTaskToTaskData(updatedTask),
      userId,
      { status: updatedTask.status, requesters: updatedTask.requesters }
    );
    
    // Get requester details for personalized notifications
    const requester = await this.usersService.findById(userId);
    this.logger.log(`👤 Requester details retrieved: ${requester?.username || 'Unknown'}`);
    
    // Send confirmation notification to the requester
    await this.notificationService.createAndSendNotification(userId, {
      title: 'Task Request Submitted',
      message: `You have requested assignment for task: "${task.title}"`,
      type: NotificationType.TASK_REQUEST_CONFIRMATION,
      priority: NotificationPriority.MEDIUM,
      data: { taskId: task._id.toString() },
      timestamp: new Date(),
    });
    this.logger.log(`📧 Confirmation notification sent to requester ${userId}`);
    
    // Notify all admins about the request
    const adminUsers = await this.usersService.findAdmins();
    this.logger.log(`👨‍💼 Found ${adminUsers.length} admin users to notify`);
    
    for (const admin of adminUsers) {
      await this.notificationService.createAndSendNotification(admin._id.toString(), {
        title: 'New Task Assignment Request',
        message: `"${requester?.username || 'User'}" has requested assignment for task: "${task.title}"`,
        type: NotificationType.TASK_REQUEST,
        priority: NotificationPriority.MEDIUM,
        data: { taskId: task._id.toString() },
        timestamp: new Date(),
      });
      this.logger.log(`📧 Admin notification sent to ${admin.username} (${admin._id.toString()})`);
    }
    
    return updatedTask;
  }

  private convertTaskToTaskData(task: Task): TaskData {
    return {
      _id: task._id.toString(),
      title: task.title,
      description: task.description,
      type: task.type,
      priority: task.priority,
      labels: task.labels || [],
      deadline: task.deadline,
      status: task.status,
      userId: task.userId.toString(),
      assignee: task.assignee ? task.assignee.toString() : undefined,
      creator: task.creator.toString(),
      parentTask: task.parentTask ? task.parentTask.toString() : undefined,
      subtasks: task.subtasks ? task.subtasks.map(subtask => subtask.toString()) : [],
      comments: task.comments ? task.comments.map(comment => comment.toString()) : [],
      attachments: task.attachments ? task.attachments.map(attachment => attachment.toString()) : [],
      progress: task.progress || 0,
      watchers: task.watchers ? task.watchers.map(watcher => watcher.toString()) : [],
      requesters: task.requesters ? task.requesters.map(requester => requester.toString()) : [],
      workflow: task.workflow,
    };
  }

  async approveRequest(taskId: string, approverId: string, requesterId: string) {
    this.logger.log(`✅ Admin ${approverId} approving request for task ${taskId}`);
    this.logger.log(`👤 Requester ID: ${requesterId}`);
    this.logger.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      this.logger.error(`❌ Task ${taskId} not found for approval`);
      throw new NotFoundException('Task not found');
    }

    this.logger.log(`📋 Task title: ${task.title}`);
    this.logger.log(`👤 Current requesters: ${task.requesters.map((r) => r.toString()).join(', ')}`);

    if (!requesterId.match(/^[0-9a-fA-F]{24}$/)) {
      this.logger.error(`❌ Invalid requester ID format: ${requesterId}`);
      throw new BadRequestException('Invalid requester ID format');
    }

    const requesterIdObj = new Types.ObjectId(requesterId);
    if (!task.requesters.some((requester) => requester.toString() === requesterIdObj.toString())) {
      this.logger.warn(`⚠️ User ${requesterId} has not requested task ${taskId}`);
      throw new BadRequestException('User has not requested this task');
    }

    this.logger.log(`✅ Assigning task ${taskId} to requester ${requesterId}`);
    this.logger.log(`✅ Removing requester ${requesterId} from requesters list`);
    this.logger.log(`✅ Updating task status to in_progress`);

    const oldStatus = task.status;
    const updatedTask = await this.taskModel.findByIdAndUpdate(
      taskId,
      {
        assignee: requesterIdObj,
        $pull: { requesters: requesterIdObj },
        status: 'in_progress',
      },
      { new: true },
    );

    this.logger.log(`✅ Task ${taskId} successfully approved and assigned to ${requesterId}`);
    
    // Emit WebSocket events
    this.taskGateway.handleTaskStatusChanged(
      this.convertTaskToTaskData(updatedTask),
      oldStatus,
      updatedTask.status,
      approverId
    );
    
    this.taskGateway.handleTaskAssigned(
      this.convertTaskToTaskData(updatedTask),
      requesterId,
      approverId
    );
    
    // Notify the requester that their request was approved
    await this.notificationService.createAndSendNotification(requesterId, {
      title: 'Task Request Approved',
      message: `Your request for task "${task.title}" has been approved`,
      type: NotificationType.TASK_REQUEST_RESPONSE,
      priority: NotificationPriority.MEDIUM,
      data: { taskId: task._id.toString() },
      timestamp: new Date(),
    });
    this.logger.log(`📧 Approval notification sent to requester ${requesterId}`);

    // Notify the newly assigned user that they have been assigned to the task
    await this.notificationService.createAndSendNotification(requesterId, {
      title: 'Task Assigned',
      message: `You have been assigned to task: ${task.title}`,
      type: NotificationType.TASK_ASSIGNED,
      priority: NotificationPriority.MEDIUM,
      data: { taskId: task._id.toString() },
      timestamp: new Date(),
    });
    this.logger.log(`📧 Assignment notification sent to user ${requesterId}`);
    
    return updatedTask;
  }

  async rejectRequest(taskId: string, requesterId: string) {
    this.logger.log(`❌ Admin rejecting request for task ${taskId}`);
    this.logger.log(`👤 Requester ID: ${requesterId}`);
    this.logger.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      this.logger.error(`❌ Task ${taskId} not found for rejection`);
      throw new NotFoundException('Task not found');
    }

    this.logger.log(`📋 Task title: ${task.title}`);
    this.logger.log(`👤 Current requesters: ${task.requesters.map((r) => r.toString()).join(', ')}`);

    if (!requesterId.match(/^[0-9a-fA-F]{24}$/)) {
      this.logger.error(`❌ Invalid requester ID format: ${requesterId}`);
      throw new BadRequestException('Invalid requester ID format');
    }

    const requesterIdObj = new Types.ObjectId(requesterId);
    if (!task.requesters.some((requester) => requester.toString() === requesterIdObj.toString())) {
      this.logger.warn(`⚠️ User ${requesterId} has not requested task ${taskId}`);
      throw new BadRequestException('User has not requested this task');
    }

    this.logger.log(`✅ Removing requester ${requesterId} from requesters list`);
    this.logger.log(`✅ Updating task status to todo`);

    const oldStatus = task.status;
    const updatedTask = await this.taskModel.findByIdAndUpdate(
      taskId,
      {
        $pull: { requesters: requesterIdObj },
        status: 'todo',
      },
      { new: true },
    );

    this.logger.log(`✅ Task ${taskId} request successfully rejected for ${requesterId}`);

    // Emit WebSocket events
    this.taskGateway.handleTaskStatusChanged(
      this.convertTaskToTaskData(updatedTask),
      oldStatus,
      updatedTask.status,
      'admin' // Since we don't have the admin ID here, we'll use 'admin'
    );

    // Notify the requester that their request was rejected
    await this.notificationService.createAndSendNotification(requesterId, {
      title: 'Task Request Rejected',
      message: `Your request for task "${task.title}" has been rejected`,
      type: NotificationType.TASK_REQUEST_RESPONSE,
      priority: NotificationPriority.MEDIUM,
      data: { taskId: task._id.toString() },
      timestamp: new Date(),
    });
    this.logger.log(`📧 Rejection notification sent to requester ${requesterId}`);

    return updatedTask;
  }
}