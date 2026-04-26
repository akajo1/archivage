import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { FeaturePermissionGuard, FeaturePermission } from '../common/guards/feature-permission.guard';
import { Roles, type Role } from '../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, FeaturePermissionGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin', 'manager')
  @FeaturePermission({ feature: 'users', operation: 'canRead' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'manager')
  @FeaturePermission({ feature: 'users', operation: 'canRead' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles('admin')
  @FeaturePermission({ feature: 'users', operation: 'canEdit' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @Roles('user')
  @FeaturePermission({ feature: 'users', operation: 'canEdit' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.usersService.update(id, dto, user.id, user.role);
  }

  @Delete(':id')
  @Roles('admin')
  @FeaturePermission({ feature: 'users', operation: 'canDelete' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.usersService.remove(id, user.id);
  }
}
