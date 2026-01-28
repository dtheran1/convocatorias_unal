/**
 * SISTEMA DE CONVOCATORIAS - UNAL SEDE DE LA PAZ
 * Web App para visualizar convocatorias de prácticas y pasantías
 *
 * INSTRUCCIONES:
 * 1. Crea un nuevo proyecto en Google Apps Script (script.google.com)
 * 2. Copia este código en el archivo Code.gs
 * 3. Crea un archivo HTML llamado "Index" y pega el contenido de Index.html
 * 4. Cambia SPREADSHEET_ID por el ID de tu Google Sheet
 * 5. Implementa como Web App (Implementar > Nueva implementación > App web)
 */

// ========== CONFIGURACIÓN ==========
// Reemplaza con el ID de tu Google Sheet (está en la URL del sheet)
const SPREADSHEET_ID = '1iNF7VwBPS_Txxk7c14JSefGKFD_D-0eZPc6s8geBGkk';
const SHEET_NAME = 'Hoja1'; // Nombre de la pestaña en la parte inferior del Sheet

// Mapeo de columnas (ajustar según tu sheet, índice base 0)
const COLUMNAS = {
  ESTADO: 0,                   // Estado (Abierto/Cerrado)
  DEPENDENCIA_ENTIDAD: 1,      // Interna/Externa
  NOMBRE_VACANTE: 2,           // Título de la convocatoria
  EMAIL_CONTACTO: 3,           // Dirección de correo electrónico
  NOMBRE_DEPENDENCIA: 4,       // Nombre de la Dirección/Dependencia/Proyecto
  DEPENDENCIA_PROYECTO: 5,     // Dependencia/Proyecto donde se desarrollará
  EMAIL_DEPENDENCIA: 6,        // Correo electrónico
  TIPO_MODALIDAD: 7,           // Tipo de modalidad a vincular (Práctica/Pasantía)
  DESCRIPCION_PERFIL: 8,       // Descripción general del perfil
  CANTIDAD_ESTUDIANTES: 9,     // Cantidad de estudiantes requeridos
  MODALIDAD_TRABAJO: 10,       // Modalidad (Presencial/Híbrida)
  SELECCIONADO: 11,            // Seleccionado
  PROGRAMAS_ACADEMICOS: 12,    // Programas académicos
  COMPETENCIAS_ESPECIFICAS: 13, // Competencias específicas
  COMPETENCIAS_ACTITUDES: 14,  // Competencias/habilidades o actitudes
  OFRECE_APOYO: 15,            // ¿Ofrece apoyo?
  TIPO_APOYO: 16,              // Tipo de apoyo
  OBSERVACIONES: 17            // Observaciones
};

/**
 * Sirve la página HTML principal
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Convocatorias - UNAL Sede de La Paz')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Obtiene todas las convocatorias del Sheet
 * @returns {Object} Objeto con datos y estadísticas
 */
function getConvocatorias() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error('No se encontró la hoja: ' + SHEET_NAME);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1); // Saltar encabezados

    const convocatorias = [];
    let totalCupos = 0;

    rows.forEach((row, index) => {
      // Saltar filas vacías
      if (!row[COLUMNAS.NOMBRE_VACANTE] || row[COLUMNAS.NOMBRE_VACANTE].toString().trim() === '') {
        return;
      }

      // Determinar estado (si no existe la columna, asumir "Abierto")
      let estado = 'Abierto';
      if (row[COLUMNAS.ESTADO]) {
        estado = row[COLUMNAS.ESTADO].toString().trim();
      }

      // Solo incluir convocatorias abiertas
      const estadoLower = estado.toLowerCase();
      if (estadoLower !== 'abierto' && estadoLower !== 'abierta') {
        return;
      }

      const cupos = parseInt(row[COLUMNAS.CANTIDAD_ESTUDIANTES]) || 0;
      totalCupos += cupos;

      convocatorias.push({
        id: index + 1,
        titulo: row[COLUMNAS.NOMBRE_VACANTE] || '',
        dependenciaEntidad: row[COLUMNAS.DEPENDENCIA_ENTIDAD] || '',
        nombreDependencia: row[COLUMNAS.NOMBRE_DEPENDENCIA] || '',
        emailContacto: row[COLUMNAS.EMAIL_CONTACTO] || row[COLUMNAS.EMAIL_DEPENDENCIA] || '',
        tipoModalidad: row[COLUMNAS.TIPO_MODALIDAD] || '',
        descripcion: row[COLUMNAS.DESCRIPCION_PERFIL] || '',
        dependenciaProyecto: row[COLUMNAS.DEPENDENCIA_PROYECTO] || '',
        cupos: cupos,
        modalidadTrabajo: row[COLUMNAS.MODALIDAD_TRABAJO] || '',
        programasAcademicos: row[COLUMNAS.PROGRAMAS_ACADEMICOS] || '',
        competenciasEspecificas: row[COLUMNAS.COMPETENCIAS_ESPECIFICAS] || '',
        competenciasActitudes: row[COLUMNAS.COMPETENCIAS_ACTITUDES] || '',
        ofreceApoyo: row[COLUMNAS.OFRECE_APOYO] || 'NO',
        tipoApoyo: row[COLUMNAS.TIPO_APOYO] || '',
        observaciones: row[COLUMNAS.OBSERVACIONES] || '',
        estado: estado
      });
    });

    return {
      success: true,
      data: convocatorias,
      stats: {
        total: convocatorias.length,
        totalCupos: totalCupos,
        activas: convocatorias.filter(c => c.estado.toLowerCase() === 'abierto' || c.estado.toLowerCase() === 'abierta').length,
        practicas: convocatorias.filter(c => c.tipoModalidad.toLowerCase().includes('práctica')).length,
        pasantias: convocatorias.filter(c => c.tipoModalidad.toLowerCase().includes('pasantía')).length
      }
    };

  } catch (error) {
    console.error('Error al obtener convocatorias:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      stats: { total: 0, totalCupos: 0, activas: 0, practicas: 0, pasantias: 0 }
    };
  }
}

/**
 * Obtiene los programas académicos únicos para los filtros
 * @returns {Array} Lista de programas académicos
 */
function getProgramasAcademicos() {
  try {
    const resultado = getConvocatorias();
    if (!resultado.success) return [];

    const programas = new Set();
    resultado.data.forEach(conv => {
      if (conv.programasAcademicos) {
        // Separar por comas o saltos de línea
        const progs = conv.programasAcademicos.split(/[,\n]/).map(p => p.trim()).filter(p => p);
        progs.forEach(p => programas.add(p));
      }
    });

    return Array.from(programas).sort();
  } catch (error) {
    console.error('Error al obtener programas:', error);
    return [];
  }
}

// ========== POSTULACIONES ==========
const SPREADSHEET_POSTULACIONES_ID = '1TPD-_1DjYE7hX7GLDQSuOpRiGsNT-GTjzeij-eG4Qts';
const SHEET_POSTULACIONES = 'Postulaciones_2026_1';

// Mapeo de columnas del Sheet de Postulaciones (según nuevo orden)
const COL_POST = {
  FECHA: 0,              // A: Fecha
  ESTADO: 1,             // B: Estado (Pendiente, Seleccionado, No seleccionado)
  ID_CONVOCATORIA: 2,    // C: ID Convocatoria
  TITULO: 3,             // D: Título Convocatoria
  PRIMER_NOMBRE: 4,      // E: Primer Nombre
  SEGUNDO_NOMBRE: 5,     // F: Segundo Nombre
  PRIMER_APELLIDO: 6,    // G: Primer Apellido
  SEGUNDO_APELLIDO: 7,   // H: Segundo Apellido
  TIPO_DOCUMENTO: 8,     // I: Tipo Documento
  NUMERO_DOCUMENTO: 9,   // J: Número Documento
  TELEFONO: 10,          // K: Teléfono
  PROGRAMA: 11,          // L: Programa
  EMAIL: 12,             // M: Email
  PAPA: 13,              // N: PAPA
  PBM: 14,               // O: PBM
  MODALIDAD: 15,         // P: Modalidad (heredado de la convocatoria)
  OBSERVACIONES: 16      // Q: Observaciones
};

/**
 * Guarda una postulación en el Sheet
 * @param {Object} datos - Datos del formulario de postulación
 * @returns {Object} Resultado de la operación
 */
function guardarPostulacion(datos) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_POSTULACIONES_ID);
    let sheet = ss.getSheetByName(SHEET_POSTULACIONES);
    
    // Verificar que existe la hoja
    if (!sheet) {
      throw new Error('No se encontró la hoja: ' + SHEET_POSTULACIONES);
    }
    
    const numeroDocumento = datos.numeroDocumento || '';
    const idConvocatoria = datos.idConvocatoria || '';
    
    // Validar estado del estudiante
    const validacion = validarEstadoEstudiante(numeroDocumento, idConvocatoria);
    
    if (!validacion.puedePostularse) {
      return {
        success: false,
        error: validacion.mensaje,
        tipo: validacion.tipo,
        datos: validacion.datos || null
      };
    }
    
    // Preparar fila de datos (según nuevo orden de columnas)
    const fila = [
      new Date(),                              // A: Fecha
      'Pendiente',                             // B: Estado inicial
      datos.idConvocatoria || '',              // C: ID Convocatoria
      datos.tituloConvocatoria || '',          // D: Título Convocatoria
      datos.primerNombre || '',                // E: Primer Nombre
      datos.segundoNombre || '',               // F: Segundo Nombre
      datos.primerApellido || '',              // G: Primer Apellido
      datos.segundoApellido || '',             // H: Segundo Apellido
      datos.tipoDocumento || 'CC',             // I: Tipo Documento (CC por defecto)
      datos.numeroDocumento || '',             // J: Número Documento
      datos.telefono || '',                    // K: Teléfono
      datos.programaEstudiante || '',          // L: Programa
      datos.correoElectronico || '',           // M: Email
      datos.papa || '',                        // N: PAPA
      datos.pbm || '',                         // O: PBM
      datos.modalidad || '',                   // P: Modalidad (heredado de convocatoria)
      ''                                       // Q: Observaciones (vacío)
    ];
    
    // Insertar fila
    sheet.appendRow(fila);
    
    // Aplicar validación de datos (dropdown) a la celda de Estado
    const ultimaFila = sheet.getLastRow();
    const celdaEstado = sheet.getRange(ultimaFila, COL_POST.ESTADO + 1); // +1 porque getRange es 1-based
    const reglaEstado = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Pendiente', 'Seleccionado', 'No seleccionado'], true)
      .setAllowInvalid(false)
      .build();
    celdaEstado.setDataValidation(reglaEstado);
    
    // Enviar correo de confirmación al estudiante
    enviarCorreoConfirmacionPostulacion(datos);
    
    return {
      success: true,
      message: '¡Postulación enviada correctamente!'
    };
    
  } catch (error) {
    console.error('Error al guardar postulación:', error);
    return {
      success: false,
      error: 'Error al enviar la postulación: ' + error.message
    };
  }
}

/**
 * Valida el estado del estudiante para determinar si puede postularse
 * @param {string} numeroDocumento - Número de documento del estudiante
 * @param {string} idConvocatoria - ID de la convocatoria a la que quiere postularse
 * @returns {Object} Resultado de la validación
 */
function validarEstadoEstudiante(numeroDocumento, idConvocatoria) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_POSTULACIONES_ID);
    const sheet = ss.getSheetByName(SHEET_POSTULACIONES);
    
    if (!sheet) {
      return { puedePostularse: true };
    }
    
    const data = sheet.getDataRange().getValues();
    
    let postulacionesPendientes = 0;
    let estaSeleccionado = null;
    let yaPostuladoAEsta = false;
    let postulacionNoSeleccionada = null;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const docRow = row[COL_POST.NUMERO_DOCUMENTO];
      
      if (docRow == numeroDocumento) {
        const estado = (row[COL_POST.ESTADO] || '').toString().toLowerCase().trim();
        const idConv = row[COL_POST.ID_CONVOCATORIA];
        
        // Verificar si ya se postuló a esta convocatoria
        if (idConv == idConvocatoria) {
          yaPostuladoAEsta = true;
        }
        
        // Verificar estados
        if (estado === 'seleccionado') {
          estaSeleccionado = {
            titulo: row[COL_POST.TITULO] || '',
            programa: row[COL_POST.PROGRAMA] || '',
            fecha: row[COL_POST.FECHA] || ''
          };
        } else if (estado === 'pendiente') {
          postulacionesPendientes++;
        } else if (estado === 'no seleccionado' && idConv == idConvocatoria) {
          postulacionNoSeleccionada = {
            titulo: row[COL_POST.TITULO] || '',
            observaciones: row[COL_POST.OBSERVACIONES] || 'Sin observaciones registradas.'
          };
        }
      }
    }
    
    // Prioridad 1: Si ya está seleccionado en alguna convocatoria
    if (estaSeleccionado) {
      return {
        puedePostularse: false,
        tipo: 'ESTUDIANTE_SELECCIONADO',
        mensaje: '¡Felicidades! Ya has sido seleccionado para una convocatoria.',
        datos: estaSeleccionado
      };
    }
    
    // Prioridad 2: Si ya se postuló a esta convocatoria específica
    if (yaPostuladoAEsta) {
      // Si fue no seleccionado, mostrar el motivo
      if (postulacionNoSeleccionada) {
        return {
          puedePostularse: false,
          tipo: 'POSTULACION_NO_SELECCIONADA',
          mensaje: 'Tu postulación anterior a esta convocatoria no fue seleccionada.',
          datos: postulacionNoSeleccionada
        };
      }
      return {
        puedePostularse: false,
        tipo: 'POSTULACION_DUPLICADA',
        mensaje: 'Ya te has postulado a esta convocatoria anteriormente.'
      };
    }
    
    // Prioridad 3: Si ya tiene 2 postulaciones pendientes
    if (postulacionesPendientes >= 2) {
      return {
        puedePostularse: false,
        tipo: 'LIMITE_POSTULACIONES',
        mensaje: 'Ya tienes 2 postulaciones en estado pendiente. No puedes postularte a más vacantes hasta que sean resueltas.'
      };
    }
    
    // Puede postularse
    return { puedePostularse: true };
    
  } catch (error) {
    console.error('Error al validar estado del estudiante:', error);
    return { puedePostularse: true }; // En caso de error, permitir postulación
  }
}

// ========== CORREO DE CONFIRMACIÓN DE POSTULACIÓN ==========

const EMAIL_CONTACTO = 'practicas_paz@unal.edu.co';

/**
 * Envía un correo de confirmación al estudiante después de postularse
 * @param {Object} datos - Datos de la postulación
 */
function enviarCorreoConfirmacionPostulacion(datos) {
  try {
    console.log('=== INICIO ENVIO CORREO CONFIRMACION ===');
    
    const email = datos.correoElectronico;
    if (!email) {
      console.log('ERROR: No se encontró email para enviar confirmación');
      return;
    }
    
    console.log('Email destino:', email);
    
    const nombreCompleto = (datos.primerNombre + ' ' + (datos.segundoNombre || '') + ' ' + datos.primerApellido + ' ' + (datos.segundoApellido || '')).trim().replace(/\s+/g, ' ');
    console.log('Nombre completo:', nombreCompleto);
    
    const asunto = '✅ Postulación Recibida - ' + datos.tituloConvocatoria;
    console.log('Asunto:', asunto);
    
    const cuerpoHtml = generarCorreoConfirmacion(nombreCompleto, datos);
    
    MailApp.sendEmail({
      to: email,
      subject: asunto,
      htmlBody: cuerpoHtml,
      name: 'Prácticas UNAL Sede de La Paz'
    });
    
    console.log('✅ Correo de confirmación enviado exitosamente a: ' + email);
    
  } catch (error) {
    console.error('❌ ERROR al enviar correo de confirmación:', error.message);
    // No lanzar error para no afectar el registro de la postulación
  }
}

/**
 * Genera el HTML del correo de confirmación
 */
function generarCorreoConfirmacion(nombreCompleto, datos) {
  const fechaPostulacion = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #4CAF50, #388E3C); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0 0 10px 0; font-size: 24px; }
    .header p { margin: 0; opacity: 0.9; }
    .content { background: #ffffff; padding: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .info-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .info-card h3 { margin: 0 0 15px 0; color: #166534; font-size: 16px; }
    .info-row { display: flex; margin-bottom: 10px; }
    .info-label { font-weight: 600; color: #374151; min-width: 140px; }
    .info-value { color: #1f2937; }
    .status-badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; }
    .next-steps { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 20px 0; }
    .next-steps h4 { margin: 0 0 10px 0; color: #1e40af; }
    .next-steps ul { margin: 0; padding-left: 20px; color: #1e3a8a; }
    .next-steps li { margin-bottom: 8px; }
    .footer { background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 5px 0; color: #64748b; font-size: 13px; }
    .footer a { color: #4CAF50; text-decoration: none; }
    .icon { font-size: 48px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">📋</div>
      <h1>¡Postulación Recibida!</h1>
      <p>Tu postulación ha sido registrada exitosamente</p>
    </div>
    
    <div class="content">
      <p class="greeting">Hola <strong>${nombreCompleto}</strong>,</p>
      
      <p>Hemos recibido tu postulación para la siguiente convocatoria:</p>
      
      <div class="info-card">
        <h3>📌 Detalles de tu postulación</h3>
        <div class="info-row">
          <span class="info-label">Convocatoria:</span>
          <span class="info-value">${datos.tituloConvocatoria || 'No especificada'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Modalidad:</span>
          <span class="info-value">${datos.modalidad || 'No especificada'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tu programa:</span>
          <span class="info-value">${datos.programaEstudiante || 'No especificado'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha de registro:</span>
          <span class="info-value">${fechaPostulacion}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Estado actual:</span>
          <span class="status-badge">⏳ Pendiente de revisión</span>
        </div>
      </div>
      
      <div class="next-steps">
        <h4>📋 ¿Qué sigue ahora?</h4>
        <ul>
          <li>Tu postulación será revisada por el equipo encargado.</li>
          <li>Recibirás un correo cuando haya una actualización sobre tu estado.</li>
          <li>El proceso de selección puede tomar algunos días.</li>
          <li>Revisa tu correo frecuentemente (incluyendo la carpeta de spam).</li>
        </ul>
      </div>
      
      <p>Si tienes alguna pregunta sobre tu postulación, no dudes en contactarnos.</p>
      
      <p>¡Gracias por tu interés en las oportunidades de prácticas y pasantías!</p>
      
      <p style="margin-top: 30px;">Saludos cordiales,<br>
      <strong>Equipo de Prácticas y Pasantías</strong><br>
      Universidad Nacional de Colombia - Sede de La Paz</p>
    </div>
    
    <div class="footer">
      <p><strong>Universidad Nacional de Colombia - Sede de La Paz</strong></p>
      <p>📧 <a href="mailto:${EMAIL_CONTACTO}">${EMAIL_CONTACTO}</a></p>
      <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">
        Este es un correo automático de confirmación. Por favor no respondas directamente a este mensaje.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
