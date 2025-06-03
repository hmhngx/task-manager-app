import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type AttachmentDocument = HydratedDocument<Attachment>;

@Schema({ timestamps: true })
export class Attachment {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ type: Buffer, required: true })
  data: Buffer;

  @Prop({ type: Number })
  width?: number;

  @Prop({ type: Number })
  height?: number;

  @Prop({ type: String })
  thumbnail?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  uploadedBy: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Task' })
  task: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Comment' })
  comment: string;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment); 