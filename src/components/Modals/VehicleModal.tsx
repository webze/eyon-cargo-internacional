import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2 } from 'lucide-react';

interface VehicleModalProps {
  vehicleId: string | null;
  onClose: () => void;
}

export default function VehicleModal({ vehicleId, onClose }: VehicleModalProps) {
  const { vehiculos, addVehicle, editVehicle, removeVehicle } = useApp();

  const [placa, setPlaca] = useState('');
  const [tipo, setTipo] = useState<'Tráiler' | 'Camión' | 'Furgón' | 'Camioneta' | 'Otro'>('Tráiler');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (vehicleId) {
      const v = vehiculos.find((x) => x.id === vehicleId);
      if (v) {
        setPlaca(v.placa);
        setTipo(v.tipo);
        setMarca(v.marca || '');
        setModelo(v.modelo || '');
        setNotas(v.notas || '');
      }
    }
  }, [vehicleId, vehiculos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa.trim()) return;

    const data = {
      placa: placa.toUpperCase().trim(),
      tipo,
      marca,
      modelo,
      notas,
      estado: 'Operativo' as const,
    };

    if (vehicleId) {
      await editVehicle(vehicleId, data);
    } else {
      await addVehicle(data);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!vehicleId) return;
    if (confirm('¿Eliminar esta unidad y todo su historial de papeles y combustible?')) {
      await removeVehicle(vehicleId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1b2127] border border-[#2e3944] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2e3944]">
          <h3 className="font-bold text-slate-100 text-lg">
            {vehicleId ? 'Editar Vehículo' : 'Nuevo Vehículo de Flota'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Placa Vehicular *</label>
              <input
                type="text"
                required
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                placeholder="V7A-982"
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 font-mono text-sm uppercase focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Tipo de Unidad</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Tráiler">Tráiler</option>
                <option value="Camión">Camión</option>
                <option value="Furgón">Furgón</option>
                <option value="Camioneta">Camioneta</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Marca</label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Volvo / Scania"
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Modelo / Año</label>
              <input
                type="text"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="FH 500 (2022)"
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 uppercase font-semibold mb-1">Notas / Especificaciones</label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ejes, capacidad de carga, retardo..."
              className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#2e3944]">
            {vehicleId ? (
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
                Guardar Vehículo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
