// src/api/telemetry.ts
import { apiClient, buildQueryString } from './client';
import type { 
  TelemetryReading, 
  PaginatedTelemetry, 
  TelemetrySummary, 
  CreateTelemetryRequest, 
  CreateTelemetryBatchRequest 
} from '../types';

// Interfaces auxiliares para los filtros de las peticiones GET
export interface BaseTelemetryFilters {
  from?: string | Date;
  to?: string | Date;
}

export interface PaginatedTelemetryFilters extends BaseTelemetryFilters {
  page?: number;
  pageSize?: number;
}

export interface GetLatestFilters extends BaseTelemetryFilters {
  limit?: number;
  sensorType?: string;
}

export const TelemetryService = {
  // ==========================================
  // ESCRITURA (POST)
  // ==========================================
  
  create: (data: CreateTelemetryRequest) => 
    apiClient<{ id: string }>('/api/telemetry', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),

  createBatch: (data: CreateTelemetryBatchRequest) => 
    apiClient<{ count: number }>('/api/telemetry/batch', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),

  // ==========================================
  // LECTURA GENERAL (GET)
  // ==========================================

  getLatest: (filters?: GetLatestFilters) => 
    apiClient<{ readings: TelemetryReading[] }>(
      `/api/telemetry/latest${buildQueryString(filters)}`
    ),

  getByClient: (clientId: string, filters?: PaginatedTelemetryFilters) => 
    apiClient<PaginatedTelemetry>(
      `/api/telemetry/by-client${buildQueryString({ clientId, ...filters })}`
    ),

  getByIp: (ip: string, filters?: PaginatedTelemetryFilters) => 
    apiClient<PaginatedTelemetry>(
      `/api/telemetry/by-ip${buildQueryString({ ip, ...filters })}`
    ),

  // ==========================================
  // LECTURA POR DISPOSITIVO (GET)
  // ==========================================

  getByDeviceId: (deviceId: string, filters?: PaginatedTelemetryFilters) => 
    apiClient<PaginatedTelemetry>(
      `/api/telemetry/device/${deviceId}${buildQueryString(filters)}`
    ),

  getByDeviceCode: (deviceCode: string, filters?: PaginatedTelemetryFilters) => 
    apiClient<PaginatedTelemetry>(
      `/api/telemetry/device/code/${deviceCode}${buildQueryString(filters)}`
    ),

  getLatestByDeviceId: (deviceId: string, limit = 1) => 
    apiClient<PaginatedTelemetry>(
      `/api/telemetry/device/${deviceId}/latest${buildQueryString({ limit })}`
    ),

  getDeviceSummary: (deviceId: string, filters?: BaseTelemetryFilters) => 
    apiClient<TelemetrySummary>(
      `/api/telemetry/device/${deviceId}/summary${buildQueryString(filters)}`
    ),

  // ==========================================
  // LECTURA POR SENSOR (GET)
  // ==========================================

  getBySensorId: (sensorId: string, filters?: PaginatedTelemetryFilters) => 
    apiClient<PaginatedTelemetry>(
      `/api/telemetry/sensor/${sensorId}${buildQueryString(filters)}`
    ),

  getBySensorCode: (sensorCode: string, filters?: PaginatedTelemetryFilters) => 
    apiClient<PaginatedTelemetry>(
      `/api/telemetry/sensor/code/${sensorCode}${buildQueryString(filters)}`
    ),

  getLatestBySensorId: (sensorId: string, limit = 1) => 
    apiClient<PaginatedTelemetry>(
      `/api/telemetry/sensor/${sensorId}/latest${buildQueryString({ limit })}`
    ),

  getSensorSummary: (sensorId: string, filters?: BaseTelemetryFilters) => 
    apiClient<TelemetrySummary>(
      `/api/telemetry/sensor/${sensorId}/summary${buildQueryString(filters)}`
    ),
};