# Guía de Testing - Banco de Perfiles Externos

Esta guía explica cómo ejecutar tests para el formulario de Banco de Perfiles Externos.

---

## 🧪 Tipos de Testing

### 1. **Backend Tests (Apps Script)**
Tests que corren directamente en Google Apps Script usando GasT framework.

**Qué se testea:**
- ✅ Funciones de configuración
- ✅ Validación de datos
- ✅ Generación de emails
- ✅ Escape de HTML (XSS prevention)
- ✅ Estructura de headers del Sheet
- ✅ Procesamiento de múltiples perfiles

### 2. **Frontend Tests (Jest + JSDOM)**
Tests que corren localmente usando Jest para JavaScript.

**Qué se testea:**
- ✅ Validación de formularios
- ✅ Recolección de datos
- ✅ Interacciones UI (toggle "Otro" apoyo)
- ✅ Gestión de múltiples perfiles
- ✅ Escape de HTML
- ✅ Validación de email

---

## 🚀 Backend Tests (Apps Script)

### Instalación

1. **Subir archivos a Apps Script:**
   ```bash
   # Los archivos ya están en tests/
   # Solo necesitas copiarlos a Apps Script
   ```

2. **En el editor de Apps Script:**
   - Abre: https://script.google.com/d/1rU2FPH8mSS2rGWpLjkEu_C8sciQEUNxCpN8YPLowxI7GQUeT9dlJQUIo/edit
   - Agregar archivo: **GasT.gs**
   - Pegar contenido de `tests/GasT.gs`
   - Agregar archivo: **BackendTests.gs**
   - Pegar contenido de `tests/BackendTests.gs`

### Ejecutar Tests

**Opción 1: Todos los tests**
```javascript
// En Apps Script, seleccionar función:
runAllTests()
// Clic en Ejecutar ▶
// Ver resultados en: Ver > Registros de ejecución (Ctrl+Enter)
```

**Opción 2: Tests individuales**
```javascript
// Ejecutar solo tests de configuración:
testConfig()

// Ejecutar solo tests de validación:
testValidation()

// Ejecutar solo tests de email:
testEmail()
```

### Resultados Esperados

```
========================================
TEST: getConfigExternos() returns valid configuration
========================================
  ✓ Config object exists
  ✓ Config has spreadsheetId
  ✓ Config has emailNotificacion
  ✓ Email is correct
✅ PASSED - getConfigExternos() returns valid configuration
   Assertions: 4 passed

========================================
TEST SUMMARY
========================================
Total tests: 8
Passed: 8 ✅
Failed: 0 ❌
Success rate: 100.00%
========================================
```

---

## 🧪 Frontend Tests (Jest)

### Instalación

1. **Instalar dependencias:**
   ```bash
   cd sections/banco-perfiles-externos/tests
   npm install
   ```

2. **Estructura de archivos:**
   ```
   tests/
   ├── package.json           # Configuración Jest
   ├── frontend.test.js       # Tests del frontend
   └── TESTING.md            # Esta guía
   ```

### Ejecutar Tests

**Todos los tests:**
```bash
npm test
```

**Watch mode (auto-refresh):**
```bash
npm run test:watch
```

**Con cobertura:**
```bash
npm run test:coverage
```

### Resultados Esperados

```
 PASS  frontend.test.js
  Banco de Perfiles Externos - Frontend Tests
    Validation Functions
      ✓ escapeHtml prevents XSS attacks (2 ms)
      ✓ validateEmail accepts valid emails (1 ms)
      ✓ validateEmail rejects invalid emails (1 ms)
    Form Data Collection
      ✓ collects entity data correctly (3 ms)
      ✓ collects profile data with "Otro" apoyo correctly (2 ms)
    Profile Management
      ✓ creates perfil card with correct structure (1 ms)
      ✓ perfil card does not contain "Habilidades" field (1 ms)
      ✓ tipo apoyo does not have "Ninguno" option (1 ms)
    UI Interactions
      ✓ toggleOtroApoyo shows textarea when "Otro" is checked (2 ms)
    Data Validation
      ✓ validates required entity fields (1 ms)
      ✓ validates "Otro" apoyo requires text (1 ms)
    Multiple Profiles
      ✓ can add multiple profiles (1 ms)
      ✓ maintains at least one profile (1 ms)
    Programs Selection
      ✓ allows selecting multiple programs (1 ms)

Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        1.234 s
```

---

## 📝 Tests Incluidos

### Backend Tests (GasT)

| Test | Descripción | Archivo |
|------|-------------|---------|
| `testConfigurationFunctions()` | Valida configuración del proyecto | BackendTests.gs |
| `testValidationFunctions()` | Valida datos del formulario | BackendTests.gs |
| `testDataProcessing()` | Procesa múltiples perfiles | BackendTests.gs |
| `testEmailGeneration()` | Genera emails HTML válidos | BackendTests.gs |
| `testSheetOperations()` | Verifica estructura de Sheet | BackendTests.gs |

### Frontend Tests (Jest)

| Suite | Tests | Descripción |
|-------|-------|-------------|
| Validation Functions | 3 | Email validation, XSS prevention |
| Form Data Collection | 2 | Recolección de datos entidad/perfil |
| Profile Management | 3 | Creación de cards, campos removidos |
| UI Interactions | 1 | Toggle campo "Otro" |
| Data Validation | 2 | Validación campos requeridos |
| Multiple Profiles | 2 | Agregar/remover perfiles |
| Programs Selection | 1 | Selección múltiple programas |

---

## ✅ Checklist de Testing

### Pre-Deployment Testing

- [ ] **Backend Tests (Apps Script)**
  - [ ] Todos los tests pasan (100%)
  - [ ] No hay errores en logs
  - [ ] Configuración válida

- [ ] **Frontend Tests (Jest)**
  - [ ] Todos los tests pasan (100%)
  - [ ] Cobertura > 80%
  - [ ] No hay warnings

- [ ] **Manual Testing**
  - [ ] Formulario se carga correctamente
  - [ ] Validaciones funcionan en tiempo real
  - [ ] Se pueden agregar/duplicar/eliminar perfiles
  - [ ] Campo "Otro" aparece/desaparece correctamente
  - [ ] No aparece campo "Habilidades"
  - [ ] No aparece opción "Ninguno" en apoyo
  - [ ] Submit envía datos correctamente
  - [ ] Email se recibe con formato correcto
  - [ ] Datos se guardan en Sheet correctamente

### Post-Deployment Testing

- [ ] **Prueba en Producción**
  - [ ] URL `/exec` accesible
  - [ ] Formulario funciona en Google Sites iframe
  - [ ] Email llega a `practicas_paz@unal.edu.co`
  - [ ] Datos en pestaña "Perfiles Externos"
  - [ ] Formato de datos correcto (20 columnas)

---

## 🐛 Debugging

### Ver logs en Apps Script

```javascript
// En cualquier función:
Logger.log('Debug info:', variable);
Logger.log(JSON.stringify(object, null, 2));

// Ver logs:
// Ver > Registros de ejecución (Ctrl+Enter)
```

### Ver logs en Jest

```javascript
// En los tests:
console.log('Debug:', variable);

// Ejecutar con verbose:
npm test -- --verbose
```

### Common Issues

**"Cannot read property of undefined"**
```javascript
// Usa optional chaining:
const value = obj?.prop?.subprop || 'default';
```

**"Element not found"**
```javascript
// Verifica que el DOM esté configurado:
beforeEach(() => {
  document.body.innerHTML = `...`;
});
```

---

## 📊 Cobertura de Código

### Ver reporte de cobertura:

```bash
npm run test:coverage
```

**Salida:**
```
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
All files                 |   85.71 |    78.57 |   90.00 |   85.71 |
 frontend functions       |   88.24 |    80.00 |   92.31 |   88.24 |
--------------------------|---------|----------|---------|---------|
```

**Meta de cobertura:** > 80% en todas las categorías

---

## 🔄 CI/CD Integration

Para integrar en un pipeline de CI/CD (GitHub Actions, GitLab CI, etc.):

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd sections/banco-perfiles-externos/tests && npm install
      - run: cd sections/banco-perfiles-externos/tests && npm test
```

---

## 📚 Recursos Adicionales

**GasT Framework:**
- GitHub: https://github.com/zixia/gast
- Docs: Tests unitarios para Apps Script

**Jest:**
- Website: https://jestjs.io/
- Docs: https://jestjs.io/docs/getting-started

**Testing Library:**
- Website: https://testing-library.com/
- Docs: https://testing-library.com/docs/dom-testing-library/intro

---

## 🎯 Mejores Prácticas

1. **Ejecuta tests antes de cada deploy:**
   ```bash
   npm test && clasp push && clasp deploy
   ```

2. **Mantén tests actualizados:**
   - Cuando agregas una función → agrega un test
   - Cuando encuentras un bug → escribe un test que lo reproduzca

3. **Tests descriptivos:**
   ```javascript
   // ✅ Bueno
   test('validates "Otro" apoyo requires text', () => { ... });
   
   // ❌ Malo
   test('test1', () => { ... });
   ```

4. **Usa mocks para dependencias externas:**
   ```javascript
   mockGoogle = {
     script: {
       run: {
         withSuccessHandler: jest.fn().mockReturnThis()
       }
     }
   };
   ```

5. **Aísla tests:**
   - Cada test debe ser independiente
   - Usa `beforeEach` para setup
   - Usa `afterEach` para cleanup

---

## 📞 Soporte

**Universidad Nacional de Colombia - Sede de La Paz**  
Email: practicas_paz@unal.edu.co

**Problemas con tests:**
- Revisa logs en Apps Script
- Ejecuta `npm test -- --verbose` para más información
- Verifica que las dependencias estén instaladas
