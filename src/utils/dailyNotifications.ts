import { Vehicle, Ranfla, VehicleDocument, MaintenanceTask } from '../types';

export type AlertUrgency = 'expired' | 'critical' | 'warning' | 'info';

export interface DailyNotificationItem {
  id: string;
  vehicleId: string;
  vehiclePlaca: string;
  unitType: 'camion' | 'ranfla' | 'mantenimiento';
  unitName: string; // Ej: "Camión V7A-982" o "Ranfla R3B-912"
  title: string;
  documentType: string;
  dueDate?: string;
  daysLeft: number;
  urgency: AlertUrgency;
  description: string;
  dateCreated: string;
}

/**
 * Escanea todos los vehículos y ranflas de la flota para calcular las notificaciones diarias de vencimientos
 */
export function generateDailyNotifications(vehiculos: Vehicle[]): DailyNotificationItem[] {
  const notifications: DailyNotificationItem[] = [];
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];

  vehiculos.forEach((veh) => {
    const kmNow = veh.kmActual || 185200;

    // 1. EVALUAR DOCUMENTOS DEL CAMIÓN / VEHÍCULO
    (veh.documentos || []).forEach((doc) => {
      if (!doc.fecha) return;
      const due = new Date(doc.fecha + 'T00:00:00');
      const diffMs = due.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysLeft < 0) {
        const absDays = Math.abs(daysLeft);
        notifications.push({
          id: `doc-${veh.id}-${doc.id}-${dateStr}`,
          vehicleId: veh.id,
          vehiclePlaca: veh.placa,
          unitType: 'camion',
          unitName: `Camión ${veh.placa}`,
          title: `¡DOCUMENTO VENCIDO! ${doc.tipo}`,
          documentType: doc.tipo,
          dueDate: doc.fecha,
          daysLeft,
          urgency: 'expired',
          description: `El documento ${doc.tipo} de la unidad ${veh.placa} venció hace ${absDays} día(s). Debe renovarse de inmediato para evitar multas de SUTRAN/MTC.`,
          dateCreated: dateStr,
        });
      } else if (daysLeft <= 30) {
        notifications.push({
          id: `doc-${veh.id}-${doc.id}-${dateStr}`,
          vehicleId: veh.id,
          vehiclePlaca: veh.placa,
          unitType: 'camion',
          unitName: `Camión ${veh.placa}`,
          title: `Vencimiento Crítico: ${doc.tipo}`,
          documentType: doc.tipo,
          dueDate: doc.fecha,
          daysLeft,
          urgency: 'critical',
          description: `El documento ${doc.tipo} de la unidad ${veh.placa} vence en solo ${daysLeft} día(s) (Fecha: ${doc.fecha}).`,
          dateCreated: dateStr,
        });
      } else if (daysLeft <= 60) {
        notifications.push({
          id: `doc-${veh.id}-${doc.id}-${dateStr}`,
          vehicleId: veh.id,
          vehiclePlaca: veh.placa,
          unitType: 'camion',
          unitName: `Camión ${veh.placa}`,
          title: `Próximo Vencimiento: ${doc.tipo}`,
          documentType: doc.tipo,
          dueDate: doc.fecha,
          daysLeft,
          urgency: 'warning',
          description: `El documento ${doc.tipo} de la unidad ${veh.placa} vence en ${daysLeft} día(s) (Fecha: ${doc.fecha}).`,
          dateCreated: dateStr,
        });
      }
    });

    // 2. EVALUAR DOCUMENTOS DE LA RANFLA ASIGNADA
    if (veh.ranfla && veh.ranfla.documentos) {
      const ranflaPlaca = veh.ranfla.placa || 'Ranfla Asignada';
      veh.ranfla.documentos.forEach((doc) => {
        if (!doc.fecha) return;
        const due = new Date(doc.fecha + 'T00:00:00');
        const diffMs = due.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) {
          const absDays = Math.abs(daysLeft);
          notifications.push({
            id: `ranfla-doc-${veh.id}-${doc.id}-${dateStr}`,
            vehicleId: veh.id,
            vehiclePlaca: veh.placa,
            unitType: 'ranfla',
            unitName: `Ranfla ${ranflaPlaca} (${veh.placa})`,
            title: `¡DOCUMENTO RANFLA VENCIDO! ${doc.tipo}`,
            documentType: doc.tipo,
            dueDate: doc.fecha,
            daysLeft,
            urgency: 'expired',
            description: `El documento ${doc.tipo} de la Ranfla ${ranflaPlaca} (Unidad ${veh.placa}) venció hace ${absDays} día(s).`,
            dateCreated: dateStr,
          });
        } else if (daysLeft <= 30) {
          notifications.push({
            id: `ranfla-doc-${veh.id}-${doc.id}-${dateStr}`,
            vehicleId: veh.id,
            vehiclePlaca: veh.placa,
            unitType: 'ranfla',
            unitName: `Ranfla ${ranflaPlaca} (${veh.placa})`,
            title: `Ranfla Vencimiento Crítico: ${doc.tipo}`,
            documentType: doc.tipo,
            dueDate: doc.fecha,
            daysLeft,
            urgency: 'critical',
            description: `El documento ${doc.tipo} de la Ranfla ${ranflaPlaca} vence en ${daysLeft} día(s) (Fecha: ${doc.fecha}).`,
            dateCreated: dateStr,
          });
        } else if (daysLeft <= 60) {
          notifications.push({
            id: `ranfla-doc-${veh.id}-${doc.id}-${dateStr}`,
            vehicleId: veh.id,
            vehiclePlaca: veh.placa,
            unitType: 'ranfla',
            unitName: `Ranfla ${ranflaPlaca} (${veh.placa})`,
            title: `Ranfla Próximo Vencimiento: ${doc.tipo}`,
            documentType: doc.tipo,
            dueDate: doc.fecha,
            daysLeft,
            urgency: 'warning',
            description: `El documento ${doc.tipo} de la Ranfla ${ranflaPlaca} vence en ${daysLeft} día(s) (Fecha: ${doc.fecha}).`,
            dateCreated: dateStr,
          });
        }
      });
    }

    // 3. EVALUAR MANTENIMIENTO DE CAMBIO DE ACEITE POR KILOMETRAJE
    (veh.mantenimientos || []).forEach((m) => {
      const targetKm = m.kmUltimoCambio + m.intervaloKm;
      const kmFaltantes = targetKm - kmNow;

      if (kmFaltantes <= 0) {
        const kmExcedidos = Math.abs(kmFaltantes);
        notifications.push({
          id: `maint-${veh.id}-${m.id}-${dateStr}`,
          vehicleId: veh.id,
          vehiclePlaca: veh.placa,
          unitType: 'mantenimiento',
          unitName: `Camión ${veh.placa}`,
          title: `¡CAMBIO DE ACEITE REQUERIDO! ${m.tipo}`,
          documentType: m.tipo,
          daysLeft: 0,
          urgency: 'expired',
          description: `El mantenimiento (${m.tipo}) de la unidad ${veh.placa} sobrepasó el límite por ${kmExcedidos.toLocaleString('es-PE')} KM (Odómetro: ${kmNow.toLocaleString('es-PE')} KM).`,
          dateCreated: dateStr,
        });
      } else if (kmFaltantes <= 1500) {
        notifications.push({
          id: `maint-${veh.id}-${m.id}-${dateStr}`,
          vehicleId: veh.id,
          vehiclePlaca: veh.placa,
          unitType: 'mantenimiento',
          unitName: `Camión ${veh.placa}`,
          title: `Próximo Cambio de Aceite: ${m.tipo}`,
          documentType: m.tipo,
          daysLeft: Math.ceil(kmFaltantes / 300), // Estimado de días
          urgency: 'warning',
          description: `Faltan solo ${kmFaltantes.toLocaleString('es-PE')} KM para el ${m.tipo} de la unidad ${veh.placa} (Odómetro actual: ${kmNow.toLocaleString('es-PE')} KM).`,
          dateCreated: dateStr,
        });
      }
    });
  });

  // Ordenar: Primero los Vencidos ('expired'), luego Críticos ('critical'), luego 'warning'
  const urgencyWeight: Record<AlertUrgency, number> = {
    expired: 1,
    critical: 2,
    warning: 3,
    info: 4,
  };

  return notifications.sort((a, b) => {
    if (urgencyWeight[a.urgency] !== urgencyWeight[b.urgency]) {
      return urgencyWeight[a.urgency] - urgencyWeight[b.urgency];
    }
    return a.daysLeft - b.daysLeft;
  });
}

/**
 * Envia notificaciones nativas del navegador web si está permitido por el usuario
 */
export function triggerDesktopPushNotifications(items: DailyNotificationItem[]) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    const expiredOrCritical = items.filter((i) => i.urgency === 'expired' || i.urgency === 'critical');
    if (expiredOrCritical.length > 0) {
      const topItem = expiredOrCritical[0];
      new Notification(`EYON Cargo - Alerta Diaria (${expiredOrCritical.length} pendientes)`, {
        body: `${topItem.title}: ${topItem.description}`,
        icon: '/favicon.ico',
      });
    }
  }
}
