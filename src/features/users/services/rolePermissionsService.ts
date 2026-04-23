import apiClient from '../../../shared/utils/apiClient';
import type {
  RolePermission,
  UpdateRolePermissionsPayload,
} from '../types/rolePermissions.types';
import type { Role } from '../../auth/types/auth.types';

export const rolePermissionsService = {
  getAll: async (): Promise<RolePermission[]> => {
    const { data } = await apiClient.get<RolePermission[]>('/role-permissions');
    return data;
  },

  update: async (
    role: Role,
    payload: UpdateRolePermissionsPayload,
  ): Promise<RolePermission> => {
    const { data } = await apiClient.put<RolePermission>(
      `/role-permissions/${role}`,
      payload,
    );
    return data;
  },
};

