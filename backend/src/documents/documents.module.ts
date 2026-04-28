import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { FeaturePermissionGuard } from '../common/guards/feature-permission.guard';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [ActivityLogModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, FeaturePermissionGuard],
})
export class DocumentsModule {}
