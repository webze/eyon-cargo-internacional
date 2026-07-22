import { Client, Trip, Vehicle, BankAccount, Debt, Partner } from '../types';

export interface SyncDataPayload {
  clientes: Client[];
  viajes: Trip[];
  vehiculos: Vehicle[];
  cuentas: BankAccount[];
  deudas: Debt[];
  socios: Partner[];
  username?: string;
}

export interface SyncResult {
  success: boolean;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  timestamp?: number;
  error?: string;
  rowsSynced?: number;
}

const SPREADSHEET_NAME = "EYON CARGO - Respaldos y Datos de Flota (Oficial)";

// Search or create Spreadsheet in Google Drive
export async function findOrCreateSpreadsheet(accessToken: string, existingId?: string): Promise<string> {
  // If we already have an ID, verify it exists
  if (existingId && existingId.trim().length > 10) {
    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${existingId.trim()}?fields=spreadsheetId,properties.title`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        return existingId.trim();
      }
    } catch {
      // Fallback to searching or creating
    }
  }

  // Search in Google Drive for an existing file with our title
  try {
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`name = '${SPREADSHEET_NAME}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`)}&fields=files(id,name)`;
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
      }
    }
  } catch (e) {
    console.warn("Drive search error:", e);
  }

  // Create a brand new Google Spreadsheet
  const createRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title: SPREADSHEET_NAME },
      sheets: [
        { properties: { title: 'Clientes' } },
        { properties: { title: 'Viajes y Fletes' } },
        { properties: { title: 'Flota y Papeles' } },
        { properties: { title: 'Cuentas Bancarias' } },
        { properties: { title: 'Deudas y Financiamiento' } },
        { properties: { title: 'Socios' } },
        { properties: { title: 'Registro de Sincronización' } },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Error creando la hoja en Google Sheets: ${errText}`);
  }

  const createData = await createRes.json();
  return createData.spreadsheetId;
}

// Convert app state into clean Google Sheets tables
export async function syncAllDataToGoogleSheets(
  accessToken: string,
  spreadsheetId: string,
  payload: SyncDataPayload
): Promise<SyncResult> {
  try {
    // 1. Clientes
    const clientesRows: any[][] = [
      ['RUC / DNI', 'Razón Social / Nombre', 'Contacto Principal', 'Teléfono', 'Email Corporativo', 'Límite Crédito (S/)', 'Estado'],
      ...payload.clientes.map((c) => [
        c.ruc || '',
        c.nombre || '',
        c.contacto || '',
        c.telefono || '',
        c.email || '',
        c.limiteCredito || 0,
        c.estado || 'Activo',
      ]),
    ];

    // 2. Viajes y Fletes
    const viajesRows: any[][] = [
      ['ID Viaje', 'Fecha', 'Cliente ID', 'Origen', 'Destino', 'Vehículo ID', 'Conductor', 'Flete Total (S/)', 'Guías Remisión', 'Notas', 'Estado'],
      ...payload.viajes.map((v) => {
        const clientObj = payload.clientes.find((c) => c.id === v.clienteId);
        const clientLabel = clientObj ? clientObj.nombre : v.clienteId || 'Cliente General';
        return [
          v.id,
          v.fecha,
          clientLabel,
          v.origen,
          v.destino,
          v.vehiculoId || '',
          v.conductor || '',
          v.monto || 0,
          v.guiasRemision || '',
          v.notas || '',
          v.estado,
        ];
      }),
    ];

    // 3. Flota y Papeles
    const flotaRows: any[][] = [
      ['Placa Tractor', 'Tipo / Categoría', 'Marca', 'Modelo', 'Km Actual', 'SOAT Fecha Vencimiento', 'CITV Vencimiento', 'Ranfla Placa', 'Ranfla Tipo', 'Estado Operativo'],
      ...payload.vehiculos.map((veh) => {
        const getDocDate = (docs: any[], tipoKeyword: string) => {
          const doc = docs?.find((d) => d.tipo.toLowerCase().includes(tipoKeyword.toLowerCase()));
          return doc?.fecha || 'Al Día';
        };
        const vehDocs = veh.documentos || [];

        return [
          veh.placa,
          veh.tipo,
          veh.marca || 'Volvo',
          veh.modelo || '',
          veh.kmActual || 0,
          getDocDate(vehDocs, 'soat'),
          getDocDate(vehDocs, 'revisión') || getDocDate(vehDocs, 'citv'),
          veh.ranfla?.placa || 'Sin Ranfla',
          veh.ranfla?.tipo || '',
          veh.estado || 'Operativo',
        ];
      }),
    ];

    // 4. Cuentas Bancarias
    const cuentasRows: any[][] = [
      ['Banco / Entidad', 'Tipo Cuenta', 'N° Cuenta Bancaria', 'Moneda', 'Saldo Disponible (S/)', 'Saldo Reservado (S/)', 'Notas'],
      ...payload.cuentas.map((c) => [
        c.banco,
        c.tipo,
        c.numeroCuenta || '',
        c.moneda || 'PEN',
        c.saldo,
        c.reservado || 0,
        c.notas || '',
      ]),
    ];

    // 5. Deudas y Financiamiento
    const deudasRows: any[][] = [
      ['Entidad / Acreedor', 'Tipo Deuda', 'Monto Total Deuda (S/)', 'Monto Pendiente (S/)', 'Cuota Mensual (S/)', 'Próximo Vencimiento', 'Notas'],
      ...payload.deudas.map((d) => [
        d.entidad,
        d.tipo,
        d.total,
        d.pendiente,
        d.cuota,
        d.fecha,
        d.notas || '',
      ]),
    ];

    // 6. Socios
    const sociosRows: any[][] = [
      ['Nombre Completo', 'Porcentaje de Participación (%)', 'Total Pagos / Retiros (S/)'],
      ...payload.socios.map((s) => {
        const totalPagos = s.pagos ? s.pagos.reduce((acc, p) => acc + p.monto, 0) : 0;
        return [
          s.nombre,
          s.pct,
          totalPagos,
        ];
      }),
    ];

    const syncDateFormatted = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
    const logRows: any[][] = [
      ['Fecha y Hora (PET)', 'Evento', 'Usuario Responsable', 'Totales Registrados'],
      [
        syncDateFormatted,
        'RESPALDO AUTOMÁTICO EN TIEMPO REAL',
        payload.username || 'Usuario App',
        `${payload.viajes.length} viajes | ${payload.clientes.length} clientes | ${payload.vehiculos.length} vehículos | ${payload.cuentas.length} cuentas`,
      ],
    ];

    // Batch update value data to Google Sheets
    const valueData = [
      { range: 'Clientes!A1:Z500', values: clientesRows },
      { range: 'Viajes y Fletes!A1:Z1000', values: viajesRows },
      { range: 'Flota y Papeles!A1:Z500', values: flotaRows },
      { range: 'Cuentas Bancarias!A1:Z500', values: cuentasRows },
      { range: 'Deudas y Financiamiento!A1:Z500', values: deudasRows },
      { range: 'Socios!A1:Z500', values: sociosRows },
      { range: 'Registro de Sincronización!A1:Z500', values: logRows },
    ];

    // Clear old values first to avoid orphaned rows
    for (const item of valueData) {
      const sheetName = item.range.split('!')[0];
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}:clear`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      ).catch(() => {});
    }

    // Write new values
    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: valueData,
        }),
      }
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`Error actualizando celdas en Google Sheets: ${errText}`);
    }

    const totalRows =
      clientesRows.length +
      viajesRows.length +
      flotaRows.length +
      cuentasRows.length +
      deudasRows.length +
      sociosRows.length;

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

    return {
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      timestamp: Date.now(),
      rowsSynced: totalRows,
    };
  } catch (error: any) {
    console.error('Google Sheets Sync error:', error);
    return {
      success: false,
      error: error?.message || 'Falló la sincronización con Google Sheets',
    };
  }
}

// Download Excel CSV Files locally as instant offline backup
export function downloadOfflineExcelBackup(payload: SyncDataPayload) {
  const sections = [
    { name: 'CLIENTES', data: payload.clientes },
    { name: 'VIAJES_Y_FLETES', data: payload.viajes },
    { name: 'FLOTA_Y_DOCUMENTOS', data: payload.vehiculos },
    { name: 'CUENTAS_BANCARIAS', data: payload.cuentas },
    { name: 'DEUDAS_Y_FINANCIAMIENTO', data: payload.deudas },
    { name: 'SOCIOS', data: payload.socios },
  ];

  let csvContent = `data:text/csv;charset=utf-8,\uFEFF`;

  sections.forEach((sec) => {
    csvContent += `=== SECCIÓN: ${sec.name} ===\n`;
    if (sec.data && sec.data.length > 0) {
      const keys = Object.keys(sec.data[0]);
      csvContent += keys.join(',') + '\n';
      sec.data.forEach((item: any) => {
        const row = keys.map((k) => {
          let val = item[k];
          if (typeof val === 'object') val = JSON.stringify(val);
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        });
        csvContent += row.join(',') + '\n';
      });
    }
    csvContent += '\n\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const nowStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `EYON_CARGO_Backup_Excel_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
