import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum TaskStatus {
  TODO = 'todo',
  DONE = 'done',
  LATE = 'late',
}

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ trim: true })
  category: string;

  @Prop({ required: true, type: Date })
  deadline: Date;

  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Prop({ required: true, type: String })
  userId: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
