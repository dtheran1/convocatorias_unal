/**
 * TESTS PARA CODE.GS - SISTEMA DE CONVOCATORIAS
 * 
 * Framework de testing simple para Google Apps Script
 * Ejecutar desde el editor: Seleccionar función runAllTests() > Run
 * 
 * INSTRUCCIONES:
 * 1. Copia este archivo en tu proyecto de Google Apps Script
 * 2. Ejecuta runAllTests() desde el menú Run
 * 3. Revisa los logs (View > Logs o Ctrl+Enter)
 */

// ============================================================
// FRAMEWORK DE TESTING SIMPLE
// ============================================================

const TestResults = {
  passed: 0,
  failed: 0,
  errors: []
};

function assert(condition, message) {
  if (condition) {
    TestResults.passed++;
    Logger.log('✅ PASS: ' + message);
  } else {
    TestResults.failed++;
    TestResults.errors.push(message);
    Logger.log('❌ FAIL: ' + message);
  }
}

function assertEqual(actual, expected, message) {
  const condition = actual === expected;
  if (!condition) {
    const errorMsg = message + ` (Expected: ${expected}, Got: ${actual})`;
    assert(false, errorMsg);
  } else {
    assert(true, message);
  }
}

function assertNotEqual(actual, unexpected, message) {
  assert(actual !== unexpected, message);
}

function assertTrue(value, message) {
  assertEqual(value, true, message);
}

function assertFalse(value, message) {
  assertEqual(value, false, message);
}

function assertContains(array, value, message) {
  assert(array.includes(value), message);
}

function assertGreaterThan(actual, threshold, message) {
  assert(actual > threshold, message + ` (${actual} > ${threshold})`);
}

function assertLessThan(actual, threshold, message) {
  assert(actual < threshold, message + ` (${actual} < ${threshold})`);
}

function printTestResults() {
  Logger.log('\n' + '='.repeat(60));
  Logger.log('TEST RESULTS SUMMARY');
  Logger.log('='.repeat(60));
  Logger.log('✅ Passed: ' + TestResults.passed);
  Logger.log('❌ Failed: ' + TestResults.failed);
  Logger.log('Total: ' + (TestResults.passed + TestResults.failed));
  
  if (TestResults.failed > 0) {
    Logger.log('\n❌ FAILED TESTS:');
    TestResults.errors.forEach((error, index) => {
      Logger.log(`  ${index + 1}. ${error}`);
    });
  } else {
    Logger.log('\n🎉 ALL TESTS PASSED!');
  }
  Logger.log('='.repeat(60));
}

// ============================================================
// TEST SUITE: VALIDACIÓN DE DATOS
// ============================================================

function testValidarDatosPostulacion() {
  Logger.log('\n📋 Testing: validarDatosPostulacion()');
  
  // Test 1: Email institucional válido
  const validData = {
    correoElectronico: 'estudiante@unal.edu.co',
    papa: '4.5',
    pbm: '75',
    numeroDocumento: '1234567890',
    telefono: '3001234567',
    primerNombre: 'Juan',
    primerApellido: 'Pérez'
  };
  
  const result1 = validarDatosPostulacion(validData);
  assertTrue(result1.isValid, 'Debe validar datos correctos');
  assertEqual(result1.errors.length, 0, 'No debe tener errores con datos válidos');
  
  // Test 2: Email no institucional
  const invalidEmail = { ...validData, correoElectronico: 'test@gmail.com' };
  const result2 = validarDatosPostulacion(invalidEmail);
  assertFalse(result2.isValid, 'Debe rechazar email no institucional');
  assertContains(result2.errors, 'Debe usar su correo institucional @unal.edu.co', 'Debe indicar error de email');
  
  // Test 3: PAPA fuera de rango
  const invalidPAPA = { ...validData, papa: '5.5' };
  const result3 = validarDatosPostulacion(invalidPAPA);
  assertFalse(result3.isValid, 'Debe rechazar PAPA > 5.0');
  
  const invalidPAPA2 = { ...validData, papa: '2.5' };
  const result4 = validarDatosPostulacion(invalidPAPA2);
  assertFalse(result4.isValid, 'Debe rechazar PAPA < 3.0');
  
  // Test 4: PBM fuera de rango
  const invalidPBM = { ...validData, pbm: '101' };
  const result5 = validarDatosPostulacion(invalidPBM);
  assertFalse(result5.isValid, 'Debe rechazar PBM > 100');
  
  // Test 5: Teléfono inválido
  const invalidPhone = { ...validData, telefono: '1234567890' };
  const result6 = validarDatosPostulacion(invalidPhone);
  assertFalse(result6.isValid, 'Debe rechazar teléfono que no inicia con 3');
  
  const invalidPhone2 = { ...validData, telefono: '300123' };
  const result7 = validarDatosPostulacion(invalidPhone2);
  assertFalse(result7.isValid, 'Debe rechazar teléfono con menos de 10 dígitos');
  
  // Test 6: Documento inválido
  const invalidDoc = { ...validData, numeroDocumento: '12345' };
  const result8 = validarDatosPostulacion(invalidDoc);
  assertFalse(result8.isValid, 'Debe rechazar documento con menos de 6 dígitos');
  
  // Test 7: Nombres con caracteres inválidos
  const invalidName = { ...validData, primerNombre: 'Juan123' };
  const result9 = validarDatosPostulacion(invalidName);
  assertFalse(result9.isValid, 'Debe rechazar nombres con números');
  
  // Test 8: Nombres con tildes válidos
  const validName = { ...validData, primerNombre: 'José María' };
  const result10 = validarDatosPostulacion(validName);
  assertTrue(result10.isValid, 'Debe aceptar nombres con tildes y espacios');
}

// ============================================================
// TEST SUITE: SANITIZACIÓN DE DATOS
// ============================================================

function testSanitizarDatos() {
  Logger.log('\n🧹 Testing: sanitizarDatos()');
  
  // Test 1: Trim de espacios
  const dataWithSpaces = {
    primerNombre: '  Juan  ',
    segundoNombre: ' Carlos ',
    primerApellido: ' Pérez  ',
    correoElectronico: '  TEST@UNAL.EDU.CO  ',
    papa: '4.5',
    pbm: '75'
  };
  
  const sanitized = sanitizarDatos(dataWithSpaces);
  assertEqual(sanitized.primerNombre, 'Juan', 'Debe eliminar espacios del nombre');
  assertEqual(sanitized.segundoNombre, 'Carlos', 'Debe eliminar espacios del segundo nombre');
  assertEqual(sanitized.primerApellido, 'Pérez', 'Debe eliminar espacios del apellido');
  
  // Test 2: Email a minúsculas
  assertEqual(sanitized.correoElectronico, 'test@unal.edu.co', 'Debe convertir email a minúsculas');
  
  // Test 3: PAPA con 2 decimales
  assertEqual(sanitized.papa, '4.50', 'Debe formatear PAPA con 2 decimales');
  
  // Test 4: PBM como entero
  assertEqual(typeof sanitized.pbm, 'number', 'PBM debe ser número');
  assertEqual(sanitized.pbm, 75, 'PBM debe ser entero');
}

// ============================================================
// TEST SUITE: ESCAPE HTML (PREVENCIÓN XSS)
// ============================================================

function testEscapeHtml() {
  Logger.log('\n🔒 Testing: escapeHtml() - XSS Prevention');
  
  // Nota: Esta función NO EXISTE aún en Code.gs
  // Este test documenta cómo debería funcionar
  
  // Para implementar, agregar en Code.gs:
  /*
  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  */
  
  Logger.log('⚠️  SKIPPED: escapeHtml() no está implementado aún');
  Logger.log('    ACCIÓN REQUERIDA: Agregar función escapeHtml() a Code.gs');
  Logger.log('    Ver CODE_REVIEW.md - Issues #1 y #2');
  
  // Tests que deberían pasar cuando se implemente:
  // assertEqual(escapeHtml('<script>alert("XSS")</script>'), '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;', 'Debe escapar tags HTML');
  // assertEqual(escapeHtml('O\'Reilly & Sons'), 'O&#039;Reilly &amp; Sons', 'Debe escapar comillas y ampersand');
  // assertEqual(escapeHtml(''), '', 'Debe manejar string vacío');
  // assertEqual(escapeHtml(null), '', 'Debe manejar null');
}

// ============================================================
// TEST SUITE: RATE LIMITING
// ============================================================

function testCheckRateLimit() {
  Logger.log('\n⏱️  Testing: checkRateLimit()');
  
  const testEmail = 'test.ratelimit@unal.edu.co';
  const cache = CacheService.getScriptCache();
  
  // Limpiar cache antes de empezar
  cache.remove('rateLimit_' + testEmail);
  
  // Test 1: Primer intento
  const result1 = checkRateLimit(testEmail);
  assertTrue(result1.permitido, 'Primer intento debe estar permitido');
  assertEqual(result1.intentos, 1, 'Debe registrar 1 intento');
  
  // Test 2: Segundo intento
  const result2 = checkRateLimit(testEmail);
  assertTrue(result2.permitido, 'Segundo intento debe estar permitido');
  assertEqual(result2.intentos, 2, 'Debe registrar 2 intentos');
  
  // Test 3: Tercer intento
  const result3 = checkRateLimit(testEmail);
  assertTrue(result3.permitido, 'Tercer intento debe estar permitido');
  assertEqual(result3.intentos, 3, 'Debe registrar 3 intentos');
  
  // Test 4: Cuarto intento - debe estar bloqueado
  const result4 = checkRateLimit(testEmail);
  assertFalse(result4.permitido, 'Cuarto intento debe estar bloqueado');
  assertGreaterThan(result4.intentos, 3, 'Debe tener más de 3 intentos');
  
  // Limpiar cache después del test
  cache.remove('rateLimit_' + testEmail);
}

// ============================================================
// TEST SUITE: VALIDACIÓN DE ESTADO DEL ESTUDIANTE
// ============================================================

function testValidarEstadoEstudiante() {
  Logger.log('\n👤 Testing: validarEstadoEstudiante()');
  
  // NOTA: Estos tests requieren un Sheet de prueba con datos mock
  // Por ahora son tests conceptuales
  
  Logger.log('⚠️  SKIPPED: Requiere Sheet de prueba con datos mock');
  Logger.log('    Para implementar:');
  Logger.log('    1. Crear spreadsheet de testing');
  Logger.log('    2. Agregar datos de prueba (seleccionados, duplicados, etc.)');
  Logger.log('    3. Crear función validarEstadoEstudiante_TEST() que use el sheet de prueba');
  
  // Test conceptual: Verificar fail-closed en errores
  Logger.log('⚠️  IMPORTANTE: Verificar que validarEstadoEstudiante() es fail-closed');
  Logger.log('    Línea 695 en Code.gs tiene FAIL-OPEN (retorna puedePostularse: true)');
  Logger.log('    DEBE CAMBIAR a: return { puedePostularse: false, tipo: "ERROR_VALIDACION" }');
}

// ============================================================
// TEST SUITE: DETECCIÓN DE POSTULACIONES DUPLICADAS
// ============================================================

function testDeteccionDuplicados() {
  Logger.log('\n🔍 Testing: Detección de duplicados');
  
  Logger.log('⚠️  SKIPPED: Requiere Sheet de prueba');
  Logger.log('    Tests necesarios:');
  Logger.log('    1. Estudiante NO puede postularse 2 veces a la MISMA convocatoria');
  Logger.log('    2. Estudiante NO puede postularse a nueva convocatoria si YA está seleccionado');
  Logger.log('    3. Estudiante NO puede postularse a 3ra convocatoria si tiene 2 pendientes');
  Logger.log('    4. Estudiante SÍ puede postularse si fue NO seleccionado anteriormente');
}

// ============================================================
// TEST SUITE: VALIDACIÓN DE EMAILS
// ============================================================

function testValidacionEmails() {
  Logger.log('\n📧 Testing: Validación de emails');
  
  // Test 1: Email institucional válido
  const validEmails = [
    'estudiante@unal.edu.co',
    'juan.perez@unal.edu.co',
    'MAYUSCULAS@UNAL.EDU.CO'
  ];
  
  validEmails.forEach(email => {
    const data = { correoElectronico: email, papa: '4.0', pbm: '75', numeroDocumento: '1234567890', telefono: '3001234567', primerNombre: 'Test', primerApellido: 'User' };
    const result = validarDatosPostulacion(data);
    assertTrue(result.isValid || !result.errors.some(e => e.includes('correo institucional')), 
              `Debe aceptar email institucional: ${email}`);
  });
  
  // Test 2: Emails inválidos
  const invalidEmails = [
    'test@gmail.com',
    'user@hotmail.com',
    'estudiante@unal.com',
    'test@edu.co',
    'test@',
    '@unal.edu.co'
  ];
  
  invalidEmails.forEach(email => {
    const data = { correoElectronico: email, papa: '4.0', pbm: '75', numeroDocumento: '1234567890', telefono: '3001234567', primerNombre: 'Test', primerApellido: 'User' };
    const result = validarDatosPostulacion(data);
    assertFalse(result.isValid, `Debe rechazar email no institucional: ${email}`);
  });
}

// ============================================================
// RUNNER PRINCIPAL
// ============================================================

function runAllTests() {
  Logger.log('🧪 INICIANDO TESTS DE CODE.GS');
  Logger.log('='.repeat(60));
  
  // Resetear contadores
  TestResults.passed = 0;
  TestResults.failed = 0;
  TestResults.errors = [];
  
  try {
    // Ejecutar suites de tests
    testValidarDatosPostulacion();
    testSanitizarDatos();
    testEscapeHtml();
    testCheckRateLimit();
    testValidarEstadoEstudiante();
    testDeteccionDuplicados();
    testValidacionEmails();
    
    // Imprimir resultados
    printTestResults();
    
  } catch (error) {
    Logger.log('\n❌ ERROR CRÍTICO EN TESTS:');
    Logger.log(error);
    Logger.log(error.stack);
  }
}

// ============================================================
// TESTS INDIVIDUALES (para debugging)
// ============================================================

function runValidationTests() {
  Logger.log('🧪 Ejecutando solo tests de validación');
  TestResults.passed = 0;
  TestResults.failed = 0;
  TestResults.errors = [];
  
  testValidarDatosPostulacion();
  testSanitizarDatos();
  testValidacionEmails();
  
  printTestResults();
}

function runSecurityTests() {
  Logger.log('🧪 Ejecutando solo tests de seguridad');
  TestResults.passed = 0;
  TestResults.failed = 0;
  TestResults.errors = [];
  
  testEscapeHtml();
  testCheckRateLimit();
  
  printTestResults();
}

function runBusinessLogicTests() {
  Logger.log('🧪 Ejecutando solo tests de lógica de negocio');
  TestResults.passed = 0;
  TestResults.failed = 0;
  TestResults.errors = [];
  
  testValidarEstadoEstudiante();
  testDeteccionDuplicados();
  
  printTestResults();
}
