import type { Role } from '../../auth/types/auth.types';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  mustChangePassword?: boolean;
  passwordResetRequestedAt?: string | null;
  temporaryPassword?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateManagedUserPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateManagedUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}

