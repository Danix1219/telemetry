// src/api/devices.ts
import { apiClient } from './client';

export interface ToggleResponse {
  isSuccess: boolean;
}

export const DeviceService = {
  // PATCH: /api/devices/{id}/disable
  disable: (id: string) => 
    apiClient<ToggleResponse>(`/api/devices/${id}/disable`, { method: 'PATCH' }),

  // PATCH: /api/devices/{id}/enable
  enable: (id: string) => 
    apiClient<ToggleResponse>(`/api/devices/${id}/enable`, { method: 'PATCH' }),
};