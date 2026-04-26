import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConfidentialityService } from './confidentiality.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeaturePermissionGuard, FeaturePermission } from '../common/guards/feature-permission.guard';

@UseGuards(JwtAuthGuard, FeaturePermissionGuard)
@Controller('confidentiality')
export class ConfidentialityController {
  constructor(private confidentialityService: ConfidentialityService) {}

  @Get()
  @FeaturePermission({ feature: 'confidentiality', operation: 'canRead' })
  findAll() {
    return this.confidentialityService.findAll();
  }
}
