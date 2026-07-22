import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Fuel, ShieldCheck, FileText, Trash2, Edit } from 'lucide-react';
import { DocumentType } from '../../types';

interface VehDetailModalProps {
  vehicleId: string;
  onClose: () => void;
}

export default function VehDetailModal({ vehicleId, onClose }: VehDetailModalProps) {
  const { vehiculos, addVehicleDoc, removeVehicleDoc, addFuelLog, removeFuelLog } = useApp();
  const [tab, setTab] = useState<'docs' | 'combustible'>('docs');

  // Submodals
  const [showDocForm, setShowDocForm] = useState(false);
  const [showCombForm, setShowCombForm] = useState(false);

  // New Doc state
  const [docTipo, setDocTipo] = useState<DocumentType>('SOAT');
  const [docFecha, setDocFecha] = useState('');
  const [docNum, setDocNum] = useState('');
  const [docNotas, setDocNotas] = useState('');

  // New Fuel state
  const [combFecha, setCombFecha] = useState(new Date().toISOString().slice(0, 10));
  const [combGalones, setCombGalones] = useState<number | ''>('');
  const [combCosto, setCombCosto] = useState<number | ''>('');
  const [combKm, setCombKm] = useState<number | ''>('');
  const [combNivel, setCombNivel] = useState<number>(100);
  const [combGrifo, setCombGrifo] = useState('');

  const veh = vehiculos.find((x) => x.id === vehicleId);
  if (!veh) return null;

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFecha) return;
    await addVehicleDoc(vehicleId, {
      tipo: docTipo,
      fecha: docFecha,
      numeroDoc: docNum,
      notas: docNotas,
    });
    setShowDocForm(false);
    setDocFecha('');
    setDocNum('');
    setDocNotas('');
  };

  const handleSaveFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    await addFuelLog(vehicleId, {
      fecha: combFecha,
      galones: Number(combGalones) || 0,
      costo: Number(combCosto) || 0,
      km: Number(combKm) || 0,
      nivel: combNivel,
      grifo: combGrifo,
    });
    setShowCombForm(false);
    setCombGalones('');
    setCombCosto('');
    setCombKm('');
  };

  const money = (n: number) =>
    'S/ ' + (n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1b2127] border border-[#2e3944] rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#2e3944]">
          <div>
            <span className="font-mono font-bold text-lg bg-[#14181c] text-amber-400 px-3 py-1 rounded-xl border border-[#2e3944]">
              {veh.placa}
            </span>
            <span className="text-xs text-slate-400 font-semibold ml-3">
              {veh.tipo} {veh.marca} {veh.modelo}
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex border-b border-[#2e3944] my-4 gap-2">
          <button
            onClick={() => setTab('docs')}
            className={`py-2 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              tab === 'docs'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Papeles & Cumplimiento (SUTRAN / MTC / SUNAT)
          </button>
          <button
            onClick={() => setTab('combustible')}
            className={`py-2 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              tab === 'combustible'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Historial de Combustible
          </button>
        </div>

        {/* TAB: DOCUMENTS */}
        {tab === 'docs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-100 text-xs uppercase">Documentos Registrados</h4>
              <button
                onClick={() => setShowDocForm(!showDocForm)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Papel
              </button>
            </div>

            {/* Doc form inline */}
            {showDocForm && (
              <form onSubmit={handleSaveDoc} className="bg-[#14181c] p-4 rounded-xl border border-[#2e3944] space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Tipo Documento</label>
                    <select
                      value={docTipo}
                      onChange={(e) => setDocTipo(e.target.value as any)}
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                    >
                      <option value="SOAT">SOAT</option>
                      <option value="Revisión Técnica">Revisión Técnica</option>
                      <option value="Tarjeta de Propiedad">Tarjeta de Propiedad</option>
                      <option value="Permiso de Operación (SUTRAN)">Permiso de Operación (SUTRAN)</option>
                      <option value="Certificado de Habilitación Vehicular (MTC)">Habilitación Vehicular (MTC)</option>
                      <option value="Póliza de Seguro">Póliza de Seguro</option>
                      <option value="Ficha RUC del vehículo (SUNAT)">Ficha RUC Vehículo (SUNAT)</option>
                      <option value="GPS / Rastreo satelital">GPS / Rastreo Satelital</option>
                      <option value="Otro">Otro Documento</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Fecha Vencimiento *</label>
                    <input
                      type="date"
                      required
                      value={docFecha}
                      onChange={(e) => setDocFecha(e.target.value)}
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Número de Póliza / Doc</label>
                    <input
                      type="text"
                      value={docNum}
                      onChange={(e) => setDocNum(e.target.value)}
                      placeholder="N° Certificado"
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Notas</label>
                    <input
                      type="text"
                      value={docNotas}
                      onChange={(e) => setDocNotas(e.target.value)}
                      placeholder="Aseguradora, observaciones"
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDocForm(false)}
                    className="px-3 py-1 bg-[#262f3a] text-slate-300 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg">
                    Guardar
                  </button>
                </div>
              </form>
            )}

            {/* List of Docs */}
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(veh.documentos || []).length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">Sin documentos asignados a esta unidad.</div>
              ) : (
                (veh.documentos || []).map((d) => {
                  const daysLeft = d.fecha
                    ? Math.round((new Date(d.fecha + 'T00:00:00').getTime() - Date.now()) / 86400000)
                    : null;

                  return (
                    <div
                      key={d.id}
                      className="bg-[#14181c] p-3 rounded-xl border border-[#2e3944] flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-200">{d.tipo}</div>
                        <div className="text-[11px] text-slate-400">
                          Vence: <b className="text-slate-100">{d.fecha || 'Sin fecha'}</b>
                          {daysLeft !== null && (
                            <span className={`ml-2 ${daysLeft < 0 ? 'text-rose-400' : daysLeft <= 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              ({daysLeft < 0 ? `${Math.abs(daysLeft)}d vencido` : `${daysLeft}d restantes`})
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => removeVehicleDoc(vehicleId, d.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB: COMBUSTIBLE */}
        {tab === 'combustible' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-100 text-xs uppercase">Historial de Combustible Diesel B5</h4>
              <button
                onClick={() => setShowCombForm(!showCombForm)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar Recarga
              </button>
            </div>

            {/* Fuel form inline */}
            {showCombForm && (
              <form onSubmit={handleSaveFuel} className="bg-[#14181c] p-4 rounded-xl border border-[#2e3944] space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Fecha Recarga</label>
                    <input
                      type="date"
                      required
                      value={combFecha}
                      onChange={(e) => setCombFecha(e.target.value)}
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Galones</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={combGalones}
                      onChange={(e) => setCombGalones(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="120.0"
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Costo Total (S/)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={combCosto}
                      onChange={(e) => setCombCosto(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="2340.00"
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Kilometraje Odometer</label>
                    <input
                      type="number"
                      value={combKm}
                      onChange={(e) => setCombKm(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="185200"
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Nivel Tanque Post-Recarga (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={combNivel}
                      onChange={(e) => setCombNivel(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <div className="text-right text-[10px] text-amber-400 font-bold">{combNivel}%</div>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Grifo / Estación</label>
                    <input
                      type="text"
                      value={combGrifo}
                      onChange={(e) => setCombGrifo(e.target.value)}
                      placeholder="Primax Panamericana Sur"
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCombForm(false)}
                    className="px-3 py-1 bg-[#262f3a] text-slate-300 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg">
                    Guardar
                  </button>
                </div>
              </form>
            )}

            {/* List of Fuel logs */}
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(veh.combustible || []).length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">Sin cargas registradas.</div>
              ) : (
                (veh.combustible || []).map((c) => (
                  <div
                    key={c.id}
                    className="bg-[#14181c] p-3 rounded-xl border border-[#2e3944] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{c.fecha}</div>
                      <div className="text-[11px] text-slate-400">
                        {c.galones} gal · {c.km ? `${c.km} km` : 'sin km'} · Nivel {c.nivel}% {c.grifo && `· ${c.grifo}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-amber-400">{money(c.costo)}</span>
                      <button
                        onClick={() => removeFuelLog(vehicleId, c.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
