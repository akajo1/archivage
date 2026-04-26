import apiClient from '../../../shared/utils/apiClient';
import type {
  AppRole,
  CreateRolePayload,
  UpdateRolePayload,
} from '../types/roles.types';

const normalizeRole = (role: AppRole): AppRole => ({
  ...role,
  badges: role.badges ?? [],
  confidentialities: role.confidentialities ?? [],
  featurePermissions: role.featurePermissions ?? [],
});

export const rolesService = {
  getAll: async (q?: string): Promise<AppRole[]> => {
    const { data } = await apiClient.get<AppRole[]>('/roles', {
      params: q ? { q } : undefined,
    });
    return data.map(normalizeRole);
  },

  create: async (payload: CreateRolePayload): Promise<AppRole> => {
    const { data } = await apiClient.post<AppRole>('/roles', payload);
    return normalizeRole(data);
  },

  update: async (id: string, payload: UpdateRolePayload): Promise<AppRole> => {
    const { data } = await apiClient.patch<AppRole>(`/roles/${id}`, payload);
    return normalizeRole(data);
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },
};

