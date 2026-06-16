import { apiClient } from './client';
import type { Device } from '../types';

export interface ToggleResponse {
  isSuccess: boolean;
}

export const DeviceService = {
  getAll: () =>
    apiClient<{ devices: Device[] }>('/api/devices'),

  disable: (id: string) =>
    apiClient<ToggleResponse>(`/api/devices/${id}/disable`, { method: 'PATCH' }),

  enable: (id: string) =>
    apiClient<ToggleResponse>(`/api/devices/${id}/enable`, { method: 'PATCH' }),
};
