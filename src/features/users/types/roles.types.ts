import type { Badge } from '../../badges/types/badge.types';
import type { Confidentiality } from '../../confidentiality/types/confidentiality.types';

export interface AppRole {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  badges: Badge[];
  confidentialities: Confidentiality[];
}

export interface CreateRolePayload {
  key: string;
  name: string;
  description?: string;
  badgeIds: string[];
  confidentialityIds: string[];
}

export interface UpdateRolePayload {
  key?: string;
  name?: string;
  description?: string;
  badgeIds?: string[];
  confidentialityIds?: string[];
}

