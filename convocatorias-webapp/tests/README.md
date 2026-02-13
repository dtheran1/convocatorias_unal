# Testing Guide - Convocatorias Webapp

Documentación completa para ejecutar tests en el proyecto Google Apps Script.

---

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Ejecutar Tests](#ejecutar-tests)
3. [Tests Disponibles](#tests-disponibles)
4. [Interpretar Resultados](#interpretar-resultados)
5. [Crear Nuevos Tests](#crear-nuevos-tests)
6. [Issues Conocidos](#issues-conocidos)

---

## 🚀 Configuración Inicial

### Paso 1: Agregar el archivo de tests

1. Abre tu proyecto en Google Apps Script (script.google.com)
2. Haz clic en el botón **+** junto a "Archivos"
3. Selecciona **Script**
4. Nombra el archivo: `CodeTests`
5. Copia y pega el contenido de `tests/CodeTests.gs`
6. Guarda (Ctrl+S)

### Paso 2: Verificar permisos

Los tests necesitan acceso a:
- ✅ Google Sheets (leer datos de prueba)
- ✅ Cache Service (test de rate limiting)
- ✅ Logger (mostrar resultados)

No se requiere configuración adicional.

---

## ▶️ Ejecutar Tests

### Opción 1: Ejecutar TODOS los tests

1. En el editor de Apps Script, selecciona la función **`runAllTests`** del dropdown
2. Haz clic en **Run** (▶️)
3. Autoriza los permisos si es la primera vez
4. Espera 5-10 segundos
5. Abre los logs: **View → Logs** (o `Ctrl+Enter`)

### Opción 2: Ejecutar tests específicos

Para ejecutar solo ciertos grupos de tests:

```javascript
// Solo tests de validación
runValidationTests()

// Solo tests de seguridad
runSecurityTests()

// Solo tests de lógica de negocio
runBusinessLogicTests()
```

### Opción 3: Ejecutar tests individuales

Puedes ejecutar cualquier función `test*()` directamente desde el dropdown.

---

## 🧪 Tests Disponibles

### 1. `testValidarDatosPostulacion()` ✅

**Qué prueba:**
- Email institucional (@unal.edu.co)
- PAPA entre 3.0 y 5.0
- PBM entre 0 y 100 (entero)
- Número de documento (6-12 dígitos)
- Teléfono colombiano (10 dígitos, inicia con 3)
- Nombres con solo letras, tildes, ñ

**Tests incluidos:** 10 casos de prueba

**Estado:** ✅ Funcional

---

### 2. `testSanitizarDatos()` ✅

**Qué prueba:**
- Eliminación de espacios (trim)
- Conversión de email a minúsculas
- Formateo de PAPA con 2 decimales
- Conversión de PBM a entero

**Tests incluidos:** 4 casos de prueba

**Estado:** ✅ Funcional

---

### 3. `testEscapeHtml()` ⚠️

**Qué prueba:**
- Escape de caracteres HTML peligrosos (`<`, `>`, `&`, `"`, `'`)
- Prevención de XSS en templates de email

**Tests incluidos:** 0 (pendiente implementación)

**Estado:** ⚠️ **SKIPPED** - La función `escapeHtml()` NO existe aún en Code.gs

**Acción requerida:**
1. Agregar función `escapeHtml()` a Code.gs:
```javascript
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```
2. Usar en templates de email (líneas 793, 800, 804, 1057, 1068, 1175)
3. Ejecutar tests nuevamente

---

### 4. `testCheckRateLimit()` ✅

**Qué prueba:**
- Primer intento permitido
- Segundo intento permitido
- Tercer intento permitido
- Cuarto intento BLOQUEADO (rate limit activado)

**Tests incluidos:** 4 casos de prueba

**Estado:** ✅ Funcional

**Nota:** Usa CacheService, los datos persisten ~6 horas

---

### 5. `testValidarEstadoEstudiante()` ⚠️

**Qué prueba:**
- Detección de estudiante ya seleccionado
- Detección de postulación duplicada
- Límite de 2 postulaciones pendientes
- Fail-closed en errores

**Tests incluidos:** 0 (requiere datos mock)

**Estado:** ⚠️ **SKIPPED** - Requiere spreadsheet de prueba

**Para implementar:**
1. Crear spreadsheet de testing
2. Agregar datos de prueba (estudiantes seleccionados, duplicados, etc.)
3. Crear función `validarEstadoEstudiante_TEST()` que use el sheet de prueba
4. Ejecutar tests

**⚠️ ISSUE CRÍTICO:** Línea 695 tiene **fail-open** (retorna `puedePostularse: true` en errores)
- **Debe cambiar a:** `return { puedePostularse: false, tipo: 'ERROR_VALIDACION' }`

---

### 6. `testDeteccionDuplicados()` ⚠️

**Qué prueba:**
- NO permitir 2 postulaciones a la MISMA convocatoria
- NO permitir postulación si ya está seleccionado
- NO permitir 3ra postulación con 2 pendientes
- SÍ permitir si fue NO seleccionado anteriormente

**Tests incluidos:** 0 (requiere datos mock)

**Estado:** ⚠️ **SKIPPED** - Requiere spreadsheet de prueba

---

### 7. `testValidacionEmails()` ✅

**Qué prueba:**
- Emails institucionales válidos
- Emails no institucionales rechazados
- Case-insensitive (mayúsculas/minúsculas)

**Tests incluidos:** 9 casos de prueba

**Estado:** ✅ Funcional

---

## 📊 Interpretar Resultados

### Ejemplo de salida exitosa

```
🧪 INICIANDO TESTS DE CODE.GS
============================================================

📋 Testing: validarDatosPostulacion()
✅ PASS: Debe validar datos correctos
✅ PASS: No debe tener errores con datos válidos
✅ PASS: Debe rechazar email no institucional
...

============================================================
TEST RESULTS SUMMARY
============================================================
✅ Passed: 27
❌ Failed: 0
Total: 27

🎉 ALL TESTS PASSED!
============================================================
```

### Ejemplo de salida con fallos

```
============================================================
TEST RESULTS SUMMARY
============================================================
✅ Passed: 24
❌ Failed: 3
Total: 27

❌ FAILED TESTS:
  1. Debe rechazar PAPA > 5.0 (Expected: false, Got: true)
  2. Debe escapar tags HTML (Expected: &lt;script&gt;, Got: <script>)
  3. Cuarto intento debe estar bloqueado (Expected: false, Got: true)
============================================================
```

---

## ✍️ Crear Nuevos Tests

### Estructura básica

```javascript
function testMiFuncion() {
  Logger.log('\n🧪 Testing: miFuncion()');
  
  // Arrange (preparar)
  const input = { campo: 'valor' };
  
  // Act (ejecutar)
  const result = miFuncion(input);
  
  // Assert (verificar)
  assertTrue(result.success, 'Debe retornar success: true');
  assertEqual(result.data, 'esperado', 'Debe retornar el dato correcto');
}
```

### Funciones de assertion disponibles

```javascript
assert(condition, message)                    // Condición booleana
assertEqual(actual, expected, message)        // Igualdad estricta
assertNotEqual(actual, unexpected, message)   // Desigualdad
assertTrue(value, message)                    // Debe ser true
assertFalse(value, message)                   // Debe ser false
assertContains(array, value, message)         // Array debe contener valor
assertGreaterThan(actual, threshold, message) // Mayor que
assertLessThan(actual, threshold, message)    // Menor que
```

### Agregar test al runner

1. Escribe tu función `testMiNuevaFuncion()`
2. Agrégala a `runAllTests()`:

```javascript
function runAllTests() {
  // ... tests existentes
  testMiNuevaFuncion();  // ← Agregar aquí
  
  printTestResults();
}
```

---

## ⚠️ Issues Conocidos

### 1. XSS en templates de email (CRÍTICO)
- **Archivo:** Code.gs líneas 793, 800, 804, 1057, 1068, 1175
- **Issue:** No se escapa HTML en datos interpolados
- **Fix:** Implementar y usar `escapeHtml()`
- **Ver:** CODE_REVIEW.md Issue #1

### 2. Fail-open en validación (CRÍTICO)
- **Archivo:** Code.gs línea 695
- **Issue:** Retorna `puedePostularse: true` en errores
- **Fix:** Cambiar a `puedePostularse: false`
- **Ver:** CODE_REVIEW.md Issue #3

### 3. Tests de integración pendientes
- `testValidarEstadoEstudiante()` requiere sheet de prueba
- `testDeteccionDuplicados()` requiere datos mock
- Crear spreadsheet de testing separado

### 4. Loose equality (==) en Code.gs
- **Issue:** Uso de `==` en lugar de `===`
- **Fix:** Reemplazar todas las comparaciones con `===`
- **Ver:** CODE_REVIEW.md Issue #6

---

## 📚 Recursos Adicionales

- **CODE_REVIEW.md** - 21 issues de seguridad y best practices
- **AGENTS.md** - Guía de estilo y arquitectura
- **Google Apps Script Testing Best Practices:** https://developers.google.com/apps-script/guides/testing

---

## 🤝 Contribuir

Para agregar nuevos tests:

1. Identifica función crítica en Code.gs
2. Escribe test siguiendo el patrón existente
3. Ejecuta `runAllTests()` para verificar
4. Documenta el test en este README

---

## 📞 Soporte

Si tienes problemas con los tests:

1. Verifica que autorizaste los permisos
2. Revisa los logs (Ctrl+Enter)
3. Ejecuta tests individuales para aislar el problema
4. Consulta CODE_REVIEW.md para issues conocidos

---

**Última actualización:** 2026-02-12
**Versión:** 1.0
**Autor:** Testing team - UNAL Sede de La Paz
