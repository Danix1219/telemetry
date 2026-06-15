import React, { useState } from 'react';
import { LayoutDashboard, AlertCircle, ServerCrash } from 'lucide-react'; // Iconos añadidos
import { Layout } from '../components/layout/Layout';
import { DeviceCard } from '../components/dashboard/DeviceCard';
import { Loader } from '../components/ui/Loader';

import { AnalyticsView } from '../components/dashboard/AnalyticsView';
import { DiagnosticsView } from '../components/dashboard/DiagnosticsView';
import { IpForensicsView } from '../components/dashboard/IpForensicsView';

import { useTrafficMonitor } from '../hooks/useTrafficMonitor';
import { useSecurityControls } from '../hooks/useSecurityControls';

export const DashboardPage = () => {
  const [activeView, setActiveView] = useState('monitor');

  const { devices, topTalkerDeviceId, isLoading, error } = useTrafficMonitor(3000, 100);
  const { blockedDevices, blockedSensors, processingIds, toggleDeviceStatus, toggleSensorStatus } = useSecurityControls();

  const activeAlerts = devices.filter(d => d.deviceId === topTalkerDeviceId && !blockedDevices[d.deviceId]).length;

  const renderMonitorView = () => (
    <div className="animate-in fade-in duration-500">
      
      {/* Header con Icono */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-indigo-600 dark:text-indigo-500" />
            Matriz en Vivo
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
            Inspección de red en tiempo real. Analice el volumen de peticiones por dispositivo para identificar cuellos de botella o hardware comprometido.
          </p>
        </div>
        
        {/* Métricas (Ligeramente refinadas) */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/60 px-5 py-2.5 rounded-xl flex flex-col shadow-sm flex-1 md:flex-none">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dispositivos</span>
            <span className="font-mono text-xl font-black text-slate-900 dark:text-white leading-none mt-1">{devices.length}</span>
          </div>
          <div className={`px-5 py-2.5 rounded-xl flex flex-col shadow-sm transition-colors flex-1 md:flex-none border
            ${activeAlerts > 0 
              ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' 
              : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800/60'}`}>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${activeAlerts > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>Alertas Críticas</span>
            <span className={`font-mono text-xl font-black leading-none mt-1 ${activeAlerts > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>{activeAlerts}</span>
          </div>
        </div>
      </div>

      {/* Manejo de Errores Enterprise */}
      {error && (
        <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-500/10 border-l-4 border-rose-500 rounded-r-xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">Error de Conexión a la API</h3>
            <p className="text-sm text-rose-600 dark:text-rose-400/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Estados de Carga y Vacío Refinados */}
      {isLoading && devices.length === 0 ? (
        <div className="py-32 flex justify-center"><Loader /></div>
      ) : devices.length === 0 && !error ? (
         <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm text-center px-4">
           <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
             <ServerCrash className="w-8 h-8 text-slate-400 dark:text-slate-500" />
           </div>
           <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sin Tráfico Detectado</h3>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-md">No se han recibido lecturas de telemetría en los últimos ciclos. Asegúrese de que los sensores estén transmitiendo.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {devices.map((device) => (
            <DeviceCard
              key={device.deviceId}
              device={device}
              isTopTalker={device.deviceId === topTalkerDeviceId}
              isBlocked={blockedDevices[device.deviceId] || false}
              processingIds={processingIds}
              blockedSensors={blockedSensors}
              onToggleDevice={toggleDeviceStatus}
              onToggleSensor={toggleSensorStatus}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {activeView === 'monitor' && renderMonitorView()}
      {activeView === 'analytics' && <AnalyticsView />}
      {activeView === 'diagnostics' && <DiagnosticsView />}
      {activeView === 'ip-forensics' && <IpForensicsView />}
    </Layout>
  );
};