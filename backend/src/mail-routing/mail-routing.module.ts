import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { MailRoutingService } from './mail-routing.service';
import { MailRoutingController } from './mail-routing.controller';
import { RoutingTemplateService } from './routing-template.service';
import { RoutingTemplateController } from './routing-template.controller';

@Module({
  imports: [PrismaModule, ActivityLogModule],
  providers: [MailRoutingService, RoutingTemplateService],
  controllers: [MailRoutingController, RoutingTemplateController],
  exports: [MailRoutingService, RoutingTemplateService],
})
export class MailRoutingModule {}

