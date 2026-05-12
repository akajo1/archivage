import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoutingTemplateDto, UpdateRoutingTemplateDto } from './dto';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ParticipantRole } from '@prisma/client';

@Injectable()
export class RoutingTemplateService {
  constructor(
    private prisma: PrismaService,
    private activityLog: ActivityLogService,
  ) {}

  /**
   * Get all routing templates
   */
  async getAll() {
    return this.prisma.routingTemplate.findMany({
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Get a single routing template
   */
  async getById(templateId: string) {
    const template = await this.prisma.routingTemplate.findUnique({
      where: { id: templateId },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Routing template not found');
    }

    return template;
  }

  /**
   * Create a new routing template
   */
  async create(dto: CreateRoutingTemplateDto, userId?: string) {
    // Validate that we have at least one step
    if (!dto.steps || dto.steps.length === 0) {
      throw new BadRequestException('At least one step is required');
    }

    // Validate step orders are sequential
    const orders = dto.steps.map((_, idx) => idx + 1);
    for (let i = 0; i < dto.steps.length; i++) {
      if (orders[i] !== i + 1) {
        throw new BadRequestException('Steps must be sequential');
      }
    }

    // If marking as default, unmark all other templates
    if (dto.isDefault) {
      await this.prisma.routingTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create template with steps
    const template = await this.prisma.routingTemplate.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
        isDefault: dto.isDefault ?? false,
        steps: {
          create: dto.steps.map((step, idx) => ({
            order: idx + 1,
            role: step.role as ParticipantRole,
          })),
        },
      },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Activity log
    if (userId) {
      const actor = await this.prisma.user.findUnique({ where: { id: userId } });
      await this.activityLog.log({
        action: 'ROUTING_TEMPLATE_CREATED',
        entity: 'RoutingTemplate',
        entityId: template.id,
        entityLabel: `Template: ${template.name}`,
        userId,
        userName: actor?.name,
        userRole: actor?.role,
      });
    }

    return template;
  }

  /**
   * Update a routing template
   */
  async update(templateId: string, dto: UpdateRoutingTemplateDto, userId?: string) {
    const template = await this.prisma.routingTemplate.findUnique({
      where: { id: templateId },
      include: { steps: true },
    });

    if (!template) {
      throw new NotFoundException('Routing template not found');
    }

    // If marking as default, unmark all other templates
    if (dto.isDefault === true && !template.isDefault) {
      await this.prisma.routingTemplate.updateMany({
        where: { isDefault: true, id: { not: templateId } },
        data: { isDefault: false },
      });
    }

    // Delete old steps if new steps are provided
    if (dto.steps && dto.steps.length > 0) {
      if (dto.steps.length === 0) {
        throw new BadRequestException('At least one step is required');
      }

      // Delete all existing steps
      await this.prisma.routingTemplateStep.deleteMany({
        where: { templateId },
      });
    }

    // Update template
    const updatedTemplate = await this.prisma.routingTemplate.update({
      where: { id: templateId },
      data: {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
        isDefault: dto.isDefault,
        ...(dto.steps && {
          steps: {
            create: dto.steps.map((step, idx) => ({
              order: idx + 1,
              role: step.role as ParticipantRole,
            })),
          },
        }),
      },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Activity log
    if (userId) {
      const actor = await this.prisma.user.findUnique({ where: { id: userId } });
      await this.activityLog.log({
        action: 'ROUTING_TEMPLATE_UPDATED',
        entity: 'RoutingTemplate',
        entityId: updatedTemplate.id,
        entityLabel: `Template: ${updatedTemplate.name}`,
        userId,
        userName: actor?.name,
        userRole: actor?.role,
      });
    }

    return updatedTemplate;
  }

  /**
   * Delete a routing template
   */
  async delete(templateId: string, userId?: string) {
    const template = await this.prisma.routingTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Routing template not found');
    }

    // Cannot delete if it's marked as default
    if (template.isDefault) {
      throw new BadRequestException('Cannot delete a default template. Unmark it as default first.');
    }

    await this.prisma.routingTemplate.delete({
      where: { id: templateId },
    });

    // Activity log
    if (userId) {
      const actor = await this.prisma.user.findUnique({ where: { id: userId } });
      await this.activityLog.log({
        action: 'ROUTING_TEMPLATE_DELETED',
        entity: 'RoutingTemplate',
        entityId: templateId,
        entityLabel: `Template: ${template.name}`,
        userId,
        userName: actor?.name,
        userRole: actor?.role,
      });
    }

    return { message: 'Template deleted successfully' };
  }
}

