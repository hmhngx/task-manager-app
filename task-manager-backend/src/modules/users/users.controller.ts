import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => ({
      id: user._id,
      username: user.username,
      role: user.role,
    }));
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);
    return { message: 'User deleted successfully' };
  }

  @Get('available')
  @Roles(UserRole.ADMIN)
  async getAvailableUsers() {
    const users = await this.usersService.findAll();
    // Only return users with role 'user'
    return users
      .filter((user) => user.role === UserRole.USER)
      .map((user) => ({
        id: user._id,
        username: user.username,
        role: user.role,
      }));
  }
}
