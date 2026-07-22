import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Plus,
  Fuel,
  ShieldCheck,
  FileText,
  Trash2,
  AlertCircle,
  Wrench,
  Gauge,
  Truck,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Save,
  RotateCcw,
} from 'lucide-react';
import { DocumentType, MaintenanceTask, VehicleExpense } from '../../types';

interface VehDetailModalProps {
  vehicleId: string;
  onClose: () => void;
}

export default function VehDetailModal({ vehicleId, onClose }: VehDetailModalProps) {
  const {
    vehiculos,
    removeVehicle,
    addVehicleDoc,
    removeVehicleDoc,
    addFuelLog,
    removeFuelLog,
    updateVehicleKm,
    updateRanfla,
    addRanflaDoc,
    removeRanflaDoc,
    addMaintenanceTask,
    updateMaintenanceTask,
    removeMaintenanceTask,
    addVehicleExpense,
    removeVehicleExpense,
  } = useApp();

  const [tab, setTab] = useState<'mantenimiento' | 'ranfla' | 'gastos' | 'docs' | 'combustible'>('mantenimiento');

  // Delete Confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Submodals / Forms visibility
  const [showDocForm, setShowDocForm] = useState(false);
  const [showCombForm, setShowCombForm] = useState(false);
  const [showMaintForm, setShowMaintForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const veh = vehiculos.find((x) => x.id === vehicleId);
  if (!veh) return null;

  // Kilometer edit state
  const [currentKmInput, setCurrentKmInput] = useState<number | ''>(veh.kmActual || 185200);

  // Ranfla Form state
  const [ranflaPlaca, setRanflaPlaca] = useState(veh.ranfla?.placa || '');
  const [ranflaTipo, setRanflaTipo] = useState<any>(veh.ranfla?.tipo || 'Plataforma 3 Ejes');
  const [ranflaMarca, setRanflaMarca] = useState(veh.ranfla?.marca || '');
  const [ranflaEjes, setRanflaEjes] = useState<number>(veh.ranfla?.ejes || 3);
  const [ranflaNotas, setRanflaNotas] = useState(veh.ranfla?.notas || '');
  const [showRanflaDocForm, setShowRanflaDocForm] = useState(false);

  // Ranfla Doc Form State
  const [rDocTipo, setRDocTipo] = useState<DocumentType>('CITV Carretea / Ranfla');
  const [rDocFecha, setRDocFecha] = useState('');
  const [rDocNum, setRDocNum] = useState('');
  const [rDocNotas, setRDocNotas] = useState('');

  // Maintenance Task Form State
  const [maintTipo, setMaintTipo] = useState<MaintenanceTask['tipo']>('Cambio de Aceite y Filtros');
  const [maintDesc, setMaintDesc] = useState('');
  const [maintKmUltimo, setMaintKmUltimo] = useState<number | ''>(veh.kmActual || 185200);
  const [maintIntervalo, setMaintIntervalo] = useState<number | ''>(10000);

  // Expense Form State
  const [expFecha, setExpFecha] = useState(new Date().toISOString().slice(0, 10));
  const [expCat, setExpCat] = useState<VehicleExpense['categoria']>('Llantas');
  const [expDesc, setExpDesc] = useState('');
  const [expMonto, setExpMonto] = useState<number | ''>('');
  const [expKm, setExpKm] = useState<number | ''>(veh.kmActual || 185200);
  const [expTaller, setExpTaller] = useState('');

  // Truck Doc state
  const [docTipo, setDocTipo] = useState<DocumentType>('SOAT');
  const [docFecha, setDocFecha] = useState('');
  const [docNum, setDocNum] = useState('');
  const [docNotas, setDocNotas] = useState('');

  // Fuel state
  const [combFecha, setCombFecha] = useState(new Date().toISOString().slice(0, 10));
  const [combGalones, setCombGalones] = useState<number | ''>('');
  const [combCosto, setCombCosto] = useState<number | ''>('');
  const [combKm, setCombKm] = useState<number | ''>(veh.kmActual || 185200);
  const [combGrifo, setCombGrifo] = useState('');

  const handleDeleteVehicle = async () => {
    await removeVehicle(vehicleId);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleSaveKm = async () => {
    if (typeof currentKmInput === 'number' && currentKmInput >= 0) {
      await updateVehicleKm(vehicleId, currentKmInput);
    }
  };

  const handleSaveRanfla = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateRanfla(vehicleId, {
      placa: ranflaPlaca.trim().toUpperCase() || 'S/P',
      tipo: ranflaTipo,
      marca: ranflaMarca,
      ejes: ranflaEjes,
      notas: ranflaNotas,
      documentos: veh.ranfla?.documentos || [],
    });
  };

  const handleSaveRanflaDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rDocFecha) return;
    await addRanflaDoc(vehicleId, {
      tipo: rDocTipo,
      fecha: rDocFecha,
      numeroDoc: rDocNum,
      notas: rDocNotas,
    });
    setShowRanflaDocForm(false);
    setRDocFecha('');
    setRDocNum('');
    setRDocNotas('');
  };

  const handleSaveMaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintIntervalo) return;
    await addMaintenanceTask(vehicleId, {
      tipo: maintTipo,
      descripcion: maintDesc || maintTipo,
      kmUltimoCambio: Number(maintKmUltimo) || 0,
      intervaloKm: Number(maintIntervalo) || 10000,
      fechaUltimoCambio: new Date().toISOString().slice(0, 10),
    });
    setShowMaintForm(false);
    setMaintDesc('');
  };

  const handleRegisterMaintDoneNow = async (task: MaintenanceTask) => {
    const kmNow = typeof currentKmInput === 'number' ? currentKmInput : veh.kmActual || 0;
    await updateMaintenanceTask(vehicleId, task.id, {
      kmUltimoCambio: kmNow,
      fechaUltimoCambio: new Date().toISOString().slice(0, 10),
    });
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expMonto || !expDesc) return;
    await addVehicleExpense(vehicleId, {
      fecha: expFecha,
      categoria: expCat,
      descripcion: expDesc,
      monto: Number(expMonto),
      km: Number(expKm) || veh.kmActual || 0,
      mecanicoOTaller: expTaller,
    });
    setShowExpenseForm(false);
    setExpDesc('');
    setExpMonto('');
  };

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
      grifo: combGrifo,
    });
    setShowCombForm(false);
    setCombGalones('');
    setCombCosto('');
    setCombKm('');
  };

  const money = (n: number) =>
    'S/ ' + (n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const totalGastosAcumulados = (veh.gastos || []).reduce((acc, g) => acc + g.monto, 0);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#1b2127] border border-[#2e3944] rounded-2xl w-full max-w-3xl p-5 sm:p-6 shadow-2xl relative my-6 text-slate-100">
        
        {/* Cabecera Principal */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2e3944]">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-lg bg-[#14181c] text-amber-400 px-3 py-1 rounded-xl border border-[#2e3944] shadow-sm">
              {veh.placa}
            </span>
            <div>
              <div className="text-sm font-bold text-slate-100">
                {veh.marca} {veh.modelo}
              </div>
              <div className="text-xs text-slate-400">
                Unidad de la Empresa Familiar · Driver: Dueño
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Quitar</span>
            </button>

            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-100 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BARRA DE ODÓMETRO ACTUALIZABLE EN TIEMPO REAL */}
        <div className="bg-[#14181c] p-3.5 rounded-xl border border-[#2e3944] my-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Odómetro del Camión (Kilometraje Actual)
              </span>
              <span className="text-xs text-slate-300">
                Ingresa los Km actuales para saber exactamente cuándo hacer cambio de aceite
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={currentKmInput}
              onChange={(e) => setCurrentKmInput(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ej: 185200"
              className="w-32 px-3 py-1.5 bg-[#1b2127] border border-[#2e3944] rounded-lg text-amber-400 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
            />
            <span className="text-xs font-bold text-slate-400">Km</span>
            <button
              onClick={handleSaveKm}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1 shadow-md transition-all"
            >
              <Save className="w-3.5 h-3.5" /> Guardar
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN POR SUBTABS - SEGMENTED CONTROL NO DESPLAZABLE */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 bg-[#14181c] rounded-xl border border-[#2e3944] mb-4 text-xs font-semibold">
          <button
            onClick={() => setTab('mantenimiento')}
            className={`py-2 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
              tab === 'mantenimiento'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1b2127]'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Aceite & Control Km</span>
          </button>

          <button
            onClick={() => setTab('ranfla')}
            className={`py-2 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
              tab === 'ranfla'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1b2127]'
            }`}
          >
            <Truck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Ranfla & Papeles</span>
          </button>

          <button
            onClick={() => setTab('gastos')}
            className={`py-2 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
              tab === 'gastos'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1b2127]'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Compras & Repuestos</span>
          </button>

          <button
            onClick={() => setTab('docs')}
            className={`py-2 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
              tab === 'docs'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1b2127]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Papeles Camión</span>
          </button>

          <button
            onClick={() => setTab('combustible')}
            className={`py-2 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center col-span-2 sm:col-span-1 ${
              tab === 'combustible'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1b2127]'
            }`}
          >
            <Fuel className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Combustible</span>
          </button>
        </div>

        {/* ---------------- PESTAÑA 1: MANTENIMIENTO Y CAMBIO DE ACEITE POR KILOMETRAJE ---------------- */}
        {tab === 'mantenimiento' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-100 text-xs uppercase">Mantenimiento Preventivo</h4>
                <p className="text-[11px] text-slate-400">
                  Calcula cuántos Km te faltan para el próximo cambio de aceite, engrase o llantas.
                </p>
              </div>

              <button
                onClick={() => setShowMaintForm(!showMaintForm)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" /> Nueva Regla Mantenimiento
              </button>
            </div>

            {/* Formulario de nueva regla de mantenimiento */}
            {showMaintForm && (
              <form onSubmit={handleSaveMaint} className="bg-[#14181c] p-4 rounded-xl border border-[#2e3944] space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Tipo de Servicio *</label>
                    <select
                      value={maintTipo}
                      onChange={(e) => setMaintTipo(e.target.value as any)}
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                    >
                      <option value="Cambio de Aceite y Filtros">Cambio de Aceite y Filtros</option>
                      <option value="Engrase General">Engrase General</option>
                      <option value="Rotación / Cambio de Llantas">Rotación / Cambio de Llantas</option>
                      <option value="Frenos y Suspensión">Frenos y Suspensión</option>
                      <option value="Filtro de Aire y Secador">Filtro de Aire y Secador</option>
                      <option value="Mantenimiento Transmisión y Corona">Mantenimiento Transmisión y Corona</option>
                      <option value="Otro">Otro Mantenimiento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Intervalo cada cuántos Km *</label>
                    <input
                      type="number"
                      required
                      value={maintIntervalo}
                      onChange={(e) => setMaintIntervalo(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Ej: 10000"
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-amber-400 font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Km en que se hizo el último servicio</label>
                    <input
                      type="number"
                      value={maintKmUltimo}
                      onChange={(e) => setMaintKmUltimo(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Km último cambio"
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Descripción / Marca de Aceite o Repuesto</label>
                    <input
                      type="text"
                      value={maintDesc}
                      onChange={(e) => setMaintDesc(e.target.value)}
                      placeholder="Ej: Aceite 15W40 + 4 filtros"
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowMaintForm(false)}
                    className="px-3 py-1.5 bg-[#262f3a] text-slate-300 rounded-lg text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    Guardar Mantenimiento
                  </button>
                </div>
              </form>
            )}

            {/* LISTA DE MANTENIMIENTOS CON ASISTENTE DE KM FALTANTES */}
            <div className="space-y-3">
              {(veh.mantenimientos || []).length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-[#14181c] rounded-2xl border border-[#2e3944]/50">
                  <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50 text-amber-400" />
                  <p className="text-xs">No hay reglas de mantenimiento registradas aún.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Haz clic en "+ Nueva Regla" para agregar Cambio de Aceite o Engrase.</p>
                </div>
              ) : (
                (veh.mantenimientos || []).map((m) => {
                  const kmNow = typeof currentKmInput === 'number' ? currentKmInput : veh.kmActual || 0;
                  const kmProximo = m.kmUltimoCambio + m.intervaloKm;
                  const kmFaltantes = kmProximo - kmNow;
                  const isVencido = kmFaltantes <= 0;
                  const isPorVencer = kmFaltantes > 0 && kmFaltantes <= 1500;

                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        isVencido
                          ? 'bg-rose-500/10 border-rose-500/40'
                          : isPorVencer
                          ? 'bg-amber-500/10 border-amber-500/40'
                          : 'bg-[#14181c] border-[#2e3944]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-100">{m.tipo}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1b2127] border border-[#2e3944] text-slate-300">
                              Cada {m.intervaloKm.toLocaleString('es-PE')} km
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{m.descripcion}</p>
                        </div>

                        {/* Estado Faltante o Vencido */}
                        <div className="text-right">
                          {isVencido ? (
                            <div className="text-rose-400 font-bold text-xs flex items-center gap-1 justify-end">
                              <AlertCircle className="w-4 h-4" />
                              <span>¡VENCIDO POR {Math.abs(kmFaltantes).toLocaleString('es-PE')} KM!</span>
                            </div>
                          ) : (
                            <div className={`font-bold text-xs ${isPorVencer ? 'text-amber-400' : 'text-emerald-400'}`}>
                              Te faltan {kmFaltantes.toLocaleString('es-PE')} km
                            </div>
                          )}
                          <div className="text-[11px] text-slate-400 font-mono">
                            Próximo servicio: <span className="font-bold text-slate-200">{kmProximo.toLocaleString('es-PE')} km</span>
                          </div>
                        </div>
                      </div>

                      {/* Detalles y botón para registrar servicio rápido */}
                      <div className="pt-2 border-t border-[#2e3944]/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="text-slate-400 text-[11px] flex items-center gap-3">
                          <span>Último cambio a los: <strong className="text-slate-200 font-mono">{m.kmUltimoCambio.toLocaleString('es-PE')} km</strong></span>
                          {m.fechaUltimoCambio && <span>Fecha: <strong className="text-slate-300">{m.fechaUltimoCambio}</strong></span>}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRegisterMaintDoneNow(m)}
                            className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Registrar Cambio Realizado Hoy ({kmNow.toLocaleString('es-PE')} km)</span>
                          </button>

                          <button
                            onClick={() => removeMaintenanceTask(vehicleId, m.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Eliminar regla"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ---------------- PESTAÑA 2: RANFLA / CARRETEA & PAPELES OFICIALES ---------------- */}
        {tab === 'ranfla' && (
          <div className="space-y-5">
            {/* Formulario de Datos de la Ranfla */}
            <form onSubmit={handleSaveRanfla} className="bg-[#14181c] p-4 rounded-xl border border-[#2e3944] space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#2e3944] pb-2">
                <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
                  <Truck className="w-4 h-4" />
                  <span>Datos de la Ranfla / Carretea (Semirremolque)</span>
                </div>
                <button
                  type="submit"
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" /> Guardar Ranfla
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Placa Ranfla *</label>
                  <input
                    type="text"
                    required
                    value={ranflaPlaca}
                    onChange={(e) => setRanflaPlaca(e.target.value)}
                    placeholder="Ej: R3B-912"
                    className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-amber-400 font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tipo de Ranfla</label>
                  <select
                    value={ranflaTipo}
                    onChange={(e) => setRanflaTipo(e.target.value as any)}
                    className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                  >
                    <option value="Plataforma 3 Ejes">Plataforma 3 Ejes</option>
                    <option value="Furgón 3 Ejes">Furgón 3 Ejes</option>
                    <option value="Cama Baja">Cama Baja</option>
                    <option value="Contenedora">Contenedora</option>
                    <option value="Cisterna">Cisterna</option>
                    <option value="Cortinero">Cortinero</option>
                    <option value="Otro">Otro Tipo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Marca Ranfla</label>
                  <input
                    type="text"
                    value={ranflaMarca}
                    onChange={(e) => setRanflaMarca(e.target.value)}
                    placeholder="Ej: Randon / Gotelli"
                    className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">N° de Ejes</label>
                  <input
                    type="number"
                    value={ranflaEjes}
                    onChange={(e) => setRanflaEjes(Number(e.target.value))}
                    className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </form>

            {/* PAPELES DE LA RANFLA */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-100 text-xs uppercase">Papeles y Certificados de la Ranfla</h4>
                  <p className="text-[11px] text-slate-400">CITV de Carretea, Tarjeta Propiedad Ranfla, Póliza de Seguro</p>
                </div>

                <button
                  onClick={() => setShowRanflaDocForm(!showRanflaDocForm)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Papel de Ranfla
                </button>
              </div>

              {/* Formulario de Papel de Ranfla */}
              {showRanflaDocForm && (
                <form onSubmit={handleSaveRanflaDoc} className="bg-[#14181c] p-4 rounded-xl border border-[#2e3944] space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Tipo Documento Ranfla</label>
                      <select
                        value={rDocTipo}
                        onChange={(e) => setRDocTipo(e.target.value as any)}
                        className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                      >
                        <option value="CITV Carretea / Ranfla">CITV Carretea / Ranfla</option>
                        <option value="Tarjeta Propiedad Ranfla">Tarjeta Propiedad Ranfla</option>
                        <option value="Póliza Seguro Ranfla">Póliza Seguro Ranfla</option>
                        <option value="Habilitación Ranfla (SUTRAN/MTC)">Habilitación Ranfla (SUTRAN/MTC)</option>
                        <option value="Otro">Otro Certificado Ranfla</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Fecha Vencimiento *</label>
                      <input
                        type="date"
                        required
                        value={rDocFecha}
                        onChange={(e) => setRDocFecha(e.target.value)}
                        className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Número de Certificado / Póliza</label>
                      <input
                        type="text"
                        value={rDocNum}
                        onChange={(e) => setRDocNum(e.target.value)}
                        placeholder="N° Certificado"
                        className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Notas u Observaciones</label>
                      <input
                        type="text"
                        value={rDocNotas}
                        onChange={(e) => setRDocNotas(e.target.value)}
                        placeholder="Entidad emisora"
                        className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowRanflaDocForm(false)}
                      className="px-3 py-1.5 bg-[#262f3a] text-slate-300 rounded-lg text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                    >
                      Guardar Documento Ranfla
                    </button>
                  </div>
                </form>
              )}

              {/* Lista de Papeles de Ranfla */}
              <div className="space-y-2">
                {(!veh.ranfla?.documentos || veh.ranfla.documentos.length === 0) ? (
                  <div className="text-center py-6 text-slate-500 bg-[#14181c] rounded-xl border border-[#2e3944]/50 text-xs">
                    No hay documentos específicos registrados para la ranfla.
                  </div>
                ) : (
                  veh.ranfla.documentos.map((d) => {
                    const days = Math.ceil((new Date(d.fecha).getTime() - Date.now()) / (1000 * 3600 * 24));
                    const isVencido = days <= 0;
                    const isProx = days > 0 && days <= 30;

                    return (
                      <div
                        key={d.id}
                        className="p-3 bg-[#14181c] border border-[#2e3944] rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-200">{d.tipo}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Vence: <strong className="text-amber-400">{d.fecha}</strong>
                            {d.numeroDoc && ` · N°: ${d.numeroDoc}`}
                          </div>
                          {d.notas && <div className="text-[10px] text-slate-400">{d.notas}</div>}
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                              isVencido
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : isProx
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {isVencido ? 'VENCIDO' : `${days} días restantes`}
                          </span>

                          <button
                            onClick={() => removeRanflaDoc(vehicleId, d.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- PESTAÑA 3: GASTOS, COMPRAS DE REPUESTOS, LLANTAS Y ACCESORIOS ---------------- */}
        {tab === 'gastos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-100 text-xs uppercase">Compras & Gastos del Vehículo / Ranfla</h4>
                <p className="text-[11px] text-slate-400">
                  Llantas, cambio de aceite, repuestos, accesorios, lavados y planchado.
                </p>
              </div>

              <button
                onClick={() => setShowExpenseForm(!showExpenseForm)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" /> Registrar Compra / Gasto
              </button>
            </div>

            {/* FORMULARIO DE COMPRA / GASTO */}
            {showExpenseForm && (
              <form onSubmit={handleSaveExpense} className="bg-[#14181c] p-4 rounded-xl border border-[#2e3944] space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Categoría de Gasto *</label>
                    <select
                      value={expCat}
                      onChange={(e) => setExpCat(e.target.value as any)}
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                    >
                      <option value="Llantas">Llantas (Tracción / Ranfla)</option>
                      <option value="Aceite y Filtros">Aceite y Filtros</option>
                      <option value="Repuestos y Accesorios">Repuestos y Accesorios</option>
                      <option value="Mantenimiento Mecánico">Mantenimiento Mecánico</option>
                      <option value="Planchado y Pintura">Planchado y Pintura</option>
                      <option value="Peajes y Lavado">Peajes y Lavado</option>
                      <option value="Otro">Otro Gasto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Monto Total (S/) *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={expMonto}
                      onChange={(e) => setExpMonto(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Ej: 2400.00"
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-amber-400 font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Fecha</label>
                    <input
                      type="date"
                      value={expFecha}
                      onChange={(e) => setExpFecha(e.target.value)}
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 font-semibold mb-1">Descripción del Ítem / Repuesto *</label>
                    <input
                      type="text"
                      required
                      value={expDesc}
                      onChange={(e) => setExpDesc(e.target.value)}
                      placeholder="Ej: 2 Llantas Bridgestone 295/80R22.5"
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Kilometraje Actual</label>
                    <input
                      type="number"
                      value={expKm}
                      onChange={(e) => setExpKm(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Km al comprar"
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Taller / Proveedor (Opcional)</label>
                  <input
                    type="text"
                    value={expTaller}
                    onChange={(e) => setExpTaller(e.target.value)}
                    placeholder="Ej: Taller Central Volvo / Comercial Repuestos"
                    className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowExpenseForm(false)}
                    className="px-3 py-1.5 bg-[#262f3a] text-slate-300 rounded-lg text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    Guardar Gasto
                  </button>
                </div>
              </form>
            )}

            {/* TOTAL GASTOS Y TABLA DE COMPRAS */}
            <div className="bg-[#14181c] p-3 rounded-xl border border-[#2e3944] flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Inversión y Gastos Acumulados en este Vehículo:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{money(totalGastosAcumulados)}</span>
            </div>

            <div className="space-y-2">
              {(!veh.gastos || veh.gastos.length === 0) ? (
                <div className="text-center py-6 text-slate-500 bg-[#14181c] rounded-xl border border-[#2e3944]/50 text-xs">
                  No hay registro de compras de accesorios o repuestos aún.
                </div>
              ) : (
                veh.gastos.map((g) => (
                  <div
                    key={g.id}
                    className="p-3 bg-[#14181c] border border-[#2e3944] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{g.descripcion}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {g.categoria}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {g.fecha} · {g.km ? `${g.km.toLocaleString('es-PE')} km` : ''}
                        {g.mecanicoOTaller && ` · Taller: ${g.mecanicoOTaller}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-emerald-400 text-sm">{money(g.monto)}</span>
                      <button
                        onClick={() => removeVehicleExpense(vehicleId, g.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
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

        {/* ---------------- PESTAÑA 4: PAPELES DEL CAMIÓN / TRÁILER ---------------- */}
        {tab === 'docs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-100 text-xs uppercase">Documentos Oficiales del Camión</h4>
              <button
                onClick={() => setShowDocForm(!showDocForm)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Papel
              </button>
            </div>

            {/* Formulario de documento de camión */}
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

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDocForm(false)}
                    className="px-3 py-1.5 bg-[#262f3a] text-slate-300 rounded-lg text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    Guardar Documento
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {(!veh.documentos || veh.documentos.length === 0) ? (
                <div className="text-center py-6 text-slate-500 bg-[#14181c] rounded-xl border border-[#2e3944]/50 text-xs">
                  Sin papeles registrados para este camión.
                </div>
              ) : (
                veh.documentos.map((d) => {
                  const days = Math.ceil((new Date(d.fecha).getTime() - Date.now()) / (1000 * 3600 * 24));
                  const isVencido = days <= 0;
                  const isProx = days > 0 && days <= 30;

                  return (
                    <div
                      key={d.id}
                      className="p-3 bg-[#14181c] border border-[#2e3944] rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-200">{d.tipo}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Vence: <strong className="text-amber-400">{d.fecha}</strong>
                          {d.numeroDoc && ` · N°: ${d.numeroDoc}`}
                        </div>
                        {d.notas && <div className="text-[10px] text-slate-400">{d.notas}</div>}
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            isVencido
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : isProx
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isVencido ? 'VENCIDO' : `${days} días restantes`}
                        </span>

                        <button
                          onClick={() => removeVehicleDoc(vehicleId, d.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ---------------- PESTAÑA 5: HISTORIAL DE COMBUSTIBLE DIÉSEL ---------------- */}
        {tab === 'combustible' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-100 text-xs uppercase">Historial de Recargas Diésel</h4>
              <button
                onClick={() => setShowCombForm(!showCombForm)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar Carga
              </button>
            </div>

            {/* Formulario Carga Combustible */}
            {showCombForm && (
              <form onSubmit={handleSaveFuel} className="bg-[#14181c] p-4 rounded-xl border border-[#2e3944] space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Fecha</label>
                    <input
                      type="date"
                      value={combFecha}
                      onChange={(e) => setCombFecha(e.target.value)}
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Galones Diésel *</label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      value={combGalones}
                      onChange={(e) => setCombGalones(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Ej: 120"
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Costo Total (S/) *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={combCosto}
                      onChange={(e) => setCombCosto(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Ej: 2340.00"
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-amber-400 font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Kilometraje del Odómetro *</label>
                    <input
                      type="number"
                      required
                      value={combKm}
                      onChange={(e) => setCombKm(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Ej: 185200"
                      className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Grifo / Estación de Servicio</label>
                  <input
                    type="text"
                    value={combGrifo}
                    onChange={(e) => setCombGrifo(e.target.value)}
                    placeholder="Ej: Primax Panamericana Sur"
                    className="w-full p-2 bg-[#1b2127] border border-[#2e3944] rounded-lg text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCombForm(false)}
                    className="px-3 py-1.5 bg-[#262f3a] text-slate-300 rounded-lg text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    Guardar Recarga
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {(!veh.combustible || veh.combustible.length === 0) ? (
                <div className="text-center py-6 text-slate-500 bg-[#14181c] rounded-xl border border-[#2e3944]/50 text-xs">
                  Sin historial de combustible registrado.
                </div>
              ) : (
                veh.combustible.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-[#14181c] border border-[#2e3944] rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200">
                        {c.galones} Galones {c.grifo && `· ${c.grifo}`}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {c.fecha} · Odómetro: <strong className="text-slate-300">{c.km.toLocaleString('es-PE')} km</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-amber-400 text-sm">{money(c.costo)}</span>
                      <button
                        onClick={() => removeFuelLog(vehicleId, c.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
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

        {/* Modal de Confirmación de Eliminación */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-[#1b2127] border border-rose-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="font-bold text-slate-100 text-lg">¿Estás seguro de quitar este vehículo?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Estás a punto de eliminar la unidad{' '}
                  <span className="font-mono font-bold text-amber-400 bg-[#14181c] px-2 py-0.5 rounded border border-[#2e3944]">
                    {veh.placa}
                  </span>{' '}
                  de la flota. Se eliminarán sus papeles, ranfla y mantenimientos.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-[#262f3a] hover:bg-[#2e3944] text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteVehicle}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Sí, Eliminar Vehículo</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
