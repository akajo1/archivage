import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { FeaturePermissionGuard } from '../common/guards/feature-permission.guard';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [ActivityLogModule],
  controllers: [RolesController],
  providers: [RolesService, FeaturePermissionGuard],
})
export class RolesModule {}
