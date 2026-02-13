/**
 * SISTEMA DE TRABAJOS DE GRADO (TDG) - UNAL SEDE DE LA PAZ
 * Proyecto Apps Script independiente para la sección de TDG
 * 
 * NOTA: Esta sección es completamente estática (solo contenido HTML)
 * No requiere acceso a spreadsheets ni funcionalidades de backend
 *
 * INSTRUCCIONES:
 * 1. Crea un nuevo proyecto en Google Apps Script (script.google.com)
 * 2. Copia este archivo como Code.gs
 * 3. Copia tdg-complete.html como archivo HTML en el mismo proyecto
 * 4. Implementa como Web App (Implementar > Nueva implementación > App web)
 * 5. Configura acceso: "Cualquier usuario" o "Solo usuarios de mi organización"
 * 6. Copia la URL /exec y embébela en Google Sites
 */

// ========== ENTRY POINT ==========

/**
 * Sirve la página tdg-complete.html
 * Esta es la única función necesaria para esta sección estática
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('tdg-complete')
    .setTitle('Trabajos de Grado - UNAL Sede de La Paz')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ========== FUNCIONES DE UTILIDAD (OPCIONALES) ==========

/**
 * Función de prueba para verificar que el script funciona correctamente
 * Ejecutar desde el editor de Apps Script para verificar
 */
function testDoGet() {
  console.log('=== TEST DE PÁGINA TDG ===');
  
  try {
    var output = doGet();
    
    if (output) {
      console.log('✓ Página HTML generada correctamente');
      console.log('✓ Título:', output.getTitle());
      console.log('✓ La sección TDG está lista para ser desplegada');
    } else {
      console.error('✗ Error: doGet() no retornó contenido');
    }
    
    console.log('\n=== ✓ TEST COMPLETADO ===');
    console.log('Puedes proceder a implementar la Web App');
    
  } catch (error) {
    console.error('✗ Error en test:', error.message);
    console.log('Stack:', error.stack);
  }
}

/**
 * Obtiene información sobre el proyecto
 * Útil para verificar la configuración
 */
function getProjectInfo() {
  console.log('=== INFORMACIÓN DEL PROYECTO ===');
  console.log('Nombre del script:', ScriptApp.getScriptId());
  console.log('Usuario activo:', Session.getActiveUser().getEmail());
  console.log('Zona horaria:', Session.getScriptTimeZone());
  console.log('\nEste proyecto sirve la página estática de Trabajos de Grado (TDG)');
  console.log('No requiere configuración adicional ni acceso a spreadsheets');
}

// ========== DOCUMENTACIÓN ==========

/**
 * GUÍA DE DESPLIEGUE
 * 
 * Paso 1: Crear el proyecto Apps Script
 * - Ve a script.google.com
 * - Clic en "Nuevo proyecto"
 * - Renombra como "TDG - UNAL Sede La Paz"
 * 
 * Paso 2: Agregar archivos
 * - Copia este archivo completo en Code.gs
 * - Agrega archivo HTML: Clic en + junto a "Archivos"
 * - Nómbralo exactamente "tdg-complete"
 * - Pega el contenido de tdg-complete.html
 * 
 * Paso 3: Probar localmente
 * - Ejecuta la función testDoGet() desde el menú desplegable
 * - Revisa los logs (Ctrl+Enter) para verificar que no hay errores
 * 
 * Paso 4: Implementar como Web App
 * - Clic en "Implementar" > "Nueva implementación"
 * - Tipo: "Aplicación web"
 * - Descripción: "TDG v1.0"
 * - Ejecutar como: "Yo" (tu cuenta)
 * - Quién tiene acceso: "Cualquier usuario" o "Solo usuarios de UNAL"
 * - Clic en "Implementar"
 * - Copia la URL que termina en /exec
 * 
 * Paso 5: Embedar en Google Sites
 * - Abre tu página en Google Sites
 * - Inserta bloque "Insertar" > "URL"
 * - Pega la URL /exec del paso anterior
 * - Ajusta altura del iframe (recomendado: 3000px mínimo)
 * 
 * SOLUCIÓN DE PROBLEMAS:
 * 
 * Si ves "Script function not found: doGet"
 * → Verifica que el archivo se llame exactamente "Code.gs"
 * 
 * Si ves error de archivo HTML no encontrado
 * → Verifica que el archivo HTML se llame exactamente "tdg-complete" (sin .html)
 * 
 * Si la página no se muestra en Google Sites
 * → Verifica que el iframe tenga la URL correcta (/exec, no /dev)
 * → Verifica que "Quién tiene acceso" permita usuarios externos si es necesario
 * 
 * Si necesitas actualizar el contenido
 * → Edita el archivo HTML en Apps Script
 * → Guarda (Ctrl+S)
 * → No necesitas crear nueva implementación, los cambios se reflejan automáticamente
 * → Puede tomar 1-2 minutos en actualizarse por caché
 */
