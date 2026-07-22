import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Truck,
  Wrench,
  FileText,
  ChevronRight,
  ShieldAlert,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DailyNotificationItem, AlertUrgency } from '../../utils/dailyNotifications';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: DailyNotificationItem[];
  onOpenVehDetail?: (vehicleId: string, initialTab?: 'mantenimiento' | 'ranfla' | 'gastos' | 'docs' | 'combustible') => void;
}

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  onOpenVehDetail,
}: NotificationsModalProps) {
  const [filter, setFilter] = useState<'all' | 'expired' | 'critical' | 'warning' | 'maint'>('all');
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  if (!isOpen) return null;

  const handleRequestPush = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones de escritorio.');
      return;
    }

    if (Notification.permission === 'granted') {
      alert('Las notificaciones del navegador ya están activadas.');
      setPushEnabled(true);
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setPushEnabled(true);
      new Notification('EYON Cargo - Notificaciones Activadas', {
        body: 'Recibirás alertas diarias de los vencimientos de la flota directamente en tu pantalla.',
      });
    } else {
      setPushEnabled(false);
      alert('Permiso de notificaciones denegado en las configuraciones del navegador.');
    }
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const handleDismissAll = () => {
    setDismissedIds(notifications.map((n) => n.id));
  };

  const activeNotifications = notifications.filter((n) => !dismissedIds.includes(n.id));

  const filteredNotifications = activeNotifications.filter((n) => {
    if (filter === 'expired') return n.urgency === 'expired';
    if (filter === 'critical') return n.urgency === 'critical';
    if (filter === 'warning') return n.urgency === 'warning';
    if (filter === 'maint') return n.unitType === 'mantenimiento';
    return true;
  });

  const countExpired = activeNotifications.filter((n) => n.urgency === 'expired').length;
  const countCritical = activeNotifications.filter((n) => n.urgency === 'critical').length;
  const countWarning = activeNotifications.filter((n) => n.urgency === 'warning').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1b2127] border border-[#2e3944] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabecera del Modal */}
        <div className="p-5 bg-[#212933] border-b border-[#2e3944] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Notificaciones Diarias de Vencimiento
              </h3>
              <p className="text-xs text-slate-400">
                Resumen de alertas de SOAT, CITV, SUTRAN, Ranflas y Aceite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRequestPush}
              title={pushEnabled ? 'Notificaciones de escritorio activadas' : 'Activar notificaciones emergentes de escritorio'}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                pushEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-[#14181c] text-slate-300 border-[#2e3944] hover:border-amber-500/50'
              }`}
            >
              {pushEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span>{pushEnabled ? 'Escritorio Activo' : 'Activar Alerta Escritorio'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 bg-[#14181c] border border-[#2e3944] rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tarjeta de Resumen Diario */}
        <div className="p-4 bg-[#14181c] border-b border-[#2e3944] grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <div className="text-rose-400 font-black text-lg font-mono">{countExpired}</div>
            <div className="text-[10px] uppercase font-bold text-rose-300">Vencidos (Atención Hoy)</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="text-amber-400 font-black text-lg font-mono">{countCritical}</div>
            <div className="text-[10px] uppercase font-bold text-amber-300">Próximos (≤ 30 Días)</div>
          </div>
          <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <div className="text-yellow-400 font-black text-lg font-mono">{countWarning}</div>
            <div className="text-[10px] uppercase font-bold text-yellow-300">En Alerta (≤ 60 Días)</div>
          </div>
        </div>

        {/* Filtros por Categoría */}
        <div className="p-3 bg-[#1b2127] border-b border-[#2e3944] flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                filter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-[#14181c] text-slate-400 border border-[#2e3944] hover:text-slate-200'
              }`}
            >
              Todas ({activeNotifications.length})
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                filter === 'expired'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-[#14181c] text-rose-400 border border-rose-500/30 hover:bg-rose-500/10'
              }`}
            >
              Vencidos ({countExpired})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                filter === 'critical'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-[#14181c] text-amber-400 border border-amber-500/30 hover:bg-amber-500/10'
              }`}
            >
              ≤ 30 Días ({countCritical})
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                filter === 'warning'
                  ? 'bg-yellow-500 text-slate-950 shadow-sm'
                  : 'bg-[#14181c] text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/10'
              }`}
            >
              ≤ 60 Días ({countWarning})
            </button>
            <button
              onClick={() => setFilter('maint')}
              className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer transition-all ${
                filter === 'maint'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-[#14181c] text-blue-400 border border-blue-500/30 hover:bg-blue-500/10'
              }`}
            >
              Aceite & Filtros
            </button>
          </div>

          {activeNotifications.length > 0 && (
            <button
              onClick={handleDismissAll}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Marcar todas como revisadas
            </button>
          )}
        </div>

        {/* Lista de Notificaciones */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[50vh] flex-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="font-bold text-slate-200">¡No hay notificaciones pendientes en este filtro!</p>
              <p className="text-xs text-slate-500">
                La documentación y mantenimientos de tu flota están bajo control.
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const isExpired = n.urgency === 'expired';
              const isCritical = n.urgency === 'critical';

              let cardBorder = 'border-amber-500/40 bg-[#14181c]';
              let badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
              let Icon = AlertTriangle;

              if (isExpired) {
                cardBorder = 'border-rose-500/50 bg-rose-500/5';
                badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                Icon = AlertCircle;
              } else if (isCritical) {
                cardBorder = 'border-amber-500/50 bg-amber-500/5';
                badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                Icon = AlertTriangle;
              }

              return (
                <div
                  key={n.id}
                  className={`p-3.5 border rounded-xl flex items-start justify-between gap-3 transition-all ${cardBorder}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg border mt-0.5 shrink-0 ${badgeBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-100 text-sm">{n.title}</span>
                        <span className="font-mono text-xs px-2 py-0.5 bg-[#1b2127] border border-[#2e3944] rounded text-amber-400 font-black">
                          {n.vehiclePlaca}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          ({n.unitName})
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{n.description}</p>
                      
                      {n.dueDate && (
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 pt-0.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Fecha límite registrada: <strong className="text-slate-200">{n.dueDate}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-xs ${badgeBg}`}>
                      {isExpired
                        ? `${Math.abs(n.daysLeft)} DÍAS VENCIDO`
                        : `${n.daysLeft} DÍAS RESTANTES`}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {onOpenVehDetail && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenVehDetail(n.vehicleId, 'docs');
                          }}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                        >
                          <span>Ficha</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDismiss(n.id)}
                        title="Descartar notificación hoy"
                        className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-[#212933] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pie del Modal */}
        <div className="p-4 bg-[#14181c] border-t border-[#2e3944] flex items-center justify-between text-xs text-slate-400">
          <span>📅 Notificaciones actualizadas para hoy ({new Date().toLocaleDateString('es-PE')})</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#212933] hover:bg-[#262f3a] text-slate-200 font-bold border border-[#2e3944] rounded-xl cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
