import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from './user.schema';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  private getIdString(id: any): string {
    if (id instanceof Types.ObjectId) {
      return id.toHexString();
    }
    if (typeof id === 'string') {
      return id;
    }
    return String(id);
  }

  async create(
    username: string,
    password: string,
    role: UserRole = UserRole.USER,
  ): Promise<{ id: string; username: string }> {
    const existingUser = await this.userModel.findOne({ username }).exec();
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ username, password: hashedPassword, role });
    const savedUser = await user.save();
    return {
      id: this.getIdString(savedUser._id),
      username: savedUser.username,
    };
  }

  async createAdmin(username: string, password: string): Promise<{ id: string; username: string }> {
    return this.create(username, password, UserRole.ADMIN);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<User | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return null;
      }
      const user = await this.userModel.findById(new Types.ObjectId(id)).exec();
      return user;
    } catch {
      return null;
    }
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }
}
