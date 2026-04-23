import apiClient from '../utils/apiClient';

export type BackendHealth = 'up' | 'down';

interface HealthResponse {
  services?: {
    database?: 'up' | 'down';
  };
}

export const healthService = {
  check: async (): Promise<BackendHealth> => {
    try {
      const { data } = await apiClient.get<HealthResponse>('/health');
      return data.services?.database === 'up' ? 'up' : 'down';
    } catch {
      return 'down';
    }
  },
};

