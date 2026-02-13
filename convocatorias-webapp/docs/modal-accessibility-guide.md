# Guía de Accesibilidad para Modales

## Resumen Ejecutivo

Esta guía documenta el patrón estándar de accesibilidad para modales en la aplicación. **Todos los modales nuevos deben usar la utilidad `initAccessibleModal()`** para garantizar la accesibilidad desde el principio.

---

## Tabla de Contenidos

1. [¿Por qué es importante?](#por-qué-es-importante)
2. [API de initAccessibleModal()](#api-de-initaccessiblemodal)
3. [Ejemplos Completos](#ejemplos-completos)
4. [Mejores Prácticas](#mejores-prácticas)
5. [Solución de Problemas](#solución-de-problemas)
6. [Checklist de QA](#checklist-de-qa)

---

## ¿Por qué es importante?

### Problemas sin accesibilidad

**Antes de implementar el patrón:**
- ❌ Usuarios de teclado no pueden navegar el modal
- ❌ Lectores de pantalla no anuncian el modal correctamente
- ❌ Tab puede salir del modal accidentalmente
- ❌ El foco queda perdido al cerrar el modal
- ❌ No cumple WCAG 2.1 AA

**Después de implementar el patrón:**
- ✅ Navegación completa por teclado
- ✅ Focus trap funcional (Tab/Shift+Tab)
- ✅ Foco restaurado al cerrar
- ✅ Scroll automático al top
- ✅ Compatible con lectores de pantalla
- ✅ Cumple WCAG 2.1 AA

---

## API de initAccessibleModal()

### Firma

```javascript
function initAccessibleModal(modalId, options)
```

### Parámetros

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `modalId` | `string` | ✅ | - | ID del elemento modal (sin `#`) |
| `options` | `object` | ❌ | `{}` | Objeto de configuración |

### Opciones (options)

| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `primaryButton` | `string` | - | ID del botón primario (recibe foco inicial) |
| `secondaryButton` | `string` | - | ID del botón secundario (para focus trap) |
| `scrollToTop` | `boolean` | `true` | Si debe hacer scroll al top del iframe |
| `focusDelay` | `number` | `100` | Delay (ms) antes de enfocar |

### Retorno

Objeto con los siguientes métodos:

| Método | Descripción |
|--------|-------------|
| `show()` | Muestra el modal con todas las características de accesibilidad |
| `hide()` | Oculta el modal y restaura el foco |
| `isOpen()` | Retorna `true` si el modal está visible |

---

## Ejemplos Completos

### Ejemplo 1: Modal de Confirmación Simple

```javascript
// Variables globales
let confirmModal = null;
let pendingCallback = null;

// Función para mostrar el modal
function showConfirm(title, message, onConfirm) {
  // Lazy initialization (solo una vez)
  if (!confirmModal) {
    confirmModal = initAccessibleModal('confirmModal', {
      primaryButton: 'btnConfirmAccept',
      secondaryButton: 'btnConfirmCancel',
      scrollToTop: true
    });
  }

  // Actualizar contenido
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;

  // Guardar callback
  pendingCallback = onConfirm;

  // Mostrar modal
  confirmModal.show();
}

// Función para ocultar el modal
function hideConfirm() {
  if (confirmModal) {
    confirmModal.hide();
  }
  pendingCallback = null;
}

// Función para aceptar
function acceptConfirm() {
  if (pendingCallback) {
    pendingCallback();
  }
  hideConfirm();
}

// Event listeners (en DOMContentLoaded)
document.getElementById('btnConfirmAccept').addEventListener('click', acceptConfirm);
document.getElementById('btnConfirmCancel').addEventListener('click', hideConfirm);

// Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && confirmModal && confirmModal.isOpen()) {
    hideConfirm();
  }
});
```

### Ejemplo 2: Modal con Contenido Dinámico

```javascript
let editModal = null;

function showEditModal(itemId, itemData) {
  // Inicializar modal
  if (!editModal) {
    editModal = initAccessibleModal('editModal', {
      primaryButton: 'btnSaveEdit',
      secondaryButton: 'btnCancelEdit',
      scrollToTop: true
    });
  }

  // Rellenar formulario con datos
  document.getElementById('editItemId').value = itemId;
  document.getElementById('editItemName').value = itemData.name;
  document.getElementById('editItemDesc').value = itemData.description;

  // Configurar botón de guardar
  document.getElementById('btnSaveEdit').onclick = function() {
    const updatedData = {
      id: itemId,
      name: document.getElementById('editItemName').value,
      description: document.getElementById('editItemDesc').value
    };

    // Guardar y cerrar
    saveItem(updatedData);
    editModal.hide();
  };

  // Configurar botón de cancelar
  document.getElementById('btnCancelEdit').onclick = function() {
    editModal.hide();
  };

  // Mostrar modal
  editModal.show();
}
```

### Ejemplo 3: Modal con Múltiples Botones

Si tienes más de 2 botones, el focus trap funciona solo entre los 2 especificados. Otros botones son accesibles pero no participan en el ciclo.

```javascript
let advancedModal = null;

function showAdvancedModal() {
  if (!advancedModal) {
    advancedModal = initAccessibleModal('advancedModal', {
      primaryButton: 'btnSubmit',      // Primera parada del Tab
      secondaryButton: 'btnCancel',    // Última parada del Tab
      scrollToTop: true
    });
  }

  // Botones adicionales son accesibles pero no están en el ciclo Tab
  document.getElementById('btnHelp').onclick = function() {
    showHelp();
  };

  document.getElementById('btnSubmit').onclick = function() {
    submitForm();
    advancedModal.hide();
  };

  document.getElementById('btnCancel').onclick = function() {
    advancedModal.hide();
  };

  advancedModal.show();
}
```

---

## Mejores Prácticas

### 1. Lazy Initialization

✅ **Recomendado:**
```javascript
let myModal = null;

function showModal() {
  if (!myModal) {
    myModal = initAccessibleModal('myModalId', {...});
  }
  myModal.show();
}
```

❌ **Evitar:**
```javascript
// Inicializar antes de que el DOM esté listo
const myModal = initAccessibleModal('myModalId', {...}); // Error!
```

### 2. Orden de Botones

El **botón primario** debe ser la acción principal (generalmente la destructiva o afirmativa):

```javascript
// ✅ Correcto: "Eliminar" es la acción principal
initAccessibleModal('deleteModal', {
  primaryButton: 'btnDelete',    // Acción destructiva
  secondaryButton: 'btnCancel'   // Acción segura
});

// ✅ Correcto: "Guardar" es la acción principal
initAccessibleModal('saveModal', {
  primaryButton: 'btnSave',      // Acción principal
  secondaryButton: 'btnCancel'   // Cancelar
});
```

### 3. Escape Key

Siempre implementa Escape para cerrar el modal:

```javascript
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (myModal && myModal.isOpen()) {
      myModal.hide();
    }
  }
});
```

### 4. Scroll Behavior

- `scrollToTop: true` (default) - Para modales de confirmación
- `scrollToTop: false` - Para modales informativos donde la posición importa

### 5. HTML Semántico

Usa atributos ARIA correctamente:

```html
<div class="modal-overlay" id="myModal"
     role="dialog"
     aria-labelledby="modalTitle"
     aria-describedby="modalDesc"
     aria-modal="true">
  <div class="modal-content">
    <h2 id="modalTitle">Título del Modal</h2>
    <p id="modalDesc">Descripción del modal...</p>

    <div class="modal-actions">
      <button type="button" id="btnCancel">Cancelar</button>
      <button type="button" id="btnAccept">Aceptar</button>
    </div>
  </div>
</div>
```

---

## Solución de Problemas

### Problema: El foco no va al botón primario

**Causa:** El botón no existe cuando se llama `show()`.

**Solución:** Verifica que el ID sea correcto y que el botón exista en el DOM:

```javascript
const btn = document.getElementById('btnPrimary');
if (!btn) {
  console.error('Botón primario no encontrado');
}
```

### Problema: Tab sale del modal

**Causa:** Los botones especificados no existen o tienen IDs incorrectos.

**Solución:** Verifica en la consola:

```javascript
console.log('Primary:', document.getElementById('btnPrimary'));
console.log('Secondary:', document.getElementById('btnSecondary'));
```

### Problema: El foco no se restaura al cerrar

**Causa:** El elemento original fue eliminado del DOM.

**Solución:** No elimines el elemento que abrió el modal mientras está abierto.

### Problema: Multiple modals se interfieren

**Causa:** Reutilizas la misma instancia para diferentes propósitos.

**Solución:** Crea instancias separadas:

```javascript
let confirmModal = initAccessibleModal('confirmModal', {...});
let editModal = initAccessibleModal('editModal', {...});
let deleteModal = initAccessibleModal('deleteModal', {...});
```

---

## Checklist de QA

### Testing Manual

- [ ] **Teclado - Abrir**
  - Navegar con Tab hasta el trigger
  - Presionar Enter para abrir
  - El botón primario recibe foco automáticamente

- [ ] **Teclado - Navegar**
  - Tab mueve entre botones
  - Shift+Tab navega en reversa
  - No se puede salir del modal con Tab

- [ ] **Teclado - Cerrar**
  - Escape cierra el modal
  - Enter en botón ejecuta la acción
  - El foco regresa al trigger original

- [ ] **Mouse**
  - Click en overlay cierra el modal (si implementado)
  - Click en botones funciona correctamente

- [ ] **Scroll**
  - Modal aparece en el top del viewport
  - Scroll del body está bloqueado
  - Scroll se restaura al cerrar

- [ ] **Screen Reader (NVDA/JAWS)**
  - Modal se anuncia al abrir
  - Título se lee correctamente
  - Descripción se lee correctamente
  - Botones tienen labels claros

### Testing Automatizado

```javascript
// Test: Modal debe enfocar botón primario
function testFocusPrimary() {
  myModal.show();
  const focused = document.activeElement;
  const expected = document.getElementById('btnPrimary');
  console.assert(focused === expected, 'Primary button should be focused');
}

// Test: Modal debe restaurar foco
function testRestoreFocus() {
  const trigger = document.getElementById('btnOpenModal');
  trigger.focus();
  myModal.show();
  myModal.hide();
  const focused = document.activeElement;
  console.assert(focused === trigger, 'Focus should return to trigger');
}
```

---

## Referencias

- [ARIA Authoring Practices Guide - Modal Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WCAG 2.1 - Understanding Focus Order](https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html)
- [MDN - ARIA: dialog role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role)
- [WebAIM - Keyboard Accessibility](https://webaim.org/techniques/keyboard/)

---

## Changelog

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2026-02-12 | 1.0 | Versión inicial con `initAccessibleModal()` |
