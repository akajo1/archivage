/**
 * Backend permission utilities for feature-based access control
 */

export type FeatureOperation =
  | 'canRead'
  | 'canCreate'
  | 'canEdit'
  | 'canDelete'
  | 'canSearch';
export type RoleFeature =
  | 'dashboard'
  | 'documents'
  | 'users'
  | 'roles'
  | 'badges'
  | 'confidentiality';

interface FeaturePermission {
  feature: RoleFeature;
  canRead: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSearch: boolean;
}

export class PermissionUtils {
  /**
   * Check if user has specific operation on a feature
   */
  static hasFeatureAccess(
    featurePermissions: FeaturePermission[] | undefined,
    feature: RoleFeature,
    operation: FeatureOperation,
  ): boolean {
    if (!featurePermissions || featurePermissions.length === 0) return false;
    const permission = featurePermissions.find((p) => p.feature === feature);
    return permission ? permission[operation] : false;
  }

  /**
   * Enforce permission check - throws ForbiddenException if not allowed
   */
  static enforceFeatureAccess(
    featurePermissions: FeaturePermission[] | undefined,
    feature: RoleFeature,
    operation: FeatureOperation,
  ): void {
    if (!this.hasFeatureAccess(featurePermissions, feature, operation)) {
      throw new Error(
        `Access denied: missing permission to ${operation} on ${feature}`,
      );
    }
  }

  /**
   * Check if user can read feature
   */
  static canReadFeature(
    featurePermissions: FeaturePermission[] | undefined,
    feature: RoleFeature,
  ): boolean {
    return this.hasFeatureAccess(featurePermissions, feature, 'canRead');
  }

  /**
   * Check if user can edit feature
   */
  static canEditFeature(
    featurePermissions: FeaturePermission[] | undefined,
    feature: RoleFeature,
  ): boolean {
    return this.hasFeatureAccess(featurePermissions, feature, 'canEdit');
  }

  /**
   * Check if user can create in a feature
   */
  static canCreateFeature(
    featurePermissions: FeaturePermission[] | undefined,
    feature: RoleFeature,
  ): boolean {
    return this.hasFeatureAccess(featurePermissions, feature, 'canCreate');
  }

  /**
   * Check if user can delete on feature
   */
  static canDeleteFeature(
    featurePermissions: FeaturePermission[] | undefined,
    feature: RoleFeature,
  ): boolean {
    return this.hasFeatureAccess(featurePermissions, feature, 'canDelete');
  }

  /**
   * Check if user can search feature
   */
  static canSearchFeature(
    featurePermissions: FeaturePermission[] | undefined,
    feature: RoleFeature,
  ): boolean {
    return this.hasFeatureAccess(featurePermissions, feature, 'canSearch');
  }

  /**
   * Normalize feature permissions - ensure defaults for missing features
   */
  static normalizePermissions(
    featurePermissions: FeaturePermission[] | undefined,
  ): Map<RoleFeature, FeaturePermission> {
    const features: RoleFeature[] = [
      'dashboard',
      'documents',
      'users',
      'roles',
      'badges',
      'confidentiality',
    ];
    const map = new Map<RoleFeature, FeaturePermission>();

    features.forEach((feature) => {
      const perm = featurePermissions?.find((p) => p.feature === feature) || {
        feature,
        canRead: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canSearch: false,
      };
      map.set(feature, perm);
    });

    return map;
  }
}
