# Diseño: Mejora de Accesibilidad en Modales de Confirmación

**Fecha:** 2026-02-12
**Tipo:** Mejora de UX/Accesibilidad
**Archivos afectados:**
- `sections/banco-perfiles/banco-perfiles.html`
- `sections/banco-perfiles-externos/banco-perfiles-externos.html`

---

## Problema

Los modales de confirmación (eliminar perfil, limpiar formulario) no gestionan correctamente el foco del teclado, causando problemas de accesibilidad:

1. **Sin foco automático**: Al abrir el modal, el foco permanece en el elemento que lo activó
2. **Sin focus trap**: El usuario puede presionar Tab y salir del modal accidentalmente
3. **Sin restauración**: Al cerrar, el foco queda perdido en el documento
4. **Sin navegación por teclado**: Enter/Escape no funcionan correctamente
5. **Scroll descontrolado**: El modal puede abrirse fuera de la vista del usuario

### Impacto
- ❌ Usuarios de teclado deben hacer clic con mouse
- ❌ Lectores de pantalla no anuncian el modal correctamente
- ❌ No cumple con WCAG 2.1 (criterios 2.1.2, 2.4.3)

---

## Solución: Focus Management Pattern

Implementar el patrón estándar de gestión de foco para modales (ARIA Authoring Practices Guide).

### Arquitectura

#### 1. Focus Trap (Trampa de Foco)

**Elementos focusables en el modal:**
- Botón "Cancelar" (`#btnCancelConfirm`)
- Botón primario "Eliminar/Aceptar" (`#btnAcceptConfirm`)

**Comportamiento:**
- Tab: navega entre botones en ciclo cerrado (Eliminar → Cancelar → Eliminar)
- Shift+Tab: ciclo inverso
- Enter: ejecuta el botón enfocado
- Escape: cierra el modal (sin ejecutar acción destructiva)

#### 2. Foco Automático al Abrir

**Secuencia:**
1. Guardar `document.activeElement` (elemento que abrió el modal)
2. Hacer scroll al top del iframe (comunicar con `postMessage`)
3. Fijar body para prevenir scroll
4. Mostrar modal (`visible` class)
5. Enfocar automáticamente el botón primario después de 100ms

#### 3. Scroll Management

**Al abrir:**
- Comunicar al iframe parent: `postMessage({ type: 'scrollToTop' })`
- Fijar posición del body (ya implementado)
- Resetear scroll interno del modal

**Al cerrar:**
- Restaurar scroll del body
- Mantener posición original del documento

#### 4. Restauración del Foco

**Al cerrar (cancelar, aceptar, Escape):**
1. Ejecutar callback si aplica
2. Ocultar modal
3. Restaurar scroll del body
4. Restaurar foco al elemento guardado (después de 100ms)

---

## Implementación Técnica

### Variables Globales

```javascript
let lastFocusedElement = null;  // Elemento que abrió el modal
```

### Funciones Modificadas

#### `showConfirm()` / `showConfirmModal()`

**Cambios:**
1. Guardar `lastFocusedElement = document.activeElement`
2. Agregar scroll al top: `window.parent.postMessage({ type: 'scrollToTop' }, '*')`
3. Enfocar botón primario: `setTimeout(() => btnAcceptConfirm.focus(), 100)`
4. Agregar event listener para focus trap

#### `hideConfirm()` / `closeConfirmModal()`

**Cambios:**
1. Remover event listener de focus trap
2. Restaurar foco: `setTimeout(() => lastFocusedElement?.focus(), 100)`
3. Limpiar `lastFocusedElement = null`

#### Nueva función: `trapFocus()`

```javascript
function trapFocus(modal, firstElement, lastElement) {
  modal.addEventListener('keydown', handleTrapFocus);
}

function handleTrapFocus(e) {
  const btnAccept = document.getElementById('btnAcceptConfirm');
  const btnCancel = document.getElementById('btnCancelConfirm');

  if (e.key === 'Tab') {
    if (!e.shiftKey && document.activeElement === btnCancel) {
      e.preventDefault();
      btnAccept.focus();
    } else if (e.shiftKey && document.activeElement === btnAccept) {
      e.preventDefault();
      btnCancel.focus();
    }
  }
}
```

---

## Casos de Uso Cubiertos

Este diseño aplica automáticamente a:
1. ✅ Modal de eliminar perfil
2. ✅ Modal de limpiar formulario
3. ✅ Cualquier uso futuro del modal de confirmación genérico

---

## Flujo de Usuario Completo

### Escenario: Eliminar perfil con teclado

1. Usuario navega con Tab hasta botón "Eliminar perfil"
2. Presiona Enter
3. **Modal se abre:**
   - Scroll sube al top del iframe
   - Foco va automáticamente a botón "Eliminar" (rojo)
4. Usuario puede:
   - Presionar Enter → elimina y cierra
   - Presionar Tab → va a "Cancelar"
   - Presionar Escape → cancela y cierra
5. **Modal se cierra:**
   - Foco regresa automáticamente al botón "Eliminar perfil"
6. Usuario continúa navegando sin interrupciones

---

## Testing

### Checklist de Accesibilidad

- [ ] Modal recibe foco automáticamente al abrir
- [ ] Tab/Shift+Tab cicla entre botones sin escapar
- [ ] Enter ejecuta el botón enfocado
- [ ] Escape cierra el modal
- [ ] Foco regresa al elemento original al cerrar
- [ ] Scroll se ajusta al top del iframe
- [ ] Funciona con lector de pantalla (NVDA/JAWS)
- [ ] Funciona en Chrome, Firefox, Safari
- [ ] Funciona en móviles (iOS/Android)

---

## Beneficios

- ✅ Accesible para usuarios de teclado
- ✅ Compatible con lectores de pantalla
- ✅ Cumple con WCAG 2.1 AA
- ✅ Mejor UX para todos los usuarios
- ✅ Implementación reutilizable (modal genérico)

---

## Referencias

- [ARIA Authoring Practices Guide - Modal Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WCAG 2.1 - Focus Order (2.4.3)](https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html)
- [WCAG 2.1 - Keyboard (2.1.1)](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)
