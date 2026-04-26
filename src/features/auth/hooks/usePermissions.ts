import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { PermissionUtils } from '../../../shared/utils/permissionUtils';

/**
 * Hook to use permission utilities with current user permissions
 */
export const usePermissions = () => {
  const { user } = useAuthStore();
  const permissions = user?.userPermissions;

  return {
    permissions,
    hasFeatureAccess: useCallback(
      (feature: string, operation: 'canRead' | 'canEdit' | 'canDelete' | 'canSearch') =>
        PermissionUtils.hasFeatureAccess(permissions, feature, operation),
      [permissions],
    ),
    canReadFeature: useCallback(
      (feature: string) => PermissionUtils.canReadFeature(permissions, feature),
      [permissions],
    ),
    canEditFeature: useCallback(
      (feature: string) => PermissionUtils.canEditFeature(permissions, feature),
      [permissions],
    ),
    canDeleteFeature: useCallback(
      (feature: string) => PermissionUtils.canDeleteFeature(permissions, feature),
      [permissions],
    ),
    canSearchFeature: useCallback(
      (feature: string) => PermissionUtils.canSearchFeature(permissions, feature),
      [permissions],
    ),
    canViewBadge: useCallback(
      (badgeId: string) => PermissionUtils.canViewBadge(permissions, badgeId),
      [permissions],
    ),
    canViewConfidentiality: useCallback(
      (confidentialityId: string) =>
        PermissionUtils.canViewConfidentiality(permissions, confidentialityId),
      [permissions],
    ),
    getAccessibleBadgeIds: useCallback(
      () => PermissionUtils.getAccessibleBadgeIds(permissions),
      [permissions],
    ),
    getAccessibleConfidentialityIds: useCallback(
      () => PermissionUtils.getAccessibleConfidentialityIds(permissions),
      [permissions],
    ),
  };
};

/**
 * Hook to refresh user permissions
 */
export const useRefreshPermissions = () => {
  const { setUserPermissions } = useAuthStore();

  const refreshPermissions = useCallback(async () => {
    try {
      const updatedUser = await authService.refreshPermissions();
      if (updatedUser.userPermissions) {
        setUserPermissions(updatedUser.userPermissions);
      }
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
      throw error;
    }
  }, [setUserPermissions]);

  return { refreshPermissions };
};

