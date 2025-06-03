import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum TaskStatus {
  TODO = 'todo',
  PENDING_APPROVAL = 'pending_approval',
  DONE = 'done',
  LATE = 'late',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskType {
  TASK = 'task',
  BUG = 'bug',
  FEATURE = 'feature',
  SUBTASK = 'subtask',
}

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: String, enum: TaskType, default: TaskType.TASK })
  type: TaskType;

  @Prop({ type: String, enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop({ type: Date })
  deadline: Date;

  @Prop({ required: true, enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignee: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creator: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Task' })
  parentTask: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Task' }] })
  subtasks: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }], default: [] })
  comments: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Attachment' }], default: [] })
  attachments: string[];

  @Prop({ type: Number, default: 0 })
  progress: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  watchers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  requesters: Types.ObjectId[];

  @Prop({ type: Object })
  workflow: {
    status: string;
    transitions: {
      from: string;
      to: string;
      conditions: string[];
    }[];
  };
}

export const TaskSchema = SchemaFactory.createForClass(Task);
