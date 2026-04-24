/**
 * SISTEMA DE CONVENIOS P&P - UNAL SEDE DE LA PAZ
 * Proyecto Apps Script VINCULADO (Bound) al spreadsheet
 * 
 * Este proyecto está vinculado directamente al spreadsheet,
 * por lo que usa getActiveSpreadsheet() en lugar de openById()
 * Este es el sheet para listar los convenios https://docs.google.com/spreadsheets/d/1WEpLg_AV8W6DEw9r5clS34eHWPN1IlOqGCWDUDyBMQs/edit?gid=0#gid=0
 */

// ========== CONFIGURACIÓN ==========

const SHEET_CONVENIOS = 'prácticas y pasantías';
const SHEET_SUGERENCIAS = 'Sugerencias';

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
 * Obtiene el spreadsheet vinculado
 */
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

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
 * Obtiene o crea la hoja de Sugerencias con encabezados
 * @returns {Sheet} La hoja de Sugerencias
 */
function getOrCreateSugerenciasSheet() {
  try {
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
      
      // Formatear columna de teléfono como texto plano (toda la columna)
      var telefonoColumn = sheet.getRange(2, COL_SUG.TELEFONO_EMPRESA + 1, sheet.getMaxRows() - 1, 1);
      telefonoColumn.setNumberFormat('@STRING@');
      
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
 * Extrae la URL de un enlace de una celda usando tres estrategias en cascada
 */
function getEnlaceUrl(richTextCell, formulaValue) {
  if (richTextCell && typeof richTextCell.getHyperlink === 'function') {
    var hyperlink = richTextCell.getHyperlink();
    if (hyperlink) return hyperlink;
  }

  var formula = (formulaValue || '').toString().trim();
  var match = formula.match(/=HYPERLINK\(\s*"([^"]+)"/i);
  if (match) return match[1];

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

    var richText;
    try { richText = range.getRichTextValues(); } catch(e) { richText = null; }

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
      if (!institucion) return;

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
 */
function guardarSugerenciaEnSheet(datos) {
  try {
    console.log('Iniciando guardarSugerenciaEnSheet...');
    
    var sheet = getOrCreateSugerenciasSheet();
    
    // Obtener la próxima fila disponible
    var lastRow = sheet.getLastRow();
    var newRow = lastRow + 1;
    
    // IMPORTANTE: Formatear la celda de teléfono ANTES de insertar datos
    var telefonoCell = sheet.getRange(newRow, COL_SUG.TELEFONO_EMPRESA + 1);
    telefonoCell.setNumberFormat('@STRING@');
    
    // Sanitizar teléfono: si empieza con +, =, - o (, prefijarlo con comilla simple
    var telefonoSanitizado = datos.telefonoEmpresa || '';
    if (telefonoSanitizado && /^[\+\=\-\(]/.test(telefonoSanitizado)) {
      telefonoSanitizado = "'" + telefonoSanitizado;
    }
    
    // Preparar datos para insertar
    var fecha = new Date();
    var row = [
      fecha,
      datos.empresa || '',
      datos.sector || '',
      datos.ciudad || '',
      datos.representante || '',
      datos.emailEmpresa || '',
      telefonoSanitizado,
      datos.nombre || '',
      datos.correo || '',
      datos.modalidad || '',
      'Pendiente'
    ];
    
    // Insertar datos usando setValues para tener más control
    sheet.getRange(newRow, 1, 1, row.length).setValues([row]);
    
    // Formatear celdas adicionales
    try {
      var fechaCell = sheet.getRange(newRow, COL_SUG.FECHA_HORA + 1);
      fechaCell.setNumberFormat('dd/mm/yyyy hh:mm:ss');
      
      var estadoCell = sheet.getRange(newRow, COL_SUG.ESTADO + 1);
      estadoCell.setBackground('#FEF3C7');
      estadoCell.setFontColor('#B45309');
      estadoCell.setFontWeight('bold');
      estadoCell.setHorizontalAlignment('center');
    } catch (e) {
      console.warn('Error al formatear celdas:', e);
    }
    
    lastRow = newRow;
    
    console.log('Sugerencia guardada en fila: ' + lastRow);
    return { success: true, row: lastRow };
    
  } catch (error) {
    console.error('Error en guardarSugerenciaEnSheet:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Recibe una sugerencia de empresa, la guarda en el sheet y la envía por correo
 */
function enviarSugerencia(datos) {
  try {
    // Validación server-side
    var campos = ['empresa', 'representante', 'emailEmpresa', 'telefonoEmpresa', 'nombre', 'correo', 'modalidad'];
    for (var i = 0; i < campos.length; i++) {
      if (!datos[campos[i]] || !datos[campos[i]].toString().trim()) {
        return { success: false, error: 'Falta el campo: ' + campos[i] };
      }
    }

    if (!datos.correo.toLowerCase().endsWith('@unal.edu.co')) {
      return { success: false, error: 'El correo debe ser @unal.edu.co.' };
    }

    // PASO 1: Guardar en el spreadsheet
    var resultadoSheet = guardarSugerenciaEnSheet(datos);
    if (!resultadoSheet.success) {
      console.error('Error al guardar en sheet:', resultadoSheet.error);
    }

    // PASO 2: Enviar email
    var asunto = '[Sugerencia de empresa] – ' + datos.empresa + ' – ' + datos.nombre;

    var cuerpo =
      '<table style="font-family:sans-serif;font-size:14px;width:100%;max-width:560px;border-collapse:collapse;margin:0 auto;">' +
        '<tr><td style="padding:20px 0;border-bottom:2px solid #4CAF50;">' +
          '<strong style="font-size:18px;">Sugerencia de empresa</strong><br>' +
          '<span style="color:#64748b;font-size:13px;">Enviada desde la sección de Convenios – UNAL Sede de La Paz</span>' +
        '</td></tr>' +
        '<tr><td style="padding:16px 0 4px;"><strong style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Datos de la empresa</strong></td></tr>' +
        '<tr><td style="padding:4px 0;"><strong>Nombre:</strong> ' + escapeHtmlGs(datos.empresa) + '</td></tr>' +
        (datos.sector ? '<tr><td style="padding:4px 0;"><strong>Sector / Rubro:</strong> ' + escapeHtmlGs(datos.sector) + '</td></tr>' : '') +
        (datos.ciudad ? '<tr><td style="padding:4px 0;"><strong>Ciudad:</strong> ' + escapeHtmlGs(datos.ciudad) + '</td></tr>' : '') +
        '<tr><td style="padding:16px 0 4px;"><strong style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Contacto de la empresa</strong></td></tr>' +
        '<tr><td style="padding:4px 0;"><strong>Representante:</strong> ' + escapeHtmlGs(datos.representante) + '</td></tr>' +
        '<tr><td style="padding:4px 0;"><strong>Correo:</strong> ' + escapeHtmlGs(datos.emailEmpresa) + '</td></tr>' +
        '<tr><td style="padding:4px 0;"><strong>Teléfono:</strong> ' + escapeHtmlGs(datos.telefonoEmpresa) + '</td></tr>' +
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

// ========== FUNCIONES DE CONFIGURACIÓN Y TEST ==========

/**
 * Configura los encabezados de la hoja de Sugerencias
 * EJECUTAR ESTA FUNCIÓN PRIMERO
 */
function configurarHojaSugerencias() {
  console.log('=== CONFIGURANDO HOJA DE SUGERENCIAS ===');
  
  try {
    var sheet = getOrCreateSugerenciasSheet();
    console.log('✓ Hoja "' + SHEET_SUGERENCIAS + '" configurada correctamente');
    console.log('✓ 11 columnas con encabezados');
    console.log('✓ Formato verde aplicado');
    return true;
  } catch (error) {
    console.error('✗ Error:', error.message);
    return false;
  }
}

/**
 * Test completo del sistema de sugerencias
 */
function testSugerenciasComplete() {
  console.log('=== TEST COMPLETO DEL SISTEMA ===\n');
  
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
    
    console.log('Guardando sugerencia de prueba...');
    var resultado = guardarSugerenciaEnSheet(datosTest);
    
    if (resultado.success) {
      console.log('✓ Sugerencia guardada en fila: ' + resultado.row);
      console.log('\n=== ✓ TEST EXITOSO ===');
      console.log('Revisa la hoja "' + SHEET_SUGERENCIAS + '" y elimina la fila de prueba.');
    } else {
      console.error('✗ Error:', resultado.error);
    }
    
  } catch (error) {
    console.error('✗ Error en test:', error.message);
  }
}

/**
 * Reconfigura la hoja de Sugerencias existente
 * EJECUTAR si la hoja ya existe pero no tiene los encabezados correctos
 */
function reconfigurarHojaSugerencias() {
  console.log('=== RECONFIGURANDO HOJA DE SUGERENCIAS ===');
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_SUGERENCIAS);
    
    if (!sheet) {
      console.error('✗ La hoja "' + SHEET_SUGERENCIAS + '" no existe');
      return false;
    }
    
    // LIMPIAR TODO EL CONTENIDO
    sheet.clear();
    console.log('✓ Contenido anterior eliminado');
    
    // CONFIGURAR ENCABEZADOS
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
    console.log('✓ Encabezados insertados');
    
    // FORMATO DE ENCABEZADOS
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4CAF50');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');
    headerRange.setFontSize(11);
    console.log('✓ Formato de encabezados aplicado');
    
    // CONGELAR FILA DE ENCABEZADOS
    sheet.setFrozenRows(1);
    console.log('✓ Primera fila congelada');
    
    // AJUSTAR ANCHOS DE COLUMNAS
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
    console.log('✓ Anchos de columna configurados');
    
    // FORMATEAR COLUMNA DE TELÉFONO COMO TEXTO
    var telefonoColumn = sheet.getRange(2, COL_SUG.TELEFONO_EMPRESA + 1, sheet.getMaxRows() - 1, 1);
    telefonoColumn.setNumberFormat('@STRING@');
    console.log('✓ Columna de teléfono formateada como texto');
    
    console.log('\n=== ✓ HOJA RECONFIGURADA CORRECTAMENTE ===');
    console.log('Ve a la pestaña "' + SHEET_SUGERENCIAS + '" para verificar');
    
    return true;
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    return false;
  }
}

/**
 * Repara la columna de teléfono en una hoja existente (sin borrar datos)
 * EJECUTAR ESTA FUNCIÓN si ya tienes datos y aparecen errores #ERROR!
 */
function repararColumnaTelefono() {
  console.log('=== REPARANDO COLUMNA DE TELÉFONO ===');
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_SUGERENCIAS);
    
    if (!sheet) {
      console.error('✗ La hoja "' + SHEET_SUGERENCIAS + '" no existe.');
      return false;
    }
    
    var lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      console.log('ℹ La hoja no tiene datos (solo encabezados)');
      return true;
    }
    
    console.log('Procesando ' + (lastRow - 1) + ' filas...');
    
    // Primero: Formatear toda la columna como texto
    var telefonoColumn = sheet.getRange('G:G');
    telefonoColumn.setNumberFormat('@STRING@');
    console.log('✓ Formato de columna configurado como texto');
    
    // Segundo: Reescribir los valores que tienen #ERROR!
    var telefonoRange = sheet.getRange(2, COL_SUG.TELEFONO_EMPRESA + 1, lastRow - 1, 1);
    var values = telefonoRange.getDisplayValues(); // Obtener valores como se muestran
    var formulas = telefonoRange.getFormulas(); // Obtener fórmulas
    var newValues = [];
    var erroresReparados = 0;
    
    for (var i = 0; i < values.length; i++) {
      var currentValue = values[i][0];
      var formula = formulas[i][0];
      
      // Si la celda muestra #ERROR! o tiene una fórmula, intentar extraer el valor real
      if (currentValue === '#ERROR!' || formula !== '') {
        // Buscar el valor en la fórmula (si existe)
        var valorExtraido = '';
        
        // Intentar extraer de diferentes formatos de fórmula
        if (formula && formula.indexOf('+') !== -1) {
          // Ej: =+57 (601) 4104799 → extraer "+57 (601) 4104799"
          valorExtraido = formula.replace(/^=/, '').trim();
        } else if (formula && formula.indexOf('(') !== -1) {
          // Ej: =(601) 4104799 → extraer "(601) 4104799"
          valorExtraido = formula.replace(/^=/, '').trim();
        }
        
        newValues.push([valorExtraido]);
        erroresReparados++;
        console.log('Fila ' + (i + 2) + ': #ERROR! → "' + valorExtraido + '"');
      } else {
        // Mantener el valor actual si no hay error
        newValues.push([currentValue]);
      }
    }
    
    // Escribir los valores limpios de vuelta
    telefonoRange.setValues(newValues);
    
    console.log('\n✓ Columna de teléfono procesada');
    console.log('✓ Errores reparados: ' + erroresReparados);
    console.log('✓ Refresca la hoja en el navegador para ver los cambios');
    console.log('\n=== ✓ REPARACIÓN COMPLETADA ===');
    
    return true;
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

/**
 * Limpia TODAS las celdas con #ERROR! en la columna de teléfono
 * Las deja vacías para que se puedan volver a llenar manualmente
 */
function limpiarErroresTelefono() {
  console.log('=== LIMPIANDO ERRORES EN COLUMNA DE TELÉFONO ===');
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_SUGERENCIAS);
    
    if (!sheet) {
      console.error('✗ La hoja "' + SHEET_SUGERENCIAS + '" no existe.');
      return false;
    }
    
    var lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      console.log('ℹ La hoja no tiene datos (solo encabezados)');
      return true;
    }
    
    // Formatear columna como texto primero
    var telefonoColumn = sheet.getRange('G:G');
    telefonoColumn.setNumberFormat('@STRING@');
    
    // Leer todos los valores
    var telefonoRange = sheet.getRange(2, COL_SUG.TELEFONO_EMPRESA + 1, lastRow - 1, 1);
    var values = telefonoRange.getDisplayValues();
    var erroresLimpiados = 0;
    
    // Limpiar celdas con error
    for (var i = 0; i < values.length; i++) {
      if (values[i][0] === '#ERROR!') {
        sheet.getRange(i + 2, COL_SUG.TELEFONO_EMPRESA + 1).setValue('');
        erroresLimpiados++;
        console.log('Fila ' + (i + 2) + ': #ERROR! → (vacío)');
      }
    }
    
    console.log('\n✓ Errores limpiados: ' + erroresLimpiados);
    console.log('✓ Las celdas están ahora vacías y listas para rellenar');
    console.log('\n=== ✓ LIMPIEZA COMPLETADA ===');
    
    return true;
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    return false;
  }
}
