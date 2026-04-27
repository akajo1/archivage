import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  FeaturePermissionGuard,
  FeaturePermission,
} from '../common/guards/feature-permission.guard';
import { RolesService } from './roles.service';
import { SearchRolesDto } from './dto/search-roles.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@UseGuards(JwtAuthGuard, FeaturePermissionGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @FeaturePermission({ feature: 'roles', operation: 'canRead' })
  findAll(@Query() query: SearchRolesDto) {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  @FeaturePermission({ feature: 'roles', operation: 'canRead' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @FeaturePermission({ feature: 'roles', operation: 'canCreate' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  @FeaturePermission({ feature: 'roles', operation: 'canEdit' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @FeaturePermission({ feature: 'roles', operation: 'canDelete' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
