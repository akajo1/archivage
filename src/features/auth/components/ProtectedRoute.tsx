import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../types/auth.types';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: Role;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole) {
    const roleOrder: Role[] = ['user', 'manager', 'admin'];
    const userRoleIndex = roleOrder.indexOf(user!.role);
    const requiredRoleIndex = roleOrder.indexOf(requiredRole);
    if (userRoleIndex < requiredRoleIndex) {
      return <Navigate to="/documents" replace />;
    }
  }

  return <>{children}</>;
};

