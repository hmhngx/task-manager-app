import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Task', required: true })
  task: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Comment', default: null })
  parentComment: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
  mentions: string[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Attachment' }], default: [] })
  attachments: string[];

  @Prop({ type: Boolean, default: false })
  isEdited: boolean;

  @Prop({ type: Date })
  editedAt: Date;

  @Prop({
    type: Map,
    of: String, // "up" | "down"
    default: {},
  })
  votes: Map<string, string>;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
