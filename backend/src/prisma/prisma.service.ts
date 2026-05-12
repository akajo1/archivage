import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client = new PrismaClient(
    {
      adapter: new PrismaMariaDb(process.env.DATABASE_URL ?? ''),
    } as unknown as Prisma.PrismaClientOptions,
  );

  get user() {
    return this.client.user;
  }
  get badge() {
    return this.client.badge;
  }
  get confidentiality() {
    return this.client.confidentiality;
  }
  get document() {
    return this.client.document;
  }
  get documentAttachment() {
    return this.client.documentAttachment;
  }
  get appRole() {
    return this.client.appRole;
  }
  get rolePermission() {
    return this.client.rolePermission;
  }
  get roleFeaturePermission() {
    return this.client.roleFeaturePermission;
  }
  // ...existing code...
  get activityLog() {
    return this.client.activityLog;
  }
  get department() {
    return this.client.department;
  }
  get mailRouting() {
    return this.client.mailRouting;
  }
  get mailParticipant() {
    return this.client.mailParticipant;
  }
  get mailRoutingAction() {
    return this.client.mailRoutingAction;
  }
  get mailComment() {
    return this.client.mailComment;
  }
  get mailAuditTrail() {
    return this.client.mailAuditTrail;
  }

  async ping() {
    await this.client.$queryRaw`SELECT 1`;
  }

  async onModuleInit() {
    await this.client.$connect();
  }
  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
