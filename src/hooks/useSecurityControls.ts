import { useState, useEffect } from 'react';
import { DeviceService } from '../api/devices';
import { SensorService } from '../api/sensors';

export const useSecurityControls = () => {
  const [blockedDevices, setBlockedDevices] = useState<Record<string, boolean>>({});
  const [blockedSensors, setBlockedSensors] = useState<Record<string, boolean>>({});
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});

  // Al montar, carga el estado real de IsActive desde la BD
  useEffect(() => {
    DeviceService.getAll()
      .then(({ devices }) => {
        const initial: Record<string, boolean> = {};
        devices.forEach(d => {
          if (!d.isActive) initial[d.id] = true;
        });
        setBlockedDevices(initial);
      })
      .catch(() => {
        // Si falla la carga inicial, el estado local empieza vacío
      });
  }, []);

  const toggleDeviceStatus = async (deviceId: string) => {
    const isCurrentlyBlocked = blockedDevices[deviceId] || false;
    setProcessingIds(prev => ({ ...prev, [deviceId]: true }));

    try {
      if (isCurrentlyBlocked) {
        await DeviceService.enable(deviceId);
      } else {
        await DeviceService.disable(deviceId);
      }
      setBlockedDevices(prev => ({ ...prev, [deviceId]: !isCurrentlyBlocked }));
    } catch (error: any) {
      console.error('Error toggling device:', error);
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
      console.error('Error toggling sensor:', error);
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
    toggleSensorStatus,
  };
};
