// src/hooks/useSecurityControls.ts
import { useState } from 'react';
import { DeviceService } from '../api/devices';
import { SensorService } from '../api/sensors';

export const useSecurityControls = () => {
  // Guardamos un registro local de quién hemos bloqueado durante esta sesión de la vista
  // true = bloqueado/inactivo, false = habilitado/activo
  const [blockedDevices, setBlockedDevices] = useState<Record<string, boolean>>({});
  const [blockedSensors, setBlockedSensors] = useState<Record<string, boolean>>({});
  
  // Guardamos qué IDs están en medio de una petición (para mostrar un "Cargando..." en el botón)
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});

  const toggleDeviceStatus = async (deviceId: string) => {
    const isCurrentlyBlocked = blockedDevices[deviceId] || false;
    
    setProcessingIds(prev => ({ ...prev, [deviceId]: true }));
    
    try {
      if (isCurrentlyBlocked) {
        await DeviceService.enable(deviceId);
      } else {
        await DeviceService.disable(deviceId);
      }
      
      // Si la API responde OK (no arroja error), actualizamos la UI invirtiendo el valor
      setBlockedDevices(prev => ({ ...prev, [deviceId]: !isCurrentlyBlocked }));
    } catch (error: any) {
      console.error("Error toggling device:", error);
      alert(`No se pudo cambiar el estado del dispositivo: ${error.message}`);
    } finally {
      setProcessingIds(prev => ({ ...prev, [deviceId]: false }));
    }
  };

  const toggleSensorStatus = async (sensorId: string) => {
    const isCurrentlyBlocked = blockedSensors[sensorId] || false;
    
    setProcessingIds(prev => ({ ...prev, [sensorId]: true }));
    
    try {
      if (isCurrentlyBlocked) {
        await SensorService.enable(sensorId);
      } else {
        await SensorService.disable(sensorId);
      }
      
      setBlockedSensors(prev => ({ ...prev, [sensorId]: !isCurrentlyBlocked }));
    } catch (error: any) {
      console.error("Error toggling sensor:", error);
      alert(`No se pudo cambiar el estado del sensor: ${error.message}`);
    } finally {
      setProcessingIds(prev => ({ ...prev, [sensorId]: false }));
    }
  };

  return {
    blockedDevices,
    blockedSensors,
    processingIds,
    toggleDeviceStatus,
    toggleSensorStatus
  };
};