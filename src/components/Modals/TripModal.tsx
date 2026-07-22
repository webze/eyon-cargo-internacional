import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2 } from 'lucide-react';
import { TripStatus } from '../../types';

interface TripModalProps {
  tripId: string | null;
  preSelectedClientId?: string | null;
  onClose: () => void;
}

export default function TripModal({ tripId, preSelectedClientId, onClose }: TripModalProps) {
  const { viajes, clientes, vehiculos, addTrip, editTrip, removeTrip } = useApp();

  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [clienteId, setClienteId] = useState('');
  const [vehiculoId, setVehiculoId] = useState('');
  const [estado, setEstado] = useState<TripStatus>('Programado');
  const [conductor, setConductor] = useState('');
  const [monto, setMonto] = useState<number | ''>('');
  const [guiasRemision, setGuiasRemision] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (preSelectedClientId) setClienteId(preSelectedClientId);

    if (tripId) {
      const v = viajes.find((x) => x.id === tripId);
      if (v) {
        setOrigen(v.origen);
        setDestino(v.destino);
        setFecha(v.fecha);
        setClienteId(v.clienteId || '');
        setVehiculoId(v.vehiculoId || '');
        setEstado(v.estado);
        setConductor(v.conductor || '');
        setMonto(v.monto || '');
        setGuiasRemision(v.guiasRemision || '');
        setNotas(v.notas || '');
      }
    }
  }, [tripId, viajes, preSelectedClientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origen.trim() || !destino.trim() || !fecha) return;

    const data = {
      origen,
      destino,
      fecha,
      clienteId,
      vehiculoId,
      estado,
      conductor,
      monto: Number(monto) || 0,
      guiasRemision,
      notas,
    };

    if (tripId) {
      await editTrip(tripId, data);
    } else {
      await addTrip(data);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!tripId) return;
    if (confirm('¿Eliminar este registro de viaje?')) {
      await removeTrip(tripId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1b2127] border border-[#2e3944] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2e3944]">
          <h3 className="font-bold text-slate-100 text-lg">
            {tripId ? 'Editar Viaje / Flete' : 'Nuevo Viaje de Carga'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Origen *</label>
              <input
                type="text"
                required
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                placeholder="Ej. Lima (Terminal Callao)"
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Destino *</label>
              <input
                type="text"
                required
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Ej. Arequipa (Mina Cerro Verde)"
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Cliente Corporativo</label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="">— Seleccionar Cliente —</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Unidad de Flota</label>
              <select
                value={vehiculoId}
                onChange={(e) => setVehiculoId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="">— Seleccionar Placa —</option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} ({v.tipo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Fecha de Salida *</label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Estado Operativo</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as TripStatus)}
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Programado">Programado</option>
                <option value="En curso">En curso</option>
                <option value="Completado">Completado</option>
                <option value="Atrasado">Atrasado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Conductor Asignado</label>
              <input
                type="text"
                value={conductor}
                onChange={(e) => setConductor(e.target.value)}
                placeholder="Manuel Reyes"
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Monto del Flete (S/)</label>
              <input
                type="number"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="8500.00"
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 uppercase font-semibold mb-1">Guías de Remisión SUNAT</label>
            <input
              type="text"
              value={guiasRemision}
              onChange={(e) => setGuiasRemision(e.target.value)}
              placeholder="001-008923 / 001-008924"
              className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#2e3944]">
            {tripId ? (
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
                Guardar Viaje
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
