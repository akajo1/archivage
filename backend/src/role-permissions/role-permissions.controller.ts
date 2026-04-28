import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { RolePermissionsService } from './role-permissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  FeaturePermissionGuard,
  FeaturePermission,
} from '../common/guards/feature-permission.guard';
import { type Role } from '../common/decorators/roles.decorator';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, FeaturePermissionGuard)
@Controller('role-permissions')
export class RolePermissionsController {
  constructor(
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  @Get()
  @FeaturePermission({ feature: 'roles', operation: 'canRead' })
  findAll() {
    return this.rolePermissionsService.findAll();
  }

  @Put(':role')
  @FeaturePermission({ feature: 'roles', operation: 'canEdit' })
  update(
    @Param('role') role: Role,
    @Body() dto: UpdateRolePermissionsDto,
    @CurrentUser() user: { id: string; role: string; name: string },
  ) {
    return this.rolePermissionsService.update(role, dto, user.id, user.name, user.role);
  }
}
