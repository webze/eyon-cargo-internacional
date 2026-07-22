import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Truck,
  Car,
  Wallet,
  Activity,
  Settings,
  LogOut,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const {
    viajes,
    vehiculos,
    deudas,
    logout,
    syncing,
    lastSyncTime,
    sidebarCollapsed,
    toggleSidebar,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useApp();

  // Badges calculations
  const delayedTrips = viajes.filter((v) => {
    if (v.estado === 'Completado') return false;
    const daysLeft = Math.round((new Date(v.fecha + 'T00:00:00').getTime() - Date.now()) / 86400000);
    return daysLeft < 0;
  }).length;

  let vehicleAlerts = 0;
  vehiculos.forEach((veh) => {
    (veh.documentos || []).forEach((doc) => {
      if (!doc.fecha) return;
      const daysLeft = Math.round((new Date(doc.fecha + 'T00:00:00').getTime() - Date.now()) / 86400000);
      if (daysLeft <= 30) vehicleAlerts++;
    });
  });

  const debtAlerts = deudas.filter((d) => {
    if (!d.fecha) return false;
    const daysLeft = Math.round((new Date(d.fecha + 'T00:00:00').getTime() - Date.now()) / 86400000);
    return daysLeft <= 7;
  }).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: delayedTrips > 0 ? delayedTrips : null },
    { id: 'clientes', label: 'Clientes (CRM)', icon: Users, badge: null },
    { id: 'viajes', label: 'Viajes y Fletes', icon: Truck, badge: null },
    { id: 'vehiculos', label: 'Flota Vehicular', icon: Car, badge: vehicleAlerts > 0 ? vehicleAlerts : null },
    { id: 'finanzas', label: 'Finanzas & Cuentas', icon: Wallet, badge: debtAlerts > 0 ? debtAlerts : null },
    { id: 'events', label: 'Microservicios Core', icon: Activity, badge: null },
    { id: 'config', label: 'Configuración', icon: Settings, badge: null },
  ];

  const handleNavClick = (id: string) => {
    onViewChange(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ----------------- MOBILE OFF-CANVAS DRAWER ----------------- */}
      {/* Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#1b2127] border-r border-[#2e3944] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        {/* Brand Header Mobile */}
        <div className="p-4 border-b border-[#2e3944] flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-lg shadow-md shadow-amber-500/20 flex-shrink-0">
              E
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-100">EYON CARGO</div>
              <div className="text-[10px] text-amber-500 font-semibold uppercase tracking-widest">
                INTERNACIONAL
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Nav Menu */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#262f3a] text-amber-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-[#212933] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== null && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile Footer */}
        <div className="p-3 border-t border-[#2e3944] space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400 bg-[#14181c] p-2.5 rounded-lg border border-[#2e3944]/50">
            <div className="flex items-center gap-2 overflow-hidden">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  syncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                }`}
              />
              <span className="truncate text-[11px]">
                {syncing ? 'Sincronizando...' : lastSyncTime ? `Listo ${lastSyncTime}` : 'En línea'}
              </span>
            </div>
            {syncing && <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin flex-shrink-0" />}
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* ----------------- DESKTOP SIDEBAR ----------------- */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 z-30 bg-[#1b2127] border-r border-[#2e3944] transition-all duration-300 ease-in-out flex-shrink-0 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header Desktop */}
        <div className="p-4 border-b border-[#2e3944] flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-lg shadow-md shadow-amber-500/20 flex-shrink-0">
              E
            </div>
            {!sidebarCollapsed && (
              <div className="truncate">
                <div className="font-bold text-sm tracking-tight text-slate-100 truncate">EYON CARGO</div>
                <div className="text-[10px] text-amber-500 font-semibold uppercase tracking-widest truncate">
                  INTERNACIONAL
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expandir' : 'Colapsar'}
            className="p-1 text-slate-500 hover:text-amber-400 rounded-lg cursor-pointer transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Desktop Nav Menu */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                } rounded-xl font-medium text-sm transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-[#262f3a] text-amber-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-[#212933] hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.badge !== null && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full">
                    {item.badge}
                  </span>
                )}
                {sidebarCollapsed && item.badge !== null && item.badge > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop Footer */}
        <div className="p-3 border-t border-[#2e3944] space-y-2.5">
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between text-xs text-slate-400 bg-[#14181c] p-2.5 rounded-lg border border-[#2e3944]/50">
              <div className="flex items-center gap-2 overflow-hidden">
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    syncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                  }`}
                />
                <span className="truncate text-[11px]">
                  {syncing ? 'Sincronizando...' : lastSyncTime ? `Listo ${lastSyncTime}` : 'En línea'}
                </span>
              </div>
              {syncing && <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin flex-shrink-0" />}
            </div>
          )}

          <button
            onClick={logout}
            title="Cerrar Sesión"
            className={`w-full flex items-center ${
              sidebarCollapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-2 text-xs'
            } font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
