import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Schema()
export class User extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role!: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
