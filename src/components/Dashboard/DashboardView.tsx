import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  AlertTriangle,
  Users,
  DollarSign,
  Building2,
  ShieldAlert,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  Calendar,
  CheckCircle2,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { formatMoney, maskName } from '../../utils/formatters';

interface DashboardViewProps {
  onOpenTripModal: (id?: string) => void;
  onOpenVehicleModal: (id?: string) => void;
  onViewChange: (view: string) => void;
}

export default function DashboardView({
  onOpenTripModal,
  onOpenVehicleModal,
  onViewChange,
}: DashboardViewProps) {
  const { clientes, viajes, vehiculos, cuentas, deudas, pagos, events, widgets, theme } = useApp();

  const isPrivacy = theme?.privacyMode || false;
  const money = (n: number) => formatMoney(n, isPrivacy);

  // Calculations
  const now = new Date();
  const ym = now.toISOString().slice(0, 7);
  const viajesMes = viajes.filter((v) => v.fecha && v.fecha.startsWith(ym));
  const enCurso = viajes.filter((v) => v.estado === 'En curso').length;

  const atrasados = viajes.filter((v) => {
    if (v.estado === 'Completado') return false;
    const days = Math.round((new Date(v.fecha + 'T00:00:00').getTime() - Date.now()) / 86400000);
    return days < 0;
  });

  const proximos = viajes.filter((v) => {
    if (v.estado === 'Completado') return false;
    const days = Math.round((new Date(v.fecha + 'T00:00:00').getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 3;
  });

  const ingresosMes = viajesMes.reduce((s, v) => s + (Number(v.monto) || 0), 0);
  const saldoBancos = cuentas.reduce((s, c) => s + (Number(c.saldo) || 0), 0);
  const reservado = cuentas.reduce((s, c) => s + (Number(c.reservado) || 0), 0);
  const cuotasDeuda = deudas
    .filter((d) => {
      if (!d.fecha) return false;
      const days = Math.round((new Date(d.fecha + 'T00:00:00').getTime() - Date.now()) / 86400000);
      return days >= 0 && days <= 30;
    })
    .reduce((s, d) => s + (Number(d.cuota) || 0), 0);

  const pagosPendientes = pagos
    .filter((p) => p.tipo === 'Egreso' && p.estado === 'Pendiente')
    .reduce((s, p) => s + (Number(p.monto) || 0), 0);

  const disponibleReal = saldoBancos - reservado - cuotasDeuda - pagosPendientes;

  // Vehicle alerts
  let docVencidos = 0;
  let docPorVencer = 0;
  let docEnRegla = 0;

  vehiculos.forEach((veh) => {
    const allDocs = [...(veh.documentos || []), ...(veh.ranfla?.documentos || [])];
    allDocs.forEach((doc) => {
      if (!doc.fecha) return;
      const days = Math.round((new Date(doc.fecha + 'T00:00:00').getTime() - Date.now()) / 86400000);
      if (days < 0) docVencidos++;
      else if (days <= 60) docPorVencer++;
      else docEnRegla++;
    });
  });

  // DATA PARA GRÁFICOS CIRCULARES (PIE CHARTS)
  // 1. Distribución por Estado de Viajes
  const countCompletados = viajes.filter((v) => v.estado === 'Completado').length;
  const countEnCurso = viajes.filter((v) => v.estado === 'En curso').length;
  const countProgramados = viajes.filter((v) => v.estado === 'Programado' || v.estado === 'Asignado').length;
  const countAtrasados = atrasados.length;

  const dataEstadoViajes = [
    { name: 'Completados', value: countCompletados || 1, color: '#10b981' },
    { name: 'En Curso', value: countEnCurso || 1, color: '#f59e0b' },
    { name: 'Programados', value: countProgramados || 1, color: '#38bdf8' },
    { name: 'Atrasados', value: countAtrasados || 0, color: '#f43f5e' },
  ].filter((item) => item.value > 0);

  // 2. Estado de Documentos de Flota (SOAT/CITV/Ranfla)
  const dataDocsFlota = [
    { name: 'Documentos al Día', value: docEnRegla || 3, color: '#10b981' },
    { name: 'Próximos a Vencer (≤ 60d)', value: docPorVencer || 1, color: '#f59e0b' },
    { name: 'Vencidos / Críticos', value: docVencidos || 0, color: '#f43f5e' },
  ].filter((item) => item.value > 0);

  // 3. Distribución de Ingresos de Flete por Cliente
  const clientRevenueMap: Record<string, number> = {};
  viajes.forEach((v) => {
    const cName = clientes.find((c) => c.id === v.clienteId)?.nombre || 'Cliente General';
    const masked = maskName(cName, isPrivacy);
    clientRevenueMap[masked] = (clientRevenueMap[masked] || 0) + (Number(v.monto) || 0);
  });

  const CLIENT_COLORS = ['#f59e0b', '#38bdf8', '#10b981', '#a855f7', '#ec4899', '#6366f1'];
  const dataClientes = Object.entries(clientRevenueMap).map(([name, val], idx) => ({
    name,
    value: val,
    color: CLIENT_COLORS[idx % CLIENT_COLORS.length],
  }));

  // Sort widgets by order
  let activeWidgets = widgets.filter((w) => w.visible).sort((a, b) => a.order - b.order);

  // Ensure charts_pie_overview exists in the list if not present in legacy saved configs
  if (!activeWidgets.some((w) => w.id === 'charts_pie_overview')) {
    activeWidgets = [
      ...activeWidgets.slice(0, 2),
      { id: 'charts_pie_overview', title: 'Análisis Gráficos Circulares de Operación y Fletes', visible: true, order: 3 },
      ...activeWidgets.slice(2),
    ];
  }

  return (
    <div className="space-[#1b2127] space-y-6">
      {activeWidgets.map((widget) => {
        switch (widget.id) {
          case 'stats_overview':
            return (
              <div key={widget.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div className="bg-[#212933] border border-[#2e3944] rounded-2xl p-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Viajes del Mes</span>
                    <Truck className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-100">{viajesMes.length}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{viajes.length} registrados total</div>
                </div>

                <div className="bg-[#212933] border border-[#2e3944] rounded-2xl p-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>En Ruta Ahora</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-400">{enCurso}</div>
                  <div className="text-[11px] text-slate-400 mt-1">unidades en tránsito</div>
                </div>

                <div className="bg-[#212933] border border-[#2e3944] rounded-2xl p-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Atrasados</span>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className={`text-2xl font-bold font-mono ${atrasados.length > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
                    {atrasados.length}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">requieren atención</div>
                </div>

                <div className="bg-[#212933] border border-[#2e3944] rounded-2xl p-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Clientes CRM</span>
                    <Users className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-100">{clientes.length}</div>
                  <div className="text-[11px] text-slate-400 mt-1">empresas clientes</div>
                </div>

                <div className="bg-[#212933] border border-[#2e3944] rounded-2xl p-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Ingresos Mes</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-400 truncate">{money(ingresosMes)}</div>
                  <div className="text-[11px] text-slate-400 mt-1">por fletes facturados</div>
                </div>

                <div className="bg-[#212933] border border-[#2e3944] rounded-2xl p-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Saldo en Bancos</span>
                    <Building2 className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-sky-400 truncate">{money(saldoBancos)}</div>
                  <div className="text-[11px] text-slate-400 mt-1">cuentas corporativas</div>
                </div>
              </div>
            );

          case 'financial_summary':
            return (
              <div key={widget.id} className="bg-[#212933] border border-[#2e3944] rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Liquidez Real Disponible Para Gastar Hoy
                    </div>
                    <div className={`text-3xl font-bold font-mono mt-1 ${disponibleReal < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {money(disponibleReal)}
                    </div>
                  </div>
                  <button
                    onClick={() => onViewChange('finanzas')}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    Ver Finanzas <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#2e3944]">
                  <div>
                    <div className="text-xs text-slate-400">Saldo Total en Bancos</div>
                    <div className="text-sm font-bold font-mono text-slate-100">{money(saldoBancos)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Reservado (SUNAT / Planilla)</div>
                    <div className="text-sm font-bold font-mono text-rose-300">− {money(reservado)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Cuotas Deuda (Próx. 30 días)</div>
                    <div className="text-sm font-bold font-mono text-amber-300">− {money(cuotasDeuda)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Pagos Pendientes</div>
                    <div className="text-sm font-bold font-mono text-slate-300">− {money(pagosPendientes)}</div>
                  </div>
                </div>
              </div>
            );

          case 'charts_pie_overview':
            return (
              <div key={widget.id} className="bg-[#212933] border border-[#2e3944] rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#2e3944]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                      <PieChartIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-base">
                        Análisis Gráficos Circulares de Operación
                      </h3>
                      <p className="text-xs text-slate-400">
                        Visualización porcentual de viajes, estado de papeles de la flota e ingresos por cliente
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-amber-400 bg-[#14181c] px-3 py-1 rounded-lg border border-[#2e3944]">
                    KPIs en Tiempo Real
                  </span>
                </div>

                {/* TRES GRÁFICOS CIRCULARES EN GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* GRÁFICO 1: ESTADO DE VIAJES */}
                  <div className="bg-[#14181c] border border-[#2e3944] rounded-xl p-4 flex flex-col justify-between items-center relative space-y-3">
                    <div className="w-full flex items-center justify-between border-b border-[#2e3944] pb-2">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-amber-400" />
                        Estado de Viajes
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-400">Total: {viajes.length}</span>
                    </div>

                    <div className="w-full h-52 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dataEstadoViajes}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {dataEstadoViajes.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke="#1b2127" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1b2127', borderColor: '#2e3944', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                            formatter={(value: any, name: any) => [`${value} viaje(s)`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Leyenda personalizada con badges */}
                    <div className="w-full grid grid-cols-2 gap-1.5 text-[11px] pt-1 border-t border-[#2e3944]/60">
                      {dataEstadoViajes.map((item) => (
                        <div key={item.name} className="flex items-center justify-between bg-[#1b2127] px-2 py-1 rounded border border-[#2e3944]">
                          <span className="flex items-center gap-1.5 text-slate-300 font-medium truncate">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="truncate">{item.name}</span>
                          </span>
                          <span className="font-mono font-bold text-slate-100">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GRÁFICO 2: ESTADO DE PAPELES DE LA FLOTA */}
                  <div className="bg-[#14181c] border border-[#2e3944] rounded-xl p-4 flex flex-col justify-between items-center relative space-y-3">
                    <div className="w-full flex items-center justify-between border-b border-[#2e3944] pb-2">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-emerald-400" />
                        Papeles de la Flota
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-400">Docs: {docEnRegla + docPorVencer + docVencidos}</span>
                    </div>

                    <div className="w-full h-52 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dataDocsFlota}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {dataDocsFlota.map((entry, index) => (
                              <Cell key={`cell-doc-${index}`} fill={entry.color} stroke="#1b2127" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1b2127', borderColor: '#2e3944', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                            formatter={(value: any, name: any) => [`${value} documento(s)`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="w-full space-y-1.5 text-[11px] pt-1 border-t border-[#2e3944]/60">
                      {dataDocsFlota.map((item) => (
                        <div key={item.name} className="flex items-center justify-between bg-[#1b2127] px-2 py-1 rounded border border-[#2e3944]">
                          <span className="flex items-center gap-1.5 text-slate-300 font-medium truncate">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="truncate">{item.name}</span>
                          </span>
                          <span className="font-mono font-bold text-slate-100">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GRÁFICO 3: DISTRIBUCIÓN DE FLETES POR CLIENTE */}
                  <div className="bg-[#14181c] border border-[#2e3944] rounded-xl p-4 flex flex-col justify-between items-center relative space-y-3">
                    <div className="w-full flex items-center justify-between border-b border-[#2e3944] pb-2">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-sky-400" />
                        Ingresos por Cliente
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-400">Total Fletes</span>
                    </div>

                    <div className="w-full h-52 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dataClientes}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {dataClientes.map((entry, index) => (
                              <Cell key={`cell-cli-${index}`} fill={entry.color} stroke="#1b2127" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1b2127', borderColor: '#2e3944', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                            formatter={(value: any, name: any) => [money(Number(value) || 0), name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="w-full space-y-1.5 text-[11px] pt-1 border-t border-[#2e3944]/60 max-h-24 overflow-y-auto">
                      {dataClientes.map((item) => (
                        <div key={item.name} className="flex items-center justify-between bg-[#1b2127] px-2 py-1 rounded border border-[#2e3944]">
                          <span className="flex items-center gap-1.5 text-slate-300 font-medium truncate">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="truncate">{item.name}</span>
                          </span>
                          <span className="font-mono font-bold text-emerald-400">{money(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            );

          case 'compliance_alerts':
            return (docVencidos > 0 || docPorVencer > 0 || atrasados.length > 0) ? (
              <div key={widget.id} className="space-y-3">
                {atrasados.length > 0 && (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center justify-between text-xs text-rose-300">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      <span>
                        <b>{atrasados.length} viaje(s) con retraso de fecha.</b> Revisa la asignación de conductor y unidad.
                      </span>
                    </div>
                    <button
                      onClick={() => onViewChange('viajes')}
                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg font-bold cursor-pointer"
                    >
                      Resolver
                    </button>
                  </div>
                )}

                {docVencidos > 0 && (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center justify-between text-xs text-rose-300">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      <span>
                        <b>{docVencidos} documento(s) de flota VENCIDOS.</b> Riesgo de multas SUTRAN / MTC.
                      </span>
                    </div>
                    <button
                      onClick={() => onViewChange('vehiculos')}
                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg font-bold cursor-pointer"
                    >
                      Ver Flota
                    </button>
                  </div>
                )}

                {docPorVencer > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between text-xs text-amber-300">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      <span>
                        <b>{docPorVencer} documento(s) vencen en los próximos 30 días.</b> Programa la renovación de SOAT o revisión técnica.
                      </span>
                    </div>
                    <button
                      onClick={() => onViewChange('vehiculos')}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg font-bold cursor-pointer"
                    >
                      Revisar
                    </button>
                  </div>
                )}
              </div>
            ) : null;

          case 'upcoming_trips':
            const pendingTrips = viajes
              .filter((v) => v.estado !== 'Completado')
              .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
              .slice(0, 5);

            return (
              <div key={widget.id} className="bg-[#212933] border border-[#2e3944] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-100 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    Próximos Viajes y Carga Programada
                  </h3>
                  <button
                    onClick={() => onViewChange('viajes')}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    Ver Todos ({viajes.length}) <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {pendingTrips.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-[#2e3944] rounded-xl">
                    No hay viajes pendientes asignados.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingTrips.map((v) => {
                      const client = clientes.find((c) => c.id === v.clienteId);
                      const daysLeft = Math.round((new Date(v.fecha + 'T00:00:00').getTime() - Date.now()) / 86400000);
                      return (
                        <div
                          key={v.id}
                          className="bg-[#1b2127] border border-[#2e3944] hover:border-amber-500/40 rounded-xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div>
                            <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                              <span>{v.origen}</span>
                              <span className="text-amber-400">→</span>
                              <span>{v.destino}</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1 flex items-center gap-4 flex-wrap">
                              <span>Cliente: <b className="text-slate-200">{client ? maskName(client.nombre, isPrivacy) : 'Sin cliente'}</b></span>
                              <span>Fecha: <b className="text-slate-200">{v.fecha}</b></span>
                              {v.conductor && <span>Conductor: <b className="text-slate-200">{v.conductor}</b></span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                v.estado === 'En curso'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : v.estado === 'Completado'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : daysLeft < 0
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              }`}
                            >
                              {daysLeft < 0 && v.estado !== 'Completado' ? 'Atrasado' : v.estado}
                            </span>
                            <span className="font-mono text-sm font-bold text-slate-200">{money(v.monto)}</span>
                            <button
                              onClick={() => onOpenTripModal(v.id)}
                              className="px-2.5 py-1 bg-[#262f3a] hover:bg-[#2e3944] text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );

          case 'event_stream':
            return (
              <div key={widget.id} className="bg-[#212933] border border-[#2e3944] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    Monitor de Microservicios & Bus de Eventos
                  </h3>
                  <button
                    onClick={() => onViewChange('events')}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    Consola Completa <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-[#14181c] border border-[#2e3944] rounded-xl p-4 font-mono text-xs space-y-2 max-h-52 overflow-y-auto">
                  {events.length === 0 ? (
                    <div className="text-slate-500">Esperando eventos en el bus...</div>
                  ) : (
                    events.slice(0, 5).map((ev) => (
                      <div key={ev.id} className="flex items-start gap-2 border-b border-[#2e3944]/50 pb-2 last:border-0 last:pb-0">
                        <span className="text-slate-500 text-[10px] whitespace-nowrap">
                          {new Date(ev.timestamp).toLocaleTimeString('es-PE')}
                        </span>
                        <span className="text-amber-400 font-bold uppercase text-[10px] whitespace-nowrap">
                          [{ev.service}]
                        </span>
                        <span className="text-slate-300 flex-1">{ev.description}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
