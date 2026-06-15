import React, { useState } from 'react';
import { Search, Server, Clock, Activity, Fingerprint, Network, AlertCircle, X } from 'lucide-react';
import { TelemetryService } from '../../api/telemetry';
import type { TelemetryReading } from '../../types';

export const IpForensicsView = () => {
  const [searchIp, setSearchIp] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Nuevo estado para controlar el modal de error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [logs, setLogs] = useState<TelemetryReading[]>([]);
  const [summary, setSummary] = useState({ total: 0, uniqueDevices: 0, lastSeen: '' });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchIp.trim()) return;

    setIsSearching(true);
    setErrorMessage(null); // Limpiamos errores previos
    
    try {
      // LLAMADA AL ENDPOINT REAL EN C#
      const res = await TelemetryService.getByIp(searchIp, { pageSize: 50 });
      setLogs(res.readings);
      
      const uniqueDevices = new Set(res.readings.map(r => r.deviceCode)).size;
      const lastSeen = res.readings.length > 0 ? new Date(res.readings[0].timestamp).toLocaleString() : 'N/A';

      setSummary({ total: res.total, uniqueDevices, lastSeen });
      setHasSearched(true);
    } catch (error: any) {
      // En lugar de alert(), guardamos el mensaje para mostrar el Modal
      setErrorMessage(error?.message || "No se pudo establecer conexión con la base de datos o la IP no existe.");
      setHasSearched(false);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Modal de Error Personalizado */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-end p-3">
              <button 
                onClick={() => setErrorMessage(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 pb-6 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Error de Auditoría</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                {errorMessage}
              </p>
              <button
                onClick={() => setErrorMessage(null)}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-colors shadow-sm shadow-rose-500/20"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header unificado con icono */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Network className="w-8 h-8 text-indigo-600 dark:text-indigo-500 shrink-0" />
            Auditoría de Origen (IP)
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
            Rastreo forense de telemetría. Ingrese una dirección IP para analizar su huella de tráfico, dispositivos asociados y comportamiento en la red.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-96 flex shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchIp}
            onChange={(e) => setSearchIp(e.target.value)}
            className="block w-full pl-10 pr-24 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#0B1121] text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors shadow-sm"
            placeholder="Ej: 192.168.1.105"
          />
          <button
            type="submit"
            disabled={isSearching || !searchIp.trim()}
            className="absolute inset-y-1 right-1 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase rounded-md disabled:opacity-50 transition-colors shadow-sm shadow-indigo-500/20"
          >
            {isSearching ? '...' : 'Auditar'}
          </button>
        </form>
      </div>

      {!hasSearched && !isSearching && (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 border-dashed shadow-sm text-center px-4">
          <Fingerprint className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Análisis Forense en Espera</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-md">Ingrese una IP en el buscador superior para extraer los registros de telemetría asociados.</p>
        </div>
      )}

      {hasSearched && !isSearching && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border shadow-sm border-slate-200 dark:border-slate-800">
              <Activity className="w-6 h-6 text-indigo-500 mb-2" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Peticiones Totales</p>
              <p className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">{summary.total}</p>
            </div>
            <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border shadow-sm border-slate-200 dark:border-slate-800">
              <Server className="w-6 h-6 text-amber-500 mb-2" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Dispositivos Únicos</p>
              <p className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">{summary.uniqueDevices}</p>
            </div>
            <div className="bg-white dark:bg-[#111827] p-5 rounded-xl border shadow-sm border-slate-200 dark:border-slate-800">
              <Clock className="w-6 h-6 text-emerald-500 mb-2" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Último Contacto</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-2">{summary.lastSeen}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800/60">
                 <thead className="bg-slate-50 dark:bg-[#0B1121]">
                   <tr>
                     <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fecha/Hora</th>
                     <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Device</th>
                     <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sensor</th>
                     <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                   {logs.map((log) => (
                     <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                       <td className="px-6 py-3.5 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                         {new Date(log.timestamp).toLocaleString()}
                       </td>
                       <td className="px-6 py-3.5 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-white">
                         {log.deviceCode}
                       </td>
                       <td className="px-6 py-3.5 whitespace-nowrap">
                         <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                           {log.sensorCode}
                         </span>
                       </td>
                       <td className="px-6 py-3.5 whitespace-nowrap text-sm font-mono font-bold text-slate-900 dark:text-white text-right">
                         {log.value ?? 'N/A'}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};