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
        mensaje: 'Felicitaciones. Ya ha sido seleccionado para una vacante.',
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
          mensaje: 'Su postulación anterior a esta vacante no fue seleccionada.',
          datos: postulacionNoSeleccionada
        };
      }
      return {
        puedePostularse: false,
        tipo: 'POSTULACION_DUPLICADA',
        mensaje: 'Ya se ha postulado a esta vacante anteriormente.'
      };
    }

    // Prioridad 3: Si ya tiene 2 postulaciones pendientes
    if (postulacionesPendientes >= 2) {
      return {
        puedePostularse: false,
        tipo: 'LIMITE_POSTULACIONES',
        mensaje: 'Ya tiene 2 postulaciones en estado pendiente. No puede postularse a más vacantes hasta que sean resueltas.'
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
      <h1>Confirmación de solicitud</h1>
      <p>Su solicitud ha sido registrada exitosamente.</p>
    </div>
    
    <div class="content">
      <p class="greeting">Estimado(a) <strong>${nombreCompleto}</strong>,</p>
      <p>Hemos recibido su solicitud para la siguiente vacante:</p>
      
      <div class="info-card">
        <h3>📌 Detalles de la solicitud</h3>
        <div class="info-row">
          <span class="info-label">Vacante:</span>
          <span class="info-value">${datos.tituloConvocatoria || 'No especificada'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Modalidad:</span>
          <span class="info-value">${datos.modalidad || 'No especificada'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Programa académico:</span>
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
        <h4>📋 Próximos pasos</h4>
        <ul>
          <li>Su solicitud será revisada por el equipo encargado.</li>
          <li>Recibirá una notificación por correo electrónico cuando haya una actualización sobre su estado.</li>
          <li>El proceso de selección puede tomar algunos días.</li>
          <li>Por favor, revise su correo frecuentemente (incluyendo la carpeta de spam).</li>
        </ul>
      </div>
      <p>Si tiene alguna pregunta sobre su solicitud, no dude en contactarnos.</p>
      <p>Agradecemos su interés en las oportunidades de prácticas y pasantías ofrecidas por la Universidad Nacional de Colombia - Sede de La Paz.</p>
      <p style="margin-top: 30px;">Atentamente,<br>
      <strong>Oficina de Prácticas y Pasantías</strong><br>
      Universidad Nacional de Colombia - Sede de La Paz</p>
    </div>
    
    <div class="footer">
      <p><strong>Universidad Nacional de Colombia - Sede de La Paz</strong></p>
      <p>📧 <a href="mailto:${EMAIL_CONTACTO}">${EMAIL_CONTACTO}</a></p>
      <p style="margin-top: 15px; font-size: 12px; color: #94a3b8;">
        Este es un correo automático de confirmación. Por favor no responda directamente a este mensaje.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// ========== TRIGGER: NOTIFICACIÓN DE CAMBIO DE ESTADO ==========

/**
 * EJECUTAR ESTA FUNCIÓN UNA SOLA VEZ para instalar el trigger
 * Después de ejecutarla, el trigger quedará configurado automáticamente
 */
function instalarTriggerPostulaciones() {
  // Eliminar triggers existentes de esta función para evitar duplicados
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onEditPostulaciones') {
      ScriptApp.deleteTrigger(trigger);
      console.log('Trigger anterior eliminado');
    }
  });
  
  // Crear nuevo trigger vinculado al spreadsheet de postulaciones
  ScriptApp.newTrigger('onEditPostulaciones')
    .forSpreadsheet(SPREADSHEET_POSTULACIONES_ID)
    .onEdit()
    .create();
  
  console.log('✅ Trigger instalado correctamente para el sheet de Postulaciones');
  console.log('El trigger se ejecutará automáticamente cuando edites la columna Estado');
}

/**
 * Trigger que se ejecuta cuando se edita el sheet de postulaciones
 * Detecta cambios en la columna Estado y envía notificaciones
 */
function onEditPostulaciones(e) {
  try {
    // Verificar que el evento existe
    if (!e || !e.range) {
      console.log('Evento no válido');
      return;
    }
    
    const sheet = e.range.getSheet();
    const sheetName = sheet.getName();
    
    // Verificar que es la hoja correcta
    if (sheetName !== SHEET_POSTULACIONES) {
      return;
    }
    
    const columnaEditada = e.range.getColumn();
    const filaEditada = e.range.getRow();
    
    // Verificar que se editó la columna Estado (columna B = 2)
    if (columnaEditada !== COL_POST.ESTADO + 1) {
      return;
    }
    
    // Ignorar ediciones en la fila de encabezados
    if (filaEditada === 1) {
      return;
    }
    
    const nuevoEstado = e.value ? e.value.toString().toLowerCase().trim() : '';
    const estadoAnterior = e.oldValue ? e.oldValue.toString().toLowerCase().trim() : '';
    
    console.log(`Cambio de estado detectado en fila ${filaEditada}: "${estadoAnterior}" → "${nuevoEstado}"`);
    
    // Solo procesar si el estado cambió a "seleccionado" o "no seleccionado"
    if (nuevoEstado !== 'seleccionado' && nuevoEstado !== 'no seleccionado') {
      return;
    }
    
    // Obtener datos de la fila
    const fila = sheet.getRange(filaEditada, 1, 1, 17).getValues()[0];
    
    const datosEstudiante = {
      email: fila[COL_POST.EMAIL],
      primerNombre: fila[COL_POST.PRIMER_NOMBRE],
      segundoNombre: fila[COL_POST.SEGUNDO_NOMBRE],
      primerApellido: fila[COL_POST.PRIMER_APELLIDO],
      segundoApellido: fila[COL_POST.SEGUNDO_APELLIDO],
      titulo: fila[COL_POST.TITULO],
      modalidad: fila[COL_POST.MODALIDAD],
      programa: fila[COL_POST.PROGRAMA],
      observaciones: fila[COL_POST.OBSERVACIONES] || ''
    };
    
    // Verificar que hay email
    if (!datosEstudiante.email) {
      console.log('No se encontró email del estudiante');
      return;
    }
    
    // Enviar notificación según el nuevo estado
    if (nuevoEstado === 'seleccionado') {
      enviarNotificacionSeleccionado(datosEstudiante);
    } else if (nuevoEstado === 'no seleccionado') {
      enviarNotificacionNoSeleccionado(datosEstudiante);
    }
    
  } catch (error) {
    console.error('Error en onEditPostulaciones:', error);
  }
}

/**
 * Envía notificación cuando el estudiante es SELECCIONADO
 */
function enviarNotificacionSeleccionado(datos) {
  try {
    const nombreCompleto = construirNombreCompleto(datos);
    
    const asunto = '🎉 Felicitaciones - Ha sido seleccionado - ' + datos.titulo;
    
    const cuerpoHtml = generarCorreoSeleccionado(nombreCompleto, datos);
    
    MailApp.sendEmail({
      to: datos.email,
      subject: asunto,
      htmlBody: cuerpoHtml,
      name: 'Prácticas UNAL Sede de La Paz'
    });
    
    console.log('✅ Notificación de SELECCIÓN enviada a: ' + datos.email);
    
  } catch (error) {
    console.error('Error al enviar notificación de selección:', error);
  }
}

/**
 * Envía notificación cuando el estudiante NO es seleccionado
 */
function enviarNotificacionNoSeleccionado(datos) {
  try {
    const nombreCompleto = construirNombreCompleto(datos);
    
    const asunto = 'Resultado de su postulación - ' + datos.titulo;
    
    const cuerpoHtml = generarCorreoNoSeleccionado(nombreCompleto, datos);
    
    MailApp.sendEmail({
      to: datos.email,
      subject: asunto,
      htmlBody: cuerpoHtml,
      name: 'Prácticas UNAL Sede de La Paz'
    });
    
    console.log('✅ Notificación de NO SELECCIÓN enviada a: ' + datos.email);
    
  } catch (error) {
    console.error('Error al enviar notificación de no selección:', error);
  }
}

/**
 * Construye el nombre completo del estudiante
 */
function construirNombreCompleto(datos) {
  return (
    (datos.primerNombre || '') + ' ' + 
    (datos.segundoNombre || '') + ' ' + 
    (datos.primerApellido || '') + ' ' + 
    (datos.segundoApellido || '')
  ).trim().replace(/\s+/g, ' ');
}

/**
 * Genera el HTML del correo de SELECCIÓN
 */
function generarCorreoSeleccionado(nombreCompleto, datos) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0 0 10px 0; font-size: 28px; }
    .header p { margin: 0; opacity: 0.9; font-size: 16px; }
    .content { background: #ffffff; padding: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .success-card { background: linear-gradient(135deg, #d1fae5, #a7f3d0); border: 2px solid #10b981; border-radius: 16px; padding: 25px; margin: 25px 0; text-align: center; }
    .success-card h2 { margin: 0 0 10px 0; color: #065f46; font-size: 22px; }
    .success-card p { margin: 0; color: #047857; font-size: 16px; }
    .info-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .info-card h3 { margin: 0 0 15px 0; color: #166534; font-size: 16px; }
    .info-row { margin-bottom: 12px; }
    .info-label { font-weight: 600; color: #374151; display: block; margin-bottom: 4px; }
    .info-value { color: #1f2937; font-size: 15px; }
    .next-steps { background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
    .next-steps h4 { margin: 0 0 15px 0; color: #065f46; }
    .next-steps ul { margin: 0; padding-left: 20px; color: #047857; }
    .next-steps li { margin-bottom: 10px; }
    .footer { background: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 5px 0; color: #64748b; font-size: 13px; }
    .footer a { color: #059669; text-decoration: none; }
    .icon { font-size: 64px; margin-bottom: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">🎉</div>
      <h1>Felicitaciones</h1>
      <p>Ha sido seleccionado/a para una oportunidad</p>
    </div>

    <div class="content">
      <p class="greeting">Estimado(a) <strong>${nombreCompleto}</strong>,</p>

      <div class="success-card">
        <h2>🏆 Ha sido seleccionado/a</h2>
        <p>Su perfil ha sido elegido para esta vacante</p>
      </div>
      
      <div class="info-card">
        <h3>📌 Detalles de la vacante</h3>
        <div class="info-row">
          <span class="info-label">Vacante:</span>
          <span class="info-value">${datos.titulo || 'No especificada'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Modalidad:</span>
          <span class="info-value">${datos.modalidad || 'No especificada'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Su programa:</span>
          <span class="info-value">${datos.programa || 'No especificado'}</span>
        </div>
      </div>

      <div class="next-steps">
        <h4>📋 Próximos pasos</h4>
        <ul>
          <li><strong>Espere nuestro contacto:</strong> El equipo de prácticas se comunicará con usted próximamente con mayor información.</li>
          <li><strong>Revise su correo:</strong> Manténgase pendiente de su bandeja de entrada (incluyendo spam).</li>
          <li><strong>Prepare su documentación:</strong> Tenga a la mano sus documentos personales y académicos.</li>
          <li><strong>Preguntas:</strong> Si tiene dudas, contáctenos a ${EMAIL_CONTACTO}</li>
        </ul>
      </div>

      <p>Felicitaciones nuevamente por este logro. Estamos emocionados de tenerle como parte de esta experiencia.</p>
      
      <p style="margin-top: 30px;">Saludos cordiales,<br>
      <strong>Equipo de Prácticas y Pasantías</strong><br>
      Universidad Nacional de Colombia - Sede de La Paz</p>
    </div>
    
    <div class="footer">
      <p><strong>Universidad Nacional de Colombia - Sede de La Paz</strong></p>
      <p>📧 <a href="mailto:${EMAIL_CONTACTO}">${EMAIL_CONTACTO}</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Genera el HTML del correo de NO SELECCIÓN
 */
function generarCorreoNoSeleccionado(nombreCompleto, datos) {
  const tieneObservaciones = datos.observaciones && datos.observaciones.trim() !== '';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #6b7280, #4b5563); color: white; padding: 35px 30px; text-align: center; }
    .header h1 { margin: 0 0 10px 0; font-size: 24px; }
    .header p { margin: 0; opacity: 0.9; font-size: 15px; }
    .content { background: #ffffff; padding: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .result-card { background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .result-card h3 { margin: 0 0 10px 0; color: #374151; font-size: 16px; }
    .result-card p { margin: 0; color: #4b5563; }
    .info-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .info-row { margin-bottom: 10px; }
    .info-label { font-weight: 600; color: #374151; }
    .info-value { color: #1f2937; }
    .observaciones { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .observaciones h4 { margin: 0 0 10px 0; color: #92400e; font-size: 15px; }
    .observaciones p { margin: 0; color: #78350f; font-style: italic; }
    .encouragement { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
    .encouragement h4 { margin: 0 0 10px 0; color: #1e40af; }
    .encouragement p { margin: 0; color: #1e3a8a; }
    .footer { background: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 5px 0; color: #64748b; font-size: 13px; }
    .footer a { color: #3b82f6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Resultado de tu postulación</h1>
      <p>Información sobre el proceso de selección</p>
    </div>
    
    <div class="content">
      <p class="greeting">Estimado(a) <strong>${nombreCompleto}</strong>,</p>

      <p>Agradecemos su interés en las oportunidades de prácticas y pasantías de la Universidad Nacional de Colombia - Sede de La Paz.</p>

      <div class="result-card">
        <h3>📋 Resultado del proceso</h3>
        <p>Después de revisar cuidadosamente todas las postulaciones, lamentamos informarle que en esta ocasión <strong>no ha sido seleccionado/a</strong> para la siguiente vacante:</p>
      </div>
      
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Vacante:</span>
          <span class="info-value">${datos.titulo || 'No especificada'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Modalidad:</span>
          <span class="info-value">${datos.modalidad || 'No especificada'}</span>
        </div>
      </div>
      
      ${tieneObservaciones ? `
      <div class="observaciones">
        <h4>💬 Observaciones del proceso:</h4>
        <p>"${datos.observaciones}"</p>
      </div>
      ` : ''}
      
      <div class="encouragement">
        <h4>💪 No se desanime</h4>
        <p>Esta decisión no define sus capacidades. Le invitamos a seguir postulándose a futuras vacantes. Constantemente se abren nuevas oportunidades que podrían ser ideales para su perfil.</p>
      </div>
      
      <div class="info-card" style="background: #f0f9ff; border: 1px solid #bae6fd;">
        <p><strong>📌 Nota:</strong> Las vacantes son ofrecidas por la Oficina de Prácticas y Pasantías. No obstante, tiene la libertad de gestionar sus prácticas o pasantías en la entidad de su interés.</p>
        <p style="margin-top: 10px;">Actualmente contamos con Convenios P&P vigentes con 20+ entidades, por lo que le invitamos a revisar la matriz de Convenios P&P disponible.</p>
        <p style="margin-top: 10px;">En caso de que la entidad de su interés no cuente con Convenio P&P con la Universidad Nacional de Colombia, por favor infórmenos para iniciar el proceso de gestión correspondiente.</p>
      </div>
      
      <p>Si tiene alguna pregunta sobre el proceso o desea recibir retroalimentación adicional, no dude en contactarnos.</p>

      <p>Le deseamos mucho éxito en sus futuros proyectos.</p>
      
      <p style="margin-top: 30px;">Saludos cordiales,<br>
      <strong>Equipo de Prácticas y Pasantías</strong><br>
      Universidad Nacional de Colombia - Sede de La Paz</p>
    </div>
    
    <div class="footer">
      <p><strong>Universidad Nacional de Colombia - Sede de La Paz</strong></p>
      <p>📧 <a href="mailto:${EMAIL_CONTACTO}">${EMAIL_CONTACTO}</a></p>
    </div>
  </div>
</body>
</html>
  `;
}
