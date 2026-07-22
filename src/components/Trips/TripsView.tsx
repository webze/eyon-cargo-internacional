import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Truck, Search, Plus, MapPin, Calendar, User, DollarSign, FileText, CheckCircle2, Edit, Trash2, AlertCircle } from 'lucide-react';
import { TripStatus, Trip } from '../../types';
import { formatMoney, maskName } from '../../utils/formatters';

interface TripsViewProps {
  onOpenTripModal: (id?: string) => void;
}

export default function TripsView({ onOpenTripModal }: TripsViewProps) {
  const { viajes, clientes, vehiculos, theme, editTrip, removeTrip, showToastMessage } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);

  const isPrivacy = theme?.privacyMode || false;
  const money = (n: number) => formatMoney(n, isPrivacy);

  const getRealStatus = (v: any) => {
    if (v.estado === 'Completado') return 'Completado';
    const daysLeft = Math.round((new Date(v.fecha + 'T00:00:00').getTime() - Date.now()) / 86400000);
    if (daysLeft < 0) return 'Atrasado';
    return v.estado;
  };

  const handleMarkCompleted = async (tripId: string) => {
    await editTrip(tripId, { estado: 'Completado' });
    showToastMessage('¡Viaje cerrado y marcado como Finalizado!');
  };

  const handleConfirmDelete = async () => {
    if (!tripToDelete) return;
    await removeTrip(tripToDelete.id);
    setTripToDelete(null);
  };

  const filtered = viajes.filter((v) => {
    const client = clientes.find((c) => c.id === v.clienteId);
    const veh = vehiculos.find((vh) => vh.id === v.vehiculoId);
    const realSt = getRealStatus(v);

    const matchesSearch =
      v.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.conductor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (veh?.placa || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || realSt === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ruta, cliente, placa o conductor..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#212933] border border-[#2e3944] rounded-xl text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-[#212933] border border-[#2e3944] text-slate-200 text-xs rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="Programado">Programados</option>
            <option value="En curso">En curso</option>
            <option value="Completado">Completados</option>
            <option value="Atrasado">Atrasados</option>
          </select>
        </div>

        <button
          onClick={() => onOpenTripModal()}
          className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          Nuevo Viaje
        </button>
      </div>

      {/* Ticket List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-[#212933] border border-dashed border-[#2e3944] rounded-2xl text-slate-400">
          <Truck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold">No hay viajes registrados</p>
          <p className="text-xs text-slate-500 mt-1">Crea un nuevo flete de transporte para iniciar el seguimiento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((v) => {
            const client = clientes.find((c) => c.id === v.clienteId);
            const veh = vehiculos.find((vh) => vh.id === v.vehiculoId);
            const realStatus = getRealStatus(v);
            const isCompleted = v.estado === 'Completado';

            return (
              <div
                key={v.id}
                className="bg-[#212933] border border-[#2e3944] hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col md:flex-row"
              >
                {/* Main Ticket Info */}
                <div className="p-5 flex-1 space-y-3">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-lg font-bold text-slate-100">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span>{v.origen}</span>
                      <span className="text-amber-400 font-bold">→</span>
                      <span>{v.destino}</span>
                    </div>

                    <div className="font-mono text-xs text-slate-400 font-semibold bg-[#14181c] px-2.5 py-1 rounded-lg border border-[#2e3944]">
                      BOLETO: EYV-{v.id.slice(-6).toUpperCase()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-slate-400 border-t border-[#2e3944]/60">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">Cliente Corporativo</span>
                      <span className="font-semibold text-slate-200 truncate block">{client ? maskName(client.nombre, isPrivacy) : 'Sin cliente'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">Fecha Salida</span>
                      <span className="font-semibold text-slate-200 block">{v.fecha}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">Unidad Asignada</span>
                      <span className="font-mono font-bold text-amber-400 block">{veh ? veh.placa : 'Sin asignar'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">Conductor</span>
                      <span className="font-semibold text-slate-200 truncate block">{v.conductor ? maskName(v.conductor, isPrivacy) : 'Sin asignar'}</span>
                    </div>
                  </div>

                  {v.guiasRemision && (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Guías de Remisión: <b className="text-slate-300">{v.guiasRemision}</b></span>
                    </div>
                  )}
                </div>

                {/* Ticket Stub Right Side */}
                <div className="bg-[#1b2127] border-t md:border-t-0 md:border-l border-dashed border-[#2e3944] p-5 w-full md:w-64 flex-shrink-0 flex flex-col justify-between gap-3 text-center">
                  <div className="space-y-1">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        realStatus === 'En curso'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : realStatus === 'Completado'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : realStatus === 'Atrasado'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      }`}
                    >
                      {realStatus}
                    </span>
                    <div className="text-lg font-bold font-mono text-slate-100">{money(v.monto)}</div>
                  </div>

                  <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
                    {!isCompleted && (
                      <button
                        onClick={() => handleMarkCompleted(v.id)}
                        title="Cerrar/Finalizar viaje"
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Finalizado
                      </button>
                    )}

                    <button
                      onClick={() => onOpenTripModal(v.id)}
                      className="px-3 py-1.5 bg-[#262f3a] hover:bg-[#2e3944] text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar
                    </button>

                    <button
                      onClick={() => setTripToDelete(v)}
                      title="Eliminar viaje"
                      className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {tripToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1b2127] border border-[#2e3944] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">¿Eliminar este viaje?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ruta: <b className="text-slate-200">{tripToDelete.origen} → {tripToDelete.destino}</b>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 bg-[#14181c] p-3 rounded-xl border border-[#2e3944]">
              Esta acción borrará el registro del viaje de los contadores y reportes.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setTripToDelete(null)}
                className="px-4 py-2 bg-[#262f3a] hover:bg-[#2e3944] text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Sí, Eliminar Viaje
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
