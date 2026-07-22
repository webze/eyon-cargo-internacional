import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, AlertCircle } from 'lucide-react';

interface ClientModalProps {
  clientId: string | null;
  onClose: () => void;
}

export default function ClientModal({ clientId, onClose }: ClientModalProps) {
  const { clientes, addClient, editClient, removeClient } = useApp();

  const [nombre, setNombre] = useState('');
  const [ruc, setRuc] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contacto, setContacto] = useState('');
  const [email, setEmail] = useState('');
  const [notas, setNotas] = useState('');

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (clientId) {
      const c = clientes.find((x) => x.id === clientId);
      if (c) {
        setNombre(c.nombre);
        setRuc(c.ruc || '');
        setTelefono(c.telefono || '');
        setContacto(c.contacto || '');
        setEmail(c.email || '');
        setNotas(c.notas || '');
      }
    }
  }, [clientId, clientes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (clientId) {
      await editClient(clientId, { nombre, ruc, telefono, contacto, email, notas });
    } else {
      await addClient({ nombre, ruc, telefono, contacto, email, notas, estado: 'Activo' });
    }
    onClose();
  };

  const handleDelete = async () => {
    if (!clientId) return;
    await removeClient(clientId);
    setShowConfirmDelete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1b2127] border border-[#2e3944] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2e3944]">
          <h3 className="font-bold text-slate-100 text-lg">
            {clientId ? 'Editar Cliente' : 'Nuevo Cliente Corporativo'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {showConfirmDelete ? (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-slate-100">¿Estás seguro de eliminar este cliente?</p>
                <p className="text-xs text-slate-400 mt-1">
                  Cliente: <b className="text-slate-200">{nombre}</b>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 bg-[#14181c] p-3 rounded-xl border border-[#2e3944]">
              Al eliminar este cliente corporativo, también se eliminarán todos los fletes y viajes asociados.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 bg-[#262f3a] hover:bg-[#2e3944] text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" /> Sí, Eliminar Cliente
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Razón Social / Nombre *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Minera Chinalco Perú S.A."
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">RUC SUNAT</label>
                <input
                  type="text"
                  value={ruc}
                  onChange={(e) => setRuc(e.target.value)}
                  placeholder="20100234567"
                  className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Teléfono Directo</label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="01-2114000 / 951 234 567"
                  className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Persona de Contacto</label>
                <input
                  type="text"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                  placeholder="Ing. Carlos Mendoza"
                  className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 uppercase font-semibold mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contacto@empresa.com"
                  className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 uppercase font-semibold mb-1">Notas / Observaciones</label>
              <textarea
                rows={2}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Permisos especiales, requerimientos SUTRAN, etc."
                className="w-full px-3.5 py-2.5 bg-[#14181c] border border-[#2e3944] rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2e3944]">
              {clientId ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-[#262f3a] hover:bg-[#2e3944] text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
                >
                  Guardar Cliente
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
