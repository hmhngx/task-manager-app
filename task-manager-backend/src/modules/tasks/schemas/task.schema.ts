import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop()
  description!: string;

  @Prop()
  category!: string;

  @Prop({ default: false })
  completed!: boolean;

  @Prop({ required: true })
  userId!: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
