import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  SlidersHorizontal,
  Sun,
  Moon,
  Zap,
  Eye,
  EyeOff,
  Menu,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onOpenTripModal: () => void;
  onOpenWidgetModal: () => void;
}

export default function Header({ currentView, onOpenTripModal, onOpenWidgetModal }: HeaderProps) {
  const {
    events,
    theme,
    updateTheme,
    togglePrivacyMode,
    sidebarCollapsed,
    toggleSidebar,
    setMobileMenuOpen,
  } = useApp();

  const titleMap: Record<string, { title: string; sub: string }> = {
    dashboard: { title: 'Dashboard Principal', sub: 'Módulos personalizables en tiempo real' },
    clientes: { title: 'Directorio de Clientes (CRM)', sub: 'Gestión de cuentas corporativas y RUC' },
    viajes: { title: 'Control de Viajes y Fletes', sub: 'Boletos de carga y seguimiento de rutas' },
    vehiculos: { title: 'Gestión de Flota Vehicular', sub: 'Cumplimiento SUTRAN, MTC, SUNAT y combustible' },
    finanzas: { title: 'Control Financiero & Liquidez', sub: 'Bancos, deudas, utilidades de socios e ingresos/egresos' },
    events: { title: 'Bus de Eventos & Microservicios', sub: 'Monitor de eventos desacoplados en tiempo real' },
    config: { title: 'Configuración & Personalización', sub: 'Ajustes de UI, PIN, y sincronización externa' },
  };

  const viewInfo = titleMap[currentView] || { title: 'EYON Cargo', sub: 'Panel de Control' };
  const latestEvent = events.length > 0 ? events[0] : null;

  const toggleThemeMode = () => {
    const modes: Array<'dark' | 'light' | 'industrial'> = ['dark', 'industrial', 'light'];
    const nextIndex = (modes.indexOf(theme.mode) + 1) % modes.length;
    updateTheme({ mode: modes[nextIndex] });
  };

  return (
    <header className="mb-6 space-y-3">
      {/* Event Stream Ticker Banner */}
      {theme.showEventStreamBanner && latestEvent && (
        <div className="bg-gradient-to-r from-amber-500/10 via-[#212933] to-[#1b2127] border border-amber-500/30 rounded-xl px-4 py-2 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-bold uppercase tracking-wider text-amber-400 text-[10px] flex-shrink-0">
              [{latestEvent.service}]
            </span>
            <span className="text-slate-300 font-mono truncate">{latestEvent.description}</span>
          </div>
          <span className="text-slate-500 text-[10px] flex-shrink-0">
            {new Date(latestEvent.timestamp).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      )}

      {/* Main Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {/* Mobile drawer hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            title="Abrir Menú Principal"
            className="md:hidden p-2.5 bg-[#212933] border border-[#2e3944] text-amber-400 rounded-xl hover:bg-[#262f3a] transition-all cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop sidebar toggle button */}
          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
            className="hidden md:flex p-2.5 bg-[#212933] border border-[#2e3944] text-slate-300 hover:text-amber-400 rounded-xl hover:bg-[#262f3a] transition-all cursor-pointer"
          >
            {sidebarCollapsed ? <PanelLeft className="w-5 h-5 text-amber-400" /> : <PanelLeftClose className="w-5 h-5 text-slate-400" />}
          </button>

          <div>
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              {viewInfo.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{viewInfo.sub}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Privacy / Mask Data Toggle */}
          <button
            onClick={togglePrivacyMode}
            title={theme.privacyMode ? 'Modo Privacidad Activo (Mascara montos y RUCs)' : 'Activar Modo Privacidad (para capturas/demos seguro)'}
            className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              theme.privacyMode
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/10'
                : 'bg-[#212933] hover:bg-[#262f3a] text-slate-300 border-[#2e3944]'
            }`}
          >
            {theme.privacyMode ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Modo Oculto ON</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Privacidad</span>
              </>
            )}
          </button>

          {/* Theme switcher button */}
          <button
            onClick={toggleThemeMode}
            title={`Modo visual: ${theme.mode}`}
            className="px-3 py-2 bg-[#212933] hover:bg-[#262f3a] border border-[#2e3944] text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {theme.mode === 'dark' && <Moon className="w-3.5 h-3.5 text-amber-400" />}
            {theme.mode === 'industrial' && <Zap className="w-3.5 h-3.5 text-sky-400" />}
            {theme.mode === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span className="capitalize hidden sm:inline">{theme.mode}</span>
          </button>

          {/* Customize Widgets Button */}
          {currentView === 'dashboard' && (
            <button
              onClick={onOpenWidgetModal}
              className="px-3 py-2 bg-[#212933] hover:bg-[#262f3a] border border-[#2e3944] text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Personalizar Módulos</span>
            </button>
          )}

          {/* Quick Action Button */}
          <button
            onClick={onOpenTripModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Viaje</span>
          </button>
        </div>
      </div>
    </header>
  );
}
