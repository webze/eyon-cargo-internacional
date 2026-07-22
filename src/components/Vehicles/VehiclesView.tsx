import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Car, Plus, ShieldAlert, Fuel, FileCheck, AlertTriangle, ChevronRight, Truck, Wrench, Shield, Gauge, Clock, Trash2, Edit3, AlertCircle } from 'lucide-react';
import ExpirationCountdownBar from '../Common/ExpirationCountdownBar';

/**
 * ============================================================================
 * COMPONENTE: VehiclesView (Gestión de Flota Pesada y Documentación)
 * ============================================================================
 * @description
 * Módulo de control de flota para camiones, tráilers y furgones de EYON Cargo.
 * Audita en tiempo real los vencimientos de documentos oficiales obligatorios:
 * - SOAT (Seguro Obligatorio de Accidentes de Tránsito)
 * - CITV (Revisión Técnica Vehicular)
 * - Permiso de Operación SUTRAN
 * - Certificado de Habilitación MTC
 * - Póliza de Carga y Responsabilidad Civil
 * 
 * Incorpora barras de progreso y cronómetros de vencimiento para cada documento.
 * Permite añadir, editar y eliminar vehículos con confirmación de seguridad.
 * ============================================================================
 */
interface VehiclesViewProps {
  onOpenVehicleModal: (id?: string) => void;
  onOpenVehDetail: (id: string) => void;
}

export default function VehiclesView({ onOpenVehicleModal, onOpenVehDetail }: VehiclesViewProps) {
  const { vehiculos, removeVehicle } = useApp();
  const [vehicleToDelete, setVehicleToDelete] = useState<{ id: string; placa: string } | null>(null);

  let totalVencidos = 0;
  let totalPorVencer = 0;

  // Auditoría rápida de alerta global de documentos
  vehiculos.forEach((v) => {
    (v.documentos || []).forEach((doc) => {
      if (!doc.fecha) return;
      const daysLeft = Math.round((new Date(doc.fecha + 'T00:00:00').getTime() - Date.now()) / 86400000);
      if (daysLeft < 0) totalVencidos++;
      else if (daysLeft <= 30) totalPorVencer++;
    });
  });

  // Identificar la unidad principal de carga pesada (Tráiler de cabecera)
  const mainTrailer = vehiculos.find((v) => v.tipo === 'Tráiler') || vehiculos[0];

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete) return;
    await removeVehicle(vehicleToDelete.id);
    setVehicleToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* ----------------- CABECERA Y BOTÓN DE REGISTRO ----------------- */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Unidad de Carga Pesada & Control de Flota
          </div>
          <div className="text-lg font-bold text-slate-100">
            {vehiculos.length} unidad(es) de transporte registrada(s)
          </div>
        </div>

        <button
          onClick={() => onOpenVehicleModal()}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Añadir Vehículo
        </button>
      </div>

      {/* ----------------- TARJETA PRINCIPAL DESTACADA (TRÁILER HEAVY DUTY) ----------------- */}
      {mainTrailer && (() => {
        const kmNow = mainTrailer.kmActual || 185200;
        
        // Mantenimiento de Aceite
        const aceiteTask = (mainTrailer.mantenimientos || []).find((m) =>
          m.tipo.toLowerCase().includes('aceite')
        ) || mainTrailer.mantenimientos?.[0];

        const kmProximoAceite = aceiteTask ? aceiteTask.kmUltimoCambio + aceiteTask.intervaloKm : 190000;
        const kmFaltantesAceite = kmProximoAceite - kmNow;
        const isAceiteVencido = kmFaltantesAceite <= 0;

        // Gastos acumulados
        const totalGastosAcumulados = (mainTrailer.gastos || []).reduce((sum, g) => sum + g.monto, 0);

        // Ranfla asignada
        const ranflaPlaca = mainTrailer.ranfla?.placa || 'R3B-912';
        const ranflaTipo = mainTrailer.ranfla?.tipo || 'Plataforma 3 Ejes';
        const ranflaDocsCount = (mainTrailer.ranfla?.documentos || []).length;

        // Próximo documento de camión o ranfla
        const allDocs = [
          ...(mainTrailer.documentos || []),
          ...(mainTrailer.ranfla?.documentos || []),
        ].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

        const proxDoc = allDocs[0];

        return (
          <div className="bg-gradient-to-br from-[#212933] via-[#1b222b] to-[#14181c] border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Cabecera de la Unidad */}
            <div className="flex items-start justify-between flex-wrap gap-4 mb-5 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <Truck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-black text-2xl text-amber-400 bg-[#101418] px-3.5 py-1 rounded-xl border border-amber-500/30">
                      {mainTrailer.placa}
                    </span>
                    <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold uppercase rounded-lg tracking-wider">
                      {mainTrailer.tipo} Carga Pesada
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-lg flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {mainTrailer.estado || 'Operativo'}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-200 mt-1">
                    {mainTrailer.marca} {mainTrailer.modelo} · {mainTrailer.notas || 'Unidad de Carga Pesada Familiar'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onOpenVehicleModal(mainTrailer.id)}
                  title="Editar Datos de Vehículo"
                  className="p-2.5 bg-[#262f3a] hover:bg-[#2e3944] text-slate-300 hover:text-amber-400 rounded-xl transition-all cursor-pointer border border-[#2e3944]"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setVehicleToDelete({ id: mainTrailer.id, placa: mainTrailer.placa })}
                  title="Eliminar Vehículo de Flota"
                  className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenVehDetail(mainTrailer.id)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  <span>Gestión Completa & Ficha Técnica</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* GRID CON TODOS LOS DATOS VISIBLES DIRECTAMENTE (SIN CONSUMO DE GASOLINA) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10 mb-5">
              
              {/* 1. ODÓMETRO ACTUAL */}
              <div
                onClick={() => onOpenVehDetail(mainTrailer.id)}
                className="bg-[#14181c]/90 border border-[#2e3944] hover:border-amber-500/50 rounded-xl p-3.5 cursor-pointer transition-all space-y-1"
              >
                <div className="text-[11px] text-slate-400 flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-amber-400" />
                    Odómetro Actual
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold hover:underline">Actualizar</span>
                </div>
                <div className="text-xl font-black font-mono text-amber-400 mt-1">
                  {kmNow.toLocaleString('es-PE')} KM
                </div>
                <div className="text-[10px] text-slate-400">Kilometraje real del camión</div>
              </div>

              {/* 2. RANFLA / CARRETEA */}
              <div
                onClick={() => onOpenVehDetail(mainTrailer.id)}
                className="bg-[#14181c]/90 border border-[#2e3944] hover:border-blue-500/50 rounded-xl p-3.5 cursor-pointer transition-all space-y-1"
              >
                <div className="text-[11px] text-slate-400 flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-400" />
                    Ranfla / Carretea
                  </span>
                  <span className="text-[10px] text-blue-400 font-bold">{ranflaDocsCount} Papeles</span>
                </div>
                <div className="text-lg font-bold font-mono text-slate-100 mt-1 truncate">
                  {ranflaPlaca}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{ranflaTipo}</div>
              </div>

              {/* 3. CAMBIO DE ACEITE Y MANTENIMIENTO */}
              <div
                onClick={() => onOpenVehDetail(mainTrailer.id)}
                className={`bg-[#14181c]/90 border rounded-xl p-3.5 cursor-pointer transition-all space-y-1 ${
                  isAceiteVencido ? 'border-rose-500/60 bg-rose-500/10' : 'border-[#2e3944] hover:border-amber-500/50'
                }`}
              >
                <div className="text-[11px] text-slate-400 flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    Cambio de Aceite
                  </span>
                  <span className={`text-[10px] font-bold ${isAceiteVencido ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isAceiteVencido ? '¡REQUERIDO!' : 'En regla'}
                  </span>
                </div>
                <div className={`text-base font-bold font-mono mt-1 ${isAceiteVencido ? 'text-rose-300' : 'text-emerald-400'}`}>
                  {isAceiteVencido
                    ? `Vencido ${Math.abs(kmFaltantesAceite).toLocaleString('es-PE')} KM`
                    : `Faltan ${kmFaltantesAceite.toLocaleString('es-PE')} KM`}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Próximo cambio: {kmProximoAceite.toLocaleString('es-PE')} KM
                </div>
              </div>

              {/* 4. COMPRAS Y REPUESTOS */}
              <div
                onClick={() => onOpenVehDetail(mainTrailer.id)}
                className="bg-[#14181c]/90 border border-[#2e3944] hover:border-emerald-500/50 rounded-xl p-3.5 cursor-pointer transition-all space-y-1"
              >
                <div className="text-[11px] text-slate-400 flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                    Compras & Llantas
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {(mainTrailer.gastos || []).length} Registros
                  </span>
                </div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                  S/ {totalGastosAcumulados.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-slate-400">Inversión acumulada en vehículo</div>
              </div>

            </div>

            {/* CRONÓMETRO DE VENCIMIENTO DE DOCUMENTACIÓN DE CAMIÓN Y RANFLA */}
            {proxDoc && (
              <div className="pt-3 border-t border-[#2e3944]/80">
                <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Vencimiento Próximo de Documentación Oficial (SOAT / CITV / Ranfla / SUTRAN)</span>
                </div>
                <ExpirationCountdownBar
                  dueDate={proxDoc.fecha}
                  title={`${proxDoc.tipo} (${mainTrailer.placa})`}
                  totalPeriodDays={365}
                  showClock={true}
                />
              </div>
            )}
          </div>
        );
      })()}

      {/* Alert Banners */}
      {(totalVencidos > 0 || totalPorVencer > 0) && (
        <div className="space-y-2">
          {totalVencidos > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 flex items-center gap-3 text-xs text-rose-300">
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>
                <b>{totalVencidos} documento(s) de flota VENCIDOS.</b> Regularízalos para evitar retenciones o sanciones de SUNAT / SUTRAN / MTC.
              </span>
            </div>
          )}
          {totalPorVencer > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-center gap-3 text-xs text-amber-300">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span>
                <b>{totalPorVencer} documento(s) vencen en menos de 30 días.</b> Revisa las fichas correspondientes.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Grid de Unidades de Flota */}
      {vehiculos.length === 0 ? (
        <div className="text-center py-12 bg-[#212933] border border-dashed border-[#2e3944] rounded-2xl text-slate-400">
          <Car className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold">No hay vehículos registrados</p>
          <p className="text-xs text-slate-500 mt-1">Registra tus camiones, tráilers y furgones para auditar SOAT y combustible.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehiculos.map((v) => {
            let venc = 0;
            let prox = 0;
            let docMasProximo = v.documentos?.[0];

            (v.documentos || []).forEach((doc) => {
              if (!doc.fecha) return;
              const d = Math.round((new Date(doc.fecha + 'T00:00:00').getTime() - Date.now()) / 86400000);
              if (d < 0) venc++;
              else if (d <= 30) prox++;
            });

            const lastFuel = (v.combustible || []).slice().sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];
            const fuelLevel = lastFuel ? Number(lastFuel.nivel) : null;

            return (
              <div
                key={v.id}
                className="bg-[#212933] border border-[#2e3944] hover:border-amber-500/50 rounded-2xl p-5 transition-all flex flex-col justify-between group shadow-md space-y-3 relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-lg bg-[#14181c] text-amber-400 px-3 py-1 rounded-xl border border-[#2e3944]">
                      {v.placa}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenVehicleModal(v.id);
                        }}
                        title="Editar datos de unidad"
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-[#14181c] rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setVehicleToDelete({ id: v.id, placa: v.placa });
                        }}
                        title="Quitar / Eliminar vehículo de la flota"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenVehDetail(v.id)}
                        title="Ver Ficha Técnica"
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-[#14181c] rounded-lg transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    onClick={() => onOpenVehDetail(v.id)}
                    className="cursor-pointer"
                  >
                    <div className="text-xs text-slate-300 font-semibold mb-2">
                      {v.tipo} {v.marca && `· ${v.marca}`} {v.modelo}
                    </div>

                    {/* Document Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-3">
                      {venc > 0 && (
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold rounded-md">
                          {venc} vencido(s)
                        </span>
                      )}
                      {prox > 0 && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-md">
                          {prox} por vencer
                        </span>
                      )}
                      {venc === 0 && prox === 0 && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-md flex items-center gap-1">
                          <FileCheck className="w-3 h-3" /> Papeles al día
                        </span>
                      )}
                    </div>

                    {/* Visual Countdown Bar for main doc */}
                    {docMasProximo && (
                      <div className="pt-2 border-t border-[#2e3944]/50">
                        <ExpirationCountdownBar
                          dueDate={docMasProximo.fecha}
                          title={docMasProximo.tipo}
                          totalPeriodDays={365}
                          showClock={false}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Ranfla & Odómetro Status */}
                <div
                  onClick={() => onOpenVehDetail(v.id)}
                  className="pt-3 border-t border-[#2e3944]/60 space-y-1.5 cursor-pointer text-xs"
                >
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1 font-semibold">
                      <Truck className="w-3.5 h-3.5 text-blue-400" />
                      Ranfla:
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      {v.ranfla?.placa ? `${v.ranfla.placa} (${v.ranfla.tipo || 'Ranfla 3 Ejes'})` : 'Sin Ranfla Asignada'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-amber-400" />
                      Odómetro:
                    </span>
                    <span className="font-mono font-bold text-slate-200">
                      {(v.kmActual || 185200).toLocaleString('es-PE')} KM
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE VEHÍCULO ----------------- */}
      {vehicleToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1b2127] border border-rose-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-bold text-slate-100 text-lg">¿Estás seguro de quitar este vehículo?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Estás a punto de eliminar la unidad con placa{' '}
                <span className="font-mono font-bold text-amber-400 bg-[#14181c] px-2 py-0.5 rounded border border-[#2e3944]">
                  {vehicleToDelete.placa}
                </span>{' '}
                de la flota. Se eliminarán sus viajes asignados, documentos de SOAT/CITV y mantenimientos.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setVehicleToDelete(null)}
                className="flex-1 py-2.5 bg-[#262f3a] hover:bg-[#2e3944] text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
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
  );
}

