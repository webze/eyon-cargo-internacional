import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  Building2,
  CreditCard,
  Plus,
  Edit,
  TrendingDown,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  PiggyBank,
  ArrowRightLeft,
} from 'lucide-react';
import { formatMoney, maskAccount } from '../../utils/formatters';
import ExpirationCountdownBar from '../Common/ExpirationCountdownBar';

/**
 * ============================================================================
 * COMPONENTE: FinanceView (Gestión Financiera, Cuentas y Deudas)
 * ============================================================================
 * @description
 * Módulo integral de finanzas estratégicas para EYON Cargo Internacional.
 * Incluye 5 pestañas principales:
 * 1. Resumen Liquidez: Muestra la caja real disponible descontando reservas y cuotas a 30 días.
 * 2. Cuentas Bancarias: BCP, BBVA, Interbank, Yape, Detracciones SUNAT, Cuentas CTS.
 * 3. Deudas & Créditos: Créditos vehiculares y préstamos con cronómetro de vencimientos.
 * 4. Control de Pagos: Historial de Ingresos y Egresos.
 * 5. Reparto a Socios: Distribución de utilidades entre socios fundadores.
 * ============================================================================
 */
interface FinanceViewProps {
  onOpenAccountModal: (id?: string) => void;
  onOpenDebtModal: (id?: string) => void;
  onOpenPaymentModal: (id?: string) => void;
  onOpenPartnerModal: (id?: string) => void;
  onOpenPartnerPayoutModal: (partnerId: string) => void;
}

export default function FinanceView({
  onOpenAccountModal,
  onOpenDebtModal,
  onOpenPaymentModal,
  onOpenPartnerModal,
  onOpenPartnerPayoutModal,
}: FinanceViewProps) {
  // Estado global y acciones desde AppContext
  const { cuentas, deudas, pagos, socios, payDebtInstalment, theme } = useApp();

  // Estado local para pestaña activa y filtro de movimientos
  const [finTab, setFinTab] = useState<'resumen' | 'cuentas' | 'deudas' | 'pagos' | 'socios'>('resumen');
  const [pagoFilter, setPagoFilter] = useState<'ALL' | 'Ingreso' | 'Egreso'>('ALL');

  // Modo Privacidad para ocultar o enmascarar montos financieros
  const isPrivacy = theme?.privacyMode || false;
  const money = (n: number) => formatMoney(n, isPrivacy);

  // ==========================================================================
  // CÁLCULOS MATEMÁTICOS DE LIQUIDEZ Y CAJA DISPONIBLE
  // ==========================================================================
  /** Total de dinero acumulado en todas las cuentas bancarias */
  const totalBancos = cuentas.reduce((s, c) => s + (Number(c.saldo) || 0), 0);

  /** Fondos intangibles o intangibilizados (SUNAT, Planilla, CTS, etc.) */
  const totalReservado = cuentas.reduce((s, c) => s + (Number(c.reservado) || 0), 0);

  /** Cuotas de deudas bancarias o vehiculares que vencen en los próximos 30 días */
  const cuotas30dias = deudas
    .filter((d) => {
      if (!d.fecha) return false;
      const days = Math.round((new Date(d.fecha + 'T00:00:00').getTime() - Date.now()) / 86400000);
      return days >= -10 && days <= 30; // Incluye vencidos recientes y próximos 30 días
    })
    .reduce((s, d) => s + (Number(d.cuota) || 0), 0);

  /** Pagos de egreso marcados como 'Pendiente' en el sistema */
  const pagosPendientes = pagos
    .filter((p) => p.tipo === 'Egreso' && p.estado === 'Pendiente')
    .reduce((s, p) => s + (Number(p.monto) || 0), 0);

  /** Liquidez real neta disponible para operar HOY */
  const disponibleHoy = totalBancos - totalReservado - cuotas30dias - pagosPendientes;

  // Filtrado de pagos según selector
  const filteredPagos = pagos.filter((p) => pagoFilter === 'ALL' || p.tipo === pagoFilter);

  return (
    <div className="space-y-6">
      {/* ----------------- BARRA DE PESTAÑAS SECUNDARIAS ----------------- */}
      <div className="flex border-b border-[#2e3944] overflow-x-auto gap-1">
        {[
          { id: 'resumen', label: 'Resumen Liquidez' },
          { id: 'cuentas', label: 'Cuentas Bancarias' },
          { id: 'deudas', label: 'Deudas & Créditos' },
          { id: 'pagos', label: 'Control de Pagos' },
          { id: 'socios', label: 'Reparto a Socios' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFinTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              finTab === tab.id
                ? 'border-amber-500 text-amber-400 bg-[#212933]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ====================================================================
          PESTAÑA 1: RESUMEN DE LIQUIDEZ Y CAJA
          ==================================================================== */}
      {finTab === 'resumen' && (
        <div className="space-y-6">
          <div className="bg-[#212933] border border-[#2e3944] rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Disponible Real Para Gastar Hoy (Neta)
                </span>
                <div className={`text-4xl font-black font-mono mt-1 ${disponibleHoy < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {money(disponibleHoy)}
                </div>
              </div>
              <div className="px-3 py-1.5 bg-[#1b2127] border border-[#2e3944] rounded-xl text-xs text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Auditoría de Caja en Tiempo Real</span>
              </div>
            </div>

            {/* Métrica Desglosada */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#2e3944]">
              <div className="bg-[#1b2127] p-3.5 rounded-xl border border-[#2e3944]">
                <span className="text-xs text-slate-400 block mb-1">Saldo en Bancos</span>
                <span className="text-base font-bold font-mono text-slate-100">{money(totalBancos)}</span>
              </div>
              <div className="bg-[#1b2127] p-3.5 rounded-xl border border-[#2e3944]">
                <span className="text-xs text-slate-400 block mb-1">Reservado (SUNAT/Planilla)</span>
                <span className="text-base font-bold font-mono text-rose-300">− {money(totalReservado)}</span>
              </div>
              <div className="bg-[#1b2127] p-3.5 rounded-xl border border-[#2e3944]">
                <span className="text-xs text-slate-400 block mb-1">Cuotas Próximas 30d</span>
                <span className="text-base font-bold font-mono text-amber-300">− {money(cuotas30dias)}</span>
              </div>
              <div className="bg-[#1b2127] p-3.5 rounded-xl border border-[#2e3944]">
                <span className="text-xs text-slate-400 block mb-1">Pagos Pendientes</span>
                <span className="text-base font-bold font-mono text-slate-300">− {money(pagosPendientes)}</span>
              </div>
            </div>
          </div>

          {/* Listas Rápidas de Cuentas y Próximas Deudas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#212933] border border-[#2e3944] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-400" /> Cuentas Principales
                </h3>
                <button
                  onClick={() => onOpenAccountModal()}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  + Agregar Cuenta
                </button>
              </div>
              <div className="space-y-2">
                {cuentas.map((c) => (
                  <div key={c.id} className="bg-[#1b2127] p-3 rounded-xl border border-[#2e3944] flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-200">{c.banco}</div>
                      <div className="text-[11px] text-slate-400">{c.tipo}</div>
                    </div>
                    <div className="text-right font-mono font-bold text-emerald-400">{money(c.saldo)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deudas con Cronómetro Visual Rápido */}
            <div className="bg-[#212933] border border-[#2e3944] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" /> Próximos Vencimientos de Cuotas
                </h3>
                <button
                  onClick={() => setFinTab('deudas')}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
                >
                  Ver Todo
                </button>
              </div>
              <div className="space-y-3">
                {deudas.slice(0, 2).map((d) => (
                  <div key={d.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-200">{d.entidad}</span>
                      <span className="font-mono font-bold text-amber-300">{money(d.cuota)}/mes</span>
                    </div>
                    <ExpirationCountdownBar dueDate={d.fecha} totalPeriodDays={30} showClock={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          PESTAÑA 2: CUENTAS BANCARIAS
          ==================================================================== */}
      {finTab === 'cuentas' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-100 text-sm">Cuentas Bancarias Registradas</h3>
            <button
              onClick={() => onOpenAccountModal()}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Nueva Cuenta
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cuentas.map((c) => (
              <div key={c.id} className="bg-[#212933] border border-[#2e3944] rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-100 text-base">{c.banco}</h4>
                    <p className="text-xs text-slate-400">{c.tipo} {c.numeroCuenta && `· N° ${maskAccount(c.numeroCuenta, isPrivacy)}`}</p>
                  </div>
                  <button
                    onClick={() => onOpenAccountModal(c.id)}
                    className="p-1.5 bg-[#262f3a] hover:bg-[#2e3944] text-slate-300 rounded-lg text-xs cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#1b2127] p-3 rounded-xl border border-[#2e3944] text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Saldo Total</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">{money(c.saldo)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Monto Reservado</span>
                    <span className="font-mono font-bold text-rose-300 text-sm">{money(c.reservado)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================
          PESTAÑA 3: DEUDAS Y CRÉDITOS CON CRONÓMETRO DE VENCIMIENTO
          ==================================================================== */}
      {finTab === 'deudas' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Créditos Vehiculares, Préstamos y Deudas</h3>
              <p className="text-xs text-slate-400">Control cronometrado de vencimiento de cuotas bancarias.</p>
            </div>
            <button
              onClick={() => onOpenDebtModal()}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Nueva Deuda
            </button>
          </div>

          <div className="space-y-4">
            {deudas.map((d) => (
              <div key={d.id} className="bg-[#212933] border border-[#2e3944] rounded-2xl p-5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-100 text-base">{d.entidad}</h4>
                      <span className="px-2 py-0.5 bg-[#1b2127] border border-[#2e3944] text-slate-300 text-[10px] font-semibold rounded-md">
                        {d.tipo}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 flex items-center gap-4 flex-wrap">
                      <span>Saldo Pendiente: <b className="text-rose-300 font-mono">{money(d.pendiente)}</b></span>
                      <span>Monto Cuota: <b className="text-amber-300 font-mono">{money(d.cuota)}/mes</b></span>
                      <span>Total Crédito: <b className="text-slate-300 font-mono">{money(d.total)}</b></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => payDebtInstalment(d.id)}
                      className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl cursor-pointer border border-emerald-500/30 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Pagar Cuota</span>
                    </button>
                    <button
                      onClick={() => onOpenDebtModal(d.id)}
                      className="p-2 bg-[#262f3a] hover:bg-[#2e3944] text-slate-300 rounded-xl text-xs cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* CRONÓMETRO VISUAL DE VENCIMIENTO CON BARRA Y DÍAS/HORAS */}
                <div className="pt-2">
                  <ExpirationCountdownBar
                    dueDate={d.fecha}
                    title={`Próximo vencimiento de cuota para ${d.entidad}`}
                    totalPeriodDays={30}
                    showClock={true}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================
          PESTAÑA 4: CONTROL DE PAGOS
          ==================================================================== */}
      {finTab === 'pagos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <select
              value={pagoFilter}
              onChange={(e) => setPagoFilter(e.target.value as any)}
              className="px-3 py-2 bg-[#212933] border border-[#2e3944] text-slate-200 text-xs rounded-xl focus:outline-none"
            >
              <option value="ALL">Todos los Movimientos</option>
              <option value="Ingreso">Ingresos (+)</option>
              <option value="Egreso">Egresos (−)</option>
            </select>

            <button
              onClick={() => onOpenPaymentModal()}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Registrar Pago
            </button>
          </div>

          <div className="space-y-2">
            {filteredPagos.map((p) => (
              <div key={p.id} className="bg-[#212933] border border-[#2e3944] rounded-xl p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                      p.tipo === 'Ingreso' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {p.tipo === 'Ingreso' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-100">{p.categoria}</div>
                    <div className="text-[11px] text-slate-400">{p.descripcion || 'Sin detalle'} · {p.fecha}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-bold text-sm ${
                      p.tipo === 'Ingreso' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {p.tipo === 'Ingreso' ? '+' : '−'} {money(p.monto)}
                  </span>
                  <button
                    onClick={() => onOpenPaymentModal(p.id)}
                    className="p-1.5 bg-[#262f3a] hover:bg-[#2e3944] text-slate-300 rounded-lg text-xs cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================
          PESTAÑA 5: REPARTO A SOCIOS
          ==================================================================== */}
      {finTab === 'socios' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-100 text-sm">Socios Fundadores y Dueños</h3>
            <button
              onClick={() => onOpenPartnerModal()}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Nuevo Socio
            </button>
          </div>

          <div className="space-y-4">
            {socios.map((s) => {
              const year = new Date().getFullYear();
              const totalYear = (s.pagos || [])
                .filter((p) => p.fecha && p.fecha.startsWith('' + year))
                .reduce((sum, p) => sum + (Number(p.monto) || 0), 0);

              return (
                <div key={s.id} className="bg-[#212933] border border-[#2e3944] rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h4 className="font-bold text-slate-100 text-base">{s.nombre}</h4>
                      <p className="text-xs text-slate-400">
                        {s.pct}% participación · Total repartido {year}: <b className="text-emerald-400 font-mono">{money(totalYear)}</b>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenPartnerPayoutModal(s.id)}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        + Reparto Utilidad
                      </button>
                      <button
                        onClick={() => onOpenPartnerModal(s.id)}
                        className="p-1.5 bg-[#262f3a] hover:bg-[#2e3944] text-slate-300 rounded-lg text-xs cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {(s.pagos || []).length > 0 && (
                    <div className="pt-2 border-t border-[#2e3944] space-y-1">
                      {s.pagos.slice(0, 3).map((p) => (
                        <div key={p.id} className="text-xs text-slate-400 flex justify-between">
                          <span>{p.fecha} · {p.concepto}</span>
                          <span className="font-mono text-slate-200 font-bold">{money(p.monto)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
