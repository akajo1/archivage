import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { FeaturePermissionGuard } from '../common/guards/feature-permission.guard';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [ActivityLogModule],
  controllers: [UsersController],
  providers: [UsersService, FeaturePermissionGuard],
})
export class UsersModule {}
