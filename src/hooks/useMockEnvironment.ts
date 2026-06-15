import { useState, useEffect, useCallback } from 'react';
import type { ProcessedDevice } from './useTrafficMonitor';

// --- 1. MOCK DEL TRÁFICO (Simula el endpoint de Telemetría) ---
export const useMockTrafficMonitor = (pollIntervalMs = 3000) => {
  const [devices, setDevices] = useState<ProcessedDevice[]>([]);
  const [topTalkerDeviceId, setTopTalkerDeviceId] = useState<string | null>(null);

  useEffect(() => {
    // Estado inicial simulado
    let mockData: ProcessedDevice[] = [
      {
        deviceId: 'guid-dev-01',
        deviceCode: 'ESP32-Warehouse-Alpha',
        lastIp: '192.168.1.105',
        totalCount: 45,
        sensors: {
          'guid-sen-01': { sensorId: 'guid-sen-01', sensorCode: 'TEMP-01', sensorType: 'Temperatura', count: 20 },
          'guid-sen-02': { sensorId: 'guid-sen-02', sensorCode: 'HUM-01', sensorType: 'Humedad', count: 25 }
        }
      },
      {
        deviceId: 'guid-dev-02',
        deviceCode: 'RPI-MainGate-Gateway',
        lastIp: '192.168.1.220',
        totalCount: 15,
        sensors: {
          'guid-sen-03': { sensorId: 'guid-sen-03', sensorCode: 'CAM-MOTION', sensorType: 'Movimiento', count: 15 }
        }
      },
      {
        deviceId: 'guid-dev-03',
        deviceCode: 'ARD-Legacy-Node',
        lastIp: '10.0.0.45',
        totalCount: 5,
        sensors: {
          'guid-sen-04': { sensorId: 'guid-sen-04', sensorCode: 'PRESSURE-X', sensorType: 'Presión', count: 5 }
        }
      }
    ];

    const generateTraffic = () => {
      mockData = mockData.map(dev => {
        // Simulamos que el dispositivo 2 de repente se vuelve loco y manda spam
        const isSpiker = dev.deviceId === 'guid-dev-02';
        const newTraffic = isSpiker ? Math.floor(Math.random() * 80) + 40 : Math.floor(Math.random() * 5);

        const newSensors = { ...dev.sensors };
        const firstSensorId = Object.keys(newSensors)[0];
        
        if (firstSensorId) {
          newSensors[firstSensorId].count += newTraffic;
        }

        return {
          ...dev,
          totalCount: dev.totalCount + newTraffic,
          sensors: newSensors
        };
      });

      // Ordenar por tráfico (el mayor arriba)
      mockData.sort((a, b) => b.totalCount - a.totalCount);
      setDevices([...mockData]);

      // Si el primero supera 100 mensajes, disparamos la alerta visual roja
      if (mockData.length > 0 && mockData[0].totalCount > 100) {
        setTopTalkerDeviceId(mockData[0].deviceId);
      } else {
        setTopTalkerDeviceId(null);
      }
    };

    generateTraffic(); // Llamada inicial
    const interval = setInterval(generateTraffic, pollIntervalMs);
    return () => clearInterval(interval);
  }, [pollIntervalMs]);

  return { devices, topTalkerDeviceId, isLoading: false, error: null };
};

// --- 2. MOCK DE LOS CONTROLES (Simula las llamadas PATCH a la API) ---
export const useMockSecurityControls = () => {
  const [blockedDevices, setBlockedDevices] = useState<Record<string, boolean>>({});
  const [blockedSensors, setBlockedSensors] = useState<Record<string, boolean>>({});
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});

  const toggleDeviceStatus = useCallback(async (deviceId: string) => {
    setProcessingIds(prev => ({ ...prev, [deviceId]: true }));
    
    // Simulamos un retraso de red de 800ms
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setBlockedDevices(prev => ({ ...prev, [deviceId]: !prev[deviceId] }));
    setProcessingIds(prev => ({ ...prev, [deviceId]: false }));
  }, []);

  const toggleSensorStatus = useCallback(async (sensorId: string) => {
    setProcessingIds(prev => ({ ...prev, [sensorId]: true }));
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setBlockedSensors(prev => ({ ...prev, [sensorId]: !prev[sensorId] }));
    setProcessingIds(prev => ({ ...prev, [sensorId]: false }));
  }, []);

  return { blockedDevices, blockedSensors, processingIds, toggleDeviceStatus, toggleSensorStatus };
};