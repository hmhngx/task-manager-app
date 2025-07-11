import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export type UserDocument = User & Document;

@Schema()
export class User extends Document {
  declare _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: false, unique: true, sparse: true })
  username?: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Prop({ type: String, required: false })
  refreshToken?: string;

  @Prop({ type: String, required: false })
  resetPasswordToken?: string;

  @Prop({ type: Date, required: false })
  resetPasswordExpires?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ type: Object })
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
