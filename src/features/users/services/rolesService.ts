import apiClient from '../../../shared/utils/apiClient';
import type {
  AppRole,
  CreateRolePayload,
  UpdateRolePayload,
} from '../types/roles.types';

export const rolesService = {
  getAll: async (q?: string): Promise<AppRole[]> => {
    const { data } = await apiClient.get<AppRole[]>('/roles', {
      params: q ? { q } : undefined,
    });
    return data;
  },

  create: async (payload: CreateRolePayload): Promise<AppRole> => {
    const { data } = await apiClient.post<AppRole>('/roles', payload);
    return data;
  },

  update: async (id: string, payload: UpdateRolePayload): Promise<AppRole> => {
    const { data } = await apiClient.patch<AppRole>(`/roles/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },
};

