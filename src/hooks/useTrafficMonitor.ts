import { useState, useEffect, useCallback, useRef } from 'react';
import { TelemetryService } from '../api/telemetry';
import { DeviceService } from '../api/devices';
import type { TelemetryReading } from '../types';

export interface ProcessedSensor {
  sensorId: string;
  sensorCode: string;
  sensorType: string;
  count: number;
}

export interface ProcessedDevice {
  deviceId: string;
  deviceCode: string;
  lastIp: string;
  totalCount: number;
  sensors: Record<string, ProcessedSensor>;
}

// Porcentaje de la muestra que tiene que dominar un dispositivo para considerarse anomalía
const ANOMALY_THRESHOLD_PERCENT = 0.5;

export const useTrafficMonitor = (pollIntervalMs = 3000, sampleLimit = 300) => {
  const [devices, setDevices] = useState<ProcessedDevice[]>([]);
  const [topTalkerDeviceId, setTopTalkerDeviceId] = useState<string | null>(null);
  const [autoDisabledDevices, setAutoDisabledDevices] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ref para no repetir el disable si ya lo procesamos en este ciclo de vida
  const pendingDisable = useRef<Set<string>>(new Set());

  const fetchAndAnalyzeTraffic = useCallback(async () => {
    try {
      const response = await TelemetryService.getLatest({ limit: sampleLimit });
      const readings = response.readings || [];

      const deviceMap: Record<string, ProcessedDevice> = {};

      readings.forEach((reading: TelemetryReading) => {
        if (!deviceMap[reading.deviceId]) {
          deviceMap[reading.deviceId] = {
            deviceId: reading.deviceId,
            deviceCode: reading.deviceCode,
            lastIp: reading.sourceIp || 'Desconocida',
            totalCount: 0,
            sensors: {}
          };
        }

        const device = deviceMap[reading.deviceId];
        device.totalCount += 1;
        if (reading.sourceIp) device.lastIp = reading.sourceIp;

        if (!device.sensors[reading.sensorId]) {
          device.sensors[reading.sensorId] = {
            sensorId: reading.sensorId,
            sensorCode: reading.sensorCode,
            sensorType: reading.sensorType || 'Desconocido',
            count: 0
          };
        }
        device.sensors[reading.sensorId].count += 1;
      });

      const deviceArray = Object.values(deviceMap).sort((a, b) => b.totalCount - a.totalCount);
      setDevices(deviceArray);

      // Detección de anomalía: el top device acapara más del 50% de la muestra
      const topDevice = deviceArray[0];
      const isAnomaly = topDevice && (topDevice.totalCount / sampleLimit) > ANOMALY_THRESHOLD_PERCENT;

      if (isAnomaly) {
        setTopTalkerDeviceId(topDevice.deviceId);

        // Auto-disable: solo si no lo hemos deshabilitado ya en esta sesión
        if (!pendingDisable.current.has(topDevice.deviceId)) {
          pendingDisable.current.add(topDevice.deviceId);

          DeviceService.disable(topDevice.deviceId)
            .then(() => {
              const timestamp = new Date().toLocaleTimeString();
              setAutoDisabledDevices(prev => ({
                ...prev,
                [topDevice.deviceId]: `Auto-deshabilitado a las ${timestamp} (${topDevice.totalCount}/${sampleLimit} req en muestra)`
              }));
              console.warn(`[TrafficMonitor] Dispositivo ${topDevice.deviceCode} auto-deshabilitado por tráfico excesivo.`);
            })
            .catch(err => {
              // Si falla (ej: ya estaba deshabilitado), quitamos del set para no bloquear futuros intentos
              pendingDisable.current.delete(topDevice.deviceId);
              console.error(`[TrafficMonitor] No se pudo deshabilitar ${topDevice.deviceCode}:`, err.message);
            });
        }
      } else {
        setTopTalkerDeviceId(null);
      }

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al obtener la telemetría.');
      console.error('useTrafficMonitor Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sampleLimit]);

  useEffect(() => {
    fetchAndAnalyzeTraffic();
    const intervalId = setInterval(fetchAndAnalyzeTraffic, pollIntervalMs);
    return () => clearInterval(intervalId);
  }, [fetchAndAnalyzeTraffic, pollIntervalMs]);

  return {
    devices,
    topTalkerDeviceId,
    autoDisabledDevices,
    isLoading,
    error,
    refetch: fetchAndAnalyzeTraffic
  };
};