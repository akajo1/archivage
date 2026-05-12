import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { MailRoutingService } from './mail-routing.service';
import { MailRoutingController } from './mail-routing.controller';

@Module({
  imports: [PrismaModule, ActivityLogModule],
  providers: [MailRoutingService],
  controllers: [MailRoutingController],
  exports: [MailRoutingService],
})
export class MailRoutingModule {}

