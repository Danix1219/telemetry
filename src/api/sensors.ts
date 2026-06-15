// src/api/sensors.ts
import { apiClient } from './client';

export interface ToggleResponse {
  isSuccess: boolean;
}

export const SensorService = {
  // PATCH: /api/sensors/{id}/disable
  disable: (id: string) => 
    apiClient<ToggleResponse>(`/api/sensors/${id}/disable`, { method: 'PATCH' }),

  // PATCH: /api/sensors/{id}/enable
  enable: (id: string) => 
    apiClient<ToggleResponse>(`/api/sensors/${id}/enable`, { method: 'PATCH' }),
};