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
  totalPeriodDays = 30,
  showClock = true,
}: ExpirationCountdownBarProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    isExpired: boolean;
    totalDaysLeft: number;
  }>({ days: 0, hours: 0, minutes: 0, isExpired: false, totalDaysLeft: 0 });

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
          hours: 0,
          minutes: 0,
          isExpired: true,
          totalDaysLeft: -absDays,
        });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({
          days,
          hours,
          minutes,
          isExpired: false,
          totalDaysLeft: days,
        });
      }
    }

    calculateTime();
    // Actualizar cada 60 segundos el reloj
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

  // Definir colores y estados según urgencia
  let statusColor = 'emerald';
  let badgeBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  let barGradient = 'from-emerald-500 to-teal-400';
  let StatusIcon = CheckCircle2;
  let statusLabel = 'Al día';

  if (timeLeft.isExpired) {
    statusColor = 'rose';
    badgeBg = 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse';
    barGradient = 'from-rose-600 to-rose-400';
    StatusIcon = AlertCircle;
    statusLabel = `¡Vencido hace ${timeLeft.days} d!`;
  } else if (timeLeft.totalDaysLeft <= 7) {
    statusColor = 'rose';
    badgeBg = 'bg-rose-500/20 border-rose-500/30 text-rose-300';
    barGradient = 'from-rose-500 to-amber-500';
    StatusIcon = AlertTriangle;
    statusLabel = `Crítico: ${timeLeft.days}d ${timeLeft.hours}h`;
  } else if (timeLeft.totalDaysLeft <= 15) {
    statusColor = 'amber';
    badgeBg = 'bg-amber-500/20 border-amber-500/30 text-amber-300';
    barGradient = 'from-amber-500 to-yellow-400';
    StatusIcon = Timer;
    statusLabel = `Próximo: ${timeLeft.days}d`;
  }

  return (
    <div className="w-full bg-[#14181c]/80 border border-[#2e3944] rounded-xl p-3 space-y-2">
      {/* Cabecera del cronómetro */}
      <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Clock className={`w-3.5 h-3.5 text-${statusColor}-400 flex-shrink-0 ${timeLeft.totalDaysLeft <= 7 ? 'animate-spin-slow' : ''}`} />
          {title && <span className="font-semibold text-slate-200">{title}</span>}
          <span className="text-[11px] text-slate-400 font-mono">({dueDate})</span>
        </div>

        {/* Badge de tiempo restante */}
        <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 ${badgeBg}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Reloj detallado con Días, Horas y Minutos */}
      {showClock && !timeLeft.isExpired && (
        <div className="grid grid-cols-3 gap-1 bg-[#101418] p-1.5 rounded-lg border border-[#2e3944]/60 text-center font-mono">
          <div>
            <div className="text-xs font-bold text-amber-400">{timeLeft.days}</div>
            <div className="text-[9px] uppercase text-slate-500">Días</div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">{timeLeft.hours}</div>
            <div className="text-[9px] uppercase text-slate-500">Horas</div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">{timeLeft.minutes}</div>
            <div className="text-[9px] uppercase text-slate-500">Min</div>
          </div>
        </div>
      )}

      {/* Barra de Progreso Visual */}
      <div className="space-y-1 pt-0.5">
        <div className="w-full h-2 bg-[#0c0f12] rounded-full overflow-hidden p-0.5 border border-[#2e3944]/50 relative">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500`}
            style={{ width: `${timeLeft.isExpired ? 100 : progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-slate-500">
          <span>0d (Límite)</span>
          <span>{timeLeft.isExpired ? '100% Expirado' : `${Math.round(progressPercent)}% tiempo disponible`}</span>
          <span>{totalPeriodDays}d Plazo</span>
        </div>
      </div>
    </div>
  );
}
