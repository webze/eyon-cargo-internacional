import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, Cpu, ShieldCheck, Zap, Database, CheckCircle2, AlertCircle, Info, RefreshCw } from 'lucide-react';

export default function EventMonitorView() {
  const { events } = useApp();
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const services = [
    { id: 'ClientMicroservice', name: 'Servicio Clientes', icon: Cpu, color: 'text-sky-400' },
    { id: 'TripMicroservice', name: 'Servicio Viajes / Fletes', icon: Zap, color: 'text-amber-400' },
    { id: 'VehicleMicroservice', name: 'Servicio Flota & Documentos', icon: Activity, color: 'text-rose-400' },
    { id: 'FinanceMicroservice', name: 'Servicio Finanzas', icon: Database, color: 'text-emerald-400' },
    { id: 'NotificationService', name: 'Servicio Notificaciones', icon: ShieldCheck, color: 'text-purple-400' },
  ];

  const filtered = events.filter((ev) => selectedService === 'ALL' || ev.service === selectedService);

  return (
    <div className="space-y-6">
      {/* Top Topology Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {services.map((s) => {
          const Icon = s.icon;
          const serviceEventsCount = events.filter((e) => e.service === s.id).length;
          return (
            <div
              key={s.id}
              onClick={() => setSelectedService(selectedService === s.id ? 'ALL' : s.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedService === s.id
                  ? 'bg-[#262f3a] border-amber-500 shadow-md'
                  : 'bg-[#212933] border-[#2e3944] hover:border-[#3d4b5a]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${s.color}`} />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-xs font-bold text-slate-100">{s.name}</div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">{serviceEventsCount} eventos en bus</div>
            </div>
          );
        })}
      </div>

      {/* Main Console */}
      <div className="bg-[#212933] border border-[#2e3944] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              Consola de Mensajería del EventBus
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditoría en tiempo real de eventos desacoplados entre microservicios
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-2 bg-[#1b2127] border border-[#2e3944] text-slate-200 text-xs rounded-xl focus:outline-none"
            >
              <option value="ALL">Todos los Microservicios</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Stream Table */}
        <div className="bg-[#14181c] border border-[#2e3944] rounded-xl overflow-hidden font-mono text-xs">
          <div className="grid grid-cols-12 gap-2 p-3 bg-[#1b2127] text-slate-400 font-semibold border-b border-[#2e3944] text-[11px] uppercase">
            <div className="col-span-2">Hora</div>
            <div className="col-span-3">Microservicio</div>
            <div className="col-span-3">Tipo de Evento</div>
            <div className="col-span-4">Descripción</div>
          </div>

          <div className="divide-y divide-[#2e3944]/50 max-h-[480px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-sans">
                Sin eventos registrados para esta selección.
              </div>
            ) : (
              filtered.map((ev) => (
                <div key={ev.id}>
                  <div
                    onClick={() => setExpandedEventId(expandedEventId === ev.id ? null : ev.id)}
                    className="grid grid-cols-12 gap-2 p-3 hover:bg-[#212933] cursor-pointer transition-colors items-center"
                  >
                    <div className="col-span-2 text-slate-500 text-[10px]">
                      {new Date(ev.timestamp).toLocaleTimeString('es-PE')}
                    </div>
                    <div className="col-span-3 font-bold text-amber-400 text-[11px] truncate">
                      [{ev.service}]
                    </div>
                    <div className="col-span-3 text-sky-300 font-semibold truncate">
                      {ev.eventType}
                    </div>
                    <div className="col-span-4 text-slate-300 truncate">
                      {ev.description}
                    </div>
                  </div>

                  {/* Expanded JSON payload view */}
                  {expandedEventId === ev.id && (
                    <div className="p-3 bg-[#0d1013] border-t border-b border-[#2e3944] text-slate-300 font-mono text-[11px] space-y-2">
                      <div className="text-slate-500 text-[10px] uppercase font-bold">
                        Event Payload JSON (ID: {ev.id})
                      </div>
                      <pre className="bg-[#14181c] p-3 rounded-lg overflow-x-auto text-emerald-400 border border-[#2e3944]">
                        {JSON.stringify(ev.payload || {}, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
