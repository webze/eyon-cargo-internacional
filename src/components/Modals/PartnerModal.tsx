import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2 } from 'lucide-react';

interface PartnerModalProps {
  partnerId: string | null;
  onClose: () => void;
}

export function PartnerModal({ partnerId, onClose }: PartnerModalProps) {
  const { socios, addPartner, editPartner, removePartner } = useApp();

  const [nombre, setNombre] = useState('');
  const [pct, setPct] = useState<number | ''>('');

  useEffect(() => {
    if (partnerId) {
      const s = socios.find((x) => x.id === partnerId);
      if (s) {
        setNombre(s.nombre);
        setPct(s.pct || '');
      }
    }
  }, [partnerId, socios]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (partnerId) {
      await editPartner(partnerId, { nombre, pct: Number(pct) || 0 });
    } else {
      await addPartner({ nombre, pct: Number(pct) || 0 });
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!partnerId) return;
    if (confirm('¿Eliminar este socio?')) {
      await removePartner(partnerId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1b2127] border border-[#2e3944] rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2e3944]">
          <h3 className="font-bold text-slate-100 text-base">
            {partnerId ? 'Editar Socio' : 'Nuevo Socio / Dueño'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 uppercase font-semibold mb-1">Nombre Completo *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Socio Fundador A"
              className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 uppercase font-semibold mb-1">Participación (%)</label>
            <input
              type="number"
              step="0.1"
              value={pct}
              onChange={(e) => setPct(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ej. 50"
              className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#2e3944]">
            {partnerId ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#262f3a] hover:bg-[#2e3944] text-slate-300 font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer shadow-md"
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PartnerPayoutModalProps {
  partnerId: string;
  onClose: () => void;
}

export function PartnerPayoutModal({ partnerId, onClose }: PartnerPayoutModalProps) {
  const { addPartnerPayout } = useApp();

  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [monto, setMonto] = useState<number | ''>('');
  const [concepto, setConcepto] = useState('Reparto de utilidades');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto) return;

    await addPartnerPayout(partnerId, {
      fecha,
      monto: Number(monto) || 0,
      concepto,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1b2127] border border-[#2e3944] rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2e3944]">
          <h3 className="font-bold text-slate-100 text-base">Registrar Pago a Socio</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 uppercase font-semibold mb-1">Fecha</label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 uppercase font-semibold mb-1">Monto (S/) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={monto}
              onChange={(e) => setMonto(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="15000.00"
              className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 uppercase font-semibold mb-1">Concepto</label>
            <select
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="Reparto de utilidades">Reparto de utilidades</option>
              <option value="Adelanto de dividendos">Adelanto de dividendos</option>
              <option value="Devolución de capital">Devolución de capital</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#2e3944]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#262f3a] text-slate-300 font-semibold rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer shadow-md"
            >
              Registrar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
