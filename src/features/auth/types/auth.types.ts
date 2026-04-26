export type Role = string;

export interface Badge {
  id: string;
  name: string;
  color: string;
}

export interface Confidentiality {
  id: string;
  level: string;
}

export interface FeaturePermission {
  feature: string;
  canRead: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canSearch: boolean;
}

export interface UserPermissions {
  badges: Badge[];
  confidentialities: Confidentiality[];
  featurePermissions: FeaturePermission[];
  canRead: boolean;
  canCreate: boolean;
  canEdit: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  documentAccesses: Array<'read' | 'create' | 'edit' | 'delete' | 'search'>;
  userPermissions?: UserPermissions;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

