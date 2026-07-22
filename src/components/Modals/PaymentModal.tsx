import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2 } from 'lucide-react';

interface PaymentModalProps {
  paymentId: string | null;
  onClose: () => void;
}

export default function PaymentModal({ paymentId, onClose }: PaymentModalProps) {
  const { pagos, cuentas, addPayment, editPayment, removePayment } = useApp();

  const [tipo, setTipo] = useState<'Ingreso' | 'Egreso'>('Egreso');
  const [estado, setEstado] = useState<'Pagado' | 'Pendiente'>('Pagado');
  const [categoria, setCategoria] = useState('');
  const [monto, setMonto] = useState<number | ''>('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [cuentaId, setCuentaId] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (paymentId) {
      const p = pagos.find((x) => x.id === paymentId);
      if (p) {
        setTipo(p.tipo);
        setEstado(p.estado);
        setCategoria(p.categoria || '');
        setMonto(p.monto || '');
        setFecha(p.fecha || '');
        setCuentaId(p.cuentaId || '');
        setDescripcion(p.descripcion || '');
      }
    }
  }, [paymentId, pagos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto) return;

    const data = {
      tipo,
      estado,
      categoria: categoria || 'General',
      monto: Number(monto) || 0,
      fecha,
      cuentaId,
      descripcion,
    };

    if (paymentId) {
      await editPayment(paymentId, data);
    } else {
      await addPayment(data);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!paymentId) return;
    if (confirm('¿Eliminar esta transacción?')) {
      await removePayment(paymentId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1b2127] border border-[#2e3944] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2e3944]">
          <h3 className="font-bold text-slate-100 text-lg">
            {paymentId ? 'Editar Transacción' : 'Registrar Pago / Movimiento'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Tipo Movimiento</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Egreso">Egreso (Gasto/Salida)</option>
                <option value="Ingreso">Ingreso (Cobro/Cobranza)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Pagado">Pagado</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Categoría</label>
              <input
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Combustible / Planilla / Peajes / Flete"
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Monto Total (S/) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={monto}
                onChange={(e) => setMonto(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="2340.00"
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              <label className="block text-slate-400 uppercase font-semibold mb-1">Cuenta Asociada</label>
              <select
                value={cuentaId}
                onChange={(e) => setCuentaId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="">— Sin especificar —</option>
                {cuentas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.banco} ({c.tipo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 uppercase font-semibold mb-1">Descripción / Comprobante</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalle o número de factura/factura electrónica"
              className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#2e3944]">
            {paymentId ? (
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
                Guardar Transacción
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
