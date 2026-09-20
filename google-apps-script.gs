/**
 * Backend de Google Apps Script para Rustikas.
 *
 * 1. Abre script.google.com y crea un proyecto nuevo.
 * 2. Pega este archivo y ejecuta inicializarHojas una sola vez.
 * 3. Implementar > Nueva implementación > Aplicación web.
 *    Ejecutar como: tú. Acceso: cualquier persona.
 * 4. Copia la URL /exec en WEB_APP_URL de src/services/googleSheets.ts.
 */

const SPREADSHEET_ID = '1QEC28ClYzYxXjuFoRlrCYZWkRbn1ZZK0QlEzTp4CtHg';

const HEADERS = {
  categorias: ['id', 'nombre', 'destacada', 'horario', 'orden'],
  platos: ['categoria_id', 'nombre', 'descripcion', 'precio', 'url_imagen', 'orden'],
  fidelizacion: ['id_cliente', 'nombre', 'telefono', 'correo', 'puntos', 'visitas', 'ultima_visita', 'fecha_registro', 'consentimiento'],
  resenas: ['id_resena', 'nombre', 'telefono', 'calificacion', 'comentario', 'fecha', 'publicada'],
};

const WRITABLE_SHEETS = new Set(['fidelizacion', 'resenas']);

function getOrCreateSheet_(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS[sheetName]);

  return sheet;
}

/** Crea las cuatro pestañas con sus encabezados sin sobrescribir filas existentes. */
function inicializarHojas() {
  Object.keys(HEADERS).forEach((sheetName) => getOrCreateSheet_(sheetName));
}

function respuesta_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

function valorSeguro_(value) {
  const text = value === undefined || value === null ? '' : String(value).trim();
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function filaDesdeDatos_(sheetName, data) {
  const now = new Date();
  const rowData = { ...data };

  if (sheetName === 'fidelizacion') {
    rowData.id_cliente = rowData.id_cliente || Utilities.getUuid();
    rowData.puntos = rowData.puntos ?? 0;
    rowData.visitas = rowData.visitas ?? 0;
    rowData.fecha_registro = rowData.fecha_registro || now;
  }

  if (sheetName === 'resenas') {
    rowData.id_resena = rowData.id_resena || Utilities.getUuid();
    rowData.fecha = rowData.fecha || now;
    rowData.publicada = rowData.publicada || 'NO';
  }

  return HEADERS[sheetName].map((header) => {
    const value = rowData[header];
    return value instanceof Date ? value : valorSeguro_(value);
  });
}

function registros_(sheetName) {
  const values = getOrCreateSheet_(sheetName).getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  const [headers, ...rows] = values;
  return rows
    .filter((row) => row.some((cell) => cell !== ''))
    .map((row) => headers.reduce((record, header, index) => {
      record[header] = row[index] || '';
      return record;
    }, {}));
}

function respuestaJsonp_(body, callback) {
  const isValidCallback = /^[A-Za-z_$][\w$]*$/.test(callback || '');
  if (!isValidCallback) return respuesta_({ ok: false, error: 'Callback no válido.' });

  return ContentService
    .createTextOutput(`${callback}(${JSON.stringify(body)});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

/**
 * Recibe { sheetName: 'fidelizacion'|'resenas', data: {...} } desde la página.
 * No permite escribir categorías ni platos desde un navegador público.
 */
function doPost(event) {
  try {
    const payload = JSON.parse(event?.postData?.contents || '{}');
    const sheetName = String(payload.sheetName || '').trim().toLowerCase();

    if (!WRITABLE_SHEETS.has(sheetName) || !payload.data || typeof payload.data !== 'object') {
      return respuesta_({ ok: false, error: 'Destino o datos no válidos.' });
    }

    getOrCreateSheet_(sheetName).appendRow(filaDesdeDatos_(sheetName, payload.data));
    return respuesta_({ ok: true });
  } catch (error) {
    console.error(error);
    return respuesta_({ ok: false, error: 'No se pudo guardar el registro.' });
  }
}

function doGet(event) {
  if (event?.parameter?.resource === 'menu') {
    return respuestaJsonp_({
      ok: true,
      categorias: registros_('categorias'),
      platos: registros_('platos'),
    }, event.parameter.callback);
  }

  return respuesta_({ ok: true, service: 'Rustikas Sheets API' });
}
