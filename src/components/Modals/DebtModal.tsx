import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2 } from 'lucide-react';

interface DebtModalProps {
  debtId: string | null;
  onClose: () => void;
}

export default function DebtModal({ debtId, onClose }: DebtModalProps) {
  const { deudas, addDebt, editDebt, removeDebt } = useApp();

  const [entidad, setEntidad] = useState('');
  const [tipo, setTipo] = useState<'Crédito vehicular' | 'Préstamo' | 'Línea de crédito' | 'Deuda con proveedor' | 'Otro'>('Crédito vehicular');
  const [total, setTotal] = useState<number | ''>('');
  const [pendiente, setPendiente] = useState<number | ''>('');
  const [cuota, setCuota] = useState<number | ''>('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (debtId) {
      const d = deudas.find((x) => x.id === debtId);
      if (d) {
        setEntidad(d.entidad);
        setTipo(d.tipo);
        setTotal(d.total || 0);
        setPendiente(d.pendiente || 0);
        setCuota(d.cuota || 0);
        setFecha(d.fecha || '');
        setNotas(d.notas || '');
      }
    }
  }, [debtId, deudas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entidad.trim()) return;

    const data = {
      entidad,
      tipo,
      total: Number(total) || 0,
      pendiente: Number(pendiente) || 0,
      cuota: Number(cuota) || 0,
      fecha,
      notas,
    };

    if (debtId) {
      await editDebt(debtId, data);
    } else {
      await addDebt(data);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!debtId) return;
    if (confirm('¿Eliminar este registro de deuda?')) {
      await removeDebt(debtId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1b2127] border border-[#2e3944] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2e3944]">
          <h3 className="font-bold text-slate-100 text-lg">
            {debtId ? 'Editar Deuda / Crédito' : 'Nuevo Crédito o Deuda'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 uppercase font-semibold mb-1">Entidad / Acreedor *</label>
            <input
              type="text"
              required
              value={entidad}
              onChange={(e) => setEntidad(e.target.value)}
              placeholder="Interbank - Crédito Tráiler / Financiera"
              className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Tipo de Crédito</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Crédito vehicular">Crédito vehicular</option>
                <option value="Préstamo">Préstamo bancario</option>
                <option value="Línea de crédito">Línea de crédito</option>
                <option value="Deuda con proveedor">Deuda con proveedor</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Próximo Pago</label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Total (S/)</label>
              <input
                type="number"
                step="0.01"
                value={total}
                onChange={(e) => setTotal(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="350000"
                className="w-full px-3 py-2 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Pendiente (S/)</label>
              <input
                type="number"
                step="0.01"
                value={pendiente}
                onChange={(e) => setPendiente(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="185000"
                className="w-full px-3 py-2 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Cuota (S/)</label>
              <input
                type="number"
                step="0.01"
                value={cuota}
                onChange={(e) => setCuota(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="12400"
                className="w-full px-3 py-2 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 uppercase font-semibold mb-1">Notas</label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Número de préstamo, tasa de interés..."
              className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#2e3944]">
            {debtId ? (
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
                Guardar Deuda
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
