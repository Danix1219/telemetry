import React from 'react';
import type { ProcessedSensor } from '../../hooks/useTrafficMonitor';

interface SensorItemProps {
  sensor: ProcessedSensor;
  isBlocked: boolean;
  isProcessing: boolean;
  isDeviceBlocked: boolean;
  onToggle: (sensorId: string) => void;
}

export const SensorItem = ({ sensor, isBlocked, isProcessing, isDeviceBlocked, onToggle }: SensorItemProps) => {
  return (
    <div className={`flex items-center justify-between py-2 px-3 rounded-lg border transition-colors group
      ${isBlocked || isDeviceBlocked
        ? 'bg-slate-50 dark:bg-slate-800/30 border-transparent opacity-70' 
        : 'bg-white dark:bg-[#111827] border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'}`}>
      
      <div className="flex-1 min-w-0 pr-3">
        <div className={`text-sm font-semibold truncate ${isBlocked || isDeviceBlocked ? 'text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
          {sensor.sensorCode}
        </div>
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate mt-0.5">
          {sensor.sensorType}
        </div>
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right w-12">
          <span className={`block font-mono text-sm font-bold ${isBlocked || isDeviceBlocked ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
            {sensor.count}
          </span>
        </div>
        
        {/* Toggle para sensor (Solo aparece on hover para no ensuciar la vista) */}
        <button
          disabled={isProcessing || isDeviceBlocked}
          onClick={() => onToggle(sensor.sensorId)}
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md transition-all disabled:opacity-50 min-w-[70px] border
            ${isBlocked 
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100' 
              : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-rose-300 hover:text-rose-600 dark:hover:border-rose-500/50 dark:hover:text-rose-400 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100'
            }`}
        >
          {isProcessing ? '...' : (isBlocked ? 'Activar' : 'Aislar')}
        </button>
      </div>
    </div>
  );
};