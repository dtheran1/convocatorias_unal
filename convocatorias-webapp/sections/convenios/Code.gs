/**
 * SISTEMA DE CONVENIOS P&P - UNAL SEDE DE LA PAZ
 * Proyecto Apps Script independiente para la sección de Convenios
 *
 * INSTRUCCIONES:
 * 1. Crea un nuevo proyecto en Google Apps Script (script.google.com)
 * 2. Copia este archivo como Code.gs
 * 3. Copia convenios.html como archivo HTML en el mismo proyecto
 * 4. Ejecuta setupConfiguration() UNA VEZ para configurar IDs en Script Properties
 * 5. Implementa como Web App (Implementar > Nueva implementación > App web)
 */

// ========== CONFIGURACIÓN ==========

const CONFIG_KEYS = {
  SPREADSHEET_CONVENIOS_ID: 'SPREADSHEET_CONVENIOS_ID',
  SHEET_CONVENIOS: 'SHEET_CONVENIOS'
};

/**
 * Obtiene un valor de configuración desde Script Properties
 * Con fallback a valores hardcoded
 */
function getConfig(key) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const value = scriptProperties.getProperty(key);

  if (!value) {
    const fallbacks = {
      'SPREADSHEET_CONVENIOS_ID': '1WEpLg_AV8W6DEw9r5clS34eHWPN1IlOqGCWDUDyBMQs',
      'SHEET_CONVENIOS': 'prácticas y pasantías'
    };
    return fallbacks[key];
  }

  return value;
}

// ========== CONSTANTES ==========

const SPREADSHEET_CONVENIOS_ID = getConfig(CONFIG_KEYS.SPREADSHEET_CONVENIOS_ID);
const SHEET_CONVENIOS = getConfig(CONFIG_KEYS.SHEET_CONVENIOS);

// Mapeo de columnas del Sheet "prácticas y pasantías"
const COL_CONV = {
  NUMERO: 0,            // A: N°
  ANIO: 1,              // B: Año
  TIPO: 3,              // D: Tipo de convenio
  INSTITUCION: 5,       // F: Nombre de la institución contraparte
  FECHA_SUSCRIPCION: 9, // J: Fecha de suscripción del convenio
  DURACION: 10,         // K: Duración
  ESTADO: 12,           // M: ESTADO (ACTIVO/INACTIVO)
  ENLACE: 13            // N: Enlace de convenio
};

// ========== ENTRY POINT ==========

/**
 * Sirve la página convenios.html
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('convenios')
    .setTitle('Convenios P&P - UNAL Sede de La Paz')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ========== HELPERS ==========

/**
 * Formatea una fecha del Sheet al formato "d de mes de yyyy"
 */
function formatFechaConvenio(val) {
  if (!val || val.toString().trim() === '') return '';
  if (val instanceof Date) {
    const meses = ['enero','febrero','marzo','abril','mayo','junio',
                   'julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return val.getDate() + ' de ' + meses[val.getMonth()] + ' de ' + val.getFullYear();
  }
  return val.toString().trim();
}

/**
 * Limpia el nombre de la institución (saltos de línea, espacios extras, números de contrato)
 */
function cleanInstitucion(val) {
  if (!val) return '';
  return val.toString()
    .replace(/\n/g, ' ')
    .replace(/No\.\s*\d+[_-]\d+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normaliza el tipo de convenio para consistencia en la visualización
 */
function normalizeTipoConvenio(val) {
  if (!val) return 'Específico';
  const t = val.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (t.includes('interadministrativo')) return 'Interadministrativo';
  return 'Específico';
}

/**
 * Limpia la referencia del documento (elimina prefijos numéricos como "1. ")
 */
function cleanEnlaceConvenio(val) {
  if (!val) return '';
  return val.toString()
    .replace(/^\s*\d+\.\s*/, '')
    .trim();
}

// ========== DATOS ==========

/**
 * Extrae la URL de un enlace de una celda usando tres estrategias en cascada:
 *   1. getRichTextValues → getHyperlink() (hyperlinks añadidos por la UI de Sheets)
 *   2. Parseo de fórmula =HYPERLINK("url","texto")
 *   3. Valor crudo si ya es una URL
 * @param {*}      richTextCell  — elemento de getRichTextValues() (puede no ser RichTextValue)
 * @param {string} formulaValue  — elemento de getFormulas()
 * @returns {string|null}
 */
function getEnlaceUrl(richTextCell, formulaValue) {
  // Estrategia 1: hyperlink via RichTextValue (falla silenciosa si el objeto no soporta el método)
  if (richTextCell && typeof richTextCell.getHyperlink === 'function') {
    var hyperlink = richTextCell.getHyperlink();
    if (hyperlink) return hyperlink;
  }

  // Estrategia 2 y 3: basadas en la fórmula / valor de texto
  var formula = (formulaValue || '').toString().trim();

  // =HYPERLINK("url", "texto")
  var match = formula.match(/=HYPERLINK\(\s*"([^"]+)"/i);
  if (match) return match[1];

  // URL cruda directa en la celda
  if (formula.startsWith('http://') || formula.startsWith('https://')) return formula;

  return null;
}

/**
 * Obtiene todos los convenios del Sheet de Convenios P&P
 * @returns {Object} { success: boolean, data: Array, error?: string }
 */
function getConvenios() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_CONVENIOS_ID);
    const sheet = ss.getSheetByName(SHEET_CONVENIOS);

    if (!sheet) {
      throw new Error('No se encontró la hoja: ' + SHEET_CONVENIOS);
    }

    const range   = sheet.getDataRange();
    const data    = range.getValues();
    const formulas = range.getFormulas();

    // getRichTextValues puede fallar en sheets con celdas mergeadas; se captura el error
    var richText;
    try { richText = range.getRichTextValues(); } catch(e) { richText = null; }

    // Buscar la fila de encabezados (contiene "N°" en la primera columna)
    let headerRowIndex = -1;
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().trim() === 'N°') {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error('No se encontró la fila de encabezados en el Sheet de Convenios');
    }

    const rows         = data.slice(headerRowIndex + 1);
    const formulaRows  = formulas.slice(headerRowIndex + 1);
    const richTextRows = richText ? richText.slice(headerRowIndex + 1) : null;
    const convenios    = [];

    rows.forEach(function(row, index) {
      const institucion = cleanInstitucion(row[COL_CONV.INSTITUCION]);
      if (!institucion) return; // Saltar filas vacías

      var rtCell = richTextRows ? richTextRows[index][COL_CONV.ENLACE] : null;
      var fmCell = formulaRows[index][COL_CONV.ENLACE];

      convenios.push({
        id: parseInt(row[COL_CONV.NUMERO]) || convenios.length + 1,
        anio: parseInt(row[COL_CONV.ANIO]) || 0,
        tipo: normalizeTipoConvenio(row[COL_CONV.TIPO]),
        institucion: institucion,
        estado: (row[COL_CONV.ESTADO] || '').toString().trim().toUpperCase(),
        fecha: formatFechaConvenio(row[COL_CONV.FECHA_SUSCRIPCION]),
        duracion: (row[COL_CONV.DURACION] || '').toString().trim(),
        doc: getEnlaceUrl(rtCell, fmCell) || cleanEnlaceConvenio(row[COL_CONV.ENLACE])
      });
    });

    return { success: true, data: convenios };

  } catch (error) {
    console.error('Error al obtener convenios:', error);
    return { success: false, error: error.message, data: [] };
  }
}

// ========== SUGERENCIA DE EMPRESA ==========

const EMAIL_DESTINO_SUGERENCIAS = 'practicas_paz@unal.edu.co';

/**
 * Recibe una sugerencia de empresa y la envía por correo.
 * @param {Object} datos — { empresa, sector, ciudad, representante, emailEmpresa, telefonoEmpresa, nombre, correo, modalidad }
 * @returns {Object} { success: boolean, error?: string }
 */
function enviarSugerencia(datos) {
  try {
    // Validación server-side: campos obligatorios
    var campos = ['empresa', 'representante', 'emailEmpresa', 'telefonoEmpresa', 'nombre', 'correo', 'modalidad'];
    for (var i = 0; i < campos.length; i++) {
      if (!datos[campos[i]] || !datos[campos[i]].toString().trim()) {
        return { success: false, error: 'Falta el campo: ' + campos[i] };
      }
    }

    // Correo del estudiante debe ser @unal.edu.co
    if (!datos.correo.toLowerCase().endsWith('@unal.edu.co')) {
      return { success: false, error: 'El correo debe ser @unal.edu.co.' };
    }

    var asunto = '[Sugerencia de empresa] \u2013 ' + datos.empresa + ' \u2013 ' + datos.nombre;

    var cuerpo =
      '<table style="font-family:sans-serif;font-size:14px;width:100%;max-width:560px;border-collapse:collapse;margin:0 auto;">' +
        '<tr><td style="padding:20px 0;border-bottom:2px solid #4CAF50;">' +
          '<strong style="font-size:18px;">Sugerencia de empresa</strong><br>' +
          '<span style="color:#64748b;font-size:13px;">Enviada desde la sección de Convenios &ndash; UNAL Sede de La Paz</span>' +
        '</td></tr>' +

        // Datos empresa
        '<tr><td style="padding:16px 0 4px;"><strong style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Datos de la empresa</strong></td></tr>' +
        '<tr><td style="padding:4px 0;"><strong>Nombre:</strong> ' + escapeHtmlGs(datos.empresa) + '</td></tr>' +
        (datos.sector ? '<tr><td style="padding:4px 0;"><strong>Sector / Rubro:</strong> ' + escapeHtmlGs(datos.sector) + '</td></tr>' : '') +
        (datos.ciudad ? '<tr><td style="padding:4px 0;"><strong>Ciudad:</strong> ' + escapeHtmlGs(datos.ciudad) + '</td></tr>' : '') +

        // Contacto empresa
        '<tr><td style="padding:16px 0 4px;"><strong style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Contacto de la empresa</strong></td></tr>' +
        '<tr><td style="padding:4px 0;"><strong>Representante:</strong> ' + escapeHtmlGs(datos.representante) + '</td></tr>' +
        '<tr><td style="padding:4px 0;"><strong>Correo:</strong> ' + escapeHtmlGs(datos.emailEmpresa) + '</td></tr>' +
        '<tr><td style="padding:4px 0;"><strong>Teléfono:</strong> ' + escapeHtmlGs(datos.telefonoEmpresa) + '</td></tr>' +

        // Datos estudiante
        '<tr><td style="padding:16px 0 4px;"><strong style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Estudiante</strong></td></tr>' +
        '<tr><td style="padding:4px 0;"><strong>Nombre:</strong> ' + escapeHtmlGs(datos.nombre) + '</td></tr>' +
        '<tr><td style="padding:4px 0;"><strong>Correo:</strong> ' + escapeHtmlGs(datos.correo) + '</td></tr>' +
        '<tr><td style="padding:4px 0;"><strong>Modalidad de interés:</strong> ' + escapeHtmlGs(datos.modalidad) + '</td></tr>' +

        '<tr><td style="padding:20px 0 0;border-top:1px solid #e2e8f0;">' +
          '<span style="color:#94a3b8;font-size:12px;">Este mensaje fue generado automáticamente.</span>' +
        '</td></tr>' +
      '</table>';

    MailApp.sendEmail({
      to: EMAIL_DESTINO_SUGERENCIAS,
      subject: asunto,
      htmlBody: cuerpo
    });

    return { success: true };

  } catch (error) {
    console.error('Error en enviarSugerencia:', error);
    return { success: false, error: 'Error interno al enviar la sugerencia.' };
  }
}

function escapeHtmlGs(text) {
  if (!text) return '';
  return text.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ========== CONFIGURACIÓN ==========

/**
 * EJECUTAR ESTA FUNCIÓN UNA SOLA VEZ para configurar Script Properties
 */
function setupConfiguration() {
  console.log('=== CONFIGURANDO SCRIPT PROPERTIES (Convenios) ===');

  const config = {
    'SPREADSHEET_CONVENIOS_ID': '1WEpLg_AV8W6DEw9r5clS34eHWPN1IlOqGCWDUDyBMQs',
    'SHEET_CONVENIOS': 'prácticas y pasantías'
  };

  const scriptProperties = PropertiesService.getScriptProperties();

  Object.keys(config).forEach(key => {
    scriptProperties.setProperty(key, config[key]);
    console.log(`✓ ${key} configurado`);
  });

  console.log('=== CONFIGURACIÓN COMPLETADA ===');
  console.log('Ejecuta verifyConfiguration() para verificar');
}

/**
 * Verifica que las propiedades estén configuradas correctamente
 */
function verifyConfiguration() {
  console.log('=== VERIFICANDO CONFIGURACIÓN (Convenios) ===');

  const requiredKeys = Object.values(CONFIG_KEYS);
  const scriptProperties = PropertiesService.getScriptProperties();
  let allConfigured = true;

  requiredKeys.forEach(key => {
    const value = scriptProperties.getProperty(key);
    if (value) {
      console.log(`✓ ${key}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`✗ ${key}: NO CONFIGURADO (usando fallback)`);
      allConfigured = false;
    }
  });

  if (allConfigured) {
    console.log('\n=== ✓ CONFIGURACIÓN COMPLETA ===');
  } else {
    console.log('\n=== ⚠ CONFIGURACIÓN INCOMPLETA ===');
    console.log('Ejecuta setupConfiguration() para configurar las propiedades faltantes');
  }

  return allConfigured;
}
