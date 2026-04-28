import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  FeaturePermission,
  FeaturePermissionGuard,
} from '../common/guards/feature-permission.guard';

@UseGuards(JwtAuthGuard, FeaturePermissionGuard)
@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  @FeaturePermission({ feature: 'logs', operation: 'canRead' })
  findAll(
    @CurrentUser() _user: { id: string; role: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    return this.activityLogService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
      action,
      userId,
      dateFrom,
      dateTo,
      search,
    });
  }

  @Get('stats')
  @FeaturePermission({ feature: 'logs', operation: 'canRead' })
  getStats(@CurrentUser() _user: { id: string; role: string }) {
    return this.activityLogService.getStats();
  }

  @Get('export')
  @FeaturePermission({ feature: 'logs', operation: 'canRead' })
  export(
    @CurrentUser() _user: { id: string; role: string },
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityLogService.findForExport({
      action,
      userId,
      dateFrom,
      dateTo,
      search,
      limit: limit ? parseInt(limit, 10) : 5000,
    });
  }
}
