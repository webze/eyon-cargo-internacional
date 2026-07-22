import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Client,
  Trip,
  Vehicle,
  BankAccount,
  Debt,
  Payment,
  Partner,
} from '../types';
import { formatMoney } from './formatters';

export interface PDFReportData {
  clientes: Client[];
  viajes: Trip[];
  vehiculos: Vehicle[];
  cuentas: BankAccount[];
  deudas: Debt[];
  pagos: Payment[];
  socios: Partner[];
  privacyMode?: boolean;
}

export function generateExecutivePDFReport(data: PDFReportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isPrivacy = !!data.privacyMode;
  const money = (val: number) => formatMoney(val, isPrivacy);
  const todayStr = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate high level metrics
  const totalSaldo = data.cuentas.reduce((s, c) => s + (Number(c.saldo) || 0), 0);
  const totalReservado = data.cuentas.reduce((s, c) => s + (Number(c.reservado) || 0), 0);
  const totalDeudaPendiente = data.deudas.reduce((s, d) => s + (Number(d.pendiente) || 0), 0);
  const viajesEnRuta = data.viajes.filter((v) => v.estado === 'En curso').length;
  const totalFletes = data.viajes.reduce((s, v) => s + (Number(v.monto) || 0), 0);

  let docVencidos = 0;
  let docPorVencer = 0;
  data.vehiculos.forEach((v) => {
    (v.documentos || []).forEach((docItem) => {
      if (!docItem.fecha) return;
      const days = Math.round((new Date(docItem.fecha + 'T00:00:00').getTime() - Date.now()) / 86400000);
      if (days < 0) docVencidos++;
      else if (days <= 30) docPorVencer++;
    });
  });

  // Color Palette
  const darkSlate = '#14181c';
  const amberGold = '#d97706';
  const headerBlue = '#0f172a';

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('EYON CARGO INTERNACIONAL', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(245, 158, 11); // Amber accent
  doc.text('SISTEMA DE GESTIÓN OPERATIVA & AUDITORÍA FINANCIERA', 14, 18);

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Fecha de Emisión: ${todayStr}`, 14, 25);
  doc.text(`RUC: 20601234567 | Habilitación MTC-SUTRAN Carga Pesada`, 115, 25);

  if (isPrivacy) {
    doc.setFillColor(239, 68, 68);
    doc.rect(145, 8, 50, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('MODO PRIVACIDAD ACTIVO', 147, 13);
  }

  // Summary Metrics Section Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. RESUMEN EJECUTIVO Y AUDITORÍA DE INDICADORES CLAVE', 14, 40);

  // 4 Metrics Cards (draw rectangles)
  const drawMetricCard = (x: number, y: number, width: number, height: number, label: string, value: string, sub: string, bgColor = [248, 250, 252], borderColor = [226, 232, 240]) => {
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.roundedRect(x, y, width, height, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), x + 4, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(value, x + 4, y + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(sub, x + 4, y + 18);
  };

  drawMetricCard(14, 44, 43, 22, 'Caja y Bancos', money(totalSaldo), `Reservado: ${money(totalReservado)}`, [240, 253, 244], [187, 247, 208]);
  drawMetricCard(61, 44, 43, 22, 'Deudas Pendientes', money(totalDeudaPendiente), `${data.deudas.length} crédito(s) activos`, [254, 242, 242], [254, 202, 202]);
  drawMetricCard(108, 44, 43, 22, 'Fletes Totales', money(totalFletes), `${data.viajes.length} viajes registrados`, [240, 249, 255], [186, 230, 253]);
  drawMetricCard(155, 44, 41, 22, 'Alertas Flota', `${docVencidos} Vencidos`, `${docPorVencer} por vencer (30 días)`, [254, 243, 199], [253, 230, 138]);

  let currentY = 72;

  // TABLE 1: CUENTAS BANCARIAS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. CUENTAS BANCARIAS CORPORATIVAS Y RECAUDACIÓN', 14, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Banco / Entidad', 'Tipo de Cuenta', 'N° Cuenta', 'Moneda', 'Saldo Total', 'Reservado (SUNAT)', 'Disponible']],
    body: data.cuentas.map((c) => [
      c.banco,
      c.tipo,
      c.numeroCuenta || '—',
      c.moneda || 'PEN',
      money(Number(c.saldo) || 0),
      money(Number(c.reservado) || 0),
      money((Number(c.saldo) || 0) - (Number(c.reservado) || 0)),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 10;

  // TABLE 2: FLOTA PESADA Y TELEMETRÍA DE VEHÍCULOS
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. FLOTA PESADA Y AUDITORÍA DE DOCUMENTACIÓN OBLIGATORIA', 14, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Placa', 'Tipo', 'Marca / Modelo', 'Estado', 'Documentos', 'Nivel Diésel', 'Observaciones']],
    body: data.vehiculos.map((v) => {
      const docsCount = (v.documentos || []).length;
      const lastFuel = v.combustible && v.combustible.length > 0 ? v.combustible[0] : null;
      const fuelLevel = lastFuel ? `${lastFuel.nivel || 100}% (${lastFuel.galones || 0} Gal)` : 'Sin registro';
      return [
        v.placa,
        v.tipo,
        `${v.marca} ${v.modelo}`,
        v.estado || 'Operativo',
        `${docsCount} doc(s)`,
        fuelLevel,
        v.notas || 'Sin novedades',
      ];
    }),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 10;

  // TABLE 3: FLETES Y VIAJES
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('4. CONTROL DE FLETES, RUTA Y GUÍAS DE REMISIÓN', 14, currentY);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Origen - Destino', 'Cliente', 'Conductor', 'Fecha', 'Estado', 'Guías Remisión', 'Monto (S/)']],
    body: data.viajes.map((v) => {
      const client = data.clientes.find((c) => c.id === v.clienteId);
      return [
        `${v.origen} → ${v.destino}`,
        client ? client.nombre : '—',
        v.conductor || 'Sin asignar',
        v.fecha,
        v.estado,
        v.guiasRemision || '—',
        money(Number(v.monto) || 0),
      ];
    }),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 10;

  // TABLE 4: DEUDAS Y FINANCIAMIENTOS
  if (data.deudas.length > 0) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('5. FINANCIAMIENTOS Y OBLIGACIONES VEHICULARES PENDIENTES', 14, currentY);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Entidad / Crédito', 'Tipo', 'Monto Total', 'Pendiente', 'Cuota Mensual', 'Próx. Vencimiento']],
      body: data.deudas.map((d) => [
        d.entidad,
        d.tipo,
        money(Number(d.total) || 0),
        money(Number(d.pendiente) || 0),
        money(Number(d.cuota) || 0),
        d.fecha || '—',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });

    // @ts-ignore
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // Footer / Signature Section
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 282, 196, 282);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('EYON CARGO INTERNACIONAL - Documento Oficial de Reporte Consolidado y Auditoría', 14, 287);
    doc.text(`Página ${i} de ${pageCount}`, 180, 287);
  }

  // Download PDF file
  const filename = `EYON_Cargo_Reporte_Ejecutivo_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
