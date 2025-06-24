import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type WorkflowDocument = HydratedDocument<Workflow>;

@Schema({ timestamps: true })
export class WorkflowTransition {
  @Prop({ required: true })
  from: string;

  @Prop({ required: true })
  to: string;

  @Prop({ type: [String], default: [] })
  allowedRoles: string[];

  @Prop({ type: Object, default: {} })
  conditions: Record<string, any>;

  @Prop({ type: Boolean, default: false })
  requiresApproval: boolean;
}

@Schema({ timestamps: true })
export class Workflow {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], required: true })
  statuses: string[];

  @Prop({ type: [WorkflowTransition], required: true })
  transitions: WorkflowTransition[];

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
  approvers: string[];
}

export const WorkflowSchema = SchemaFactory.createForClass(Workflow);
