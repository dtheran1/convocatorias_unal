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
  SHEET_CONVENIOS: 'SHEET_CONVENIOS',
  SHEET_SUGERENCIAS: 'SHEET_SUGERENCIAS'
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
      'SPREADSHEET_CONVENIOS_ID': '1WEpLg_AV8W6DEw9r5clS34eHWPN1IlOqGCWDyBMQs',
      'SHEET_CONVENIOS': 'prácticas y pasantías',
      'SHEET_SUGERENCIAS': 'Sugerencias'
    };
    return fallbacks[key];
  }

  return value;
}

// ========== CONSTANTES ==========

const SPREADSHEET_CONVENIOS_ID = getConfig(CONFIG_KEYS.SPREADSHEET_CONVENIOS_ID);
const SHEET_CONVENIOS = getConfig(CONFIG_KEYS.SHEET_CONVENIOS);
const SHEET_SUGERENCIAS = getConfig(CONFIG_KEYS.SHEET_SUGERENCIAS);

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

// Mapeo de columnas del Sheet "Sugerencias"
const COL_SUG = {
  FECHA_HORA: 0,        // A: Fecha y hora
  EMPRESA: 1,           // B: Nombre de la empresa
  SECTOR: 2,            // C: Sector / Rubro
  CIUDAD: 3,            // D: Ciudad
  REPRESENTANTE: 4,     // E: Nombre del representante
  EMAIL_EMPRESA: 5,     // F: Correo de la empresa
  TELEFONO_EMPRESA: 6,  // G: Teléfono de la empresa
  NOMBRE_ESTUDIANTE: 7, // H: Nombre del estudiante
  CORREO_ESTUDIANTE: 8, // I: Correo del estudiante
  MODALIDAD: 9,         // J: Modalidad (Práctica/Pasantía)
  ESTADO: 10            // K: Estado (Pendiente/Revisado/Aprobado)
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

// ========== SHEET SUGERENCIAS - SETUP ==========

/**
 * Obtiene el spreadsheet usando la URL directa
 * @returns {Spreadsheet}
 */
function getSpreadsheet() {
  console.log('=== getSpreadsheet() ===');
  
  // Método 1: Intentar openById directo
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_CONVENIOS_ID);
    if (ss) {
      console.log('✓ Acceso directo exitoso');
      return ss;
    }
  } catch (e) {
    console.log('openById falló, intentando con URL...');
  }
  
  // Método 2: Usar URL directa (construida desde el ID)
  try {
    var url = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_CONVENIOS_ID + '/edit';
    console.log('Intentando abrir URL:', url);
    var ss = SpreadsheetApp.openByUrl(url);
    if (ss) {
      console.log('✓ Acceso exitoso con openByUrl');
      console.log('Nombre:', ss.getName());
      return ss;
    }
  } catch (e) {
    console.error('Error con openByUrl:', e.message);
  }
  
  // Método 3: getActiveSpreadsheet
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      console.log('✓ Usando spreadsheet activo');
      return ss;
    }
  } catch (e) {
    console.error('Error con getActiveSpreadsheet:', e.message);
  }
  
  throw new Error('No se pudo acceder al spreadsheet. Verifica que el script tenga permisos o usa un proyecto bound (desde Extensiones → Apps Script en el spreadsheet).');
}

/**
 * Obtiene o crea la hoja de Sugerencias con encabezados
 * @returns {Sheet} La hoja de Sugerencias
 */
function getOrCreateSugerenciasSheet() {
  try {
    console.log('Intentando obtener spreadsheet...');
    
    var ss = getSpreadsheet();
    
    var sheet = ss.getSheetByName(SHEET_SUGERENCIAS);
    
    // Si la hoja no existe, crearla
    if (!sheet) {
      console.log('Hoja "' + SHEET_SUGERENCIAS + '" no existe, creándola...');
      sheet = ss.insertSheet(SHEET_SUGERENCIAS);
      
      // Configurar encabezados
      var headers = [
        'Fecha y Hora',
        'Empresa',
        'Sector',
        'Ciudad',
        'Representante',
        'Email Empresa',
        'Teléfono Empresa',
        'Nombre Estudiante',
        'Correo Estudiante',
        'Modalidad',
        'Estado'
      ];
      
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Formato de encabezados
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#4CAF50');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      
      // Congelar fila de encabezados
      sheet.setFrozenRows(1);
      
      // Ajustar anchos de columnas
      sheet.setColumnWidth(1, 150);  // Fecha y Hora
      sheet.setColumnWidth(2, 200);  // Empresa
      sheet.setColumnWidth(3, 120);  // Sector
      sheet.setColumnWidth(4, 120);  // Ciudad
      sheet.setColumnWidth(5, 180);  // Representante
      sheet.setColumnWidth(6, 200);  // Email Empresa
      sheet.setColumnWidth(7, 140);  // Teléfono Empresa
      sheet.setColumnWidth(8, 180);  // Nombre Estudiante
      sheet.setColumnWidth(9, 200);  // Correo Estudiante
      sheet.setColumnWidth(10, 100); // Modalidad
      sheet.setColumnWidth(11, 120); // Estado
      
      console.log('Hoja "' + SHEET_SUGERENCIAS + '" creada con encabezados');
    } else {
      console.log('Hoja "' + SHEET_SUGERENCIAS + '" ya existe');
    }
    
    return sheet;
    
  } catch (error) {
    console.error('Error en getOrCreateSugerenciasSheet:', error);
    throw error;
  }
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
    const ss = getSpreadsheet();
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
 * Guarda una sugerencia de empresa en la hoja de Sugerencias
 * @param {Object} datos — { empresa, sector, ciudad, representante, emailEmpresa, telefonoEmpresa, nombre, correo, modalidad }
 * @returns {Object} { success: boolean, error?: string }
 */
function guardarSugerenciaEnSheet(datos) {
  try {
    console.log('Iniciando guardarSugerenciaEnSheet...');
    
    var sheet;
    try {
      sheet = getOrCreateSugerenciasSheet();
    } catch (e) {
      console.error('Error al obtener/crear hoja:', e);
      return { 
        success: false, 
        error: 'No se pudo acceder a la hoja de sugerencias: ' + e.message 
      };
    }
    
    // Preparar datos para insertar
    var fecha = new Date();
    var row = [
      fecha,                          // Fecha y Hora
      datos.empresa || '',            // Empresa
      datos.sector || '',             // Sector
      datos.ciudad || '',             // Ciudad
      datos.representante || '',      // Representante
      datos.emailEmpresa || '',       // Email Empresa
      datos.telefonoEmpresa || '',    // Teléfono Empresa
      datos.nombre || '',             // Nombre Estudiante
      datos.correo || '',             // Correo Estudiante
      datos.modalidad || '',          // Modalidad
      'Pendiente'                     // Estado inicial
    ];
    
    console.log('Datos preparados para insertar:', JSON.stringify({
      empresa: datos.empresa,
      estudiante: datos.nombre,
      fecha: fecha.toString()
    }));
    
    // Insertar en la siguiente fila disponible
    try {
      sheet.appendRow(row);
    } catch (e) {
      console.error('Error al insertar fila:', e);
      return { 
        success: false, 
        error: 'Error al insertar datos: ' + e.message 
      };
    }
    
    // Formatear la celda de fecha
    var lastRow = sheet.getLastRow();
    
    try {
      var fechaCell = sheet.getRange(lastRow, COL_SUG.FECHA_HORA + 1);
      fechaCell.setNumberFormat('dd/mm/yyyy hh:mm:ss');
      
      // Formatear el estado con color
      var estadoCell = sheet.getRange(lastRow, COL_SUG.ESTADO + 1);
      estadoCell.setBackground('#FEF3C7');
      estadoCell.setFontColor('#B45309');
      estadoCell.setFontWeight('bold');
      estadoCell.setHorizontalAlignment('center');
    } catch (e) {
      console.warn('Error al formatear celdas (datos guardados correctamente):', e);
      // No retornamos error porque los datos sí se guardaron
    }
    
    console.log('Sugerencia guardada exitosamente en fila: ' + lastRow);
    return { success: true, row: lastRow };
    
  } catch (error) {
    console.error('Error general en guardarSugerenciaEnSheet:', error);
    return { 
      success: false, 
      error: error.message || 'Error desconocido al guardar sugerencia' 
    };
  }
}

/**
 * Recibe una sugerencia de empresa, la guarda en el sheet y la envía por correo.
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

    // PASO 1: Guardar en el spreadsheet
    var resultadoSheet = guardarSugerenciaEnSheet(datos);
    if (!resultadoSheet.success) {
      console.error('Error al guardar en sheet (continuando con email):', resultadoSheet.error);
      // Continuar con el envío de email aunque falle el guardado en sheet
    }

    // PASO 2: Enviar email
    var asunto = '[Sugerencia de empresa] – ' + datos.empresa + ' – ' + datos.nombre;

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

    return { success: true, sheetSaved: resultadoSheet.success };

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
    'SPREADSHEET_CONVENIOS_ID': '1WEpLg_AV8W6DEw9r5clS34eHWPN1IlOqGCWDyBMQs',
    'SHEET_CONVENIOS': 'prácticas y pasantías',
    'SHEET_SUGERENCIAS': 'Sugerencias'
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

// ========== FUNCIONES DE PRUEBA Y DIAGNÓSTICO ==========

/**
 * Prueba el acceso al spreadsheet de convenios
 * Ejecutar esta función primero para diagnosticar problemas
 */
function testSpreadsheetAccess() {
  console.log('=== TEST DE ACCESO AL SPREADSHEET ===');
  
  try {
    // 1. Verificar ID
    console.log('1. ID del spreadsheet: ' + SPREADSHEET_CONVENIOS_ID);
    
    // 2. Intentar abrir
    console.log('2. Intentando abrir spreadsheet...');
    var ss;
    try {
      ss = getSpreadsheet();
      console.log('✓ Spreadsheet abierto exitosamente');
    } catch (e) {
      console.error('✗ Error al abrir spreadsheet:', e.message);
      console.log('\nPosibles causas:');
      console.log('- El ID del spreadsheet es incorrecto');
      console.log('- El script no tiene permisos para acceder');
      console.log('- El spreadsheet fue eliminado o movido');
      return false;
    }
    
    // 3. Obtener nombre del spreadsheet
    try {
      var name = ss.getName();
      console.log('✓ Nombre del spreadsheet: ' + name);
    } catch (e) {
      console.error('✗ Error al obtener nombre:', e.message);
    }
    
    // 4. Listar hojas existentes
    try {
      var sheets = ss.getSheets();
      console.log('✓ Hojas en el spreadsheet:');
      sheets.forEach(function(sheet) {
        console.log('  - ' + sheet.getName());
      });
    } catch (e) {
      console.error('✗ Error al listar hojas:', e.message);
    }
    
    // 5. Verificar hoja de convenios
    try {
      var sheetConvenios = ss.getSheetByName(SHEET_CONVENIOS);
      if (sheetConvenios) {
        console.log('✓ Hoja "' + SHEET_CONVENIOS + '" encontrada');
      } else {
        console.warn('⚠ Hoja "' + SHEET_CONVENIOS + '" NO encontrada');
      }
    } catch (e) {
      console.error('✗ Error al verificar hoja de convenios:', e.message);
    }
    
    console.log('\n=== ✓ TEST COMPLETADO ===');
    return true;
    
  } catch (error) {
    console.error('✗ Error general en test:', error.message);
    return false;
  }
}

/**
 * Prueba la creación de la hoja de Sugerencias
 * Ejecutar después de testSpreadsheetAccess()
 */
function testCreateSugerenciasSheet() {
  console.log('=== TEST DE CREACIÓN DE HOJA SUGERENCIAS ===');
  
  try {
    console.log('1. Intentando obtener/crear hoja de sugerencias...');
    var sheet = getOrCreateSugerenciasSheet();
    
    if (sheet) {
      console.log('✓ Hoja obtenida/creada exitosamente');
      console.log('✓ Nombre: ' + sheet.getName());
      console.log('✓ Número de filas: ' + sheet.getLastRow());
      console.log('✓ Número de columnas: ' + sheet.getLastColumn());
      
      // Verificar encabezados
      if (sheet.getLastRow() >= 1) {
        var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        console.log('✓ Encabezados:');
        headers.forEach(function(header, index) {
          console.log('  Columna ' + (index + 1) + ': ' + header);
        });
      }
      
      console.log('\n=== ✓ TEST COMPLETADO ===');
      return true;
    } else {
      console.error('✗ No se pudo obtener la hoja');
      return false;
    }
    
  } catch (error) {
    console.error('✗ Error en test:', error.message);
    console.log('Stack:', error.stack);
    return false;
  }
}

/**
 * Prueba completa del sistema de sugerencias
 * Ejecutar para validar todo el flujo
 */
function testSugerenciasComplete() {
  console.log('=== TEST COMPLETO DEL SISTEMA DE SUGERENCIAS ===\n');
  
  // Test 1: Acceso al spreadsheet
  console.log('--- Test 1: Acceso al spreadsheet ---');
  if (!testSpreadsheetAccess()) {
    console.error('\n✗ FALLO en Test 1. Corrige este problema antes de continuar.');
    return;
  }
  
  console.log('\n--- Test 2: Creación de hoja ---');
  if (!testCreateSugerenciasSheet()) {
    console.error('\n✗ FALLO en Test 2.');
    return;
  }
  
  console.log('\n--- Test 3: Guardado de datos ---');
  try {
    var datosTest = {
      empresa: 'Empresa Test S.A.S',
      sector: 'Tecnología',
      ciudad: 'Bogotá',
      representante: 'Juan Test',
      emailEmpresa: 'test@empresa.com',
      telefonoEmpresa: '3001234567',
      nombre: 'Estudiante Test',
      correo: 'test@unal.edu.co',
      modalidad: 'Práctica'
    };
    
    console.log('Intentando guardar sugerencia de prueba...');
    var resultado = guardarSugerenciaEnSheet(datosTest);
    
    if (resultado.success) {
      console.log('✓ Sugerencia guardada exitosamente en fila: ' + resultado.row);
      console.log('\n=== ✓ TODOS LOS TESTS PASARON ===');
      console.log('El sistema está funcionando correctamente.');
      console.log('\nNOTA: Revisa la hoja "' + SHEET_SUGERENCIAS + '" y elimina la fila de prueba si es necesario.');
    } else {
      console.error('✗ Error al guardar sugerencia:', resultado.error);
    }
    
  } catch (error) {
    console.error('✗ Error en test de guardado:', error.message);
  }
}

/**
 * Diagnóstico completo del acceso al spreadsheet
 * EJECUTAR ESTA FUNCIÓN PRIMERO
 */
function diagnosticoCompleto() {
  console.log('='.repeat(60));
  console.log('DIAGNÓSTICO COMPLETO DE ACCESO');
  console.log('='.repeat(60));
  
  // 1. Verificar configuración
  console.log('\n1. CONFIGURACIÓN:');
  console.log('   SPREADSHEET_CONVENIOS_ID:', SPREADSHEET_CONVENIOS_ID);
  console.log('   SHEET_CONVENIOS:', SHEET_CONVENIOS);
  console.log('   SHEET_SUGERENCIAS:', SHEET_SUGERENCIAS);
  
  // 2. Intentar openById
  console.log('\n2. TEST openById:');
  try {
    var ss1 = SpreadsheetApp.openById(SPREADSHEET_CONVENIOS_ID);
    console.log('   ✓ Éxito');
    console.log('   Nombre:', ss1.getName());
    console.log('   ID:', ss1.getId());
    console.log('   URL:', ss1.getUrl());
  } catch (e) {
    console.log('   ✗ Error:', e.message);
    console.log('   Tipo:', e.name);
  }
  
  // 3. Intentar getActiveSpreadsheet
  console.log('\n3. TEST getActiveSpreadsheet:');
  try {
    var ss2 = SpreadsheetApp.getActiveSpreadsheet();
    if (ss2) {
      console.log('   ✓ Éxito');
      console.log('   Nombre:', ss2.getName());
      console.log('   ID:', ss2.getId());
      console.log('   URL:', ss2.getUrl());
    } else {
      console.log('   ✗ Retornó null (no hay spreadsheet activo)');
    }
  } catch (e) {
    console.log('   ✗ Error:', e.message);
  }
  
  // 4. Verificar contexto de ejecución
  console.log('\n4. CONTEXTO DE EJECUCIÓN:');
  console.log('   Usuario activo:', Session.getActiveUser().getEmail());
  console.log('   Zona horaria:', Session.getScriptTimeZone());
  
  // 5. Listar todos los spreadsheets accesibles (Drive API)
  console.log('\n5. PERMISOS DE DRIVE:');
  try {
    var files = DriveApp.getFilesByType(MimeType.GOOGLE_SHEETS);
    var count = 0;
    while (files.hasNext() && count < 5) {
      var file = files.next();
      console.log('   - ' + file.getName() + ' (' + file.getId() + ')');
      count++;
    }
    if (count === 0) {
      console.log('   ⚠ No se encontraron spreadsheets accesibles');
    }
  } catch (e) {
    console.log('   ✗ Error al listar Drive:', e.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('FIN DEL DIAGNÓSTICO');
  console.log('='.repeat(60));
}

/**
 * Configura los encabezados de la hoja de Sugerencias existente
 * Ejecutar si la hoja ya existe pero no tiene encabezados correctos
 */
function configurarHojaSugerencias() {
  console.log('=== CONFIGURANDO HOJA DE SUGERENCIAS ===');
  
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_SUGERENCIAS);
    
    if (!sheet) {
      console.error('✗ La hoja "' + SHEET_SUGERENCIAS + '" no existe. Créala primero.');
      return false;
    }
    
    // Limpiar contenido existente
    sheet.clear();
    
    // Configurar encabezados
    var headers = [
      'Fecha y Hora',
      'Empresa',
      'Sector',
      'Ciudad',
      'Representante',
      'Email Empresa',
      'Teléfono Empresa',
      'Nombre Estudiante',
      'Correo Estudiante',
      'Modalidad',
      'Estado'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Formato de encabezados
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4CAF50');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');
    
    // Congelar fila de encabezados
    sheet.setFrozenRows(1);
    
    // Ajustar anchos de columnas
    sheet.setColumnWidth(1, 150);  // Fecha y Hora
    sheet.setColumnWidth(2, 200);  // Empresa
    sheet.setColumnWidth(3, 120);  // Sector
    sheet.setColumnWidth(4, 120);  // Ciudad
    sheet.setColumnWidth(5, 180);  // Representante
    sheet.setColumnWidth(6, 200);  // Email Empresa
    sheet.setColumnWidth(7, 140);  // Teléfono Empresa
    sheet.setColumnWidth(8, 180);  // Nombre Estudiante
    sheet.setColumnWidth(9, 200);  // Correo Estudiante
    sheet.setColumnWidth(10, 100); // Modalidad
    sheet.setColumnWidth(11, 120); // Estado
    
    console.log('✓ Hoja "' + SHEET_SUGERENCIAS + '" configurada correctamente');
    console.log('✓ 11 columnas con encabezados');
    console.log('✓ Formato verde aplicado');
    
    return true;
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    return false;
  }
}
