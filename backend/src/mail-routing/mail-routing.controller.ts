import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { MailRoutingStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MailRoutingService } from './mail-routing.service';
import {
  CreateRoutingDto,
  ForwardRoutingDto,
  VerifyRoutingDto,
  RejectRoutingDto,
  AddParticipantDto,
  AddCommentDto,
} from './dto';

@Controller('mail-routings')
@UseGuards(JwtAuthGuard)
export class MailRoutingController {
  constructor(private mailRoutingService: MailRoutingService) {}

  @Post('initialize')
  async initializeRouting(
    @Body() dto: CreateRoutingDto,
    @CurrentUser() user: User,
  ) {
    return this.mailRoutingService.initializeRouting(dto, user.id);
  }

  @Post(':id/forward')
  async forward(
    @Param('id') routingId: string,
    @Body() dto: ForwardRoutingDto,
    @CurrentUser() user: User,
  ) {
    return this.mailRoutingService.forward(routingId, dto, user.id);
  }

  @Post(':id/verify')
  async verify(
    @Param('id') routingId: string,
    @Body() dto: VerifyRoutingDto,
    @CurrentUser() user: User,
  ) {
    return this.mailRoutingService.verify(routingId, dto, user.id);
  }

  @Post(':id/reject')
  async reject(
    @Param('id') routingId: string,
    @Body() dto: RejectRoutingDto,
    @CurrentUser() user: User,
  ) {
    return this.mailRoutingService.reject(routingId, dto, user.id);
  }

  @Post(':id/return')
  async returnToSender(
    @Param('id') routingId: string,
    @Body() dto: VerifyRoutingDto,
    @CurrentUser() user: User,
  ) {
    return this.mailRoutingService.returnToSender(routingId, dto, user.id);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') routingId: string,
    @Body() dto: AddCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.mailRoutingService.addComment(routingId, dto, user.id);
  }

  @Post(':id/participants')
  async addParticipant(
    @Param('id') routingId: string,
    @Body() dto: AddParticipantDto,
    @CurrentUser() user: User,
  ) {
    return this.mailRoutingService.addParticipant(routingId, dto, user.id);
  }

  @Get(':id')
  async getDetail(
    @Param('id') routingId: string,
    @CurrentUser() user: User,
  ) {
    return this.mailRoutingService.getRoutingDetail(routingId, user.id);
  }

  @Get(':id/timeline')
  async getTimeline(
    @Param('id') routingId: string,
    @CurrentUser() user: User,
  ) {
    return this.mailRoutingService.getRoutingTimeline(routingId, user.id);
  }

  @Get('inbox/me')
  async getInbox(
    @CurrentUser() user: User,
    @Query('status') status?: MailRoutingStatus,
  ) {
    return this.mailRoutingService.getUserInbox(user.id, status);
  }
}

