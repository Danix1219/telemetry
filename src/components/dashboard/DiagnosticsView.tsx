import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, ThermometerSnowflake } from 'lucide-react';
import { TelemetryService } from '../../api/telemetry';
import { Loader } from '../ui/Loader';

export const DiagnosticsView = () => {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        setIsLoading(true);
        // 1. Obtenemos las últimas lecturas globales para saber qué sensores están activos
        const latest = await TelemetryService.getLatest({ limit: 50 });
        const uniqueSensorsMap = new Map();
        
        latest.readings.forEach(r => {
          if (!uniqueSensorsMap.has(r.sensorId)) {
            uniqueSensorsMap.set(r.sensorId, { id: r.sensorId, code: r.sensorCode, type: r.sensorType });
          }
        });

        // 2. Pedimos el Summary matemático (Min, Max, Avg) a la API para cada sensor activo
        const sensorPromises = Array.from(uniqueSensorsMap.values()).map(async (sensorInfo) => {
          const sumRes = await TelemetryService.getSensorSummary(sensorInfo.id);
          return {
            ...sensorInfo,
            ...sumRes,
            // Lógica simple para marcar 'Warning' si el último valor está a más del 20% del promedio
            status: (sumRes.avgValue && sumRes.lastValue && Math.abs(sumRes.lastValue - sumRes.avgValue) > sumRes.avgValue * 0.2) 
                    ? 'warning' : 'ok'
          };
        });

        const results = await Promise.all(sensorPromises);
        setSummaries(results);
      } catch (error) {
        console.error("Error cargando diagnósticos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagnostics();
  }, []);

  if (isLoading) return <div className="py-32 flex justify-center"><Loader /></div>;

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Header Unificado con Icono */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <ThermometerSnowflake className="w-8 h-8 text-indigo-600 dark:text-indigo-500 shrink-0" />
            Salud de Hardware
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
            Análisis estadístico (Min, Max, Promedio) para detectar sensores descalibrados y anomalías de lectura en tiempo real.
          </p>
        </div>
      </div>

      {summaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800/60 border-dashed text-center px-4">
          <ThermometerSnowflake className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No hay sensores activos transmitiendo datos para diagnosticar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {summaries.map((sensor, idx) => {
            // Calcular posiciones visuales para la barra de diagnóstico
            let lastPos = 50;
            let avgPos = 50;
            if (sensor.minValue !== undefined && sensor.maxValue !== undefined && sensor.maxValue > sensor.minValue) {
              const range = sensor.maxValue - sensor.minValue;
              if (sensor.lastValue !== undefined) lastPos = ((sensor.lastValue - sensor.minValue) / range) * 100;
              if (sensor.avgValue !== undefined) avgPos = ((sensor.avgValue - sensor.minValue) / range) * 100;
              
              // Limitar entre 0 y 100 para evitar que el punto se salga de la barra
              lastPos = Math.max(0, Math.min(100, lastPos));
              avgPos = Math.max(0, Math.min(100, avgPos));
            }

            return (
              <div key={idx} className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800/60 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                
                {/* Acento superior de estado */}
                <div className={`absolute top-0 left-0 w-full h-1 ${sensor.status === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>

                <div className="flex justify-between items-start mb-4 mt-1">
                  <div className="min-w-0 pr-3">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                      {sensor.code}
                      {sensor.status === 'ok' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                      )}
                    </h3>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">{sensor.type || 'Sensor'}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-2xl font-black font-mono leading-none ${sensor.status === 'ok' ? 'text-slate-900 dark:text-white' : 'text-amber-600 dark:text-amber-400'}`}>
                      {sensor.lastValue ?? 'N/A'}
                    </span>
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400 mt-1">Última Lectura</span>
                  </div>
                </div>

                {sensor.count > 0 && (
                  <div className="mt-6 mb-2">
                    {/* Indicadores de texto */}
                    <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                      <span>Min: {sensor.minValue}</span>
                      <span>Avg: {sensor.avgValue}</span>
                      <span>Max: {sensor.maxValue}</span>
                    </div>
                    
                    {/* Barra visual de rangos */}
                    <div className="relative h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-3">
                      {/* Rango (Fondo tenue) */}
                      <div className="absolute top-0 left-0 h-full bg-indigo-500/20 rounded-full w-full"></div>
                      
                      {/* Marcador Promedio (Línea vertical) */}
                      <div 
                        className="absolute top-[-4px] w-0.5 h-3.5 bg-indigo-400 dark:bg-indigo-500 rounded-full"
                        style={{ left: `${avgPos}%` }}
                        title="Promedio Histórico"
                      ></div>

                      {/* Marcador Último Valor (Punto) */}
                      <div 
                        className={`absolute top-[-3.5px] w-3 h-3 rounded-full ring-2 ring-white dark:ring-[#111827] shadow-sm z-10 transform -translate-x-1/2
                          ${sensor.status === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ left: `${lastPos}%` }}
                        title="Valor Actual"
                      ></div>
                    </div>
                  </div>
                )}

                {/* Mensaje de advertencia si hay anomalía */}
                {sensor.status === 'warning' && (
                  <div className="mt-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 rounded-xl flex items-start gap-3">
                    <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                      Desviación detectada. El último valor difiere severamente del promedio histórico del sensor.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};