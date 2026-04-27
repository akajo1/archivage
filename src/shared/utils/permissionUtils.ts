import type { UserPermissions, FeaturePermission } from '../../features/auth/types/auth.types';

/**
 * Utility functions for checking user permissions
 */

export const PermissionUtils = {
  /**
   * Check if user has access to a specific feature with a specific operation
   */
  hasFeatureAccess: (
    permissions: UserPermissions | undefined,
    feature: string,
    operation: 'canRead' | 'canCreate' | 'canEdit' | 'canDelete' | 'canSearch',
  ): boolean => {
    if (!permissions) return false;

    const featurePermission = permissions.featurePermissions.find((fp) => fp.feature === feature);
    if (!featurePermission) return false;

    return featurePermission[operation] ?? false;
  },

  /**
   * Check if user can read a specific feature
   */
  canReadFeature: (permissions: UserPermissions | undefined, feature: string): boolean => {
    return PermissionUtils.hasFeatureAccess(permissions, feature, 'canRead');
  },

  /**
   * Check if user can edit a specific feature
   */
  canEditFeature: (permissions: UserPermissions | undefined, feature: string): boolean => {
    return PermissionUtils.hasFeatureAccess(permissions, feature, 'canEdit');
  },

  /**
   * Check if user can create in a specific feature
   */
  canCreateFeature: (permissions: UserPermissions | undefined, feature: string): boolean => {
    return PermissionUtils.hasFeatureAccess(permissions, feature, 'canCreate');
  },

  /**
   * Check if user can delete a specific feature
   */
  canDeleteFeature: (permissions: UserPermissions | undefined, feature: string): boolean => {
    return PermissionUtils.hasFeatureAccess(permissions, feature, 'canDelete');
  },

  /**
   * Check if user can search a specific feature
   */
  canSearchFeature: (permissions: UserPermissions | undefined, feature: string): boolean => {
    return PermissionUtils.hasFeatureAccess(permissions, feature, 'canSearch');
  },

  /**
   * Check if user has access to a specific badge
   */
  canViewBadge: (permissions: UserPermissions | undefined, badgeId: string): boolean => {
    if (!permissions) return false;
    return permissions.badges.some((b) => b.id === badgeId);
  },

  /**
   * Check if user has access to a specific confidentiality level
   */
  canViewConfidentiality: (
    permissions: UserPermissions | undefined,
    confidentialityId: string,
  ): boolean => {
    if (!permissions) return false;
    return permissions.confidentialities.some((c) => c.id === confidentialityId);
  },

  /**
   * Get all accessible badge IDs
   */
  getAccessibleBadgeIds: (permissions: UserPermissions | undefined): string[] => {
    if (!permissions) return [];
    return permissions.badges.map((b) => b.id);
  },

  /**
   * Get all accessible confidentiality level IDs
   */
  getAccessibleConfidentialityIds: (permissions: UserPermissions | undefined): string[] => {
    if (!permissions) return [];
    return permissions.confidentialities.map((c) => c.id);
  },

  /**
   * Get feature permission details
   */
  getFeaturePermission: (
    permissions: UserPermissions | undefined,
    feature: string,
  ): FeaturePermission | undefined => {
    if (!permissions) return undefined;
    return permissions.featurePermissions.find((fp) => fp.feature === feature);
  },

  /**
   * Check if user has any permission for a feature
   */
  hasAnyFeatureAccess: (permissions: UserPermissions | undefined, feature: string): boolean => {
    const featurePermission = PermissionUtils.getFeaturePermission(permissions, feature);
    if (!featurePermission) return false;
    return (
      featurePermission.canRead ||
      featurePermission.canCreate ||
      featurePermission.canEdit ||
      featurePermission.canDelete ||
      featurePermission.canSearch
    );
  },
};

