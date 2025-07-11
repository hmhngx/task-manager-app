import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from './user.schema';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { randomBytes } from 'crypto';

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
    email: string,
    password: string,
    username?: string,
    role: UserRole = UserRole.USER,
  ): Promise<{ id: string; email: string; username?: string }> {
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    if (username) {
      const existingUsername = await this.userModel.findOne({ username }).exec();
      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data with default values
    const userData: {
      email: string;
      username?: string;
      password: string;
      role: UserRole;
      isActive: boolean;
      permissions: string[];
      profile: {
        firstName?: string;
        lastName?: string;
        bio?: string;
      };
    } = {
      email,
      username,
      password: hashedPassword,
      role,
      isActive: true,
      permissions: [],
      profile: {},
    };

    // Set admin-specific fields if creating an admin
    if (role === UserRole.ADMIN) {
      userData.permissions = [
        'create:task',
        'read:task',
        'update:task',
        'delete:task',
        'create:user',
        'read:user',
        'update:user',
        'delete:user',
        'admin:all',
      ];
      userData.profile = {
        firstName: username || 'Admin',
        lastName: 'User',
        bio: 'System Administrator',
      };
    }

    const user = new this.userModel(userData);
    const savedUser = await user.save();

    return {
      id: this.getIdString(savedUser._id),
      email: savedUser.email,
      username: savedUser.username,
    };
  }

  async createAdmin(
    email: string,
    password: string,
    username?: string,
  ): Promise<{ id: string; email: string; username?: string }> {
    return this.create(email, password, username, UserRole.ADMIN);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
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

  async findAdmins(): Promise<User[]> {
    return this.userModel.find({ role: UserRole.ADMIN }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken }).exec();
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null }).exec();
  }

  async createPasswordResetToken(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new ConflictException('User not found');
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setMinutes(resetTokenExpiry.getMinutes() + 15); // 15 minutes

    await this.userModel
      .findByIdAndUpdate(user._id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      })
      .exec();

    return resetToken;
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    const user = await this.userModel
      .findOne({
        email,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      })
      .exec();

    if (!user) {
      throw new ConflictException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userModel
      .findByIdAndUpdate(user._id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      })
      .exec();
  }

  async clearPasswordResetToken(email: string): Promise<void> {
    await this.userModel
      .findOneAndUpdate({ email }, { resetPasswordToken: null, resetPasswordExpires: null })
      .exec();
  }
}
