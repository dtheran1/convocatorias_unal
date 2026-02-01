# Plan de Mejoras - Sistema de Convocatorias UNAL

> **Proyecto:** Convocatorias de Prácticas y Pasantías - UNAL Sede La Paz
> **Versión Actual:** 1.0 (Fase 1 completada)
> **Score Técnico Actual:** 6.4/10
> **Score Objetivo:** 8.5/10
> **Fecha:** 2026-01-31

---

## 📊 Evaluación Técnica Actual

| Aspecto | Score | Estado |
|---------|-------|--------|
| Funcionalidad | 8/10 | ✅ Bueno |
| Seguridad | 6/10 | ⚠️ Mejorable |
| Rendimiento | 6/10 | ⚠️ Mejorable |
| Escalabilidad | 5/10 | 🔴 Requiere atención |
| Mantenibilidad | 7/10 | ✅ Aceptable |
| UX/UI | 8/10 | ✅ Bueno |
| Documentación | 4/10 | 🔴 Requiere atención |
| Testing | 3/10 | 🔴 Crítico |
| Accesibilidad | 6/10 | ⚠️ Mejorable |

**Promedio:** 6.4/10

---

## 🎯 Objetivos del Plan

1. **Seguridad:** Aumentar de 6/10 a 9/10
2. **Rendimiento:** Aumentar de 6/10 a 8/10
3. **Testing:** Aumentar de 3/10 a 8/10
4. **Escalabilidad:** Aumentar de 5/10 a 7/10
5. **Documentación:** Aumentar de 4/10 a 8/10

---

## 🔴 FASE 2: CRÍTICO - Seguridad y Estabilidad (1-2 semanas)

> **Prioridad:** ALTA
> **Objetivo:** Resolver problemas de seguridad y estabilidad
> **Esfuerzo Estimado:** 16-24 horas

### 2.1 Autenticación Robusta

**Problema Actual:**
- Solo valida email `@unal.edu.co` (cualquiera puede crear uno)
- Sin validación LDAP real
- Sin verificación de identidad institucional

**Mejora:**
```javascript
// Integración con LDAP/OAuth UNAL
function authenticateUser(email, token) {
  // Validar contra LDAP institucional
  // Verificar que el usuario existe en base de datos UNAL
  // Obtener información del estudiante (programa, semestre)
}
```

**Beneficios:**
- ✅ Autenticación real contra sistemas UNAL
- ✅ Previene cuentas falsas
- ✅ Auto-completado de datos del estudiante

**Tareas:**
- [ ] Investigar API de autenticación UNAL disponible
- [ ] Implementar OAuth 2.0 o SAML si está disponible
- [ ] Agregar middleware de verificación
- [ ] Testing con usuarios reales

**Archivos afectados:** `Code.gs` (líneas 56-77, 483-493)

---

### 2.2 Protección de Datos Sensibles

**Problema Actual:**
- Números de documento en texto plano
- Correos visibles en Sheets
- PAPA/PBM sin encriptación

**Mejora:**
```javascript
function hashSensitiveData(data) {
  const crypto = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    data
  );
  return Utilities.base64Encode(crypto);
}

function encryptDocument(numero) {
  // Hash con salt único por usuario
  const salt = getUserSalt(email);
  return hashSensitiveData(numero + salt);
}
```

**Beneficios:**
- ✅ Cumple GDPR/LOPD
- ✅ Protege privacidad de estudiantes
- ✅ Búsqueda por hash (sin exponer dato)

**Tareas:**
- [ ] Implementar hashing de documentos
- [ ] Encriptar emails (reversible para envío)
- [ ] Migrar datos existentes
- [ ] Actualizar búsquedas para usar hash

**Archivos afectados:** `Code.gs` (nueva función `DataEncryption`)

---

### 2.3 Auditoría y Logging

**Problema Actual:**
- Solo `console.log()` que no persiste
- Sin historial de cambios
- Imposible auditar acciones

**Mejora:**
```javascript
function logAction(action, user, details) {
  const logSheet = getLogSheet();
  logSheet.appendRow([
    new Date(),
    user,
    action,
    JSON.stringify(details),
    Session.getActiveUser().getEmail(),
    Session.getTemporaryActiveUserKey()
  ]);
}

// Ejemplos de uso:
logAction('POSTULACION_CREADA', userEmail, { convocatoriaId: 5 });
logAction('ESTADO_CAMBIADO', adminEmail, { postulacionId: 123, nuevoEstado: 'Seleccionado' });
```

**Beneficios:**
- ✅ Trazabilidad completa
- ✅ Detección de anomalías
- ✅ Cumplimiento legal

**Tareas:**
- [ ] Crear Sheet "Audit_Log"
- [ ] Implementar función `logAction()`
- [ ] Agregar logs en todas las operaciones críticas
- [ ] Dashboard de visualización de logs

**Archivos afectados:** `Code.gs` (nuevo módulo `AuditLog`)

---

### 2.4 Gestión de Secretos

**Problema Actual:**
- IDs de Sheets en PropertiesService (bien)
- Pero sin encriptación
- Sin rotación de secretos

**Mejora:**
```javascript
// Usar Google Cloud Secret Manager
function getSecret(secretName) {
  const projectId = 'convocatorias-unal';
  const secretManagerUrl = `https://secretmanager.googleapis.com/v1/projects/${projectId}/secrets/${secretName}/versions/latest:access`;

  const response = UrlFetchApp.fetch(secretManagerUrl, {
    headers: {
      'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
    }
  });

  return JSON.parse(response).payload.data;
}
```

**Beneficios:**
- ✅ Secretos encriptados en reposo
- ✅ Rotación automática
- ✅ Control de acceso granular

**Tareas:**
- [ ] Configurar Google Cloud Secret Manager
- [ ] Migrar secretos desde PropertiesService
- [ ] Implementar función `getSecret()`
- [ ] Actualizar referencias en código

**Archivos afectados:** `Code.gs` (líneas 28-50)

---

### 2.5 Manejo de Transacciones

**Problema Actual:**
- Si falla el email después de guardar: inconsistencia
- Sin rollback
- Sin reintentos automáticos

**Mejora:**
```javascript
function guardarPostulacionTransaccional(datos) {
  let rowIndex = null;

  try {
    // 1. Validaciones
    const validacion = validarDatosPostulacion(datos);
    if (!validacion.isValid) throw new Error('Validación falló');

    // 2. Guardar en Sheet
    rowIndex = insertarPostulacion(datos);

    // 3. Enviar email (con retry)
    const emailEnviado = enviarEmailConRetry(datos, 3);
    if (!emailEnviado) {
      logWarning('Email falló pero postulación guardada', rowIndex);
    }

    // 4. Log exitoso
    logAction('POSTULACION_EXITOSA', datos.email, { rowIndex });

    return { success: true, rowIndex };

  } catch (error) {
    // Rollback: eliminar fila si se insertó
    if (rowIndex) {
      eliminarFila(rowIndex);
      logAction('ROLLBACK_POSTULACION', datos.email, { error: error.message });
    }

    return { success: false, error: error.message };
  }
}
```

**Beneficios:**
- ✅ Consistencia de datos
- ✅ Reintentos automáticos
- ✅ Rollback en caso de error

**Tareas:**
- [ ] Implementar patrón transaccional
- [ ] Agregar retry logic para emails
- [ ] Implementar rollback
- [ ] Testing de escenarios de fallo

**Archivos afectados:** `Code.gs` (líneas 481-598)

---

## 🟡 FASE 3: IMPORTANTE - Rendimiento y Escalabilidad (2-3 semanas)

> **Prioridad:** MEDIA-ALTA
> **Objetivo:** Mejorar rendimiento y preparar para escala
> **Esfuerzo Estimado:** 20-30 horas

### 3.1 Cacheo con CacheService

**Problema Actual:**
- Cada llamada a `getConvocatorias()` lee TODO el Sheet
- Sin cacheo
- Lento con >100 convocatorias

**Mejora:**
```javascript
function getConvocatoriasCached() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'convocatorias_all';

  // Intentar obtener del cache
  let cached = cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Si no existe, leer de Sheet
  const result = getConvocatoriasFromSheet();

  // Guardar en cache por 6 horas (21600 segundos)
  cache.put(cacheKey, JSON.stringify(result), 21600);

  return result;
}

// Invalidar cache cuando se actualicen convocatorias
function onConvocatoriaUpdate() {
  CacheService.getScriptCache().remove('convocatorias_all');
}
```

**Beneficios:**
- ✅ 10-50x más rápido
- ✅ Reduce lecturas de Sheet
- ✅ Mejor experiencia de usuario

**Tareas:**
- [ ] Implementar cacheo de convocatorias
- [ ] Agregar invalidación en updates
- [ ] Medir mejora de rendimiento
- [ ] Documentar estrategia de cache

**Archivos afectados:** `Code.gs` (líneas 95-199)

---

### 3.2 Paginación Server-Side

**Problema Actual:**
- Frontend recibe TODAS las convocatorias
- Si hay 1000: overhead innecesario
- Sin lazy loading real

**Mejora:**
```javascript
function getConvocatoriasPaginated(page = 1, perPage = 20, filters = {}) {
  const allData = getConvocatoriasCached();

  // Aplicar filtros server-side
  let filtered = allData.data;
  if (filters.tipo) {
    filtered = filtered.filter(c => c.tipoModalidad.includes(filters.tipo));
  }
  if (filters.origen) {
    filtered = filtered.filter(c => c.dependenciaEntidad === filters.origen);
  }

  // Calcular paginación
  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;

  return {
    success: true,
    data: filtered.slice(start, end),
    pagination: {
      page,
      perPage,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}
```

**Frontend:**
```javascript
let currentPage = 1;

function loadMore() {
  google.script.run
    .withSuccessHandler(appendConvocatorias)
    .getConvocatoriasPaginated(currentPage, 20, activeFilters);
  currentPage++;
}
```

**Beneficios:**
- ✅ Carga inicial más rápida
- ✅ Menos transferencia de datos
- ✅ Scroll infinito posible

**Tareas:**
- [ ] Implementar paginación backend
- [ ] Actualizar frontend para scroll infinito
- [ ] Testing con datasets grandes
- [ ] Optimizar experiencia móvil

**Archivos afectados:** `Code.gs` (nueva función), `Index.html` (líneas 2433-2510)

---

### 3.3 Índices y Búsqueda Optimizada

**Problema Actual:**
- Búsqueda lineal en arrays
- Sin índices
- Búsqueda case-sensitive

**Mejora:**
```javascript
// Crear índice invertido
function buildSearchIndex(convocatorias) {
  const index = {};

  convocatorias.forEach((conv, idx) => {
    const searchableText = [
      conv.titulo,
      conv.nombreDependencia,
      conv.programasAcademicos,
      conv.descripcion
    ].join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const words = searchableText.split(/\s+/);
    words.forEach(word => {
      if (!index[word]) index[word] = [];
      index[word].push(idx);
    });
  });

  return index;
}

function searchWithIndex(query, index, convocatorias) {
  const normalizedQuery = query.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const words = normalizedQuery.split(/\s+/);

  // Encontrar convocatorias que contengan TODAS las palabras
  const resultSets = words.map(word => new Set(index[word] || []));
  const intersection = resultSets.reduce((acc, set) =>
    new Set([...acc].filter(x => set.has(x)))
  );

  return [...intersection].map(idx => convocatorias[idx]);
}
```

**Beneficios:**
- ✅ Búsqueda instantánea
- ✅ Maneja tildes/acentos
- ✅ Búsqueda multi-palabra

**Tareas:**
- [ ] Implementar índice invertido
- [ ] Normalizar texto (tildes, case)
- [ ] Actualizar búsqueda frontend
- [ ] Agregar fuzzy matching

**Archivos afectados:** `Index.html` (líneas 2830-2863)

---

### 3.4 Compresión de Respuestas

**Problema Actual:**
- JSON sin comprimir
- Overhead en transferencia
- Lento en conexiones móviles

**Mejora:**
```javascript
function compressData(data) {
  const jsonString = JSON.stringify(data);
  const compressed = Utilities.gzip(Utilities.newBlob(jsonString)).getBytes();
  return Utilities.base64Encode(compressed);
}

function decompressData(compressed) {
  const decoded = Utilities.base64Decode(compressed);
  const decompressed = Utilities.ungzip(Utilities.newBlob(decoded));
  return JSON.parse(decompressed.getDataAsString());
}

// En getConvocatorias()
function getConvocatorias(compressed = false) {
  const result = getConvocatoriasCached();

  if (compressed) {
    return {
      compressed: true,
      data: compressData(result)
    };
  }

  return result;
}
```

**Frontend:**
```javascript
google.script.run
  .withSuccessHandler(result => {
    if (result.compressed) {
      // Descomprimir en frontend si es necesario
      const decompressed = pako.inflate(atob(result.data), { to: 'string' });
      handleDataSuccess(JSON.parse(decompressed));
    } else {
      handleDataSuccess(result);
    }
  })
  .getConvocatorias(true);
```

**Beneficios:**
- ✅ 60-80% menos datos transferidos
- ✅ Más rápido en móvil
- ✅ Menos uso de cuota

**Tareas:**
- [ ] Implementar compresión backend
- [ ] Agregar descompresión frontend (pako.js)
- [ ] Testing en diferentes navegadores
- [ ] Medir mejora de velocidad

**Archivos afectados:** `Code.gs` (nueva utilidad), `Index.html` (agregar pako.js CDN)

---

## 🟢 FASE 4: MEJORAS - Funcionalidades Nuevas (3-4 semanas)

> **Prioridad:** MEDIA
> **Objetivo:** Agregar funcionalidades solicitadas
> **Esfuerzo Estimado:** 30-40 horas

### 4.1 Dashboard Administrativo

**Descripción:**
Interfaz web para administradores que permita:
- Ver todas las postulaciones
- Filtrar por estado, programa, convocatoria
- Cambiar estado (Pendiente → Seleccionado/No seleccionado)
- Agregar observaciones
- Exportar a Excel

**Mockup:**
```
+--------------------------------------------------+
| DASHBOARD ADMINISTRATIVO                   [Admin] |
+--------------------------------------------------+
| Filtros:                                          |
| [Estado ▼] [Programa ▼] [Convocatoria ▼] [Buscar]|
+--------------------------------------------------+
| Nombre      | Programa | Convocatoria | Estado  |▲|
|-------------|----------|--------------|---------|▼|
| Juan Pérez  | Ing. Mec | Práctica IBM | [Pendiente▼]|
| Ana Gómez   | Biología | Pasantía X   | [Seleccionado]|
| ...                                              |
+--------------------------------------------------+
| [Exportar Excel] [Enviar Notificaciones]        |
+--------------------------------------------------+
```

**Implementación:**
```javascript
// Nuevo archivo: Admin.html
function doGet(e) {
  const page = e.parameter.page || 'index';

  if (page === 'admin') {
    // Verificar que el usuario es admin
    if (!isAdmin()) {
      return HtmlService.createHtmlOutput('Acceso denegado');
    }
    return HtmlService.createHtmlOutputFromFile('Admin');
  }

  return HtmlService.createHtmlOutputFromFile('Index');
}

function getPostulaciones(filters = {}) {
  // Similar a getConvocatorias() pero para postulaciones
}

function updateEstadoPostulacion(rowId, nuevoEstado, observaciones) {
  // Actualizar celda
  // Enviar notificación
  // Logging
}
```

**Tareas:**
- [ ] Crear archivo `Admin.html`
- [ ] Implementar tabla con DataTables.js
- [ ] Agregar filtros y búsqueda
- [ ] Implementar cambio de estado
- [ ] Agregar sistema de roles (admin/staff)
- [ ] Testing con datos reales

**Archivos nuevos:** `Admin.html`, `Code.gs` (nuevas funciones admin)

---

### 4.2 Exportación a Excel

**Descripción:**
Botón "Exportar" que descargue postulaciones en formato Excel con:
- Filtros aplicados
- Formato condicional (colores por estado)
- Gráficos de resumen

**Implementación:**
```javascript
function exportToExcel(filters = {}) {
  const postulaciones = getPostulacionesFiltered(filters);

  // Crear nuevo Spreadsheet temporal
  const tempSheet = SpreadsheetApp.create('Exportación_Postulaciones_' + new Date().toISOString());
  const sheet = tempSheet.getSheets()[0];

  // Headers
  sheet.appendRow(['Fecha', 'Estado', 'Nombre Completo', 'Documento', 'Email', 'Programa', 'PAPA', 'PBM', 'Convocatoria']);

  // Datos
  postulaciones.forEach(p => {
    sheet.appendRow([
      p.fecha,
      p.estado,
      `${p.primerNombre} ${p.primerApellido}`,
      p.numeroDocumento,
      p.email,
      p.programa,
      p.papa,
      p.pbm,
      p.tituloConvocatoria
    ]);
  });

  // Formato condicional
  const statusRange = sheet.getRange(2, 2, postulaciones.length, 1);
  const rule1 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Seleccionado')
    .setBackground('#d1fae5')
    .setRanges([statusRange])
    .build();

  sheet.setConditionalFormatRules([rule1]);

  // Retornar URL de descarga
  return {
    url: tempSheet.getUrl(),
    id: tempSheet.getId()
  };
}
```

**Frontend:**
```javascript
function exportarPostulaciones() {
  showLoadingModal('Generando Excel...');

  google.script.run
    .withSuccessHandler(result => {
      hideLoadingModal();
      window.open(result.url, '_blank');
    })
    .exportToExcel(activeFilters);
}
```

**Tareas:**
- [ ] Implementar función `exportToExcel()`
- [ ] Agregar formato condicional
- [ ] Agregar gráficos de resumen
- [ ] Botón en dashboard admin
- [ ] Testing de descarga

**Archivos afectados:** `Code.gs` (nueva función), `Admin.html` (botón)

---

### 4.3 Búsqueda Avanzada

**Descripción:**
Búsqueda inteligente con:
- Autocompletado de programas
- Búsqueda fuzzy (tolerancia a errores)
- Operadores booleanos (AND, OR, NOT)
- Búsqueda por rango (PAPA > 4.0, cupos 1-5)

**Implementación:**
```javascript
// Frontend
<input type="text"
       id="advancedSearch"
       placeholder='Ej: Ingeniería AND (Práctica OR Pasantía) cupos:>5'
       autocomplete="off">

<div id="autocompleteResults" class="autocomplete-dropdown"></div>

// JavaScript
function parseAdvancedQuery(query) {
  const tokens = query.match(/(\w+):([<>]=?)?(\d+)|"[^"]+"|AND|OR|NOT|\w+/g);

  // Construir AST de búsqueda
  const ast = buildSearchAST(tokens);

  return ast;
}

function searchWithAST(ast, convocatorias) {
  // Evaluar árbol de búsqueda
  return convocatorias.filter(conv => evaluateNode(ast, conv));
}

function evaluateNode(node, conv) {
  if (node.type === 'FIELD') {
    // cupos:>5 → conv.cupos > 5
    return compareField(conv, node.field, node.operator, node.value);
  }
  if (node.type === 'AND') {
    return evaluateNode(node.left, conv) && evaluateNode(node.right, conv);
  }
  if (node.type === 'OR') {
    return evaluateNode(node.left, conv) || evaluateNode(node.right, conv);
  }
  if (node.type === 'NOT') {
    return !evaluateNode(node.child, conv);
  }
}
```

**Fuzzy Search:**
```javascript
function fuzzyMatch(query, text, threshold = 0.7) {
  const distance = levenshteinDistance(query.toLowerCase(), text.toLowerCase());
  const maxLength = Math.max(query.length, text.length);
  const similarity = 1 - (distance / maxLength);

  return similarity >= threshold;
}
```

**Tareas:**
- [ ] Implementar parser de queries
- [ ] Agregar fuzzy matching (Levenshtein)
- [ ] Implementar autocompletado
- [ ] Testing con queries complejas
- [ ] Documentar sintaxis de búsqueda

**Archivos afectados:** `Index.html` (líneas 2830-2863, nuevo módulo `AdvancedSearch.js`)

---

### 4.4 Notificaciones Push / SMS

**Descripción:**
Sistema de notificaciones multi-canal:
- Email (ya existe)
- SMS (Twilio)
- Push notifications (PWA)
- WhatsApp Business API (opcional)

**Implementación (SMS con Twilio):**
```javascript
function enviarSMS(telefono, mensaje) {
  const accountSid = getSecret('TWILIO_ACCOUNT_SID');
  const authToken = getSecret('TWILIO_AUTH_TOKEN');
  const fromNumber = getSecret('TWILIO_PHONE_NUMBER');

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const payload = {
    To: telefono,
    From: fromNumber,
    Body: mensaje
  };

  const options = {
    method: 'post',
    payload: payload,
    headers: {
      'Authorization': 'Basic ' + Utilities.base64Encode(accountSid + ':' + authToken)
    }
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    logAction('SMS_ENVIADO', telefono, { response: response.getContentText() });
    return { success: true };
  } catch (error) {
    logError('SMS_FALLO', { telefono, error: error.message });
    return { success: false, error: error.message };
  }
}

// Al cambiar estado a "Seleccionado"
function onSeleccionado(postulacion) {
  // Email
  enviarNotificacionSeleccionado(postulacion);

  // SMS
  enviarSMS(
    postulacion.telefono,
    `🎉 Felicitaciones ${postulacion.primerNombre}! Has sido seleccionado para ${postulacion.tituloConvocatoria}. Revisa tu correo para más detalles.`
  );
}
```

**Push Notifications (PWA):**
```javascript
// Service Worker (sw.js)
self.addEventListener('push', event => {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    data: { url: data.url }
  });
});

// Frontend
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: PUBLIC_VAPID_KEY
  });

  // Enviar subscription al backend
  google.script.run.savePushSubscription(subscription);
}
```

**Tareas:**
- [ ] Configurar cuenta Twilio
- [ ] Implementar envío de SMS
- [ ] Convertir a PWA (manifest.json, service worker)
- [ ] Implementar push notifications
- [ ] Agregar preferencias de notificación (email/SMS/push)
- [ ] Testing en diferentes dispositivos

**Archivos nuevos:** `sw.js`, `manifest.json`
**Archivos afectados:** `Code.gs` (nueva función `enviarSMS()`), `Index.html` (soporte PWA)

---

### 4.5 Comparador de Vacantes

**Descripción:**
Permite seleccionar 2-4 vacantes y ver tabla comparativa lado a lado.

**Mockup:**
```
+--------------------------------------------------+
| COMPARADOR DE VACANTES                      [X]  |
+--------------------------------------------------+
| Aspecto          | Vacante 1   | Vacante 2   | Vacante 3   |
|------------------|-------------|-------------|-------------|
| Título           | Práctica IBM| Pasantía UN | Práctica XYZ|
| Tipo             | Práctica    | Pasantía    | Práctica    |
| Modalidad        | Híbrida     | Presencial  | Remota      |
| Cupos            | 2           | 5           | 1           |
| Apoyo Económico  | SÍ ($500K)  | NO          | SÍ ($300K)  |
| Programas        | Ing. Mec    | Todos       | Ing. Bio    |
| Requisitos PAPA  | > 4.0       | > 3.5       | > 4.2       |
+--------------------------------------------------+
| [Postularme a Vacante 1] [Ver Detalles]         |
+--------------------------------------------------+
```

**Implementación:**
```javascript
// Frontend
let selectedForComparison = [];

function addToComparison(convocatoriaId) {
  if (selectedForComparison.length >= 4) {
    showToast('Máximo 4 vacantes para comparar');
    return;
  }

  if (!selectedForComparison.includes(convocatoriaId)) {
    selectedForComparison.push(convocatoriaId);
    updateComparisonBadge();
  }
}

function openComparator() {
  const convocatorias = selectedForComparison.map(id =>
    allConvocatorias.find(c => c.id === id)
  );

  renderComparisonTable(convocatorias);
  document.getElementById('comparatorModal').classList.add('active');
}

function renderComparisonTable(convocatorias) {
  const aspects = [
    { label: 'Título', key: 'titulo' },
    { label: 'Tipo', key: 'tipoModalidad' },
    { label: 'Modalidad', key: 'modalidadTrabajo' },
    { label: 'Cupos', key: 'cupos' },
    { label: 'Apoyo', key: 'ofreceApoyo' },
    { label: 'Programas', key: 'programasAcademicos' }
  ];

  let html = '<table class="comparison-table"><thead><tr><th>Aspecto</th>';
  convocatorias.forEach((c, i) => {
    html += `<th>Vacante ${i + 1}</th>`;
  });
  html += '</tr></thead><tbody>';

  aspects.forEach(aspect => {
    html += `<tr><td>${aspect.label}</td>`;
    convocatorias.forEach(c => {
      html += `<td>${c[aspect.key] || '-'}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';

  document.getElementById('comparisonTableContainer').innerHTML = html;
}
```

**CSS:**
```css
.comparison-table {
  width: 100%;
  border-collapse: collapse;
}

.comparison-table th,
.comparison-table td {
  border: 1px solid var(--border);
  padding: 12px;
  text-align: left;
}

.comparison-table thead {
  background: var(--unal-green);
  color: white;
}

.comparison-table tr:nth-child(even) {
  background: var(--bg-primary);
}
```

**Tareas:**
- [ ] Agregar checkbox "Comparar" en cada card
- [ ] Implementar badge flotante con contador
- [ ] Crear modal comparador
- [ ] Renderizar tabla comparativa
- [ ] Agregar export a PDF/imagen
- [ ] Testing responsivo

**Archivos afectados:** `Index.html` (nuevo modal, estilos, funciones)

---

## 🟣 FASE 5: OPTIMIZACIÓN - Testing y Documentación (2-3 semanas)

> **Prioridad:** MEDIA
> **Objetivo:** Asegurar calidad y mantenibilidad
> **Esfuerzo Estimado:** 20-30 horas

### 5.1 Testing Automático

**Framework:** Jest + Google Apps Script Testing (clasp)

**Estructura:**
```
tests/
├── unit/
│   ├── validation.test.js       → Tests de validación
│   ├── rate-limiting.test.js    → Tests de rate limit
│   ├── encryption.test.js       → Tests de encriptación
│   └── business-logic.test.js   → Lógica de negocio
├── integration/
│   ├── postulacion-flow.test.js → Flujo completo
│   └── email-sending.test.js    → Envío de emails
├── e2e/
│   └── user-journey.test.js     → Journey de usuario
└── fixtures/
    └── sample-data.json          → Datos de prueba
```

**Ejemplo de Test:**
```javascript
// tests/unit/validation.test.js
const { validarDatosPostulacion } = require('../../Code.gs');

describe('Validación de Postulación', () => {
  test('rechaza email no institucional', () => {
    const datos = {
      correoElectronico: 'test@gmail.com',
      // ... otros campos
    };

    const resultado = validarDatosPostulacion(datos);

    expect(resultado.isValid).toBe(false);
    expect(resultado.errors).toContain('El correo electrónico debe ser institucional (@unal.edu.co)');
  });

  test('acepta email institucional válido', () => {
    const datos = {
      correoElectronico: 'estudiante@unal.edu.co',
      primerNombre: 'Juan',
      primerApellido: 'Pérez',
      numeroDocumento: '1234567890',
      telefono: '3001234567',
      programaEstudiante: 'Ingeniería Mecatrónica',
      papa: '4.5',
      pbm: '75',
      idConvocatoria: '1',
      tituloConvocatoria: 'Test',
      modalidad: 'Práctica'
    };

    const resultado = validarDatosPostulacion(datos);

    expect(resultado.isValid).toBe(true);
    expect(resultado.errors).toHaveLength(0);
  });

  test('valida rango de PAPA correctamente', () => {
    const datos = { /* ... */ papa: '5.5' };
    const resultado = validarDatosPostulacion(datos);
    expect(resultado.errors).toContain('PAPA debe estar entre 0 y 5');
  });

  test('valida formato de teléfono colombiano', () => {
    const datos = { /* ... */ telefono: '2001234567' };
    const resultado = validarDatosPostulacion(datos);
    expect(resultado.errors).toContain('Teléfono debe ser un celular colombiano válido (10 dígitos, inicia con 3)');
  });
});

// tests/integration/postulacion-flow.test.js
describe('Flujo de Postulación Completo', () => {
  test('usuario puede postularse exitosamente', async () => {
    // 1. Obtener convocatorias
    const convocatorias = await getConvocatorias();
    expect(convocatorias.success).toBe(true);
    expect(convocatorias.data.length).toBeGreaterThan(0);

    // 2. Postularse a la primera
    const datos = {
      idConvocatoria: convocatorias.data[0].id,
      // ... datos válidos
    };

    const resultado = await guardarPostulacion(datos);
    expect(resultado.success).toBe(true);

    // 3. Verificar que se guardó
    const postulaciones = await getPostulaciones();
    expect(postulaciones.data).toContainEqual(
      expect.objectContaining({ numeroDocumento: datos.numeroDocumento })
    );
  });

  test('rate limit funciona correctamente', async () => {
    const datos = { /* ... */ };

    // Intentar 3 veces
    await guardarPostulacion(datos);
    await guardarPostulacion(datos);
    await guardarPostulacion(datos);

    // El 4to intento debe fallar
    const resultado = await guardarPostulacion(datos);
    expect(resultado.success).toBe(false);
    expect(resultado.tipo).toBe('RATE_LIMIT_EXCEEDED');
  });
});
```

**Configuración (package.json):**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "jest tests/e2e"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "@types/google-apps-script": "^1.0.0",
    "gas-local": "^1.0.0"
  }
}
```

**Tareas:**
- [ ] Configurar Jest
- [ ] Escribir tests unitarios (80% coverage)
- [ ] Escribir tests de integración
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Agregar badge de coverage
- [ ] Documentar cómo ejecutar tests

**Archivos nuevos:** `tests/` (directorio completo), `jest.config.js`, `package.json`

---

### 5.2 Documentación Completa

**Estructura:**
```
docs/
├── README.md                    → Overview del proyecto
├── SETUP.md                     → Instalación y configuración
├── API.md                       → Documentación de API
├── ARCHITECTURE.md              → Arquitectura del sistema
├── DEPLOYMENT.md                → Guía de despliegue
├── CONTRIBUTING.md              → Guía para contribuidores
├── CHANGELOG.md                 → Historial de cambios
├── TROUBLESHOOTING.md           → Solución de problemas
└── screenshots/                 → Capturas de pantalla
    ├── dashboard.png
    ├── formulario.png
    └── admin.png
```

**Ejemplo (API.md):**
```markdown
# API Documentation

## Funciones Públicas

### `getConvocatorias()`

Obtiene todas las convocatorias abiertas.

**Parámetros:** Ninguno

**Retorna:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Práctica en IBM",
      "tipoModalidad": "Práctica",
      "cupos": 2,
      // ...
    }
  ],
  "stats": {
    "total": 15,
    "totalCupos": 45,
    "activas": 15,
    "practicas": 8,
    "pasantias": 7
  }
}
```

**Errores:**
- `PERMISSION_DENIED`: Usuario sin correo @unal.edu.co

**Ejemplo:**
```javascript
google.script.run
  .withSuccessHandler(result => {
    if (result.success) {
      console.log(`${result.stats.total} convocatorias disponibles`);
    }
  })
  .getConvocatorias();
```

---

### `guardarPostulacion(datos)`

Guarda una nueva postulación.

**Parámetros:**
```javascript
{
  primerNombre: string,       // Requerido, solo letras
  segundoNombre: string,      // Opcional
  primerApellido: string,     // Requerido, solo letras
  segundoApellido: string,    // Opcional
  numeroDocumento: string,    // Requerido, 6-12 dígitos
  telefono: string,           // Requerido, 3XXXXXXXXX
  correoElectronico: string,  // Requerido, @unal.edu.co
  programaEstudiante: string, // Requerido
  papa: string,               // Requerido, 0.00-5.00
  pbm: string,                // Requerido, 0-100
  idConvocatoria: string,     // Requerido
  tituloConvocatoria: string, // Requerido
  modalidad: string           // Requerido
}
```

**Retorna (éxito):**
```json
{
  "success": true,
  "message": "¡Postulación enviada correctamente!"
}
```

**Retorna (error):**
```json
{
  "success": false,
  "error": "Mensaje de error",
  "tipo": "VALIDATION_ERROR | RATE_LIMIT_EXCEEDED | ESTUDIANTE_SELECCIONADO | ..."
}
```

**Validaciones:**
- Email debe ser @unal.edu.co
- Documento: 6-12 dígitos
- Teléfono: celular colombiano (10 dígitos, inicia con 3)
- PAPA: 0-5, máximo 2 decimales
- PBM: 0-100, entero
- Nombres: solo letras, máximo 50 caracteres

**Rate Limiting:**
- Máximo 3 intentos cada 10 minutos por documento+email

**Ejemplo:**
```javascript
const datos = {
  primerNombre: 'Juan',
  primerApellido: 'Pérez',
  numeroDocumento: '1234567890',
  telefono: '3001234567',
  correoElectronico: 'juan.perez@unal.edu.co',
  programaEstudiante: 'Ingeniería Mecatrónica',
  papa: '4.5',
  pbm: '75',
  idConvocatoria: '1',
  tituloConvocatoria: 'Práctica IBM',
  modalidad: 'Práctica'
};

google.script.run
  .withSuccessHandler(result => {
    if (result.success) {
      alert('¡Postulación enviada!');
    } else {
      alert(`Error: ${result.error}`);
    }
  })
  .guardarPostulacion(datos);
```
```

**JSDoc en Code.gs:**
```javascript
/**
 * Valida los datos de una postulación
 *
 * @param {Object} datos - Datos del formulario de postulación
 * @param {string} datos.primerNombre - Primer nombre (solo letras, max 50 chars)
 * @param {string} datos.primerApellido - Primer apellido (solo letras, max 50 chars)
 * @param {string} datos.numeroDocumento - Número de documento (6-12 dígitos)
 * @param {string} datos.telefono - Celular colombiano (10 dígitos, inicia con 3)
 * @param {string} datos.correoElectronico - Email institucional (@unal.edu.co)
 * @param {string} datos.programaEstudiante - Programa académico
 * @param {string} datos.papa - PAPA (0.00-5.00, max 2 decimales)
 * @param {string} datos.pbm - PBM (0-100, entero)
 * @param {string} datos.idConvocatoria - ID de la convocatoria
 * @param {string} datos.tituloConvocatoria - Título de la convocatoria
 * @param {string} datos.modalidad - Modalidad (Práctica/Pasantía)
 *
 * @returns {Object} Resultado de validación
 * @returns {boolean} return.isValid - Si los datos son válidos
 * @returns {string[]} return.errors - Array de mensajes de error
 *
 * @example
 * const validacion = validarDatosPostulacion({
 *   primerNombre: 'Juan',
 *   correoElectronico: 'juan@unal.edu.co',
 *   // ... otros campos
 * });
 *
 * if (!validacion.isValid) {
 *   console.error('Errores:', validacion.errors);
 * }
 */
function validarDatosPostulacion(datos) {
  // ...
}
```

**Tareas:**
- [ ] Escribir README.md completo
- [ ] Documentar todas las funciones con JSDoc
- [ ] Crear guía de instalación paso a paso
- [ ] Documentar arquitectura con diagramas
- [ ] Agregar troubleshooting común
- [ ] Capturar screenshots
- [ ] Video tutorial (opcional)

**Archivos nuevos:** `docs/` (directorio completo)

---

### 5.3 CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ master, develop ]
  pull_request:
    branches: [ master ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        fail_ci_if_error: true

  lint:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Run ESLint
      run: npm run lint

  deploy:
    runs-on: ubuntu-latest
    needs: [test, lint]
    if: github.ref == 'refs/heads/master'

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install clasp
      run: npm install -g @google/clasp

    - name: Authenticate clasp
      run: |
        echo '${{ secrets.CLASPRC_JSON }}' > ~/.clasprc.json

    - name: Push to Google Apps Script
      run: clasp push

    - name: Create release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: v${{ github.run_number }}
        release_name: Release v${{ github.run_number }}
        draft: false
        prerelease: false
```

**Pre-commit Hooks (Husky):**
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "*.js": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

**Tareas:**
- [ ] Configurar GitHub Actions
- [ ] Configurar Codecov
- [ ] Configurar ESLint
- [ ] Configurar Husky pre-commit hooks
- [ ] Configurar semantic-release
- [ ] Documentar flujo de CI/CD

**Archivos nuevos:** `.github/workflows/ci.yml`, `.eslintrc.js`, `.huskyrc.json`

---

## 🌟 FASE 6: AVANZADO - Features Premium (4-6 semanas)

> **Prioridad:** BAJA
> **Objetivo:** Diferenciadores y features innovadores
> **Esfuerzo Estimado:** 40-60 horas

### 6.1 PWA (Progressive Web App)

**Características:**
- Instalable en dispositivo móvil
- Funciona offline (caché)
- Push notifications
- Add to Home Screen

**Implementación:**

**manifest.json:**
```json
{
  "name": "Convocatorias UNAL - Sede La Paz",
  "short_name": "Convocatorias UNAL",
  "description": "Sistema de gestión de convocatorias de prácticas y pasantías",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#4CAF50",
  "theme_color": "#388E3C",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Service Worker (sw.js):**
```javascript
const CACHE_NAME = 'convocatorias-v1';
const urlsToCache = [
  '/',
  '/Index.html',
  '/styles.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Fetch from network
        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification
self.addEventListener('push', event => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url
    },
    actions: [
      {
        action: 'open',
        title: 'Ver detalles'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
```

**Registro en Index.html:**
```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}
```

**Tareas:**
- [ ] Crear manifest.json
- [ ] Diseñar iconos (72x72, 144x144, 192x192, 512x512)
- [ ] Implementar service worker
- [ ] Configurar estrategia de caché
- [ ] Testing offline
- [ ] Lighthouse audit (objetivo: 90+)

**Archivos nuevos:** `manifest.json`, `sw.js`, `icons/`

---

### 6.2 Analytics Avanzado

**Descripción:**
Dashboard con métricas de uso:
- Total de vistas por convocatoria
- Tasa de conversión (vista → postulación)
- Tiempo promedio en página
- Dispositivos más usados
- Programas más populares
- Horas pico de acceso

**Implementación (Google Analytics 4):**

```html
<!-- Index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');

  // Eventos personalizados
  function trackEvent(eventName, params) {
    gtag('event', eventName, params);
  }

  // Track vista de convocatoria
  function openDetallesModal(id) {
    trackEvent('view_convocatoria', {
      convocatoria_id: id,
      convocatoria_titulo: convocatorias[id].titulo
    });
    // ... resto del código
  }

  // Track postulación
  function handlePostulacionSuccess(result) {
    if (result.success) {
      trackEvent('postulacion_enviada', {
        convocatoria_id: currentConvocatoriaId,
        programa: datos.programaEstudiante
      });
    }
    // ... resto del código
  }

  // Track búsqueda
  function applyFilters() {
    trackEvent('search', {
      search_term: document.getElementById('searchInput').value,
      filters_active: Object.values(activeFilters).filter(Boolean).length
    });
    // ... resto del código
  }
</script>
```

**Dashboard personalizado (Data Studio):**
```javascript
// Code.gs - Función para exportar datos a BigQuery
function exportAnalyticsToBigQuery() {
  const postulaciones = getAllPostulaciones();

  // Preparar datos para BigQuery
  const rows = postulaciones.map(p => ({
    fecha: p.fecha,
    convocatoria_id: p.idConvocatoria,
    programa: p.programa,
    papa: parseFloat(p.papa),
    pbm: parseInt(p.pbm),
    estado: p.estado
  }));

  // Insertar en BigQuery usando API
  const projectId = 'convocatorias-unal';
  const datasetId = 'analytics';
  const tableId = 'postulaciones';

  BigQuery.Tabledata.insertAll({
    rows: rows.map(row => ({ json: row }))
  }, projectId, datasetId, tableId);
}
```

**Tareas:**
- [ ] Configurar Google Analytics 4
- [ ] Implementar eventos personalizados
- [ ] Configurar conversiones
- [ ] Crear dashboard en Data Studio
- [ ] Agregar heatmaps (Hotjar)
- [ ] Configurar alertas de anomalías

**Archivos afectados:** `Index.html` (agregar GA4), `Code.gs` (export a BigQuery)

---

### 6.3 Internacionalización (i18n)

**Descripción:**
Soporte multi-idioma (Español, Inglés)

**Implementación:**

**Estructura:**
```
locales/
├── es.json
└── en.json
```

**es.json:**
```json
{
  "header.title": "Convocatorias - UNAL Sede de La Paz",
  "header.subtitle": "Prácticas y Pasantías",
  "filters.all": "Todas",
  "filters.practices": "Prácticas",
  "filters.internships": "Pasantías",
  "filters.internal": "Internas",
  "filters.external": "Externas",
  "form.firstName": "Primer Nombre",
  "form.lastName": "Primer Apellido",
  "form.email": "Correo Electrónico",
  "form.submit": "Enviar Postulación",
  "error.required": "Este campo es requerido",
  "error.invalidEmail": "Debe ser un correo institucional (@unal.edu.co)",
  "success.submitted": "¡Postulación enviada correctamente!"
}
```

**en.json:**
```json
{
  "header.title": "Job Openings - UNAL La Paz Campus",
  "header.subtitle": "Internships and Apprenticeships",
  "filters.all": "All",
  "filters.practices": "Practices",
  "filters.internships": "Internships",
  "filters.internal": "Internal",
  "filters.external": "External",
  "form.firstName": "First Name",
  "form.lastName": "Last Name",
  "form.email": "Email Address",
  "form.submit": "Submit Application",
  "error.required": "This field is required",
  "error.invalidEmail": "Must be an institutional email (@unal.edu.co)",
  "success.submitted": "Application submitted successfully!"
}
```

**JavaScript:**
```javascript
let currentLocale = 'es';
let translations = {};

async function loadTranslations(locale) {
  const response = await fetch(`/locales/${locale}.json`);
  translations = await response.json();
  currentLocale = locale;
  updatePageContent();
}

function t(key) {
  return translations[key] || key;
}

function updatePageContent() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.placeholder = t(key);
  });
}

// Selector de idioma
function changeLanguage(locale) {
  localStorage.setItem('preferredLocale', locale);
  loadTranslations(locale);
}

// Cargar idioma preferido al inicio
window.addEventListener('DOMContentLoaded', () => {
  const preferredLocale = localStorage.getItem('preferredLocale') ||
                          navigator.language.split('-')[0] ||
                          'es';
  loadTranslations(preferredLocale);
});
```

**HTML:**
```html
<div class="language-selector">
  <button onclick="changeLanguage('es')" class="lang-btn">🇪🇸 ES</button>
  <button onclick="changeLanguage('en')" class="lang-btn">🇺🇸 EN</button>
</div>

<h1 data-i18n="header.title">Convocatorias - UNAL Sede de La Paz</h1>
<input type="text" data-i18n-placeholder="form.email" placeholder="Correo Electrónico">
```

**Tareas:**
- [ ] Crear archivos de traducción
- [ ] Implementar sistema i18n
- [ ] Traducir todas las cadenas
- [ ] Agregar selector de idioma
- [ ] Formatear fechas/números según locale
- [ ] Testing en ambos idiomas

**Archivos nuevos:** `locales/es.json`, `locales/en.json`
**Archivos afectados:** `Index.html` (agregar data-i18n attributes)

---

### 6.4 Modo Oscuro

**Descripción:**
Toggle para tema oscuro/claro con persistencia.

**CSS Variables:**
```css
/* Light Theme (default) */
:root {
  --bg-primary: #f8fafc;
  --bg-card: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border: #e2e8f0;
}

/* Dark Theme */
[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-card: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border: #334155;
}

/* Smooth transition */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

**JavaScript:**
```javascript
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  updateThemeIcon(newTheme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme') ||
                     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
}

// Escuchar cambios del sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem('theme')) {
    const newTheme = e.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    updateThemeIcon(newTheme);
  }
});

window.addEventListener('DOMContentLoaded', loadTheme);
```

**HTML:**
```html
<button class="theme-toggle" onclick="toggleTheme()" title="Cambiar tema">
  <span class="material-icons" id="themeIcon">dark_mode</span>
</button>
```

**Tareas:**
- [ ] Definir paleta de colores dark
- [ ] Implementar CSS variables
- [ ] Agregar toggle button
- [ ] Persistir preferencia
- [ ] Testing de contraste (WCAG AA)
- [ ] Optimizar imágenes para dark mode

**Archivos afectados:** `Index.html` (CSS variables, toggle)

---

### 6.5 Accesibilidad (WCAG 2.1 AA)

**Mejoras:**

**1. Navegación por Teclado:**
```javascript
// Trap focus en modales
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }

    if (e.key === 'Escape') {
      closeModal();
    }
  });

  firstElement.focus();
}

// Skip to main content
<a href="#main-content" class="skip-link">Saltar al contenido principal</a>
```

**2. ARIA Labels:**
```html
<!-- Botones sin texto -->
<button aria-label="Cerrar modal" onclick="closeModal()">
  <span class="material-icons" aria-hidden="true">close</span>
</button>

<!-- Estados dinámicos -->
<div role="alert" aria-live="polite" aria-atomic="true">
  Postulación enviada correctamente
</div>

<!-- Carga -->
<div role="status" aria-live="polite" aria-busy="true">
  <span class="sr-only">Cargando convocatorias...</span>
  <div class="spinner"></div>
</div>

<!-- Formulario -->
<label for="email">
  Correo Electrónico
  <span aria-label="requerido">*</span>
</label>
<input
  id="email"
  type="email"
  required
  aria-required="true"
  aria-describedby="email-error email-hint"
>
<div id="email-hint" class="form-hint">Debe ser @unal.edu.co</div>
<div id="email-error" class="form-error" role="alert"></div>
```

**3. Contraste de Colores:**
```css
/* Verificar que todos los textos cumplan WCAG AA (4.5:1) */
/* Herramienta: https://webaim.org/resources/contrastchecker/ */

.btn-primary {
  background: #2563eb; /* Azul */
  color: #ffffff;      /* Blanco - Contraste: 8.6:1 ✅ */
}

.text-muted {
  color: #6b7280;      /* Gris - Contraste con blanco: 4.6:1 ✅ */
}
```

**4. Screen Reader Only Text:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**Tareas:**
- [ ] Agregar ARIA labels completos
- [ ] Implementar navegación por teclado
- [ ] Verificar contraste de colores
- [ ] Testing con screen readers (NVDA, JAWS)
- [ ] Agregar focus visible
- [ ] Lighthouse accessibility audit (objetivo: 100)

**Archivos afectados:** `Index.html` (ARIA labels, keyboard nav)

---

## 📋 Checklist de Implementación

### Fase 2: Crítico (1-2 semanas)
- [ ] 2.1 Autenticación robusta (LDAP/OAuth)
- [ ] 2.2 Protección de datos sensibles (hashing)
- [ ] 2.3 Auditoría y logging
- [ ] 2.4 Gestión de secretos (Secret Manager)
- [ ] 2.5 Manejo de transacciones

### Fase 3: Importante (2-3 semanas)
- [ ] 3.1 Cacheo con CacheService
- [ ] 3.2 Paginación server-side
- [ ] 3.3 Índices y búsqueda optimizada
- [ ] 3.4 Compresión de respuestas

### Fase 4: Mejoras (3-4 semanas)
- [ ] 4.1 Dashboard administrativo
- [ ] 4.2 Exportación a Excel
- [ ] 4.3 Búsqueda avanzada
- [ ] 4.4 Notificaciones push/SMS
- [ ] 4.5 Comparador de vacantes

### Fase 5: Optimización (2-3 semanas)
- [ ] 5.1 Testing automático (Jest)
- [ ] 5.2 Documentación completa
- [ ] 5.3 CI/CD Pipeline

### Fase 6: Avanzado (4-6 semanas)
- [ ] 6.1 PWA (Progressive Web App)
- [ ] 6.2 Analytics avanzado
- [ ] 6.3 Internacionalización (i18n)
- [ ] 6.4 Modo oscuro
- [ ] 6.5 Accesibilidad (WCAG 2.1 AA)

---

## 🎯 Roadmap Visual

```
Q1 2026
├── Enero
│   ├── ✅ Fase 1 completada
│   └── 🟡 Inicio Fase 2
├── Febrero
│   ├── Fase 2 completada
│   └── Inicio Fase 3
└── Marzo
    ├── Fase 3 completada
    └── Inicio Fase 4

Q2 2026
├── Abril
│   ├── Fase 4 completada
│   └── Inicio Fase 5
├── Mayo
│   └── Fase 5 completada
└── Junio
    └── Inicio Fase 6

Q3 2026
├── Julio-Agosto
│   └── Fase 6 completada
└── Septiembre
    └── Refinamiento y optimización

Q4 2026
└── Octubre-Diciembre
    └── Mantenimiento y mejoras incrementales
```

---

## 📊 Métricas de Éxito

### Objetivos Cuantitativos

| Métrica | Actual | Objetivo | Fase |
|---------|--------|----------|------|
| Score Técnico | 6.4/10 | 8.5/10 | Fase 5 |
| Test Coverage | 0% | 80% | Fase 5 |
| Lighthouse Performance | ? | 90+ | Fase 3 |
| Lighthouse Accessibility | ? | 100 | Fase 6 |
| Tiempo de carga (FCP) | ? | <1.5s | Fase 3 |
| Tasa de error | ? | <0.1% | Fase 2 |
| Uptime | ? | 99.9% | Fase 2 |

### Objetivos Cualitativos

- ✅ Seguridad robusta con autenticación real
- ✅ Experiencia de usuario fluida y rápida
- ✅ Código mantenible y bien documentado
- ✅ Sistema escalable hasta 10,000+ usuarios
- ✅ Accesible para todos los usuarios
- ✅ Cumplimiento GDPR/LOPD

---

## 🤝 Contribución

Este documento es vivo y debe actualizarse conforme se completan fases.

**Proceso:**
1. Revisar plan cada sprint (2 semanas)
2. Marcar tareas completadas
3. Actualizar roadmap si hay cambios
4. Documentar decisiones importantes
5. Agregar nuevas mejoras identificadas

---

## 📝 Notas Finales

- **Prioridad flexible:** Las fases pueden ajustarse según necesidades del negocio
- **Iterativo:** No es necesario completar toda una fase antes de empezar la siguiente
- **Feedback continuo:** Recoger feedback de usuarios en cada fase
- **MVP primero:** Funcionalidades mínimas viables antes que features completas

**Última actualización:** 2026-01-31
**Próxima revisión:** 2026-02-15
