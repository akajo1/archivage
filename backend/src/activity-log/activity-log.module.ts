import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogController } from './activity-log.controller';
import { FeaturePermissionGuard } from '../common/guards/feature-permission.guard';

@Module({
  controllers: [ActivityLogController],
  providers: [ActivityLogService, FeaturePermissionGuard],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}

