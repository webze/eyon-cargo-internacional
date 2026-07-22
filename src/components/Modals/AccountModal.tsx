import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2 } from 'lucide-react';

interface AccountModalProps {
  accountId: string | null;
  onClose: () => void;
}

export default function AccountModal({ accountId, onClose }: AccountModalProps) {
  const { cuentas, addAccount, editAccount, removeAccount } = useApp();

  const [banco, setBanco] = useState('');
  const [tipo, setTipo] = useState<'Cuenta corriente' | 'Cuenta de ahorros' | 'Cuenta CTS' | 'CCI'>('Cuenta corriente');
  const [saldo, setSaldo] = useState<number | ''>('');
  const [reservado, setReservado] = useState<number | ''>('');
  const [numeroCuenta, setNumeroCuenta] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (accountId) {
      const c = cuentas.find((x) => x.id === accountId);
      if (c) {
        setBanco(c.banco);
        setTipo(c.tipo);
        setSaldo(c.saldo || 0);
        setReservado(c.reservado || 0);
        setNumeroCuenta(c.numeroCuenta || '');
        setNotas(c.notas || '');
      }
    }
  }, [accountId, cuentas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banco.trim()) return;

    const data = {
      banco,
      tipo,
      saldo: Number(saldo) || 0,
      reservado: Number(reservado) || 0,
      numeroCuenta,
      notas,
    };

    if (accountId) {
      await editAccount(accountId, data);
    } else {
      await addAccount(data);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!accountId) return;
    if (confirm('¿Eliminar esta cuenta bancaria?')) {
      await removeAccount(accountId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1b2127] border border-[#2e3944] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2e3944]">
          <h3 className="font-bold text-slate-100 text-lg">
            {accountId ? 'Editar Cuenta' : 'Nueva Cuenta Bancaria'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 uppercase font-semibold mb-1">Banco / Entidad *</label>
            <input
              type="text"
              required
              value={banco}
              onChange={(e) => setBanco(e.target.value)}
              placeholder="BCP / Interbank / BBVA"
              className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Tipo de Cuenta</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Cuenta corriente">Cuenta corriente</option>
                <option value="Cuenta de ahorros">Cuenta de ahorros</option>
                <option value="Cuenta CTS">Cuenta CTS</option>
                <option value="CCI">CCI</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Número de Cuenta</label>
              <input
                type="text"
                value={numeroCuenta}
                onChange={(e) => setNumeroCuenta(e.target.value)}
                placeholder="191-28391823-0-12"
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Saldo Actual (S/)</label>
              <input
                type="number"
                step="0.01"
                value={saldo}
                onChange={(e) => setSaldo(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Monto Reservado (S/)</label>
              <input
                type="number"
                step="0.01"
                value={reservado}
                onChange={(e) => setReservado(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * El monto reservado (para SUNAT o planilla) se descuenta automáticamente del cálculo de liquidez disponible.
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-[#2e3944]">
            {accountId ? (
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
                Guardar Cuenta
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
