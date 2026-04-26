import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { FeaturePermissionGuard } from '../common/guards/feature-permission.guard';

@Module({
  controllers: [RolesController],
  providers: [RolesService, FeaturePermissionGuard],
})
export class RolesModule {}
