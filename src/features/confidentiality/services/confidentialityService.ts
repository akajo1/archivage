import apiClient from '../../../shared/utils/apiClient';
import type { Confidentiality } from '../types/confidentiality.types';

export const confidentialityService = {
  getAll: async (): Promise<Confidentiality[]> => {
    const { data } = await apiClient.get<Confidentiality[]>('/confidentiality');
    return data;
  },
};

