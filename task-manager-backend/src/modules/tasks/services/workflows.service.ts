import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workflow, WorkflowDocument, WorkflowTransition } from '../schemas/workflow.schema';
import { Task, TaskDocument } from '../schemas/task.schema';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectModel(Workflow.name) private workflowModel: Model<WorkflowDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
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

  async updateWorkflow(
    id: string,
    updates: Partial<Workflow>,
    userId: string,
  ) {
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

    const transition = workflow.transitions.find(
      (t) => t.from === fromStatus && t.to === toStatus,
    );

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
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const userIdObj = new Types.ObjectId(userId);
    if (task.requesters.some(requester => requester.toString() === userIdObj.toString())) {
      throw new BadRequestException('User has already requested this task');
    }

    return this.taskModel.findByIdAndUpdate(
      taskId,
      {
        $push: { requesters: userIdObj },
        status: 'pending_approval',
      },
      { new: true },
    );
  }

  async approveRequest(taskId: string, approverId: string, requesterId: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!requesterId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Invalid requester ID format');
    }

    const requesterIdObj = new Types.ObjectId(requesterId);
    if (!task.requesters.some(requester => requester.toString() === requesterIdObj.toString())) {
      throw new BadRequestException('User has not requested this task');
    }

    return this.taskModel.findByIdAndUpdate(
      taskId,
      {
        assignee: requesterIdObj,
        $pull: { requesters: requesterIdObj },
        status: 'in_progress',
      },
      { new: true },
    );
  }

  async rejectRequest(taskId: string, requesterId: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!requesterId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestException('Invalid requester ID format');
    }

    const requesterIdObj = new Types.ObjectId(requesterId);
    if (!task.requesters.some(requester => requester.toString() === requesterIdObj.toString())) {
      throw new BadRequestException('User has not requested this task');
    }

    return this.taskModel.findByIdAndUpdate(
      taskId,
      {
        $pull: { requesters: requesterIdObj },
        status: 'todo',
      },
      { new: true },
    );
  }
} 