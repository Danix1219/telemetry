import React from 'react';
import  type{ ProcessedDevice } from '../../hooks/useTrafficMonitor';
import { SensorItem } from './SensorItem';
import { AlertTriangle, PowerOff } from 'lucide-react';

interface DeviceCardProps {
  device: ProcessedDevice;
  isTopTalker: boolean;
  isBlocked: boolean;
  processingIds: Record<string, boolean>;
  blockedSensors: Record<string, boolean>;
  onToggleDevice: (id: string) => void;
  onToggleSensor: (id: string) => void;
}

export const DeviceCard = ({ 
  device, isTopTalker, isBlocked, processingIds, blockedSensors, onToggleDevice, onToggleSensor 
}: DeviceCardProps) => {
  const isProcessingDevice = processingIds[device.deviceId];

  const MAX_EXPECTED_TRAFFIC = 100; 
  const trafficPercentage = Math.min((device.totalCount / MAX_EXPECTED_TRAFFIC) * 100, 100);

  // Clases Estilo SaaS Limpio
  const cardBase = "flex flex-col bg-white dark:bg-[#111827] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative";
  
  let statusClasses = "";
  let topBorderColor = "";
  
  if (isBlocked) {
    statusClasses = "border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 opacity-75 grayscale";
    topBorderColor = "bg-slate-400 dark:bg-slate-600";
  } else if (isTopTalker) {
    statusClasses = "border-2 border-rose-500 shadow-rose-100 dark:shadow-none dark:border-rose-500/50";
    topBorderColor = "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]";
  } else {
    statusClasses = "border border-slate-200 dark:border-slate-800/60";
    topBorderColor = "bg-indigo-500";
  }

  return (
    <div className={`${cardBase} ${statusClasses}`}>
      {/* Acento superior delgado */}
      <div className={`h-1 w-full ${topBorderColor}`}></div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Cabecera de la Tarjeta */}
        <div className="flex justify-between items-start mb-5">
          <div className="min-w-0 pr-3">
            <h2 className={`text-lg font-bold truncate tracking-tight ${isBlocked ? 'text-slate-500' : 'text-slate-900 dark:text-white'}`}>
              {device.deviceCode}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {device.lastIp}
              </span>
            </div>
          </div>
          
          <div className="text-right shrink-0">
            <div className={`text-3xl font-black font-mono leading-none ${isBlocked ? 'text-slate-400' : isTopTalker ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {device.totalCount}
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
              Msjs / Ciclo
            </div>
          </div>
        </div>

        {/* Barra de progreso de carga */}
        {!isBlocked && (
          <div className="mb-6 bg-slate-50 dark:bg-[#0B1121] p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 mb-2 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                {isTopTalker && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                Carga de Red
              </span>
              <span className={isTopTalker ? 'text-rose-500' : ''}>{Math.round(trafficPercentage)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${isTopTalker ? 'bg-rose-500' : 'bg-indigo-500'}`}
                style={{ width: `${trafficPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Botón de Acción Principal (Ghost Button Style) */}
        <button
          disabled={isProcessingDevice}
          onClick={() => onToggleDevice(device.deviceId)}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 flex justify-center items-center gap-2 border disabled:opacity-50 disabled:cursor-not-allowed
            ${isBlocked 
              ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' 
              : isTopTalker 
                ? 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500' 
                : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }
          `}
        >
          {isProcessingDevice ? (
            <span className="animate-pulse">Procesando...</span>
          ) : (
            <>
              <PowerOff className="w-4 h-4" />
              {isBlocked ? 'Restaurar Conexión' : 'Aislar Dispositivo'}
            </>
          )}
        </button>

        {/* Lista de Sensores */}
        <div className="mt-6 flex-1">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
            Sensores Activos ({Object.keys(device.sensors).length})
          </h3>
          <div className="space-y-1.5">
            {Object.values(device.sensors).map((sensor) => (
              <SensorItem
                key={sensor.sensorId}
                sensor={sensor}
                isBlocked={blockedSensors[sensor.sensorId] || false}
                isProcessing={processingIds[sensor.sensorId] || false}
                isDeviceBlocked={isBlocked}
                onToggle={onToggleSensor}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};