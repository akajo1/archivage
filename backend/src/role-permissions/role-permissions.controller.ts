import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { RolePermissionsService } from './role-permissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, type Role } from '../common/decorators/roles.decorator';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('role-permissions')
export class RolePermissionsController {
  constructor(
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  @Get()
  @Roles('admin', 'manager')
  findAll() {
    return this.rolePermissionsService.findAll();
  }

  @Put(':role')
  @Roles('admin')
  update(@Param('role') role: Role, @Body() dto: UpdateRolePermissionsDto) {
    return this.rolePermissionsService.update(role, dto);
  }
}
