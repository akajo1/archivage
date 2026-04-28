import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LogData {
  action: string;
  entity?: string;
  entityId?: string;
  entityLabel?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  ipAddress?: string;
}

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  /** Fire-and-forget: never blocks the main request */
  log(data: LogData): void {
    this.prisma.activityLog
      .create({ data })
      .catch((err: unknown) =>
        console.error('[ActivityLog] Failed to persist log entry:', err),
      );
  }

  async findAll(filters: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(200, Math.max(1, filters.limit ?? 50));
    const skip = (page - 1) * limit;

    const where = this.buildWhere(filters);

    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findForExport(filters: {
    action?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    limit?: number;
  }) {
    const limit = Math.min(10000, Math.max(1, filters.limit ?? 5000));
    const items = await this.prisma.activityLog.findMany({
      where: this.buildWhere(filters),
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      items,
      total: items.length,
      generatedAt: new Date().toISOString(),
    };
  }

  private buildWhere(filters: {
    action?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) {
    const where: Record<string, unknown> = {};

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
        ...(filters.dateTo
          ? {
              lte: new Date(new Date(filters.dateTo).setHours(23, 59, 59, 999)),
            }
          : {}),
      };
    }

    if (filters.search) {
      const search = filters.search.trim();
      where.OR = [
        { userName: { contains: search } },
        { entityLabel: { contains: search } },
        { action: { contains: search } },
        { entity: { contains: search } },
        { userRole: { contains: search } },
        { ipAddress: { contains: search } },
      ];
    }

    return where;
  }

  async getStats() {
    const [total, byAction, recentLogins] = await Promise.all([
      this.prisma.activityLog.count(),
      this.prisma.activityLog.groupBy({
        by: ['action'],
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
      this.prisma.activityLog.findMany({
        where: { action: 'LOGIN' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          userId: true,
          userName: true,
          userRole: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      total,
      byAction: byAction.map((item) => ({
        action: item.action,
        count: item._count.action,
      })),
      recentLogins,
    };
  }
}
