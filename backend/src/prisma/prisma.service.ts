import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client = new PrismaClient();

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
  get activityLog() {
    return this.client.activityLog;
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
