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
import {
  FeaturePermissionGuard,
  FeaturePermission,
} from '../common/guards/feature-permission.guard';
import { type Role } from '../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, FeaturePermissionGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @FeaturePermission({ feature: 'users', operation: 'canRead' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @FeaturePermission({ feature: 'users', operation: 'canRead' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @FeaturePermission({ feature: 'users', operation: 'canCreate' })
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: { id: string; role: Role; name: string },
  ) {
    return this.usersService.create(dto, user.id, user.name, user.role);
  }

  @Patch(':id')
  @FeaturePermission({ feature: 'users', operation: 'canEdit' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: { id: string; role: Role; name: string },
  ) {
    return this.usersService.update(id, dto, user.id, user.role, user.name);
  }

  @Delete(':id')
  @FeaturePermission({ feature: 'users', operation: 'canDelete' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: Role; name: string },
  ) {
    return this.usersService.remove(id, user.id, user.name, user.role);
  }
}
