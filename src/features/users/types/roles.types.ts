import type { Badge } from '../../badges/types/badge.types';
import type { Confidentiality } from '../../confidentiality/types/confidentiality.types';

export const ROLE_FEATURE_KEYS = [
  'dashboard',
  'documents',
  'users',
  'roles',
  'badges',
  'confidentiality',
] as const;

export type RoleFeatureKey = (typeof ROLE_FEATURE_KEYS)[number];

export interface FeaturePermission {
  feature: RoleFeatureKey;
  canRead: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSearch: boolean;
}

export interface AppRole {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  badges: Badge[];
  confidentialities: Confidentiality[];
  featurePermissions: FeaturePermission[];
}

export interface CreateRolePayload {
  key: string;
  name: string;
  description?: string;
  badgeIds: string[];
  confidentialityIds: string[];
  featurePermissions: FeaturePermission[];
}

export interface UpdateRolePayload {
  key?: string;
  name?: string;
  description?: string;
  badgeIds?: string[];
  confidentialityIds?: string[];
  featurePermissions?: FeaturePermission[];
}

