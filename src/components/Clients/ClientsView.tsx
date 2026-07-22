import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Search, Plus, Phone, Mail, FileText, UserCheck, Edit, Trash2 } from 'lucide-react';
import { formatMoney, maskRuc, maskPhone, maskEmail, maskName } from '../../utils/formatters';

interface ClientsViewProps {
  onOpenClientModal: (id?: string) => void;
  onOpenTripForClient: (clientId: string) => void;
}

export default function ClientsView({ onOpenClientModal, onOpenTripForClient }: ClientsViewProps) {
  const { clientes, viajes, theme } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.ruc || '').includes(searchTerm) ||
      (c.contacto || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isPrivacy = theme?.privacyMode || false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por razón social, RUC o contacto..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#212933] border border-[#2e3944] rounded-xl text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          onClick={() => onOpenClientModal()}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-[#212933] border border-dashed border-[#2e3944] rounded-2xl text-slate-400">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold">No se encontraron clientes</p>
          <p className="text-xs text-slate-500 mt-1">Registra tu primer cliente corporativo para asignar fletes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const clientTrips = viajes.filter((v) => v.clienteId === c.id);
            const totalRevenue = clientTrips.reduce((s, v) => s + (Number(v.monto) || 0), 0);

            return (
              <div
                key={c.id}
                className="bg-[#212933] border border-[#2e3944] hover:border-amber-500/40 rounded-2xl p-5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-100 text-sm leading-snug">
                      {maskName(c.nombre, isPrivacy)}
                    </h3>
                    <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-mono rounded-md font-semibold">
                      RUC: {maskRuc(c.ruc, isPrivacy)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 my-4">
                    {c.contacto && (
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-200">{maskName(c.contacto, isPrivacy)}</span>
                      </div>
                    )}
                    {c.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{maskPhone(c.telefono, isPrivacy)}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{maskEmail(c.email, isPrivacy)}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#1b2127] border border-[#2e3944] rounded-xl p-3 flex justify-between items-center text-xs mb-4">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Viajes Realizados</span>
                      <span className="font-bold text-slate-200">{clientTrips.length} fletes</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[11px] block">Facturado Total</span>
                      <span className="font-bold font-mono text-emerald-400">{formatMoney(totalRevenue, isPrivacy)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#2e3944]">
                  <button
                    onClick={() => onOpenClientModal(c.id)}
                    className="flex-1 py-1.5 bg-[#262f3a] hover:bg-[#2e3944] text-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  <button
                    onClick={() => onOpenTripForClient(c.id)}
                    className="flex-1 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    + Crear Viaje
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
