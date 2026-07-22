import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, AlertCircle, CheckCircle2, Timer } from 'lucide-react';

/**
 * ============================================================================
 * COMPONENTE: ExpirationCountdownBar (Barra de Vencimientos y Cronómetro)
 * ============================================================================
 * @description
 * Muestra una representación visual intuitiva con cronómetro en tiempo real,
 * barra de progreso dinámica y código de colores según los días restantes
 * para el vencimiento de una deuda o un documento oficial (SOAT, CITV, SUTRAN).
 *
 * @param dueDate - Fecha de vencimiento en formato 'YYYY-MM-DD' o ISO.
 * @param title - Etiqueta opcional (ej: "SOAT Tráiler", "Cuota Banco BCP").
 * @param totalPeriodDays - Días totales del ciclo de cobro (default: 30 para cuotas, 365 para documentos anuales).
 * @param showClock - Si es true, muestra el desglose exacto de Días + Horas.
 * ============================================================================
 */
interface ExpirationCountdownBarProps {
  dueDate: string;
  title?: string;
  totalPeriodDays?: number;
  showClock?: boolean;
}

export default function ExpirationCountdownBar({
  dueDate,
  title,
  totalPeriodDays = 365,
  showClock = true,
}: ExpirationCountdownBarProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    isExpired: boolean;
    totalDaysLeft: number;
  }>({ days: 0, isExpired: false, totalDaysLeft: 0 });

  useEffect(() => {
    function calculateTime() {
      if (!dueDate) return;
      const target = new Date(dueDate + 'T23:59:59').getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        const absDays = Math.abs(Math.floor(difference / (1000 * 60 * 60 * 24)));
        setTimeLeft({
          days: absDays,
          isExpired: true,
          totalDaysLeft: -absDays,
        });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        setTimeLeft({
          days,
          isExpired: false,
          totalDaysLeft: days,
        });
      }
    }

    calculateTime();
    const timer = setInterval(calculateTime, 60000);
    return () => clearInterval(timer);
  }, [dueDate]);

  if (!dueDate) {
    return (
      <div className="text-[11px] text-slate-500 italic">Fecha no definida</div>
    );
  }

  // Calcular porcentaje de tiempo restante para la barra
  const rawPercentage = (timeLeft.totalDaysLeft / totalPeriodDays) * 100;
  const progressPercent = Math.max(0, Math.min(100, rawPercentage));

  // LÓGICA DE COLORES SOLICITADA:
  // - Falta mucho (> 60 días): VERDE
  // - Falta intermedio (30 - 60 días): AMARILLO
  // - Falta poco (<= 30 días) o Vencido: ROJO
  let badgeBg = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
  let barGradient = 'from-emerald-500 to-teal-400';
  let StatusIcon = CheckCircle2;
  let statusLabel = `Al día (${timeLeft.days} DÍAS)`;
  let statusColor = 'emerald';

  if (timeLeft.isExpired) {
    badgeBg = 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse';
    barGradient = 'from-rose-600 to-rose-400';
    StatusIcon = AlertCircle;
    statusLabel = `¡Vencido hace ${timeLeft.days} Días!`;
    statusColor = 'rose';
  } else if (timeLeft.totalDaysLeft <= 30) {
    badgeBg = 'bg-rose-500/20 border-rose-500/40 text-rose-300';
    barGradient = 'from-rose-600 to-rose-400';
    StatusIcon = AlertTriangle;
    statusLabel = `Crítico: ${timeLeft.days} Días faltantes`;
    statusColor = 'rose';
  } else if (timeLeft.totalDaysLeft <= 60) {
    badgeBg = 'bg-amber-500/20 border-amber-500/40 text-amber-300';
    barGradient = 'from-amber-500 to-yellow-400';
    StatusIcon = Timer;
    statusLabel = `Atención: ${timeLeft.days} Días faltantes`;
    statusColor = 'amber';
  }

  return (
    <div className="w-full bg-[#14181c]/80 border border-[#2e3944] rounded-xl p-3.5 space-y-3">
      {/* Cabecera del cronómetro */}
      <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 text-${statusColor}-400 flex-shrink-0 ${timeLeft.totalDaysLeft <= 30 ? 'animate-bounce' : ''}`} />
          {title && <span className="font-bold text-slate-100">{title}</span>}
          <span className="text-[11px] text-slate-400 font-mono">({dueDate})</span>
        </div>

        {/* Badge con días restantes */}
        <div className={`px-3 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${badgeBg}`}>
          <StatusIcon className="w-4 h-4" />
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Solo Días en texto destacado */}
      {showClock && (
        <div className="flex items-center justify-between bg-[#101418] px-3 py-2 rounded-lg border border-[#2e3944]/60 text-xs">
          <span className="text-slate-400 uppercase font-semibold text-[11px] tracking-wider">Tiempo Restante:</span>
          <span className={`font-mono font-bold text-sm text-${statusColor}-400`}>
            {timeLeft.isExpired ? `${timeLeft.days} DÍAS VENCIDO` : `${timeLeft.days} DÍAS DISPONIBLES`}
          </span>
        </div>
      )}

      {/* BARRA DE PROGRESO ANCHA (Línea de tiempo más ancha) */}
      <div className="space-y-1 pt-1">
        <div className="w-full h-4 bg-[#0c0f12] rounded-full overflow-hidden p-0.5 border border-[#2e3944] relative shadow-inner">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500 shadow-sm`}
            style={{ width: `${timeLeft.isExpired ? 100 : progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-0.5">
          <span>0d (Vencimiento)</span>
          <span className="text-slate-300 font-semibold">
            {timeLeft.isExpired ? '100% Expirado' : `${Math.round(progressPercent)}% de vigencia`}
          </span>
          <span>{totalPeriodDays}d Plazo</span>
        </div>
      </div>
    </div>
  );
}
