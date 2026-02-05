/**
 * Logo Carousel - Apps Script Backend
 * Sirve el carousel de instituciones con convenio embebible en Google Sites
 */

/**
 * Entry point para la aplicación web
 * @return {HtmlOutput} Página HTML del carousel
 */
function doGet() {
  const htmlOutput = HtmlService.createTemplateFromFile('logoCarrusel')
      .evaluate()
      .setTitle('Instituciones con Convenio - UNAL')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  
  return htmlOutput;
}

/**
 * Obtiene la configuración de URLs de imágenes
 * En Apps Script, las imágenes se sirven desde Google Drive o se embedden como base64
 * @return {Object} Configuración de paths de imágenes
 */
function getImageConfig() {
  return {
    basePath: 'https://drive.google.com/uc?export=view&id=1CNUrvGzyBU-ZJKlQHs5UrBY8BJzWW8Px', // Base para Google Drive
    useBase64: true, // Flag para usar base64 embebido
    logos: getLogosWithIds()
  };
}

/**
 * Mapeo de logos a IDs de Google Drive o datos base64
 * NOTA: Actualizar con los IDs reales de Google Drive cuando se suban las imágenes
 * @return {Object} Mapeo de archivos de logos
 */
function getLogosWithIds() {
  // TODO: Reemplazar con los IDs reales de Google Drive
  // Por ahora retornamos la estructura para que funcione localmente
  return {
    'ANEI.webp': 'GOOGLE_DRIVE_ID_ANEI',
    'Alcaldía de La Paz.png': 'GOOGLE_DRIVE_ID_LAPAZ',
    'ASOHOFRUCOL.png': 'GOOGLE_DRIVE_ID_ASOHOFRUCOL',
    'Alianza Francesa.png': 'GOOGLE_DRIVE_ID_ALIANZA',
    'comfacesar.png': 'GOOGLE_DRIVE_ID_COMFACESAR',
    'Alcaldía de San Diego.png': 'GOOGLE_DRIVE_ID_SANDIEGO',
    'Cámara de comercio de Valledupar.png': 'GOOGLE_DRIVE_ID_CAMARA',
    'La rotativa.png': 'GOOGLE_DRIVE_ID_ROTATIVA',
    'Laboratorio Nancy Florez.png': 'GOOGLE_DRIVE_ID_LABORATORIO',
    'LOGO-AGROSOLIDARIA-.png': 'GOOGLE_DRIVE_ID_AGROSOLIDARIA',
    'logo-palmas.png': 'GOOGLE_DRIVE_ID_PALMAS',
    'Logo-PDPC-.webp': 'GOOGLE_DRIVE_ID_PDPC',
    'LOGO-PRODERI-CON-SLOGAN-BLANCO-1-2048x621.png': 'GOOGLE_DRIVE_ID_PRODERI',
    'logo-dark.svg': 'GOOGLE_DRIVE_ID_DARK',
    'Logos Reserva Natural Los Tananeos.avif': 'GOOGLE_DRIVE_ID_TANANEOS'
  };
}

/**
 * Función auxiliar para incluir archivos CSS/JS inline
 * Apps Script no permite archivos externos, todo debe ir inline
 * @param {string} filename - Nombre del archivo (no se usa, pero mantiene compatibilidad)
 * @return {string} Contenido del archivo
 */
function include(filename) {
  // En Apps Script, todo el CSS y JS debe ir inline en el HTML
  // Esta función se mantiene para compatibilidad pero no se usa
  return '';
}