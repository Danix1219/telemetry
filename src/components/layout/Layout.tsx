import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Network, 
  ThermometerSnowflake, 
  Moon, 
  Sun, 
  ShieldCheck,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Layout = ({ children, activeView, setActiveView }: LayoutProps) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true;
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // NUEVO: Estado para el sidebar colapsable en escritorio
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const menuItems = [
    { id: 'monitor', label: 'Matriz en Vivo', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analítica de Red', icon: Activity },
    { id: 'diagnostics', label: 'Salud de Hardware', icon: ThermometerSnowflake },
    { id: 'ip-forensics', label: 'Auditoría de IP', icon: Network },
  ];

  const handleNavClick = (id: string) => {
    setActiveView(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] text-slate-900 dark:text-slate-100 flex transition-colors duration-300 overflow-hidden">
      
      {/* OVERLAY PARA MÓVILES */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR (Lateral) */}
      <aside className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800/60 flex flex-col z-40 transition-all duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'} w-64`}>
        
        {/* Header del Sidebar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800/60 shrink-0">
          <div className="flex items-center overflow-hidden">
            <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-500 shrink-0" />
            <h1 className={`text-lg font-bold tracking-tight ml-3 transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 md:hidden' : 'opacity-100'}`}>
              ISOM <span className="font-normal text-slate-500">Center</span>
            </h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Menú de Navegación */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
          <p className={`px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 h-0 hidden' : 'opacity-100'}`}>
            Plataforma
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isSidebarCollapsed ? item.label : ''} // Tooltip al estar colapsado
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group
                  ${isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}
                  ${isSidebarCollapsed ? 'justify-center' : 'justify-start gap-3'}`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                <span className={`truncate transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer del Sidebar (Perfil + Botón Colapsar) */}
        <div className="border-t border-slate-200 dark:border-slate-800/60 shrink-0">
          <div className={`flex items-center p-4 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
                AD
              </div>
              <div className={`text-left transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                <p className="text-sm font-bold leading-none text-slate-900 dark:text-white">Admin ISOM</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Sistemas</p>
              </div>
            </div>
            
            {/* Botón para colapsar (Solo visible en Desktop) */}
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`hidden md:flex p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors ${isSidebarCollapsed ? 'hidden' : ''}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          
          {/* Botón para expandir cuando está colapsado */}
          {isSidebarCollapsed && (
            <div className="pb-4 flex justify-center hidden md:flex">
               <button 
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-center px-4 md:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            {/* El título se movió a cada módulo individual para ponerle su icono */}
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest hidden sm:block">System Live</span>
            </div>
            <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};