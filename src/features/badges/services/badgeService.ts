import apiClient from '../../../shared/utils/apiClient';
import type { Badge } from '../types/badge.types';

export const badgeService = {
  getAll: async (): Promise<Badge[]> => {
    const { data } = await apiClient.get<Badge[]>('/badges');
    return data;
  },
};

