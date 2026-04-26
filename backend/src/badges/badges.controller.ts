import { Controller, Get, UseGuards } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeaturePermissionGuard, FeaturePermission } from '../common/guards/feature-permission.guard';

@UseGuards(JwtAuthGuard, FeaturePermissionGuard)
@Controller('badges')
export class BadgesController {
  constructor(private badgesService: BadgesService) {}

  @Get()
  @FeaturePermission({ feature: 'badges', operation: 'canRead' })
  findAll() {
    return this.badgesService.findAll();
  }
}


