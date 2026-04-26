import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { FeaturePermissionGuard } from '../common/guards/feature-permission.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, FeaturePermissionGuard],
})
export class UsersModule {}
