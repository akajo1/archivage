import type { Role } from '../../auth/types/auth.types';
import type { Badge } from '../../badges/types/badge.types';
import type { Confidentiality } from '../../confidentiality/types/confidentiality.types';
import type { FeaturePermission } from './roles.types';

export interface RolePermission {
  role: Role;
  badges: Badge[];
  confidentialities: Confidentiality[];
  featurePermissions: FeaturePermission[];
}

export interface UpdateRolePermissionsPayload {
  badgeIds: string[];
  confidentialityIds: string[];
  featurePermissions?: FeaturePermission[];
}

