# Code Review — Best Practices Audit
**Proyecto:** convocatorias-webapp
**Referencia:** skill `code-best-practices`
**Contexto:** Production user-facing → todo el checklist aplica
**Fecha:** 2026-02-03

---

## Resumen Ejecutivo

| Impacto | Cantidad | Arreglar |
|---------|----------|----------|
| Alto | 7 | SIEMPRE — antes de cualquier otra cosa |
| Medio | 9 | En código activo |
| Bajo | 5 | Si hay tiempo |

El código tiene una estructura sólida: validación dúplex (cliente + servidor), rate limiting, error handling por tipos, y sanitización. Sin embargo hay 3 vulnerabilidades de seguridad que son bloqueantes en producción, y varios patrones que generan deuda técnica acumulable.

---

## ALTO IMPACTO

### 1. XSS en plantillas de correo electrónico
**Archivos:** `Code.gs:793`, `Code.gs:800`, `Code.gs:804`, `Code.gs:1057`, `Code.gs:1068`, `Code.gs:1175`
**Por qué:** Los tres templates de email (`generarCorreoConfirmacion`, `generarCorreoSeleccionado`, `generarCorreoNoSeleccionado`) interpolan datos del usuario directamente en HTML sin escaping:

```javascript
// Code.gs:793 — VULNERABLE
<p class="greeting">Estimado(a) <strong>${nombreCompleto}</strong>,</p>

// Code.gs:1175 — ESPECIALMENTE CRITICO: dato controlado por admin
<p>"${datos.observaciones}"</p>
```

`nombreCompleto` viene del spreadsheet (dato del estudiante). `datos.observaciones` es editado por un administrador en el sheet. Cualquiera de los dos puede contener HTML/script que se ejecuta en el cliente que recibe el correo.

**Fix:**
```javascript
// Agregar función de escape y usarla en TODOS los templates
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Ejemplo de uso en template:
<p class="greeting">Estimado(a) <strong>${escapeHtml(nombreCompleto)}</strong>,</p>
<p>"${escapeHtml(datos.observaciones)}"</p>
```

---

### 2. XSS en mensajes de error del frontend
**Archivo:** `Index.html:2539`, `Index.html:2557`, `Index.html:3367`, `Index.html:3391`, `Index.html:3408`
**Por qué:** Las funciones que pintan estados de error/resultado usan `innerHTML` con datos que vienen del servidor sin escaping:

```javascript
// Index.html:2539 — showError: message viene del backend
container.innerHTML = `<p>${message}</p>`;

// Index.html:3367 — showSeleccionadoMessage: datos.titulo viene del sheet
<p style="...">${datos.titulo || 'No disponible'}</p>

// Index.html:3391 — showNoSeleccionadoMessage: dato editable por admin
<p style="...">${datos.observaciones || 'Sin observaciones registradas.'}</p>

// Index.html:3408 — showErrorMessage: titulo y mensaje sin escape
<h3 style="...">${titulo}</h3>
<p>${mensaje}</p>
```

El `escapeHtml` que ya existe en el archivo (línea 2916) **no se usa** en estos contextos. Mismo dato, distinto tratamiento.

**Fix:** Usar la función `escapeHtml` ya existente en cada interpolación:
```javascript
<p>${escapeHtml(datos.observaciones || 'Sin observaciones registradas.')}</p>
```

---

### 3. Fail-open en validación de estado del estudiante
**Archivo:** `Code.gs:693-696`
**Por qué:** Si `validarEstadoEstudiante()` lanza cualquier excepción, el catch retorna `puedePostularse: true`. El sistema **permite la postulación por defecto en caso de error**. Esto invierte la lógica de seguridad: un error en la validación debería bloquear, no permitir.

```javascript
// Code.gs:693-696 — FAIL-OPEN
} catch (error) {
  console.error('Error al validar estado del estudiante:', error);
  return { puedePostularse: true }; // ← PELIGROSO
}
```

**Fix:** Fail-closed:
```javascript
} catch (error) {
  console.error('Error al validar estado del estudiante:', error);
  return {
    puedePostularse: false,
    tipo: 'VALIDATION_ERROR',
    mensaje: 'No se pudo verificar su estado. Por favor intente más tarde.'
  };
}
```

---

### 4. IDs de spreadsheet expuestos en código versionado
**Archivos:** `Code.gs:35-38`, `Code.gs:1218-1223`
**Por qué:** Los IDs de los sheets de Google están en texto plano en dos lugares del código que está en git. Cualquiera con acceso al repo conoce los IDs de los spreadsheets que contienen datos de estudiantes (nombre, documento, email, teléfono, PAPA, PBM).

```javascript
// Code.gs:35-38 — Fallbacks hardcoded
'SPREADSHEET_ID': '1iNF7VwBPS_Txxk7c14JSefGKFD_D-0eZPc6s8geBGkk',
'SPREADSHEET_POSTULACIONES_ID': '1TPD-_1DjYE7hX7GLDQSuOpRiGsNT-GTjzeij-eG4Qts',

// Code.gs:1218-1223 — setupConfiguration tiene los mismos IDs
'SPREADSHEET_ID': '1iNF7VwBPS_Txxk7c14JSefGKFD_D-0eZPc6s8geBGkk',
```

**Fix:** Eliminar los fallbacks del `getConfig()`. Si la property no existe, lanzar error explícito en vez de usar valor hardcoded. `setupConfiguration()` puede quedar como utilidad de inicialización única, pero los IDs deben estar en un archivo `.env` o ser ingresados manualmente en Script Properties desde la UI de Apps Script, nunca en el código.

```javascript
function getConfig(key) {
  const value = PropertiesService.getScriptProperties().getProperty(key);
  if (!value) {
    throw new Error(`Configuración faltante: ${key}. Ejecuta setupConfiguration().`);
  }
  return value;
}
```

---

### 5. Google Drive file ID expuesto en frontend
**Archivo:** `Index.html:2445`
**Por qué:** El fallback JSON usa un ID de archivo de Drive directamente en el código:

```javascript
// Index.html:2445
const jsonUrl = 'https://drive.google.com/uc?export=download&id=1mqR3PsAH9oMU2I2ccLy_8H1F-0eQ2HBU';
```

Mismo problema que el punto 4: dato de infraestructura expuesto en un repo público o accesible.

**Fix:** Si este fallback es necesario, poner la URL en una variable de configuración que no esté en git. Si no es necesario (Apps Script siempre estará disponible), eliminarlo.

---

### 6. Loose equality (`==`) en comparación de datos críticos
**Archivo:** `Code.gs:626`, `Code.gs:631`, `Code.gs:644`
**Por qué:** La función `validarEstadoEstudiante` compara documentos e IDs de convocatoria con `==`:

```javascript
// Code.gs:626
if (docRow == numeroDocumento) {

// Code.gs:631
if (idConv == idConvocatoria) {

// Code.gs:644
} else if (estado === 'no seleccionado' && idConv == idConvocatoria) {
```

`docRow` viene del spreadsheet (puede ser number si Google Sheets lo interpretó así). `numeroDocumento` viene del formulario (string). `"12345" == 12345` es `true`, pero esto es incidental — si algún valor es `0` o `""`, la coercion produce resultados silenciosamente incorrectos. El resto del archivo usa `===` consistentemente; estas líneas son la excepción.

**Fix:** Usar strict equality y normalizar tipos:
```javascript
if (String(docRow) === String(numeroDocumento)) {
```

---

### 7. postMessage sin validación de origen
**Archivo:** `Index.html:2357`
**Por qué:** La comunicación con el iframe padre usa `'*'` como target origin:

```javascript
// Index.html:2357
window.parent.postMessage({ type: 'setHeight', height: ... }, '*');
```

Cualquier página que embedde esta app en un iframe puede interceptar estos mensajes. En este caso el payload es solo una altura (bajo riesgo directo), pero es un patrón inseguro que debe corregirse.

**Fix:** Especificar el origen esperado:
```javascript
window.parent.postMessage({ type: 'setHeight', height: ... }, 'https://sites.google.com');
```

---

## MEDIO IMPACTO

### 8. Lógica de validación duplicada cliente-servidor
**Archivos:** `Index.html:2936-3063` (cliente) vs `Code.gs:365-445` (servidor)
**Por qué:** Las regex, rangos numéricos y reglas de campo están escritas dos veces independientemente. Si se cambia la regla del server (ej: PAPA máximo 4.5), el cliente sigue permitiendo 5.0 hasta que alguien note la inconsistencia.

Ejemplos concretos duplicados:
- Regex de nombres: `/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{1,50}$/` — misma en ambos
- Documento: `/^\d{6,12}$/` — misma en ambos
- Teléfono: `/^3\d{9}$/` — misma en ambos
- PAPA: `0-5, max 2 decimales` — misma en ambos

**Fix:** Extraer las reglas a un objeto de configuración compartido. En Apps Script no hay `import`, pero se puede crear un objeto `VALIDATION_RULES` en `Code.gs` que el frontend también declare (una sola fuente de verdad en el server, la otra es referencia documentada).

---

### 9. Números mágicos dispersos
**Archivos y líneas:**

| Valor | Archivo:Línea | Qué representa |
|-------|---------------|----------------|
| `2` | `Code.gs:682` | Límite de postulaciones pendientes |
| `17` | `Code.gs:919` | Cantidad de columnas del sheet |
| `200` | `Index.html:2651` | Caracteres de truncamiento de descripción |
| `6` | `Index.html:2472` | Cantidad de skeleton cards |
| `480`, `768` | `Index.html:2311` | Breakpoints de dispositivo |
| `700/650/600` | `Index.html:2323-2327` | Alturas mínimas sin contenido |
| `1400/1100/800` | `Index.html:2332-2334` | Alturas mínimas con contenido |
| `100`, `50` | `Index.html:2351` | Padding extra por dispositivo |

**Fix:** Extraer a constantes nombradas en la sección de configuración de cada archivo:
```javascript
// Code.gs
const MAX_POSTULACIONES_PENDIENTES = 2;
const TOTAL_COLUMNAS_POSTULACIONES = Object.keys(COL_POST).length;

// Index.html
const DESCRIPCION_MAX_CHARS = 200;
const SKELETON_CARD_COUNT = 6;
```

---

### 10. Nombre completo se construye de dos formas distintas
**Archivos:** `Code.gs:719` vs `Code.gs:1004-1010`
**Por qué:** Existe la función `construirNombreCompleto()` (línea 1004) para esto exactamente, pero en `enviarCorreoConfirmacionPostulacion` (línea 719) se hace inline con la misma lógica:

```javascript
// Code.gs:719 — inline duplicado
const nombreCompleto = (datos.primerNombre + ' ' + (datos.segundoNombre || '') + ' ' + datos.primerApellido + ' ' + (datos.segundoApellido || '')).trim().replace(/\s+/g, ' ');

// Code.gs:1004 — función que ya hace esto
function construirNombreCompleto(datos) { ... }
```

**Fix:** Reemplazar línea 719 con `const nombreCompleto = construirNombreCompleto(datos);`

---

### 11. ~200 líneas de CSS duplicado en los 3 templates de email
**Archivos:** `Code.gs:760-846`, `Code.gs:1022-1046`, `Code.gs:1118-1142`
**Por qué:** Cada template de email tiene su propio bloque `<style>` con reglas casi idénticas (`body`, `.container`, `.content`, `.info-card`, `.footer`, etc.). Cambiar un color o font en uno no cambia en los otros.

**Fix:** Extraer el CSS base a una constante compartida:
```javascript
const EMAIL_BASE_CSS = `
  body { font-family: Arial, sans-serif; line-height: 1.6; ... }
  .container { max-width: 600px; margin: 0 auto; }
  /* ... reglas comunes ... */
`;

function generarCorreoConfirmacion(nombreCompleto, datos) {
  return `<html><head><style>${EMAIL_BASE_CSS}
    /* CSS específico de este template si hace falta */
  </style></head>...`;
}
```

---

### 12. `getProgramasAcademicos()` lee el sheet completo por segunda vez
**Archivo:** `Code.gs:207`
**Por qué:** Llama internamente a `getConvocatorias()`, que ya lee todo el spreadsheet. Si el frontend llama a ambas funciones, el sheet se lee dos veces consecutivas sin necesidad.

```javascript
// Code.gs:207
function getProgramasAcademicos() {
  const resultado = getConvocatorias(); // ← lee el sheet OTRA VEZ
```

**Fix:** Extraer los programas directamente de los datos ya retornados por `getConvocatorias()` en el frontend, o recibir los programas como parte de la respuesta de `getConvocatorias()`.

---

### 13. Sin caching de datos del spreadsheet
**Archivo:** `Code.gs:129`, `Code.gs:615`
**Por qué:** Cada llamada a `getConvocatorias()` y `validarEstadoEstudiante()` hace `sheet.getDataRange().getValues()` — una lectura completa del sheet. Apps Script tiene `CacheService` disponible para este caso exacto.

**Fix:** Cache de corto plazo (60-120 segundos) para `getConvocatorias`. Las postulaciones no deben cachear (datos de escritura activa), pero las convocatorias cambian raramente.

```javascript
function getConvocatorias() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('convocatorias');
  if (cached) return JSON.parse(cached);

  // ... lógica actual de lectura ...

  cache.put('convocatorias', JSON.stringify(result), 120); // 2 min
  return result;
}
```

---

### 14. Patrón `formOriginalHTML` es frágil
**Archivo:** `Index.html:3109`, `Index.html:3118-3123`
**Por qué:** El formulario se "restaura" guardando y reemplazando innerHTML como string:

```javascript
// Index.html:3118
if (!formOriginalHTML) {
  formOriginalHTML = document.getElementById('postulacionBody').innerHTML;
} else {
  document.getElementById('postulacionBody').innerHTML = formOriginalHTML;
}
```

Si algo modifica el DOM del formulario (validación, estado, etc.) entre restauraciones, esos cambios se pierden silenciosamente. Es un patrón error-prone.

**Fix:** Clonar el nodo original al inicio:
```javascript
const postulacionBody = document.getElementById('postulacionBody');
const formTemplate = postulacionBody.cloneNode(true); // guardar una vez

// Para restaurar:
postulacionBody.innerHTML = formTemplate.innerHTML;
```

---

### 15. Inconsistencia en logging: `Logger.log` vs `console.log` vs `console.error`
**Archivo:** `Code.gs` — mezclados por todo el archivo
**Por qué:** Apps Script tiene dos sistemas de logging: `Logger.log` (visible en el logger de Apps Script) y `console.log`/`console.error` (visible en Cloud Logging). El código usa los tres indistintamente:

- `Code.gs:102` → `Logger.log`
- `Code.gs:119` → `Logger.log`
- `Code.gs:191` → `console.error`
- `Code.gs:329` → `console.log`

**Fix:** Standardizar en `console.log`/`console.error` (Cloud Logging es más potente y searchable que el Logger legacy).

---

### 16. Inconsistencia en nombres de variables entre backend y frontend
**Por qué:** El backend retorna `{ success, error, tipo, datos }` pero algunos campos no son consistentes:

- `guardarPostulacion` retorna `tipo` para el tipo de error
- `getConvocatorias` retorna `error` como string directamente (sin `tipo`)
- En `onEditPostulaciones` el objeto interno usa `email` pero el formulario usa `correoElectronico`

No es un bug actual, pero cuando se modifica uno de los puntos de comunicación, el otro puede quedarse desincronizado.

---

## BAJO IMPACTO

### 17. `innerHTML` en `showSkeletonCards` con string concatenation
**Archivo:** `Index.html:2470-2496`
**Por qué:** Se construye HTML con un loop y concatenación de strings. Funciona, pero es más difícil de mantener que un array de strings con `.join('')` o un `.map()`:

```javascript
// Index.html:2470-2496 — concatenación en loop
let html = '<div class="cards-grid">';
for (let i = 0; i < 6; i++) {
  html += `<div class="skeleton-card">...`;
}
```

**Fix:** Minor — usar `Array.from({length: 6}, () => template).join('')`.

---

### 18. Validación de PBM acepta float en `validateForm` del frontend
**Archivo:** `Index.html:3212`
**Por qué:** El server valida que PBM sea entero (`datos.pbm.toString().includes('.')` en Code.gs:410), pero el frontend `validateForm()` usa `parseFloat`:

```javascript
// Index.html:3212 — usa parseFloat, no parseInt
const pbm = parseFloat(document.getElementById('pbm').value);
```

La validación real-time (`validateField`, línea 3024) sí chequea el punto decimal. Pero `validateForm` (la que se ejecuta al submit) no. Un valor `50.5` pasaría la validación del formulario y se catchearia solo en el server.

**Fix:** Usar `parseInt` y agregar el check de punto decimal consistente con `validateField`.

---

### 19. Mezclado de español e inglés en nombres de variables
**Por qué:** Es cosmético pero genera fricción al leer:

- `totalCupos`, `emailContacto`, `tipoModalidad` — español
- `setupIframeHeight`, `clearAllFilters`, `handleDataSuccess` — inglés
- `escapeHtml`, `debounce` — inglés (estándar)

No es un error funcional. Si se decide un estándar, aplicarlo consistentemente en nuevo código.

---

### 20. `secondoApellido` listado como requerido en `validateForm` pero no en el server
**Archivo:** `Index.html:3181`
**Por qué:** El frontend trata `segundoApellido` como campo requerido en la validación de submit:

```javascript
// Index.html:3181
{ field: 'segundoApellido', error: 'errorSegundoApellido' },
```

Pero el server (`Code.gs:437`) lo trata como opcional:
```javascript
if (datos.segundoApellido && datos.segundoApellido.trim() !== '' && ...)
```

El campo es semánticalmente opcional (no todos tienen segundo apellido). El frontend es el que está mal.

**Fix:** Eliminar `segundoApellido` de la lista `requiredFields` en `validateForm`.

---

### 21. Alturas mínimas de iframe hardcoded por dispositivo
**Archivo:** `Index.html:2323-2335`
**Por qué:** Las alturas mínimas (`mobile: 1400`, `tablet: 1100`, `desktop: 800`) son guesses estáticos que no se ajustan al contenido real. Si hay 1 convocatoria la altura es exagerada; si hay 10, puede ser insuficiente.

El `ResizeObserver` (línea 2367) ya calcula la altura real del contenido. Los valores mínimos deben ser más conservadores y dejar que el contenido decida.

---

## Checklist de Revisión (estado actual)

```
SECURITY
[✗] No secrets en codigo?          → IDs de spreadsheet en git (punto 4, 5)
[✓] Inputs validados en boundaries? → Validación dúplex funcionando
[N/A] Passwords hasheados?          → No hay autenticación propia
[✗] Sensitive data filtrada?        → XSS en emails y mensajes (punto 1, 2)

DATA INTEGRITY
[✓] Estado inmutable / copias?      → Datos se pasan por valor en la mayoría
[✗] Strict equality (===)?          → 3 excepciones en validarEstadoEstudiante (punto 6)
[✓] Null/undefined manejados?       → Fallbacks con `|| ''` generalizado
[✗] Race conditions?                → Fail-open en catch (punto 3)

PERFORMANCE
[✗] No lecturas redundantes?        → getProgramasAcademicos duplica lectura (punto 12)
[✗] Operaciones pesadas cacheadas?  → Sin caching de spreadsheet (punto 13)
[✓] Cleanup de recursos?            → ResizeObserver y MutationObserver activos

MAINTAINABILITY
[✗] Funciones con responsabilidad unica? → Email templates mezclan CSS + lógica (punto 11)
[✗] No magic numbers?               → 10+ magic numbers dispersos (punto 9)
[✗] Una sola fuente de verdad?      → Validación duplicada cliente-servidor (punto 8)
[✓] Errores manejados por tipos?    → Error types bien definidos en la mayoría
```

---

## Orden de acción recomendado

1. **Inmediato** (bloquean producción segura): Puntos 1, 2, 3, 4
2. **Esta semana**: Puntos 5, 6, 7, 8, 10, 20
3. **Próximo sprint**: Puntos 9, 11, 12, 13, 14, 15, 18
4. **Cuando sea posible**: Puntos 16, 17, 19, 21
