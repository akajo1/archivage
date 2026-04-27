import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

export interface FeaturePermissionMetadata {
  feature: string;
  operation: 'canRead' | 'canEdit' | 'canDelete' | 'canSearch';
}

/**
 * Decorator to specify required feature permissions for a route
 */
export const FeaturePermission = Reflector.createDecorator<FeaturePermissionMetadata>();

@Injectable()
export class FeaturePermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<FeaturePermissionMetadata>(
      FeaturePermission,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: { role?: string } }>();
    const userRole = request.user?.role;

    if (!userRole) {
      throw new ForbiddenException('User role not found.');
    }


    const permission = await this.prisma.rolePermission.findUnique({
      where: { role: userRole },
      include: {
        featurePermissions: {
          where: { feature: requiredPermission.feature },
        },
      },
    });

    if (!permission || permission.featurePermissions.length === 0) {
      throw new ForbiddenException(
        `Accès refusé : permissions insuffisantes pour ${requiredPermission.feature}.`,
      );
    }

    const featurePermission = permission.featurePermissions[0];
    if (!featurePermission[requiredPermission.operation]) {
      throw new ForbiddenException(
        `Accès refusé : vous ne pouvez pas ${requiredPermission.operation} sur ${requiredPermission.feature}.`,
      );
    }

    return true;
  }
}

