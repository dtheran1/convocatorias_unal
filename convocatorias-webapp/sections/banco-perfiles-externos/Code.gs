/**
 * Banco de Perfiles Externos - Backend
 * Google Apps Script para gestionar formulario de Banco de Perfiles de Entidades Externas
 * 
 * INSTRUCCIONES:
 * 1. Ejecuta setupBancoPerfilesExternos() UNA VEZ para configurar
 * 2. Ejecuta testConfigurationExternos() para verificar
 * 3. Implementa como Web App
 */

// ============================================================
// CONFIGURATION
// ============================================================

// Nombres de las propiedades de configuración
const CONFIG_KEYS_EXTERNOS = {
  BANCO_PERFILES_EXTERNOS_SHEET_ID: 'BANCO_PERFILES_EXTERNOS_SHEET_ID',
  EMAIL_NOTIFICACION_EXTERNOS: 'EMAIL_NOTIFICACION_EXTERNOS'
};

/**
 * Configuración del proyecto
 */
function getConfigExternos() {
  const scriptProps = PropertiesService.getScriptProperties();
  
  return {
    // ID de la hoja de cálculo donde se guardarán los perfiles externos
    spreadsheetId: scriptProps.getProperty(CONFIG_KEYS_EXTERNOS.BANCO_PERFILES_EXTERNOS_SHEET_ID) || '1234hFhc7yiGR2CB-qvO9nkzsJ8JPmLCD35fIcTUbQSs',
    
    // Email donde se enviarán las notificaciones
    emailNotificacion: scriptProps.getProperty(CONFIG_KEYS_EXTERNOS.EMAIL_NOTIFICACION_EXTERNOS) || 'practicas_paz@unal.edu.co'
  };
}

/**
 * PASO 1: EJECUTA ESTA FUNCIÓN PRIMERO para autorizar permisos
 * Esta función simple permite que Apps Script solicite permisos de Spreadsheet
 */
function autorizarPermisosExternos() {
  console.log('=== AUTORIZANDO PERMISOS (EXTERNOS) ===');
  console.log('');
  console.log('Esta función debe ejecutarse PRIMERO para autorizar el acceso a Spreadsheets.');
  console.log('');
  console.log('Cuando ejecutes esta función:');
  console.log('1. Clic en "Revisar permisos"');
  console.log('2. Selecciona tu cuenta');
  console.log('3. Clic en "Avanzado" → "Ir a [nombre del proyecto]"');
  console.log('4. Clic en "Permitir"');
  console.log('');
  console.log('Una vez autorizado, ejecuta setupBancoPerfilesExternos()');
  
  try {
    var sheets = SpreadsheetApp.getActiveSpreadsheet();
    console.log('');
    console.log('✅ Permisos ya autorizados correctamente');
  } catch (error) {
    console.log('');
    console.log('✅ Solicitud de permisos completada');
    console.log('Ahora ejecuta setupBancoPerfilesExternos()');
  }
}

/**
 * PASO 2: EJECUTAR ESTA FUNCIÓN después de autorizarPermisosExternos()
 * Configura Script Properties e inicializa el Sheet
 */
function setupBancoPerfilesExternos() {
  console.log('=== CONFIGURANDO BANCO DE PERFILES EXTERNOS ===');
  
  // ⬇️ EDITA ESTOS VALORES CON TUS DATOS REALES:
  const config = {
    'BANCO_PERFILES_EXTERNOS_SHEET_ID': '1234hFhc7yiGR2CB-qvO9nkzsJ8JPmLCD35fIcTUbQSs',  // ← Reemplaza con tu Sheet ID
    'EMAIL_NOTIFICACION_EXTERNOS': 'practicas_paz@unal.edu.co'
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
    initializeSheetExternos(config['BANCO_PERFILES_EXTERNOS_SHEET_ID']);
    console.log('✓ Sheet inicializado correctamente');
    console.log('');
    console.log('=== CONFIGURACIÓN COMPLETADA ===');
    console.log('Ejecuta testConfigurationExternos() para verificar');
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
 * Inicializar el Google Sheet con las columnas necesarias para perfiles externos
 */
function initializeSheetExternos(sheetId) {
  const ss = SpreadsheetApp.openById(sheetId);
  let sheet = ss.getSheetByName('Perfiles Externos');
  
  // Crear hoja si no existe
  if (!sheet) {
    sheet = ss.insertSheet('Perfiles Externos');
  }
  
  // Definir headers para perfiles externos
  const headers = [
    'Fecha de Registro',
    'Nombre Entidad',
    'Información Entidad',
    'Tipo Entidad',
    'Municipio y Departamento',
    'Nombre Contacto',
    'Cargo Contacto',
    'Correo Contacto',
    'Teléfono Contacto',
    'Tipo Modalidad',
    'Modalidad de Vinculación',
    'Descripción Perfil',
    'Dependencia/Área',
    'Cantidad Estudiantes',
    'Duración Estimada',
    'Modalidad Trabajo',
    'Programas Académicos',
    'Competencias Específicas',
    'Apoyo Estudiante',
    'Tipo de Apoyo',
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
    headerRange.setBackground('#2563eb');
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
  return HtmlService.createHtmlOutputFromFile('banco-perfiles-externos')
    .setTitle('Banco de Perfiles Externos - UNAL La Paz')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================================
// FORM SUBMISSION
// ============================================================

/**
 * Procesar envío del formulario de perfiles externos
 * @param {Object} formData - Datos del formulario
 * @returns {Object} Respuesta con éxito o error
 */
function submitBancoPerfilesExternos(formData) {
  try {
    // Validar datos de la entidad
    if (!formData || !formData.nombreEntidad || !formData.informacionEntidad || !formData.tipoEntidad) {
      return {
        success: false,
        error: 'Datos de la entidad incompletos'
      };
    }
    
    if (!formData.municipioDepartamento || !formData.nombreContacto || !formData.cargoContacto || !formData.correoContacto) {
      return {
        success: false,
        error: 'Datos de contacto incompletos'
      };
    }
    
    // Validar que haya perfiles
    if (!formData.perfiles || formData.perfiles.length === 0) {
      return {
        success: false,
        error: 'Debes incluir al menos un perfil'
      };
    }
    
    // Guardar en Sheet
    const rowsAdded = saveToSheetExternos(formData);
    
    // Enviar notificación por email
    sendNotificationEmailExternos(formData, rowsAdded);
    
    return {
      success: true,
      message: 'Formulario enviado exitosamente',
      rowsAdded: rowsAdded
    };
    
  } catch (error) {
    Logger.log('Error en submitBancoPerfilesExternos: ' + error.toString());
    return {
      success: false,
      error: 'Error al procesar el formulario: ' + error.message
    };
  }
}

/**
 * Guardar datos en Google Sheet (Perfiles Externos)
 */
function saveToSheetExternos(formData) {
  const config = getConfigExternos();
  const ss = SpreadsheetApp.openById(config.spreadsheetId);
  let sheet = ss.getSheetByName('Perfiles Externos');
  
  if (!sheet) {
    // Si no existe la hoja, inicializarla
    initializeSheetExternos(config.spreadsheetId);
    sheet = ss.getSheetByName('Perfiles Externos');
  }
  
  const timestamp = new Date();
  const rows = [];
  
  // Crear una fila por cada perfil
  formData.perfiles.forEach(function(perfil) {
    const row = [
      timestamp,
      formData.nombreEntidad,
      formData.informacionEntidad,
      formData.tipoEntidad,
      formData.municipioDepartamento,
      formData.nombreContacto,
      formData.cargoContacto,
      formData.correoContacto,
      formData.telefonoContacto || '',
      perfil.tipoModalidad,
      perfil.modalidadVinculacion || '',
      perfil.descripcionPerfil,
      perfil.dependenciaArea,
      perfil.cantidadEstudiantes,
      perfil.duracionEstimada,
      perfil.modalidadTrabajo,
      perfil.programas.join(', '),
      perfil.competenciasEspecificas,
      perfil.apoyoEstudiante,
      perfil.tipoApoyo ? perfil.tipoApoyo.join(', ') : '',
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
 * Enviar email de notificación para perfiles externos
 */
function sendNotificationEmailExternos(formData, rowsAdded) {
  const config = getConfigExternos();
  const recipient = config.emailNotificacion;
  const subject = '🏢 Nuevo registro de Entidad Externa - ' + formData.nombreEntidad;
  
  const htmlBody = buildEmailTemplateExternos(formData, rowsAdded);
  
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
 * Construir template HTML del email para perfiles externos
 */
function buildEmailTemplateExternos(formData, rowsAdded) {
  const perfilesHtml = formData.perfiles.map(function(perfil, index) {
    return `
      <div class="perfil-section">
        <h3 style="color: #1d4ed8; margin-top: 0;">Perfil #${index + 1}</h3>
        <table>
          <tr>
            <td class="label">Tipo de Modalidad:</td>
            <td>${escapeHtml(perfil.tipoModalidad)}</td>
          </tr>
          <tr>
            <td class="label">Modalidad de Vinculación:</td>
            <td>${escapeHtml(perfil.modalidadVinculacion)}</td>
          </tr>
          <tr>
            <td class="label">Descripción:</td>
            <td>${escapeHtml(perfil.descripcionPerfil)}</td>
          </tr>
          <tr>
            <td class="label">Dependencia/Área:</td>
            <td>${escapeHtml(perfil.dependenciaArea)}</td>
          </tr>
          <tr>
            <td class="label">Cantidad de Estudiantes:</td>
            <td>${escapeHtml(perfil.cantidadEstudiantes)}</td>
          </tr>
          <tr>
            <td class="label">Duración Estimada:</td>
            <td>${escapeHtml(perfil.duracionEstimada)}</td>
          </tr>
          <tr>
            <td class="label">Modalidad de Trabajo:</td>
            <td>${escapeHtml(perfil.modalidadTrabajo)}</td>
          </tr>
          <tr>
            <td class="label">Programas Académicos:</td>
            <td>${escapeHtml(perfil.programas.join(', '))}</td>
          </tr>
          <tr>
            <td class="label">Competencias Específicas:</td>
            <td>${escapeHtml(perfil.competenciasEspecificas)}</td>
          </tr>
          <tr>
            <td class="label">Apoyo al Estudiante:</td>
            <td>${escapeHtml(perfil.apoyoEstudiante)}</td>
          </tr>
          ${perfil.tipoApoyo && perfil.tipoApoyo.length > 0 ? `
          <tr>
            <td class="label">Tipo de Apoyo:</td>
            <td>${escapeHtml(perfil.tipoApoyo.join(', '))}</td>
          </tr>
          ` : ''}
          ${perfil.observaciones ? `
          <tr>
            <td class="label">Observaciones:</td>
            <td>${escapeHtml(perfil.observaciones)}</td>
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
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; }
        .header h1 { margin: 0 0 0.5rem 0; font-size: 1.5rem; }
        .header p { margin: 0; opacity: 0.95; }
        .info-section { background: #eff6ff; border-left: 4px solid #2563eb; padding: 1rem; margin-bottom: 2rem; border-radius: 4px; }
        .perfil-section { background: #f8fafc; border-left: 4px solid #2563eb; padding: 1rem; margin-bottom: 1rem; border-radius: 4px; }
        .footer { margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #e2e8f0; font-size: 0.875rem; color: #64748b; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 0.5rem 0; vertical-align: top; }
        .label { font-weight: 600; color: #64748b; width: 40%; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏢 Nuevo Registro - Entidad Externa</h1>
          <p>Universidad Nacional de Colombia – Sede de La Paz</p>
        </div>
        
        <div class="info-section">
          <h2 style="color: #1d4ed8; margin-top: 0; font-size: 1.2rem;">Información de la Entidad</h2>
          <table>
            <tr>
              <td class="label">Nombre Entidad:</td>
              <td>${escapeHtml(formData.nombreEntidad)}</td>
            </tr>
            <tr>
              <td class="label">Información:</td>
              <td>${escapeHtml(formData.informacionEntidad)}</td>
            </tr>
            <tr>
              <td class="label">Tipo:</td>
              <td>${escapeHtml(formData.tipoEntidad)}</td>
            </tr>
            <tr>
              <td class="label">Ubicación:</td>
              <td>${escapeHtml(formData.municipioDepartamento)}</td>
            </tr>
            <tr>
              <td class="label">Contacto:</td>
              <td>${escapeHtml(formData.nombreContacto)}</td>
            </tr>
            <tr>
              <td class="label">Cargo:</td>
              <td>${escapeHtml(formData.cargoContacto)}</td>
            </tr>
            <tr>
              <td class="label">Email:</td>
              <td>${escapeHtml(formData.correoContacto)}</td>
            </tr>
            ${formData.telefonoContacto ? `
            <tr>
              <td class="label">Teléfono:</td>
              <td>${escapeHtml(formData.telefonoContacto)}</td>
            </tr>
            ` : ''}
            <tr>
              <td class="label">Perfiles Registrados:</td>
              <td><strong>${rowsAdded}</strong></td>
            </tr>
          </table>
        </div>
        
        <h2 style="color: #1d4ed8; font-size: 1.2rem;">Perfiles Registrados</h2>
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
 * Obtener estadísticas del banco de perfiles externos
 */
function getEstadisticasExternos() {
  try {
    const config = getConfigExternos();
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    const sheet = ss.getSheetByName('Perfiles Externos');
    
    if (!sheet) {
      return {
        totalPerfiles: 0,
        totalEntidades: 0
      };
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return {
        totalPerfiles: 0,
        totalEntidades: 0
      };
    }
    
    const entidades = new Set();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      entidades.add(row[1]); // Nombre Entidad
    }
    
    return {
      totalPerfiles: data.length - 1,
      totalEntidades: entidades.size
    };
    
  } catch (error) {
    Logger.log('Error en getEstadisticasExternos: ' + error.toString());
    return {
      totalPerfiles: 0,
      totalEntidades: 0,
      error: error.message
    };
  }
}

/**
 * Verifica que todas las propiedades estén configuradas correctamente
 */
function testConfigurationExternos() {
  console.log('=== VERIFICANDO CONFIGURACIÓN (EXTERNOS) ===');
  console.log('');
  
  const config = getConfigExternos();
  console.log('📋 Configuración actual:');
  console.log('   Sheet ID: ' + config.spreadsheetId);
  console.log('   Email: ' + config.emailNotificacion);
  console.log('');
  
  // Validar que no sean los valores por defecto
  if (config.spreadsheetId === 'TU_SHEET_ID_AQUI') {
    console.log('❌ ERROR: Sheet ID no configurado');
    console.log('   Edita setupBancoPerfilesExternos() y reemplaza el Sheet ID');
    console.log('   Luego ejecuta setupBancoPerfilesExternos() nuevamente');
    return false;
  }
  
  // Verificar acceso al Sheet
  try {
    const ss = SpreadsheetApp.openById(config.spreadsheetId);
    console.log('✓ Sheet accesible: ' + ss.getName());
    
    const sheet = ss.getSheetByName('Perfiles Externos');
    if (sheet) {
      console.log('✓ Hoja "Perfiles Externos" existe');
      console.log('  Filas: ' + sheet.getLastRow());
      console.log('  Columnas: ' + sheet.getLastColumn());
    } else {
      console.log('⚠ Hoja "Perfiles Externos" no existe');
      console.log('  (Se creará automáticamente al recibir el primer registro)');
    }
    
    console.log('');
    console.log('=== ✅ TODO OK - El sistema está listo ===');
    return true;
    
  } catch (error) {
    console.log('✗ Error al acceder al Sheet: ' + error.message);
    console.log('');
    console.log('💡 Solución:');
    console.log('   1. Edita setupBancoPerfilesExternos() con el Sheet ID correcto');
    console.log('   2. Ejecuta setupBancoPerfilesExternos() nuevamente');
    console.log('   3. Asegúrate de tener permisos de edición en el Sheet');
    return false;
  }
}
