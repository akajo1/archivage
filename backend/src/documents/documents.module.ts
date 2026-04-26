import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { FeaturePermissionGuard } from '../common/guards/feature-permission.guard';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, FeaturePermissionGuard],
})
export class DocumentsModule {}
