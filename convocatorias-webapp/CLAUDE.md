# CLAUDE.md — Agente Especializado: Convocatorias UNAL

Guía completa para Claude Code al trabajar en este repositorio. Cubre arquitectura, sistema de diseño, patrones de componentes, convenciones de código y reglas de seguridad.

---

## Arquitectura

Google Apps Script web app embebida en Google Sites como iframes. Sin build step, bundler ni package manager.

```
convocatorias-webapp/
├── Code.gs          ← Backend: lee/escribe Google Sheets, envía emails, valida
└── Index.html       ← Frontend: grid de convocatorias + formulario de postulación

sections/            ← Componentes independientes, cada uno es su propio proyecto Apps Script
├── convenios/       Code.gs + convenios.html
├── banco-perfiles/  banco-perfiles.html
├── tdg/             tdg-complete.html (solo estático)
├── hero/, stats/, comparison/, requirements/, process/, documents/, contact/, vacantes/
```

**Regla:** cada section es completamente autocontenida — su propio CSS, JS y `Code.gs` si necesita backend. No comparten estado entre sí.

### Comunicación Frontend ↔ Backend

```javascript
google.script.run
  .withSuccessHandler(handleSuccess)
  .withFailureHandler(handleError)
  .functionName(args);
```

- Solo funciones de nivel top en `Code.gs` son llamables desde el frontend.
- Sin REST API, sin routing, sin middleware.

### Fallback para desarrollo local

```javascript
if (typeof google !== 'undefined' && google.script && google.script.run) {
  google.script.run.withSuccessHandler(handleData).getData();
} else {
  handleData({ success: true, data: MOCK_DATA }); // Abre el .html en el navegador
}
```

### Comunicación de altura al iframe padre

Todos los archivos HTML deben incluir:

```javascript
window.parent.postMessage({ type: 'setHeight', height: calculatedHeight }, '*');
```

No eliminar ni modificar este contrato — lo usa Google Sites para redimensionar el iframe.

---

## Sistema de Diseño (Design System)

### Paleta de colores (CSS custom properties)

**Siempre usar `var(--nombre)`. Nunca hardcodear colores.**

```css
:root {
  /* Marca institucional UNAL */
  --unal-green:       #4CAF50;   /* Color primario de marca */
  --unal-green-dark:  #388E3C;   /* Hover sobre elementos verdes */
  --unal-green-light: #C8E6C9;   /* Fondos sutiles verdes */
  --unal-green-bg:    #f0f9f0;   /* Fondo muy claro para info cards */

  /* Acciones */
  --primary:          #2563eb;   /* Botones de acción primaria (azul) */
  --primary-dark:     #1d4ed8;   /* Hover sobre --primary */
  --secondary:        #64748b;   /* Texto secundario, botones neutros */

  /* Semánticos */
  --success:          #22c55e;   /* Éxito, estado "Abierto" */
  --warning:          #f59e0b;   /* Advertencias, badge Pasantía */
  --danger:           #ef4444;   /* Errores, estado "Cerrado", botón limpiar */

  /* Neutros */
  --bg-primary:       #f8fafc;   /* Fondo de página */
  --bg-card:          #ffffff;   /* Fondo de cards y modales */
  --text-primary:     #1e293b;   /* Texto principal */
  --text-secondary:   #64748b;   /* Texto secundario */
  --text-muted:       #94a3b8;   /* Texto apagado, placeholders */
  --border:           #e2e8f0;   /* Bordes de inputs, separadores */
}
```

### Sombras

```css
--shadow:    0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);   /* Cards en reposo */
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); /* Cards en hover */
```

### Border radius

```css
--radius:    12px;   /* Estándar para cards, modales, inputs */
--radius-lg: 16px;   /* Elementos prominentes */
/* Botones pill: border-radius: 50px */
/* Botones cuadrados: border-radius: 8px */
```

### Tipografía

- **Fuente:** Inter (Google Fonts) con fallback a system fonts
- **Escala de pesos:** 400 regular · 500 medium · 600 semibold (labels, headings) · 700 bold (títulos principales)
- **Escala de tamaños:**

```
h1: 1.75rem / 700
h2: 1.5rem  / 700
h3: 1.25rem / 600
h4: 1.1rem  / 600
body: 0.95rem–1rem / 400
small/labels: 0.85rem / 400–500
micro: 0.75rem–0.8rem / 500–600 (badges)
```

### Iconos

Material Icons via CDN: `<span class="material-icons">nombre_icono</span>`

Tamaños: `font-size: 1.1rem` (inline) · `1.5rem` (botones) · `2rem` (empty states) · `4rem` (ilustraciones)

### Breakpoints responsive

```css
@media (max-width: 992px) { /* Tablets grandes */ }
@media (max-width: 768px) { /* Tablets / laptops pequeños — punto clave */ }
@media (max-width: 600px) { /* Mobile landscape */ }
@media (max-width: 480px) { /* Mobile portrait */ }
```

---

## Patrones de Componentes

### 1. MODALES

#### Estructura HTML completa

```html
<!-- Overlay + contenedor -->
<div class="modal-overlay" id="miModal" role="dialog"
     aria-labelledby="miModalTitle" aria-describedby="miModalDesc">
  <div class="modal">

    <!-- Header: siempre con botón close -->
    <div class="modal-header">
      <h2 class="modal-title" id="miModalTitle">Título del Modal</h2>
      <button class="modal-close" onclick="cerrarModal()" aria-label="Cerrar">
        <span class="material-icons">close</span>
      </button>
    </div>

    <!-- Body: contenido desplazable -->
    <div class="modal-body" id="miModalDesc">
      <!-- Contenido aquí -->
    </div>

    <!-- Footer de acciones (solo en modales de formulario/confirmación) -->
    <div class="modal-actions">
      <button type="button" class="btn-cancelar" id="btnCancelar">Cancelar</button>
      <button type="button" class="btn-postular" id="btnAceptar">Aceptar</button>
    </div>

  </div>
</div>
```

#### CSS requerido para modales

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  padding: 1rem;
}

.modal-overlay.active {
  opacity: 1;
  visibility: visible;
}

.modal {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  transform: translateY(20px);
  transition: transform 0.3s ease;
  box-shadow: var(--shadow-lg);
}

.modal-overlay.active .modal {
  transform: translateY(0);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg-card);
  z-index: 1;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0.25rem;
  border-radius: 50%;
  display: flex;
  transition: color 0.2s, background 0.2s;
}
.modal-close:hover {
  color: var(--text-primary);
  background: var(--bg-primary);
}

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
}

/* Mobile: modal full width */
@media (max-width: 480px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }
  .modal {
    max-width: 100%;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    max-height: 95vh;
  }
}
```

#### JS: Gestión accesible de modales

Usar siempre `initAccessibleModal()` para todos los modales:

```javascript
// Inicializar una vez (lazy)
let miModalManager = null;

function abrirMiModal(datos) {
  if (!miModalManager) {
    miModalManager = initAccessibleModal('miModal', {
      primaryButton: 'btnAceptar',       // Recibe foco inicial
      secondaryButton: 'btnCancelar',    // Foco alternativo en Tab
      scrollToTop: true,                 // Scroll iframe al top
      focusDelay: 100                    // ms antes de enfocar
    });
  }

  // Actualizar contenido
  document.getElementById('miModalTitle').textContent = datos.titulo;

  // Asignar handlers de botones
  document.getElementById('btnAceptar').onclick = () => {
    miModalManager.hide();
    ejecutarAccion(datos.id);
  };
  document.getElementById('btnCancelar').onclick = () => miModalManager.hide();

  miModalManager.show();
}
```

#### Tipos de modales en el proyecto

| Tipo | Propósito | Ejemplo |
|------|-----------|---------|
| **Detalle** | Mostrar info readonly (convocatoria completa) | `modalOverlay` en Index.html |
| **Formulario** | Recopilar datos del usuario | `postulacionModalOverlay` |
| **Confirmación** | Confirmar acción destructiva | Modales de banco-perfiles |
| **Error/Estado** | Informar resultado de operación | Modales de rechazo en postulación |

#### Comportamientos obligatorios en modales

- Click en overlay → cerrar modal
- Tecla ESC → cerrar modal (listener en `document`)
- Scroll del body deshabilitado mientras el modal esté abierto
- Focus vuelve al elemento que abrió el modal al cerrar
- En mobile: modal ocupa ancho completo, se ancla al bottom

---

### 2. CARDS

#### Estructura HTML

```html
<div class="card">
  <!-- Header: badges + título -->
  <div class="card-header">
    <div class="card-badges">
      <span class="badge badge-practica">Práctica</span>
      <span class="badge badge-presencial">Presencial</span>
      <span class="badge badge-interna">Interna</span>
    </div>
    <h3 class="card-title">Nombre de la Vacante</h3>
    <p class="card-subtitle">Dependencia / Entidad</p>
  </div>

  <!-- Body: información principal -->
  <div class="card-body">
    <div class="card-info">
      <div class="info-item">
        <span class="material-icons">business</span>
        <span>Nombre entidad</span>
      </div>
      <div class="info-item">
        <span class="material-icons">school</span>
        <span>Programas académicos</span>
      </div>
    </div>
    <p class="card-description">Descripción truncada a 3 líneas...</p>
    <button class="btn-ver-mas" onclick="abrirModal(id)">Ver más</button>
  </div>

  <!-- Footer: cupos + acciones -->
  <div class="card-footer">
    <div class="cupos">
      <span class="material-icons">people</span>
      <span><strong>N</strong> cupos</span>
    </div>
    <div class="card-footer-buttons">
      <button class="btn-postularse" onclick="abrirPostulacion(id)">Postularse</button>
    </div>
  </div>
</div>
```

#### CSS de la grilla y cards

```css
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
  align-items: stretch;
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  min-height: 320px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card-body {
  flex: 1;           /* Expande para ocupar espacio disponible */
  padding: 1rem 1.5rem;
}

.card-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;    /* Trunca a 3 líneas */
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--text-secondary);
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Touch devices */
@media (hover: none) and (pointer: coarse) {
  .card:active { transform: scale(0.98); }
}
```

#### Sistema de Badges

```css
/* Tipo de convocatoria */
.badge-practica  { background: #dbeafe; color: #1d4ed8; }   /* azul */
.badge-pasantia  { background: #fef3c7; color: #b45309; }   /* ámbar */

/* Modalidad de trabajo */
.badge-presencial { background: #dcfce7; color: #166534; }  /* verde */
.badge-hibrida    { background: #f3e8ff; color: #7c3aed; }  /* violeta */
.badge-virtual    { background: #e0f2fe; color: #0369a1; }  /* cyan */

/* Origen */
.badge-interna { background: #e0e7ff; color: #4338ca; }     /* índigo */
.badge-externa { background: #fce7f3; color: #be185d; }     /* rosa */

/* Estado */
.badge-activa  { background: #dcfce7; color: #166534; }
.badge-cerrada { background: #fee2e2; color: #991b1b; }

/* Base compartida */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.6rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
```

---

### 3. BOTONES

**Nunca hardcodear colores en botones. Siempre usar las clases base del proyecto.**

#### Variantes

```css
/* Primario — acción principal (verde UNAL) */
.btn-postular, .btn-primary {
  background: var(--unal-green);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.btn-postular:hover { background: var(--unal-green-dark); }
.btn-postular:active { transform: scale(0.97); }

/* Secundario — cancelar, acción neutra */
.btn-cancelar, .btn-secondary {
  background: var(--bg-primary);
  border: 2px solid var(--border);
  color: var(--text-secondary);
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
}
.btn-cancelar:hover { border-color: var(--text-muted); }

/* Pill — botones de tarjetas y filtros */
.btn-postularse, .btn-pill {
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Filtros — toggle activo/inactivo */
.filter-btn {
  border: 2px solid var(--border);
  border-radius: 50px;
  padding: 0.5rem 1rem;
  background: var(--bg-card);
  color: var(--text-secondary);
  transition: all 0.2s;
  cursor: pointer;
}
.filter-btn.active {
  background: var(--unal-green);
  border-color: var(--unal-green);
  color: #fff;
}

/* Destructivo — limpiar filtros, eliminar */
.btn-clear-filters, .btn-danger {
  border: 2px solid var(--danger);
  color: var(--danger);
  background: var(--bg-card);
  border-radius: 50px;
  padding: 0.5rem 1rem;
}
.btn-clear-filters:hover {
  background: var(--danger);
  color: #fff;
}

/* Con icono */
.btn-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 50px;
  font-weight: 500;
}

/* Estado deshabilitado */
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}
```

#### Estado de carga en botones

```javascript
function setSubmitButtonLoading(loading) {
  const btn = document.getElementById('btnSubmit');
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Enviando...';
  } else {
    btn.disabled = false;
    btn.innerHTML = 'Enviar Postulación';
  }
}
```

---

### 4. FORMULARIOS

#### Estructura HTML

```html
<form id="miFormulario" onsubmit="submitFormulario(event)">

  <!-- Info contextual (opcional) -->
  <div class="form-info-card">
    <span class="material-icons">info</span>
    <p>Texto de contexto importante para el usuario.</p>
  </div>

  <!-- Fila de dos columnas -->
  <div class="form-row">
    <div class="form-group">
      <label class="form-label" for="nombre">
        Nombre <span class="required">*</span>
      </label>
      <input class="form-input" type="text" id="nombre" name="nombre"
             placeholder="Tu nombre completo" autocomplete="name">
      <div class="form-error" id="errorNombre" role="alert"></div>
    </div>

    <div class="form-group">
      <label class="form-label" for="email">
        Correo institucional <span class="required">*</span>
      </label>
      <input class="form-input" type="email" id="email" name="email"
             placeholder="usuario@unal.edu.co">
      <div class="form-hint">Solo se aceptan correos @unal.edu.co</div>
      <div class="form-error" id="errorEmail" role="alert"></div>
    </div>
  </div>

  <!-- Acciones del formulario -->
  <div class="form-actions">
    <button type="button" class="btn-cancelar" onclick="cerrarModal()">Cancelar</button>
    <button type="submit" class="btn-postular" id="btnSubmit">Enviar</button>
  </div>

</form>
```

#### CSS de formularios

```css
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}
@media (max-width: 600px) {
  .form-row { grid-template-columns: 1fr; }
}

.form-group { display: flex; flex-direction: column; gap: 0.375rem; }

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}
.required { color: var(--danger); }

.form-input {
  padding: 0.625rem 0.875rem;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 16px;  /* Evita zoom en iOS */
  color: var(--text-primary);
  background: var(--bg-card);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-input:focus {
  outline: none;
  border-color: var(--unal-green);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15);
}
.form-input.error {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
.form-input.valid {
  border-color: var(--success);
}

.form-error {
  font-size: 0.8rem;
  color: var(--danger);
  min-height: 1.2em;   /* Reserva espacio para evitar layout shift */
  display: none;
}
.form-error.visible { display: block; }

.form-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.form-info-card {
  background: var(--unal-green-bg);
  border: 1px solid var(--unal-green-light);
  border-radius: var(--radius);
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: 0.9rem;
}
.form-info-card .material-icons { color: var(--unal-green); flex-shrink: 0; }

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}
```

#### JS: Validación en tiempo real

```javascript
// Validación de un campo individual
function validateField(fieldId) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById('error' + fieldId.charAt(0).toUpperCase() + fieldId.slice(1));
  let error = '';

  // Reglas por campo
  if (fieldId === 'email') {
    if (!field.value) error = 'El correo es requerido';
    else if (!field.value.endsWith('@unal.edu.co')) error = 'Solo correos @unal.edu.co';
  }
  // ... más reglas

  if (error) {
    field.classList.add('error');
    field.classList.remove('valid');
    errorEl.textContent = error;
    errorEl.classList.add('visible');
  } else {
    field.classList.remove('error');
    field.classList.add('valid');
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
  }
  return !error;
}

// Configurar validación al salir de cada campo
function setupRealtimeValidation() {
  ['nombre', 'email', 'documento'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validateField(id));
  });
}
```

#### Reglas de validación (dominio UNAL)

| Campo | Regla |
|-------|-------|
| Email | Debe terminar en `@unal.edu.co` |
| Documento | 6–12 dígitos numéricos |
| Teléfono | 10 dígitos, empieza con `3` (móvil colombiano) |
| PAPA | Número 0–5, máximo 2 decimales |
| PBM | Entero 0–100 |
| Nombres | Solo letras y acentos, máx 50 caracteres |

---

### 5. BÚSQUEDA Y FILTROS

```html
<!-- Barra de búsqueda -->
<div class="search-box">
  <span class="material-icons">search</span>
  <input type="text" id="searchInput" placeholder="Buscar convocatorias...">
</div>

<!-- Botones de filtro -->
<div class="filters">
  <button class="filter-btn active" data-filter="all">Todas</button>
  <button class="filter-btn" data-filter="práctica">Prácticas</button>
  <button class="filter-btn" data-filter="pasantía">Pasantías</button>
  <button class="filter-btn" data-filter="interna">Internas</button>
  <button class="filter-btn" data-filter="externa">Externas</button>
</div>

<!-- Contador de filtros activos -->
<div class="active-filters-badge" id="activeFiltersBadge" style="display:none">
  <span id="activeFiltersCount">2</span> filtros activos
  <button class="btn-clear-filters" onclick="clearAllFilters()">Limpiar filtros</button>
</div>
```

```javascript
// Motor de filtrado
function applyFilters() {
  const query = document.getElementById('searchInput').value
    .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  filteredConvocatorias = allConvocatorias.filter(conv => {
    const matchesSearch = !query || [conv.titulo, conv.dependenciaEntidad, conv.descripcion]
      .some(field => (field || '').toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .includes(query));

    const matchesTipo = !activeFilters.tipo ||
      conv.tipoModalidad?.toLowerCase() === activeFilters.tipo;

    const matchesOrigen = !activeFilters.origen ||
      conv.origen?.toLowerCase() === activeFilters.origen;

    return matchesSearch && matchesTipo && matchesOrigen;
  });

  updateActiveFiltersBadge();
  renderCards();
}

// Búsqueda con debounce (300ms)
document.getElementById('searchInput').addEventListener(
  'input', debounce(applyFilters, 300)
);
```

---

### 6. ESTADOS VACÍOS Y DE CARGA

#### Empty state

```html
<div class="empty-state">
  <span class="material-icons">search_off</span>
  <h3>No se encontraron convocatorias</h3>
  <p>Intenta con otros términos de búsqueda o limpia los filtros.</p>
  <button class="btn-clear-filters" onclick="clearAllFilters()">Limpiar filtros</button>
</div>
```

```css
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}
.empty-state .material-icons {
  font-size: 4rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}
.empty-state h3 { margin-bottom: 0.5rem; color: var(--text-primary); }
```

#### Skeleton loading

```javascript
function showSkeletonCards(count = 6) {
  const container = document.getElementById('cardsContainer');
  container.innerHTML = Array(count).fill(`
    <div class="card skeleton-card">
      <div class="skeleton skeleton-badges"></div>
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text short"></div>
    </div>
  `).join('');
}
```

```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}
```

---

### 7. BARRA DE ESTADÍSTICAS

```html
<div class="stats-bar">
  <div class="stat-item">
    <div class="stat-number" id="statVacantes">-</div>
    <div class="stat-label">Vacantes</div>
  </div>
  <div class="stat-item">
    <div class="stat-number" id="statPracticas">-</div>
    <div class="stat-label">Prácticas</div>
  </div>
  <div class="stat-item">
    <div class="stat-number" id="statPasantias">-</div>
    <div class="stat-label">Pasantías</div>
  </div>
  <div class="stat-item">
    <div class="stat-number" id="statCupos">-</div>
    <div class="stat-label">Cupos totales</div>
  </div>
</div>
```

```css
.stats-bar {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}
.stat-item {
  text-align: center;
  background: var(--bg-card);
  padding: 1rem 1.5rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  min-width: 100px;
}
.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--unal-green);
}
.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

### 8. ACCORDION

```html
<div class="accordion">
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAccordion(this)">
      <div class="accordion-title">
        <span class="material-icons">checklist</span>
        Requisitos
      </div>
      <span class="expand-icon material-icons">expand_more</span>
    </div>
    <div class="accordion-content">
      <p>Contenido del accordion...</p>
    </div>
  </div>
</div>
```

```javascript
function toggleAccordion(header) {
  const item = header.parentElement;
  const content = item.querySelector('.accordion-content');
  const icon = header.querySelector('.expand-icon');
  const isOpen = item.classList.contains('open');

  // Cerrar todos los demás
  document.querySelectorAll('.accordion-item.open').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.accordion-content').style.display = 'none';
    el.querySelector('.expand-icon').style.transform = 'rotate(0deg)';
  });

  if (!isOpen) {
    item.classList.add('open');
    content.style.display = 'block';
    icon.style.transform = 'rotate(180deg)';
  }
}
```

---

## Patrones de JavaScript

### Gestión de estado global

```javascript
let allConvocatorias = [];        // Datos crudos del backend
let filteredConvocatorias = [];   // Datos filtrados actualmente mostrados
let activeFilters = {
  tipo: null,    // 'práctica' | 'pasantía' | null
  origen: null   // 'interna' | 'externa' | null
};
let currentConvocatoriaId = null; // ID de la convocatoria con modal abierto
```

### Flujo de datos

```
GAS Backend (Code.gs)
  ↓ google.script.run
handleDataSuccess(result)
  ↓
Poblar allConvocatorias + filteredConvocatorias
  ↓ renderCards()
DOM actualizado
  ↓ Interacción del usuario (filtros, búsqueda)
applyFilters() → updateStats() → renderCards()
```

### Prevención de XSS

```javascript
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// SIEMPRE usar al insertar datos en innerHTML:
container.innerHTML = `<p>${escapeHtml(datoDelUsuario)}</p>`;
```

### Debounce

```javascript
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
// Búsqueda: debounce(applyFilters, 300)
```

---

## Patrones de Backend (Code.gs)

### Estructura de respuesta estándar

```javascript
// Éxito
return { success: true, data: resultado, stats: {} };

// Error
return { success: false, error: mensaje, tipo: 'TIPO_ERROR' };
```

### Tipos de error en postulaciones

| `tipo` | Significado |
|--------|-------------|
| `ESTUDIANTE_SELECCIONADO` | Ya fue seleccionado en otra convocatoria |
| `POSTULACION_NO_SELECCIONADA` | No fue seleccionado en esta convocatoria |
| `POSTULACION_DUPLICADA` | Ya postuló a esta convocatoria |
| `LIMITE_POSTULACIONES` | Tiene 2 o más postulaciones pendientes |
| `RATE_LIMIT` | Demasiados intentos en poco tiempo |
| `PERMISSION_DENIED` | No es correo @unal.edu.co |
| `VALIDATION_ERROR` | Datos del formulario inválidos |

### Verificación de permisos (obligatoria en toda función pública)

```javascript
function getConvocatorias() {
  const userEmail = Session.getActiveUser().getEmail();
  if (!userEmail?.endsWith('@unal.edu.co')) {
    return { success: false, error: 'PERMISSION_DENIED' };
  }
  // ... lógica
}
```

### Mapeo de columnas de Sheets

```javascript
// SIEMPRE usar constantes de columnas, NUNCA índices crudos
const COLUMNAS = {
  ESTADO: 0,
  DEPENDENCIA_ENTIDAD: 1,
  NOMBRE_VACANTE: 2,
  // ...
};

// Uso correcto:
const estado = row[COLUMNAS.ESTADO];

// NUNCA:
const estado = row[0]; // ❌
```

### Patrón try/catch en backend

```javascript
function miFuncionBackend(args) {
  try {
    // operación
    return { success: true, data: resultado };
  } catch (error) {
    console.error('contexto del error:', error);
    return { success: false, error: error.message, tipo: 'INTERNAL_ERROR' };
  }
}
```

---

## Convenciones de Código

### Nomenclatura

| Contexto | Convención | Ejemplos |
|----------|------------|----------|
| Funciones de dominio (backend) | camelCase, verbos españoles | `validarDatosPostulacion`, `guardarPostulacion` |
| Funciones utilitarias | camelCase, verbos ingleses | `escapeHtml`, `debounce`, `renderCards` |
| Constantes de columnas | SCREAMING_SNAKE_CASE | `COLUMNAS`, `COL_POST`, `RATE_LIMIT_CONFIG` |
| Variables CSS | kebab-case con prefijo | `--unal-green`, `--text-primary`, `--shadow-md` |
| Clases CSS | kebab-case, BEM-like | `.card-header`, `.accordion-item`, `.modal-overlay` |
| IDs HTML | camelCase | `cardsContainer`, `searchInput`, `modalOverlay` |
| Data attributes | kebab-case | `data-filter`, `data-id` |
| Booleanos | prefijo is/has/puede | `isValid`, `isOpen`, `puedePostularse` |
| Arrays | plural | `allConvocatorias`, `filteredConvocatorias` |

### Idioma

- **UI y textos:** español
- **Variables y funciones de dominio:** español
- **Utilidades técnicas:** inglés
- **Seguir el idioma del archivo circundante**

### Formato

- Indentación: 2 espacios
- Siempre `===` y `!==` (nunca `==` o `!=`)
- Template literals para HTML generado dinámicamente
- Early returns para validaciones
- Destructuring donde aplique
- Vanilla JS — sin jQuery, React ni bundlers

---

## Seguridad — Issues conocidos (no re-introducir)

| # | Problema | Ubicación |
|---|----------|-----------|
| 1 | XSS en templates de email — datos sin escapar en HTML | `Code.gs` funciones de email |
| 2 | XSS en mensajes frontend — `innerHTML` con strings no sanitizados | `Index.html` |
| 3 | Fail-open en `validarEstadoEstudiante()` — permite postulación en excepción | `Code.gs` |
| 4 | IDs de spreadsheet hardcodeados en git | `Code.gs` fallbacks de `getConfig()` |
| 5 | `postMessage` con origen wildcard `'*'` | Todos los HTML |
| 6 | Igualdad débil `==` en rutas críticas | `Code.gs` |

**Regla:** en validaciones de seguridad, **denegar por defecto** — nunca retornar estado permisivo en excepción.

---

## Checklist para Nueva Sección

Al crear una nueva sección en `sections/`:

- [ ] Carpeta en `sections/nombre-seccion/`
- [ ] Archivo `nombre-seccion.html` autocontenido (CSS + JS + HTML en un solo archivo)
- [ ] Fallback de mock data para desarrollo local
- [ ] Comunicación de altura: `window.parent.postMessage({ type: 'setHeight', height }, '*')`
- [ ] `initAccessibleModal()` para todos los modales
- [ ] Usar variables CSS del design system (`var(--unal-green)`, `var(--border)`, etc.)
- [ ] Breakpoints responsive: 480px, 600px, 768px, 992px
- [ ] Touch targets mínimo 44x44px en mobile
- [ ] `escapeHtml()` para todo dato usuario interpolado en HTML
- [ ] Si tiene backend: `Code.gs` propio, verificación de `@unal.edu.co`, `doGet()` presente
- [ ] Columnas de Sheets mapeadas en constante `COL_*`
- [ ] Manejo de error fail-closed

---

## Checklist Modal Accessibility (WCAG 2.1 AA)

- [ ] Usa `initAccessibleModal()` 
- [ ] `role="dialog"` en el overlay
- [ ] `aria-labelledby` → ID del título
- [ ] `aria-describedby` → ID de la descripción
- [ ] Focus inicial en botón primario (acción principal)
- [ ] ESC cierra sin ejecutar acción
- [ ] Focus vuelve al elemento disparador al cerrar
- [ ] Click en overlay cierra modal
- [ ] Body scroll deshabilitado mientras el modal está abierto
- [ ] Mobile: modal full-width anclado al bottom

---

## Gotchas Importantes

- **Sin módulos en Apps Script.** Todas las funciones `.gs` son globales — colisiones de nombres sobreescriben silenciosamente.
- **`doGet()` obligatorio** en todo proyecto Apps Script que sirve HTML.
- **Triggers de Sheets corren server-side.** `onEditPostulaciones()` se ejecuta en contexto Apps Script, no en el browser.
- **Rate limiting usa `CacheService`** (efímero, ~6h TTL). Se resetea con la caché, no con el deployment.
- **Min-heights de iframes están hardcodeados en CSS.** Actualizar si el contenido cambia significativamente.
- **`font-size: 16px` en inputs** previene zoom automático en iOS — no bajar de 16px.
- **`-webkit-line-clamp`** para truncar texto en cards — siempre acompañado de `display: -webkit-box` y `overflow: hidden`.
- **La grilla de cards usa `auto-fill` con `minmax(340px, 1fr)`** — ajustar el `minmax` si las cards tienen contenido más compacto o extenso.

---

## Despliegue

Sin build step. Despliegue manual:

1. Abrir el proyecto en script.google.com
2. Pegar `Code.gs` y el `.html` correspondiente
3. Para el proyecto raíz: correr `setupConfiguration()` una vez
4. Implementar → Nueva implementación → App web
5. Pegar la URL `/exec` en el iframe de Google Sites
