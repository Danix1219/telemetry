
// ==========================================
// MODELOS BASE 
// ==========================================

export interface Device {
  id: string;
  name: string;
  code: string;
  type: string;
  description?: string;
  location?: string;
  connectionType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sensor {
  id: string;
  deviceId: string;
  name: string;
  code: string;
  type: string;
  unit: string;
  description?: string;
  minValue?: number;
  maxValue?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TelemetryReading {
  id: string;
  deviceId: string;
  sensorId: string;
  deviceCode: string;
  sensorCode: string;
  sensorType?: string;
  value?: number;
  rawValue?: string;
  unit?: string;
  sourceIp?: string;
  clientId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// ==========================================
// RESPUESTAS Y PETICIONES DE LA API
// ==========================================

export interface PaginatedTelemetry {
  readings: TelemetryReading[];
  total: number;
}

export interface TelemetrySummary {
  count: number;
  minValue?: number;
  maxValue?: number;
  avgValue?: number;
  lastValue?: number;
  lastTimestamp?: string;
}

export interface CreateTelemetryRequest {
  deviceCode: string;
  sensorCode: string;
  value?: number;
  rawValue?: string;
  unit?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface TelemetryBatchItem extends CreateTelemetryRequest {}

export interface CreateTelemetryBatchRequest {
  items: TelemetryBatchItem[];
}