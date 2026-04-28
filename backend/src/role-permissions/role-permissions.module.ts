import { Module } from '@nestjs/common';
import { RolePermissionsController } from './role-permissions.controller';
import { RolePermissionsService } from './role-permissions.service';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [ActivityLogModule],
  controllers: [RolePermissionsController],
  providers: [RolePermissionsService],
})
export class RolePermissionsModule {}
