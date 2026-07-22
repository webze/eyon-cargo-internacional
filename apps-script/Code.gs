/**
 * EYON Cargo Internacional - Google Apps Script Integration Backend
 * Este script conecta tu aplicación EYON Cargo con tu Google Sheet personal.
 * Genera hojas individuales ordenadas y un Dashboard Consolidado "00_Resumen_Ejecutivo".
 */

function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : 'getAll';
  var sheet = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'getAll') {
    var data = {
      ok: true,
      clientes: getSheetData(sheet, 'Clientes'),
      viajes: getSheetData(sheet, 'Viajes'),
      vehiculos: getSheetData(sheet, 'Vehiculos'),
      cuentas: getSheetData(sheet, 'Cuentas'),
      deudas: getSheetData(sheet, 'Deudas'),
      pagos: getSheetData(sheet, 'Pagos'),
      socios: getSheetData(sheet, 'Socios')
    };

    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true, message: 'EYON Cargo Apps Script API activa' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = {};
    if (e && e.postData && e.postData.contents) {
      try {
        contents = JSON.parse(e.postData.contents);
      } catch (errParse) {
        contents = {};
      }
    }
    var sheet = SpreadsheetApp.getActiveSpreadsheet();

    if (contents.clientes) saveSheetData(sheet, 'Clientes', contents.clientes);
    if (contents.viajes) saveSheetData(sheet, 'Viajes', contents.viajes);
    if (contents.vehiculos) saveSheetData(sheet, 'Vehiculos', contents.vehiculos);
    if (contents.cuentas) saveSheetData(sheet, 'Cuentas', contents.cuentas);
    if (contents.deudas) saveSheetData(sheet, 'Deudas', contents.deudas);
    if (contents.pagos) saveSheetData(sheet, 'Pagos', contents.pagos);
    if (contents.socios) saveSheetData(sheet, 'Socios', contents.socios);

    // Generar o actualizar pestaña de Resumen Ejecutivo Consolidado
    generateExecutiveSummarySheet(sheet, contents);

    return ContentService.createTextOutput(JSON.stringify({ ok: true, timestamp: new Date().toISOString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheetData(ss, sheetName) {
  var sh = ss.getSheetByName(sheetName);
  if (!sh) return [];
  var values = sh.getDataRange().getValues();
  if (values.length <= 1) return [];

  var headers = values[0];
  var result = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = row[j];
      try {
        obj[headers[j]] = typeof val === 'string' && (val.startsWith('{') || val.startsWith('[')) ? JSON.parse(val) : val;
      } catch (e) {
        obj[headers[j]] = val;
      }
    }
    result.push(obj);
  }
  return result;
}

function saveSheetData(ss, sheetName, items) {
  if (!items || !Array.isArray(items) || items.length === 0) return;

  var sh = ss.getSheetByName(sheetName);
  if (!sh) {
    sh = ss.insertSheet(sheetName);
  } else {
    sh.clear();
  }

  // Extraer todas las claves únicas de todos los items
  var keysMap = {};
  items.forEach(function(item) {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach(function(k) {
        keysMap[k] = true;
      });
    }
  });

  var keys = Object.keys(keysMap);
  if (keys.length === 0) return;

  sh.appendRow(keys);

  var rows = items.map(function(item) {
    return keys.map(function(k) {
      var val = item ? item[k] : '';
      if (val === undefined || val === null) return '';
      if (typeof val === 'object') return JSON.stringify(val);
      return val;
    });
  });

  if (rows.length > 0) {
    sh.getRange(2, 1, rows.length, keys.length).setValues(rows);
  }

  // Dar formato estético a los encabezados
  sh.getRange(1, 1, 1, keys.length)
    .setBackground('#0f172a')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
}

/**
 * Crea o actualiza la hoja "00_Resumen_Ejecutivo" con tablas bien estructuradas y totales
 */
function generateExecutiveSummarySheet(ss, data) {
  try {
    var sheetName = '00_Resumen_Ejecutivo';
    var sh = ss.getSheetByName(sheetName);
    if (!sh) {
      sh = ss.insertSheet(sheetName, 0);
    } else {
      sh.clear();
    }

    // Título Principal
    sh.getRange('A1:E1').merge()
      .setValue('EYON CARGO INTERNACIONAL - CONSOLIDADO Y RESUMEN GENERAL')
      .setFontWeight('bold')
      .setFontSize(14)
      .setBackground('#0f172a')
      .setFontColor('#ffffff')
      .setHorizontalAlignment('center');

    sh.getRange('A2:E2').merge()
      .setValue('Fecha de última sincronización: ' + new Date().toLocaleString('es-PE'))
      .setFontSize(9)
      .setFontItalic(true)
      .setHorizontalAlignment('center');

    // TABLA 1: RESUMEN BANCARIO
    sh.getRange('A4:D4').merge()
      .setValue('1. RESUMEN BANCARIO Y LIQUIDEZ (S/)')
      .setFontWeight('bold')
      .setBackground('#1e293b')
      .setFontColor('#f59e0b');

    var cuentas = data.cuentas || [];
    var totalSaldo = 0;
    var totalReservado = 0;

    var bankRows = [['Banco', 'N° Cuenta', 'Saldo Total', 'Reservado SUNAT']];
    for (var i = 0; i < cuentas.length; i++) {
      var c = cuentas[i];
      var s = Number(c.saldo) || 0;
      var r = Number(c.reservado) || 0;
      totalSaldo += s;
      totalReservado += r;
      bankRows.push([c.banco || '—', c.numeroCuenta || '—', s, r]);
    }
    bankRows.push(['TOTAL CONSOLIDADO', '—', totalSaldo, totalReservado]);

    sh.getRange(5, 1, bankRows.length, 4).setValues(bankRows);
    sh.getRange(5, 1, 1, 4).setFontWeight('bold').setBackground('#f1f5f9');
    sh.getRange(5 + bankRows.length - 1, 1, 1, 4).setFontWeight('bold').setBackground('#e2e8f0');

    // TABLA 2: RESUMEN DE FLOTA Y DIESEL
    var startRow = 5 + bankRows.length + 2;
    sh.getRange(startRow, 1, 1, 4).merge()
      .setValue('2. RESUMEN DE FLOTA PESADA Y DIESEL')
      .setFontWeight('bold')
      .setBackground('#1e293b')
      .setFontColor('#38bdf8');

    var vehiculos = data.vehiculos || [];
    var fleetRows = [['Placa', 'Tipo', 'Marca/Modelo', 'Estado']];
    for (var j = 0; j < vehiculos.length; j++) {
      var v = vehiculos[j];
      fleetRows.push([v.placa || '—', v.tipo || '—', (v.marca || '') + ' ' + (v.modelo || ''), v.estado || 'Operativo']);
    }

    sh.getRange(startRow + 1, 1, fleetRows.length, 4).setValues(fleetRows);
    sh.getRange(startRow + 1, 1, 1, 4).setFontWeight('bold').setBackground('#f1f5f9');

    // Ajuste automático de ancho de columnas
    sh.autoResizeColumns(1, 5);
  } catch (err) {
    Logger.log('Error en generateExecutiveSummarySheet: ' + err.toString());
  }
}
