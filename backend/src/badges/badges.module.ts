import { Module } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { FeaturePermissionGuard } from '../common/guards/feature-permission.guard';

@Module({
  controllers: [BadgesController],
  providers: [BadgesService, FeaturePermissionGuard],
})
export class BadgesModule {}
