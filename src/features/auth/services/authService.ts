import apiClient from '../../../shared/utils/apiClient';
import type {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  User,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
  FirstLoginChangePasswordPayload,
} from '../types/auth.types';

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
    return data;
  },
  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      '/auth/refresh',
      { refresh_token: refreshToken },
      { skipAuthRefresh: true } as object,
    );
    return data;
  },
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore — we always clear tokens client-side
    }
  },
  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
  refreshPermissions: async (): Promise<User> => {
    const { data } = await apiClient.post<User>('/auth/refresh-permissions');
    return data;
  },
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<{ message: string; resetUrl?: string }> => {
    const { data } = await apiClient.post('/auth/forgot-password', payload);
    return data;
  },
  resetPassword: async (payload: ResetPasswordPayload): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/auth/reset-password', payload);
    return data;
  },
  changePassword: async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/auth/change-password', payload);
    return data;
  },
  firstLoginChangePassword: async (
    payload: FirstLoginChangePasswordPayload,
  ): Promise<{ message: string }> => {
    const { data } = await apiClient.post('/auth/first-login-change-password', payload);
    return data;
  },
};
