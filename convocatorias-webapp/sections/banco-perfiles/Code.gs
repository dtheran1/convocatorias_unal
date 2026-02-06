/**
 * Banco de Perfiles - Backend
 * Google Apps Script para gestionar formulario de Banco de Perfiles
 * 
 * INSTRUCCIONES:
 * 1. Ejecuta setupBancoPerfiles() UNA VEZ para configurar
 * 2. Ejecuta testConfiguration() para verificar
 * 3. Implementa como Web App
 */

// ============================================================
// CONFIGURATION
// ============================================================

// Nombres de las propiedades de configuración
const CONFIG_KEYS_BANCO = {
  BANCO_PERFILES_SHEET_ID: 'BANCO_PERFILES_SHEET_ID',
  EMAIL_NOTIFICACION: 'EMAIL_NOTIFICACION'
};

/**
 * Configuración del proyecto
 */
function getConfig() {
  const scriptProps = PropertiesService.getScriptProperties();
  
  return {
    // ID de la hoja de cálculo donde se guardarán los perfiles
    spreadsheetId: scriptProps.getProperty(CONFIG_KEYS_BANCO.BANCO_PERFILES_SHEET_ID) || '1234hFhc7yiGR2CB-qvO9nkzsJ8JPmLCD35fIcTUbQSs',
    
    // Email donde se enviarán las notificaciones
    emailNotificacion: scriptProps.getProperty(CONFIG_KEYS_BANCO.EMAIL_NOTIFICACION) || 'practicas_paz@unal.edu.co'
  };
}

/**
 * PASO 1: EJECUTA ESTA FUNCIÓN PRIMERO para autorizar permisos
 * Esta función simple permite que Apps Script solicite permisos de Spreadsheet
 */
function autorizarPermisos() {
  console.log('=== AUTORIZANDO PERMISOS ===');
  console.log('');
  console.log('Esta función debe ejecutarse PRIMERO para autorizar el acceso a Spreadsheets.');
  console.log('');
  console.log('Cuando ejecutes esta función:');
  console.log('1. Clic en "Revisar permisos"');
  console.log('2. Selecciona tu cuenta');
  console.log('3. Clic en "Avanzado" → "Ir a [nombre del proyecto]"');
  console.log('4. Clic en "Permitir"');
  console.log('');
  console.log('Una vez autorizado, ejecuta setupBancoPerfiles()');
  
  // Esta línea simple fuerza la solicitud de permisos
  try {
    var sheets = SpreadsheetApp.getActiveSpreadsheet();
    console.log('');
    console.log('✅ Permisos ya autorizados correctamente');
  } catch (error) {
    // En proyectos standalone, getActiveSpreadsheet() falla, pero eso está bien
    // Lo importante es que solicitó permisos
    console.log('');
    console.log('✅ Solicitud de permisos completada');
    console.log('Ahora ejecuta setupBancoPerfiles()');
  }
}

/**
 * PASO 2: EJECUTAR ESTA FUNCIÓN después de autorizarPermisos()
 * Configura Script Properties e inicializa el Sheet
 */
function setupBancoPerfiles() {
  console.log('=== CONFIGURANDO BANCO DE PERFILES ===');
  
  // ⬇️ EDITA ESTOS VALORES CON TUS DATOS REALES:
  const config = {
    'BANCO_PERFILES_SHEET_ID': '1234hFhc7yiGR2CB-qvO9nkzsJ8JPmLCD35fIcTUbQSs',  // ← Reemplaza con tu Sheet ID
    'EMAIL_NOTIFICACION': 'practicas_paz@unal.edu.co'
  };
  
  const scriptProps = PropertiesService.getScriptProperties();
  
  // Guardar propiedades
  Object.keys(config).forEach(function(key) {
    scriptProps.setProperty(key, config[key]);
    console.log('✓ ' + key + ' configurado');
  });
  
  console.log('');
  console.log('Intentando inicializar el Sheet...');
  
  // Inicializar el Sheet
  try {
    initializeSheet(config['BANCO_PERFILES_SHEET_ID']);
    console.log('✓ Sheet inicializado correctamente');
    console.log('');
    console.log('=== CONFIGURACIÓN COMPLETADA ===');
    console.log('Ejecuta testConfiguration() para verificar');
  } catch (error) {
    console.log('✗ Error al inicializar Sheet: ' + error.message);
    console.log('');
    console.log('Posibles causas:');
    console.log('1. El Sheet ID es incorrecto');
    console.log('2. No tienes permisos de edición en el Sheet');
    console.log('3. El Sheet fue eliminado o movido');
    console.log('');
    console.log('Verifica el Sheet ID e intenta nuevamente');
  }
}

/**
 * Inicializar el Google Sheet con las columnas necesarias
 */
function initializeSheet(sheetId) {
  const ss = SpreadsheetApp.openById(sheetId);
  let sheet = ss.getSheetByName('Banco de Perfiles');
  
  // Crear hoja si no existe
  if (!sheet) {
    sheet = ss.insertSheet('Banco de Perfiles');
  }
  
  // Definir headers
  const headers = [
    'Fecha de Registro',
    'Nombre Dependencia',
    'Correo Contacto',
    'Responsable',
    'Tipo Modalidad',
    'Descripción Perfil',
    'Dependencia/Proyecto',
    'Cantidad Estudiantes',
    'Modalidad Trabajo',
    'Programas Académicos',
    'Competencias Específicas',
    'Habilidades Valoradas',
    'Apoyo Estudiante',
    'Observaciones'
  ];
  
  // Verificar si ya tiene headers
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const hasHeaders = firstRow.some(cell => cell !== '');
  
  if (!hasHeaders) {
    // Escribir headers
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Formatear headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4CAF50');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    
    // Congelar primera fila
    sheet.setFrozenRows(1);
    
    // Auto-resize columnas
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }
}

// ============================================================
// WEB APP ENTRY POINT
// ============================================================

/**
 * Servir la página HTML
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('banco-perfiles')
    .setTitle('Banco de Perfiles - UNAL La Paz')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================================
// FORM SUBMISSION
// ============================================================

/**
 * Procesar envío del formulario
 * @param {Object} formData - Datos del formulario
 * @returns {Object} Respuesta con éxito o error
 */
function submitBancoPerfiles(formData) {
  try {
    // Validar datos
    if (!formData || !formData.nombreDependencia || !formData.correoContacto || !formData.responsable) {
      return {
        success: false,
        error: 'Datos de dependencia incompletos'
      };
    }
    
    if (!formData.perfiles || formData.perfiles.length === 0) {
      return {
        success: false,
        error: 'Debes incluir al menos un perfil'
      };
    }
    
    // Guardar en Sheet
    const rowsAdded = saveToSheet(formData);
    
    // Enviar notificación por email
    sendNotificationEmail(formData, rowsAdded);
    
    return {
      success: true,
      message: 'Formulario enviado exitosamente',
      rowsAdded: rowsAdded
    };
    
  } catch (error) {
    Logger.log('Error en submitBancoPerfiles: ' + error.toString());
    return {
      success: false,
      error: 'Error al procesar el formulario: ' + error.message
    };
  }
}

/**
 * Guardar datos en Google Sheet
 */
function saveToSheet(formData) {
  const config = getConfig();
  const ss = SpreadsheetApp.openById(config.spreadsheetId);
  let sheet = ss.getSheetByName('Banco de Perfiles');
  
  if (!sheet) {
    // Si no existe la hoja, inicializarla
    initializeSheet(config.spreadsheetId);
    sheet = ss.getSheetByName('Banco de Perfiles');
  }
  
  const timestamp = new Date();
  const rows = [];
  
  // Crear una fila por cada perfil
  formData.perfiles.forEach(function(perfil) {
    const row = [
      timestamp,
      formData.nombreDependencia,
      formData.correoContacto,
      formData.responsable,
      perfil.tipoModalidad,
      perfil.descripcionPerfil,
      perfil.dependenciaProyecto,
      perfil.cantidadEstudiantes,
      perfil.modalidadTrabajo,
      perfil.programas.join(', '),
      perfil.competenciasEspecificas,
      perfil.habilidadesValoradas,
      perfil.apoyoEstudiante,
      perfil.observaciones || ''
    ];
    rows.push(row);
  });
  
  // Agregar filas al final
  if (rows.length > 0) {
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length).setValues(rows);
    
    // Formatear fechas
    sheet.getRange(lastRow + 1, 1, rows.length, 1)
      .setNumberFormat('dd/mm/yyyy hh:mm:ss');
  }
  
  return rows.length;
}

// ============================================================
// EMAIL NOTIFICATION
// ============================================================

/**
 * Enviar email de notificación
 */
function sendNotificationEmail(formData, rowsAdded) {
  const config = getConfig();
  const recipient = config.emailNotificacion;
  const subject = '📋 Nuevo registro en Banco de Perfiles - ' + formData.nombreDependencia;
  
  const htmlBody = buildEmailTemplate(formData, rowsAdded);
  
  try {
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: htmlBody
    });
  } catch (error) {
    Logger.log('Error al enviar email: ' + error.toString());
    // No lanzar error - el formulario se guardó correctamente aunque falle el email
  }
}

/**
 * Construir template HTML del email
 */
function buildEmailTemplate(formData, rowsAdded) {
  const perfilesHtml = formData.perfiles.map(function(perfil, index) {
    return `
      <div style="background: #f8fafc; border-left: 4px solid #4CAF50; padding: 1rem; margin-bottom: 1rem; border-radius: 4px;">
        <h3 style="color: #388E3C; margin-top: 0;">Perfil #${index + 1}</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 0.5rem 0; font-weight: 600; color: #64748b; width: 40%;">Tipo de Modalidad:</td>
            <td style="padding: 0.5rem 0;">${escapeHtml(perfil.tipoModalidad)}</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 0; font-weight: 600; color: #64748b;">Descripción:</td>
            <td style="padding: 0.5rem 0;">${escapeHtml(perfil.descripcionPerfil)}</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 0; font-weight: 600; color: #64748b;">Dependencia/Proyecto:</td>
            <td style="padding: 0.5rem 0;">${escapeHtml(perfil.dependenciaProyecto)}</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 0; font-weight: 600; color: #64748b;">Cantidad de Estudiantes:</td>
            <td style="padding: 0.5rem 0;">${escapeHtml(perfil.cantidadEstudiantes)}</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 0; font-weight: 600; color: #64748b;">Modalidad de Trabajo:</td>
            <td style="padding: 0.5rem 0;">${escapeHtml(perfil.modalidadTrabajo)}</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 0; font-weight: 600; color: #64748b;">Programas Académicos:</td>
            <td style="padding: 0.5rem 0;">${escapeHtml(perfil.programas.join(', '))}</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 0; font-weight: 600; color: #64748b;">Competencias Específicas:</td>
            <td style="padding: 0.5rem 0;">${escapeHtml(perfil.competenciasEspecificas)}</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 0; font-weight: 600; color: #64748b;">Habilidades Valoradas:</td>
            <td style="padding: 0.5rem 0;">${escapeHtml(perfil.habilidadesValoradas)}</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 0; font-weight: 600; color: #64748b;">Apoyo al Estudiante:</td>
            <td style="padding: 0.5rem 0;">${escapeHtml(perfil.apoyoEstudiante)}</td>
          </tr>
          ${perfil.observaciones ? `
          <tr>
            <td style="padding: 0.5rem 0; font-weight: 600; color: #64748b;">Observaciones:</td>
            <td style="padding: 0.5rem 0;">${escapeHtml(perfil.observaciones)}</td>
          </tr>
          ` : ''}
        </table>
      </div>
    `;
  }).join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); color: white; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; }
        .header h1 { margin: 0 0 0.5rem 0; font-size: 1.5rem; }
        .header p { margin: 0; opacity: 0.95; }
        .info-section { background: #f0f9f0; border-left: 4px solid #4CAF50; padding: 1rem; margin-bottom: 2rem; border-radius: 4px; }
        .footer { margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #e2e8f0; font-size: 0.875rem; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Nuevo Registro - Convocatoria Interna Banco de Perfiles</h1>
          <p>Universidad Nacional de Colombia – Sede de La Paz</p>
        </div>
        
        <div class="info-section">
          <h2 style="color: #388E3C; margin-top: 0; font-size: 1.2rem;">Información de la Dependencia (Sede La Paz)</h2>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 0.5rem 0; font-weight: 600; color: #64748b; width: 40%;">Nombre Dependencia:</td>
              <td style="padding: 0.5rem 0;">${escapeHtml(formData.nombreDependencia)}</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 0; font-weight: 600; color: #64748b;">Correo de Contacto:</td>
              <td style="padding: 0.5rem 0;">${escapeHtml(formData.correoContacto)}</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 0; font-weight: 600; color: #64748b;">Responsable:</td>
              <td style="padding: 0.5rem 0;">${escapeHtml(formData.responsable)}</td>
            </tr>
            <tr>
              <td style="padding: 0.5rem 0; font-weight: 600; color: #64748b;">Perfiles Registrados:</td>
              <td style="padding: 0.5rem 0;"><strong>${rowsAdded}</strong></td>
            </tr>
          </table>
        </div>
        
        <h2 style="color: #388E3C; font-size: 1.2rem;">Perfiles Registrados</h2>
        ${perfilesHtml}
        
        <div class="footer">
          <p><strong>Sistema de Gestión de Prácticas y Pasantías</strong></p>
          <p>Universidad Nacional de Colombia - Sede de La Paz</p>
          <p>Este es un mensaje automático generado por el sistema.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Escapar HTML para prevenir XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Obtener estadísticas del banco de perfiles
 */
function getEstadisticas() {
  try {
    const config = getConfig();
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    const sheet = ss.getSheetByName('Banco de Perfiles');
    
    if (!sheet) {
      return {
        totalPerfiles: 0,
        totalDependencias: 0,
        totalEstudiantes: 0
      };
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return {
        totalPerfiles: 0,
        totalDependencias: 0,
        totalEstudiantes: 0
      };
    }
    
    const dependencias = new Set();
    let totalEstudiantes = 0;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      dependencias.add(row[1]); // Nombre Dependencia
      totalEstudiantes += parseInt(row[7]) || 0; // Cantidad Estudiantes
    }
    
    return {
      totalPerfiles: data.length - 1,
      totalDependencias: dependencias.size,
      totalEstudiantes: totalEstudiantes
    };
    
  } catch (error) {
    Logger.log('Error en getEstadisticas: ' + error.toString());
    return {
      totalPerfiles: 0,
      totalDependencias: 0,
      totalEstudiantes: 0,
      error: error.message
    };
  }
}

/**
 * Verifica que todas las propiedades estén configuradas correctamente
 */
function testConfiguration() {
  console.log('=== VERIFICANDO CONFIGURACIÓN ===');
  console.log('');
  
  const config = getConfig();
  console.log('📋 Configuración actual:');
  console.log('   Sheet ID: ' + config.spreadsheetId);
  console.log('   Email: ' + config.emailNotificacion);
  console.log('');
  
  // Validar que no sean los valores por defecto
  if (config.spreadsheetId === 'TU_SHEET_ID_AQUI') {
    console.log('❌ ERROR: Sheet ID no configurado');
    console.log('   Edita setupBancoPerfiles() y reemplaza el Sheet ID');
    console.log('   Luego ejecuta setupBancoPerfiles() nuevamente');
    return false;
  }
  
  // Verificar acceso al Sheet
  try {
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    console.log('✓ Sheet accesible: ' + ss.getName());
    
    const sheet = ss.getSheetByName('Banco de Perfiles');
    if (sheet) {
      console.log('✓ Hoja "Banco de Perfiles" existe');
      console.log('  Filas: ' + sheet.getLastRow());
      console.log('  Columnas: ' + sheet.getLastColumn());
    } else {
      console.log('⚠ Hoja "Banco de Perfiles" no existe');
      console.log('  (Se creará automáticamente al recibir el primer registro)');
    }
    
    console.log('');
    console.log('=== ✅ TODO OK - El sistema está listo ===');
    return true;
    
  } catch (error) {
    console.log('✗ Error al acceder al Sheet: ' + error.message);
    console.log('');
    console.log('💡 Solución:');
    console.log('   1. Edita setupBancoPerfiles() con el Sheet ID correcto');
    console.log('   2. Ejecuta setupBancoPerfiles() nuevamente');
    console.log('   3. Asegúrate de tener permisos de edición en el Sheet');
    return false;
  }
}
