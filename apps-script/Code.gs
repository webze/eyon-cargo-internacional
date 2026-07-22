/**
 * EYON Cargo Internacional - Google Apps Script Integration Backend
 * Este script conecta tu aplicación EYON Cargo con tu Google Sheet personal.
 */

function doGet(e) {
  var action = e.parameter.action;
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
    var contents = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet();

    if (contents.clientes) saveSheetData(sheet, 'Clientes', contents.clientes);
    if (contents.viajes) saveSheetData(sheet, 'Viajes', contents.viajes);
    if (contents.vehiculos) saveSheetData(sheet, 'Vehiculos', contents.vehiculos);
    if (contents.cuentas) saveSheetData(sheet, 'Cuentas', contents.cuentas);
    if (contents.deudas) saveSheetData(sheet, 'Deudas', contents.deudas);
    if (contents.pagos) saveSheetData(sheet, 'Pagos', contents.pagos);
    if (contents.socios) saveSheetData(sheet, 'Socios', contents.socios);

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
  if (!items || items.length === 0) return;

  var sh = ss.getSheetByName(sheetName);
  if (!sh) {
    sh = ss.insertSheet(sheetName);
  } else {
    sh.clear();
  }

  var keys = Object.keys(items[0]);
  sh.appendRow(keys);

  var rows = items.map(function(item) {
    return keys.map(function(k) {
      var val = item[k];
      return (typeof val === 'object' && val !== null) ? JSON.stringify(val) : val;
    });
  });

  if (rows.length > 0) {
    sh.getRange(2, 1, rows.length, keys.length).setValues(rows);
  }
}
