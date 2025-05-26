import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(username: string, password: string): Promise<{ id: string; username: string }> {
    const existingUser = await this.userModel.findOne({ username }).exec();
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ username, password: hashedPassword });
    const savedUser = await user.save();
    return { id: savedUser._id.toString(), username: savedUser.username };
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }
}
