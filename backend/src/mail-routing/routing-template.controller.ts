import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoutingTemplateService } from './routing-template.service';
import {
  CreateRoutingTemplateDto,
  UpdateRoutingTemplateDto,
} from './dto';

@Controller('routing-templates')
@UseGuards(JwtAuthGuard)
export class RoutingTemplateController {
  constructor(private routingTemplateService: RoutingTemplateService) {}

  @Get()
  async getAll() {
    return this.routingTemplateService.getAll();
  }

  @Get(':id')
  async getById(@Param('id') templateId: string) {
    return this.routingTemplateService.getById(templateId);
  }

  @Post()
  async create(
    @Body() dto: CreateRoutingTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.routingTemplateService.create(dto, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') templateId: string,
    @Body() dto: UpdateRoutingTemplateDto,
    @CurrentUser() user: User,
  ) {
    return this.routingTemplateService.update(templateId, dto, user.id);
  }

  @Delete(':id')
  async delete(
    @Param('id') templateId: string,
    @CurrentUser() user: User,
  ) {
    return this.routingTemplateService.delete(templateId, user.id);
  }
}

