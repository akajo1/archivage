import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { BadgesModule } from './badges/badges.module';
import { ConfidentialityModule } from './confidentiality/confidentiality.module';
import { DocumentsModule } from './documents/documents.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { RolePermissionsModule } from './role-permissions/role-permissions.module';
import { RolesModule } from './roles/roles.module';
import { ActivityLogModule } from './activity-log/activity-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    BadgesModule,
    ConfidentialityModule,
    DocumentsModule,
    UsersModule,
    RolesModule,
    RolePermissionsModule,
    ActivityLogModule,
    HealthModule,
  ],
})
export class AppModule {}
