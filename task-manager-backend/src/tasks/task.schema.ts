import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Task extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ default: false })
  completed!: boolean;

  @Prop({ required: true })
  userId!: string;

  @Prop()
  category!: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
