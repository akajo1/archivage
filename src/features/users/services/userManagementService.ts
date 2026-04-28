import apiClient from '../../../shared/utils/apiClient';
import type {
  ManagedUser,
  CreateManagedUserPayload,
  UpdateManagedUserPayload,
} from '../types/userManagement.types';

export const userManagementService = {
  getAll: async (): Promise<ManagedUser[]> => {
    const { data } = await apiClient.get<ManagedUser[]>('/users');
    return data;
  },

  create: async (payload: CreateManagedUserPayload): Promise<ManagedUser> => {
    const { data } = await apiClient.post<ManagedUser>('/users', payload);
    return data;
  },

  update: async (
    id: string,
    payload: UpdateManagedUserPayload,
  ): Promise<ManagedUser> => {
    const { data } = await apiClient.patch<ManagedUser>(`/users/${id}`, payload);
    return data;
  },

  adminResetPassword: async (id: string): Promise<ManagedUser> => {
    const { data } = await apiClient.post<ManagedUser>(
      `/users/${id}/admin-reset-password`,
    );
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};

