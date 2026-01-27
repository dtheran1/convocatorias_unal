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
  DEPENDENCIA_ENTIDAD: 0,      // Interna/Externa
  NOMBRE_VACANTE: 1,           // Título de la convocatoria
  EMAIL_CONTACTO: 2,           // Dirección de correo electrónico
  NOMBRE_DEPENDENCIA: 3,       // Nombre de la Dirección/Dependencia/Proyecto
  DEPENDENCIA_PROYECTO: 4,     // Dependencia/Proyecto donde se desarrollará
  EMAIL_DEPENDENCIA: 5,        // Correo electrónico
  TIPO_MODALIDAD: 6,           // Tipo de modalidad a vincular (Práctica/Pasantía)
  DESCRIPCION_PERFIL: 7,       // Descripción general del perfil
  CANTIDAD_ESTUDIANTES: 8,     // Cantidad de estudiantes requeridos
  MODALIDAD_TRABAJO: 9,        // Modalidad (Presencial/Híbrida)
  SELECCIONADO: 10,            // Seleccionado
  PROGRAMAS_ACADEMICOS: 11,    // Programas académicos
  COMPETENCIAS_ESPECIFICAS: 12, // Competencias específicas
  COMPETENCIAS_ACTITUDES: 13,  // Competencias/habilidades o actitudes
  OFRECE_APOYO: 14,            // ¿Ofrece apoyo?
  TIPO_APOYO: 15,              // Tipo de apoyo
  OBSERVACIONES: 16,           // Observaciones
  ESTADO: 17                   // Estado (Abierto/Cerrado)
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
