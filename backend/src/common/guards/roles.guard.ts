import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, type Role } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: Role } }>();
    const userRole = request.user?.role;
    const roleOrder: Role[] = ['user', 'manager', 'admin'];
    const userLevel = userRole ? Math.max(roleOrder.indexOf(userRole), 0) : -1;
    const minRequired = Math.min(
      ...requiredRoles.map((role) => Math.max(roleOrder.indexOf(role), 0)),
    );

    if (userLevel < minRequired) {
      throw new ForbiddenException('Accès refusé : permissions insuffisantes.');
    }

    return true;
  }
}
