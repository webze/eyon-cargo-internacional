import React from 'react';
import { useApp } from '../../context/AppContext';
import { Car, Plus, ShieldAlert, Fuel, FileCheck, AlertTriangle, ChevronRight, Truck, Wrench, Shield, Gauge, Clock } from 'lucide-react';
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
 * ============================================================================
 */
interface VehiclesViewProps {
  onOpenVehicleModal: (id?: string) => void;
  onOpenVehDetail: (id: string) => void;
}

export default function VehiclesView({ onOpenVehicleModal, onOpenVehDetail }: VehiclesViewProps) {
  const { vehiculos } = useApp();

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
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          Añadir Vehículo
        </button>
      </div>

      {/* ----------------- TARJETA PRINCIPAL DESTACADA (TRÁILER HEAVY DUTY) ----------------- */}
      {mainTrailer && (
        <div className="bg-gradient-to-br from-[#212933] via-[#1b222b] to-[#14181c] border border-amber-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between flex-wrap gap-4 mb-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Truck className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono font-black text-2xl text-amber-400 bg-[#101418] px-3.5 py-1 rounded-xl border border-amber-500/30">
                    {mainTrailer.placa}
                  </span>
                  <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold uppercase rounded-lg tracking-wider">
                    {mainTrailer.tipo} Carga Pesada
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mt-1.5">
                  {mainTrailer.marca} {mainTrailer.modelo} · {mainTrailer.notas || 'Unidad de Carga Pesada Nacional & Internacional'}
                </h3>
              </div>
            </div>

            <button
              onClick={() => onOpenVehDetail(mainTrailer.id)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <span>Gestión Completa & Ficha Técnica</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Métrica Telemetría */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10 mb-4">
            <div className="bg-[#14181c]/80 border border-[#2e3944] rounded-xl p-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>Odómetro Total</span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-100 mt-1">
                {mainTrailer.combustible && mainTrailer.combustible.length > 0
                  ? `${Math.max(...mainTrailer.combustible.map((c) => c.km || 0)).toLocaleString()} KM`
                  : '185,200 KM'}
              </div>
            </div>

            <div className="bg-[#14181c]/80 border border-[#2e3944] rounded-xl p-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                <Fuel className="w-3.5 h-3.5 text-sky-400" />
                <span>Consumo Total</span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-100 mt-1">
                {mainTrailer.combustible && mainTrailer.combustible.length > 0
                  ? `${mainTrailer.combustible.reduce((a, b) => a + Number(b.galones || 0), 0)} Gal.`
                  : '120 Gal.'}
              </div>
            </div>

            <div className="bg-[#14181c]/80 border border-[#2e3944] rounded-xl p-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Documentos Oficiales</span>
              </div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                {(mainTrailer.documentos || []).length} Registrados
              </div>
            </div>

            <div className="bg-[#14181c]/80 border border-[#2e3944] rounded-xl p-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Estado Operativo</span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-100 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{mainTrailer.estado || 'Operativo'}</span>
              </div>
            </div>
          </div>

          {/* Cronómetro de Documento Más Próximo del Tráiler Principal */}
          {mainTrailer.documentos && mainTrailer.documentos.length > 0 && (
            <div className="pt-3 border-t border-[#2e3944]/80">
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Vencimiento Próximo de Documentación (SOAT / CITV / SUTRAN)</span>
              </div>
              <ExpirationCountdownBar
                dueDate={mainTrailer.documentos[0].fecha}
                title={`${mainTrailer.documentos[0].tipo} (${mainTrailer.placa})`}
                totalPeriodDays={365}
                showClock={true}
              />
            </div>
          )}
        </div>
      )}

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
                onClick={() => onOpenVehDetail(v.id)}
                className="bg-[#212933] border border-[#2e3944] hover:border-amber-500/50 rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between group shadow-md space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-lg bg-[#14181c] text-amber-400 px-3 py-1 rounded-xl border border-[#2e3944]">
                      {v.placa}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  </div>

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

                {/* Fuel Level Gauge */}
                <div className="pt-3 border-t border-[#2e3944]/60 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Fuel className="w-3 h-3 text-slate-500" />
                      Nivel de Tanque
                    </span>
                    <span className="font-mono font-bold text-slate-200">
                      {fuelLevel === null ? 'Sin datos' : `${fuelLevel}%`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#14181c] border border-[#2e3944] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all rounded-full ${
                        fuelLevel === null
                          ? 'w-0'
                          : fuelLevel < 20
                          ? 'bg-rose-500'
                          : fuelLevel < 50
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${fuelLevel || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
