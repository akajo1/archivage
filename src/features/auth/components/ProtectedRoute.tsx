import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types/auth.types';
import type { ReactNode } from 'react';
import { PermissionUtils } from '../../../shared/utils/permissionUtils';

type FeatureOperation = 'canRead' | 'canCreate' | 'canEdit' | 'canDelete' | 'canSearch';

interface RequiredPermission {
  feature: string;
  operation: FeatureOperation;
}

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: Role;
  requiredPermission?: RequiredPermission;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  requiredPermission,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole) {
    const roleOrder: Role[] = ['user', 'manager', 'admin'];
    const userRoleIndex = Math.max(roleOrder.indexOf(user!.role), 0);
    const requiredRoleIndex = Math.max(roleOrder.indexOf(requiredRole), 0);
    if (userRoleIndex < requiredRoleIndex) {
      return <Navigate to="/documents" replace />;
    }
  }

  if (
    requiredPermission &&
    !PermissionUtils.hasFeatureAccess(
      user?.userPermissions,
      requiredPermission.feature,
      requiredPermission.operation,
    )
  ) {
    return (
      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[#f4a8bf] bg-[#fce8ef] px-6 py-5 text-[#BD114A]">
        <h2 className="text-lg font-semibold">Acces refuse</h2>
        <p className="mt-2 text-sm">
          Vous n&apos;avez pas la permission requise pour acceder a cette page ({location.pathname}).
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

