import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';
import { TelemetryService } from '../../api/telemetry';
import { Loader } from '../ui/Loader';

export const AnalyticsView = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        // Obtenemos los últimos 200 registros reales de C#
        const res = await TelemetryService.getLatest({ limit: 200 });
        
        // Agrupamos por tiempo (minutos) para la gráfica
        const groupedData: Record<string, any> = {};
        
        res.readings.forEach(reading => {
          const time = new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (!groupedData[time]) groupedData[time] = { time };
          
          // Agrupamos el valor por SensorCode (ej: TEMP-01: 24.5)
          groupedData[time][reading.sensorCode] = reading.value || 0;
        });

        const formattedData = Object.values(groupedData).reverse(); // Orden cronológico
        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000); // Actualizar gráfica cada 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Header unificado con icono */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-indigo-600 dark:text-indigo-500 shrink-0" />
            Analítica de Red
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
            Visualización gráfica del comportamiento de los sensores. Analice las tendencias y fluctuaciones de la telemetría en tiempo real.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Comportamiento de Red Global</h3>
          <p className="text-sm text-slate-500">Métricas en tiempo real (Últimos 200 registros)</p>
        </div>
        
        <div className="h-[300px] md:h-80 w-full font-mono text-xs">
          {isLoading && chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center"><Loader /></div>
          ) : chartData.length === 0 ? (
             <div className="h-full flex items-center justify-center text-slate-500">Sin datos suficientes para graficar.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} vertical={false} />
                <XAxis dataKey="time" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend />
                {/* Genera líneas dinámicas para las primeras métricas detectadas */}
                {Object.keys(chartData[0] || {}).filter(k => k !== 'time').slice(0,3).map((sensorKey, i) => (
                  <Line 
                    key={sensorKey} 
                    type="monotone" 
                    dataKey={sensorKey} 
                    stroke={['#F43F5E', '#3B82F6', '#10B981'][i]} 
                    strokeWidth={3} 
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};