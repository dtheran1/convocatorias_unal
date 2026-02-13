# 🚀 Quick Start - Testing en 5 Minutos

Guía rápida para empezar a testear Code.gs hoy mismo.

---

## ⚡ Paso a Paso

### 1️⃣ Copia el archivo de tests (1 min)

```
1. Abre: script.google.com
2. Selecciona tu proyecto "Convocatorias"
3. Haz clic en el + junto a "Archivos"
4. Selecciona "Script"
5. Nómbralo: CodeTests
6. Copia y pega el contenido de tests/CodeTests.gs
7. Guarda (Ctrl+S)
```

### 2️⃣ Ejecuta los tests (30 seg)

```
1. Selecciona función: runAllTests (dropdown arriba)
2. Haz clic en Run ▶️
3. Autoriza permisos (solo la primera vez)
4. Espera 5 segundos
```

### 3️⃣ Ve los resultados (30 seg)

```
1. View → Logs (o Ctrl+Enter)
2. Busca el resumen al final:

   ============================================================
   TEST RESULTS SUMMARY
   ============================================================
   ✅ Passed: 27
   ❌ Failed: 0
   Total: 27

   🎉 ALL TESTS PASSED!
   ============================================================
```

---

## 📊 ¿Qué se está testeando?

| Test Suite | Tests | Estado |
|------------|-------|--------|
| ✅ Validación de emails | 9 | Funcional |
| ✅ Validación PAPA/PBM | 6 | Funcional |
| ✅ Validación teléfonos/docs | 4 | Funcional |
| ✅ Sanitización de datos | 4 | Funcional |
| ✅ Rate limiting | 4 | Funcional |
| ⚠️ Escape HTML (XSS) | 0 | Pendiente |
| ⚠️ Estado estudiante | 0 | Requiere mock data |
| ⚠️ Detección duplicados | 0 | Requiere mock data |

**Total:** 27 tests funcionales, 3 pendientes

---

## 🔥 Tests Más Importantes

### 1. Rate Limiting ✅
```javascript
Verifica que después de 3 intentos, 
el 4to intento es BLOQUEADO.
```

### 2. Email Institucional ✅
```javascript
Solo acepta @unal.edu.co
Rechaza gmail.com, hotmail.com, etc.
```

### 3. PAPA Válido ✅
```javascript
Acepta: 3.0 - 5.0
Rechaza: < 3.0 o > 5.0
```

### 4. Teléfono Colombiano ✅
```javascript
Acepta: 10 dígitos, inicia con 3
Rechaza: otros formatos
```

---

## ⚠️ Issues Detectados

### 🔴 CRÍTICO: XSS en emails
```javascript
// Code.gs línea 793
<p>${nombreCompleto}</p>  // ❌ SIN ESCAPE

// Debe ser:
<p>${escapeHtml(nombreCompleto)}</p>  // ✅ CON ESCAPE
```

**Acción:** Implementar función `escapeHtml()` (ver tests/README.md)

### 🔴 CRÍTICO: Fail-open en validación
```javascript
// Code.gs línea 695
return { puedePostularse: true };  // ❌ PELIGROSO

// Debe ser:
return { puedePostularse: false, tipo: 'ERROR_VALIDACION' };  // ✅ SEGURO
```

**Acción:** Cambiar a fail-closed

---

## 🎯 Próximos Pasos

### Opción A: Arreglar issues críticos
```bash
1. Implementar escapeHtml() en Code.gs
2. Cambiar fail-open a fail-closed (línea 695)
3. Ejecutar tests nuevamente
4. Verificar que pasan todos
```

### Opción B: Agregar más tests
```bash
1. Crear spreadsheet de prueba
2. Agregar datos mock (estudiantes, postulaciones)
3. Implementar testValidarEstadoEstudiante()
4. Implementar testDeteccionDuplicados()
```

### Opción C: Testing de frontend
```bash
1. Testear Index.html (formulario de postulación)
2. Testear validaciones en tiempo real
3. Testear flujo multi-step
4. Testear modales y filtros
```

---

## 🆘 Troubleshooting

### ❌ "ReferenceError: checkRateLimit is not defined"
**Solución:** El archivo CodeTests.gs debe estar en el MISMO proyecto que Code.gs

### ❌ "Authorization required"
**Solución:** Haz clic en "Review permissions" y autoriza

### ❌ "No se ven los logs"
**Solución:** View → Logs (o Ctrl+Enter). Si no aparecen, espera 10 segundos más.

### ❌ Muchos tests fallan
**Solución:** Verifica que Code.gs tiene las funciones actualizadas. Los tests asumen que tienes el código más reciente.

---

## 📖 Documentación Completa

- **tests/README.md** - Documentación completa de testing
- **CODE_REVIEW.md** - 21 issues de seguridad detectados
- **AGENTS.md** - Guía de estilo y arquitectura

---

## ✅ Checklist de Testing

- [ ] Tests instalados en Google Apps Script
- [ ] `runAllTests()` ejecutado exitosamente
- [ ] Resultados revisados en logs
- [ ] Issues críticos identificados
- [ ] Plan de acción definido
- [ ] Tests corriendo en cada deploy

---

**Tiempo total:** 5 minutos
**Dificultad:** Fácil
**Beneficio:** Alto - Detecta bugs antes de producción

¡Feliz testing! 🎉
