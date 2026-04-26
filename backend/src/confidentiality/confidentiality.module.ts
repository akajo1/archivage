import { Module } from '@nestjs/common';
import { ConfidentialityService } from './confidentiality.service';
import { ConfidentialityController } from './confidentiality.controller';
import { FeaturePermissionGuard } from '../common/guards/feature-permission.guard';

@Module({
  controllers: [ConfidentialityController],
  providers: [ConfidentialityService, FeaturePermissionGuard],
})
export class ConfidentialityModule {}
