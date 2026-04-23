import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const now = new Date().toISOString();

    try {
      await this.prisma.ping();

      return {
        status: 'ok',
        timestamp: now,
        services: {
          api: 'up',
          database: 'up',
        },
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'degraded',
        timestamp: now,
        services: {
          api: 'up',
          database: 'down',
        },
      });
    }
  }
}
