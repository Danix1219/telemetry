// src/hooks/useTrafficMonitor.ts
import { useState, useEffect, useCallback } from 'react';
import { TelemetryService } from '../api/telemetry';
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

export const useTrafficMonitor = (pollIntervalMs = 3000, sampleLimit = 300) => {
  const [devices, setDevices] = useState<ProcessedDevice[]>([]);
  const [topTalkerDeviceId, setTopTalkerDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndAnalyzeTraffic = useCallback(async () => {
    try {
      // Obtenemos la última ventana de telemetría
      const response = await TelemetryService.getLatest({ limit: sampleLimit });
      const readings = response.readings || [];
      
      const deviceMap: Record<string, ProcessedDevice> = {};

      readings.forEach((reading: TelemetryReading) => {
        // 1. Inicializar o actualizar el dispositivo
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
        // Mantenemos la IP más reciente que hayamos visto
        if (reading.sourceIp) device.lastIp = reading.sourceIp; 

        // 2. Inicializar o actualizar el sensor dentro del dispositivo
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

      // Convertir el mapa a un array y ordenar por el que tiene más tráfico (descendente)
      const deviceArray = Object.values(deviceMap).sort((a, b) => b.totalCount - a.totalCount);
      setDevices(deviceArray);

      // Lógica de detección de anomalía
      // Si el primer dispositivo tiene más de 50 peticiones en esta muestra, lo marcamos en rojo
      if (deviceArray.length > 0 && deviceArray[0].totalCount > 50) {
        setTopTalkerDeviceId(deviceArray[0].deviceId);
      } else {
        setTopTalkerDeviceId(null);
      }

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al obtener la telemetría.');
      console.error("useTrafficMonitor Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [sampleLimit]);

  useEffect(() => {
    // Primera carga inmediata
    fetchAndAnalyzeTraffic();

    // Iniciar el polling (consulta cíclica)
    const intervalId = setInterval(fetchAndAnalyzeTraffic, pollIntervalMs);

    // Limpieza al desmontar el componente
    return () => clearInterval(intervalId);
  }, [fetchAndAnalyzeTraffic, pollIntervalMs]);

  return { 
    devices, 
    topTalkerDeviceId, 
    isLoading, 
    error,
    refetch: fetchAndAnalyzeTraffic // Exponemos refetch por si queremos un botón de "Actualizar ahora"
  };
};