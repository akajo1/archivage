export type Role = string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  documentAccesses: Array<'read' | 'create' | 'edit'>;
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

