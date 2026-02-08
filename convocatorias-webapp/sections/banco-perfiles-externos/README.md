# Banco de Perfiles Externos

Formulario web para que entidades externas registren perfiles de prácticas y pasantías disponibles para estudiantes de la UNAL Sede de La Paz.

---

## Descripción

Este módulo permite a **entidades externas** (empresas, ONGs, organizaciones, etc.) postular perfiles para recibir estudiantes en modalidad de práctica o pasantía. Es una versión específica del banco de perfiles, diferenciada del banco de perfiles internos (dependencias de la Universidad).

**Características principales:**
- Formulario único (no permite múltiples perfiles por envío, a diferencia del banco interno)
- Enfocado en entidades externas a la Universidad
- Campos específicos: teléfono de contacto, habilidades/actitudes, tipos de apoyo
- Guarda registros en una hoja separada: `Perfiles Externos`
- Envío de notificación por correo electrónico al equipo de prácticas

---

## Arquitectura

```
banco-perfiles-externos/
├── banco-perfiles-externos.html  # Frontend: formulario web
├── Código.js                     # Backend: Google Apps Script
└── README.md                     # Esta documentación
```

### Frontend (`banco-perfiles-externos.html`)
- **Tecnología:** HTML5 + CSS3 + Vanilla JavaScript
- **Estilos:** CSS variables con esquema de colores azul (diferenciado del verde institucional)
- **Funcionalidades:**
  - Validación en tiempo real
  - Íconos de validación
  - Loading overlay durante envío
  - Mensaje de éxito post-envío
  - Responsive design (mobile-first)
  - Fallback mock para desarrollo local
  - Comunicación de altura con iframe padre

### Backend (`Código.js`)
- **Tecnología:** Google Apps Script
- **Funcionalidades:**
  - Inicialización automática de hoja `Perfiles Externos`
  - Guardado de datos en Google Sheets
  - Envío de notificaciones por email
  - Escape de HTML para prevenir XSS
  - Manejo de errores robusto

---

## Campos del Formulario

### Datos de la Entidad Externa
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| Nombre de la Entidad | Texto | ✅ | Razón social o nombre de la organización |
| Correo electrónico | Email | ✅ | Email de contacto principal |
| Responsable | Texto | ✅ | Persona responsable del contacto |
| Teléfono de contacto | Tel | ✅ | Número telefónico |

### Información del Perfil
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| Modalidad | Radio | ✅ | Presencial / Virtual / Híbrida |
| Programas académicos | Checkbox | ✅ | Uno o varios de los 6 programas de la sede |
| Competencias específicas | Textarea | ✅ | Conocimientos técnicos deseados |
| Habilidades o actitudes | Textarea | ✅ | Soft skills y actitudes valoradas |
| Apoyo al estudiante | Radio | ✅ | SI / NO |
| Tipo de apoyo | Checkbox | Condicional* | Auxilio económico, Alimentación, Transporte, Otro, Ninguno |
| Observaciones | Textarea | ✅ | Comentarios adicionales, sugerencias, condiciones |

\* *Requerido solo si "Apoyo al estudiante" = SI*

---

## Instalación y Configuración

### 1. Crear proyecto en Google Apps Script

1. Ve a [script.google.com](https://script.google.com)
2. Crea un **nuevo proyecto** standalone
3. Nombra el proyecto: `Banco Perfiles Externos - UNAL La Paz`

### 2. Subir archivos

1. Copia el contenido de `banco-perfiles-externos.html` → crea archivo HTML en Apps Script
2. Copia el contenido de `Código.js` → pega en `Code.gs` (o crea nuevo .gs)

### 3. Configurar Google Sheet

1. Crea una nueva **Google Spreadsheet**
2. Copia el **Sheet ID** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_SHEET_ID]/edit
   ```

### 4. Ejecutar setup

En el editor de Apps Script:

```javascript
// PASO 1: Autorizar permisos
autorizarPermisosExternos()

// PASO 2: Configurar (edita el Sheet ID primero)
setupBancoPerfilesExternos()

// PASO 3: Verificar
testConfigurationExternos()
```

**Importante:** Antes de ejecutar `setupBancoPerfilesExternos()`, edita los valores en el código:

```javascript
const config = {
  'BANCO_PERFILES_EXTERNOS_SHEET_ID': 'TU_SHEET_ID_AQUI',  // ← Cambiar
  'EMAIL_NOTIFICACION_EXTERNOS': 'practicas_paz@unal.edu.co'
};
```

### 5. Implementar como Web App

1. En Apps Script: **Implementar** → **Nueva implementación**
2. Tipo: **Aplicación web**
3. Configuración:
   - **Descripción:** Banco de Perfiles Externos v1.0
   - **Ejecutar como:** Yo (tu cuenta)
   - **Quién tiene acceso:** Cualquier usuario
4. Clic en **Implementar**
5. Copia la **URL de la app web** (termina en `/exec`)

### 6. Embeber en Google Sites

1. Abre tu Google Site
2. Agrega un **elemento de inserción** (Embed)
3. Pega la URL `/exec` obtenida
4. Ajusta altura mínima: `1200px` (se ajusta automáticamente)

---

## Estructura de Datos (Google Sheet)

La hoja `Perfiles Externos` contiene las siguientes columnas:

| # | Columna | Tipo | Descripción |
|---|---------|------|-------------|
| A | Fecha de Registro | Timestamp | Fecha y hora del registro |
| B | Nombre Entidad | Texto | Nombre de la organización |
| C | Correo Contacto | Email | Email principal |
| D | Responsable | Texto | Persona responsable |
| E | Teléfono Contacto | Texto | Número telefónico |
| F | Modalidad Trabajo | Texto | Presencial/Virtual/Híbrida |
| G | Programas Académicos | Texto | Lista separada por comas |
| H | Competencias Específicas | Texto | Descripción de competencias |
| I | Habilidades/Actitudes | Texto | Soft skills valoradas |
| J | Apoyo Estudiante | Texto | SI/NO |
| K | Tipo de Apoyo | Texto | Lista separada por comas |
| L | Observaciones | Texto | Comentarios adicionales |

---

## Notificaciones por Email

Cuando se envía un formulario exitosamente, se envía un email a `practicas_paz@unal.edu.co` con:

- **Asunto:** 🏢 Nuevo registro de Entidad Externa - [Nombre Entidad]
- **Contenido:**
  - Datos de la entidad
  - Información completa del perfil
  - Formato HTML profesional con colores azules

---

## Diferencias con Banco de Perfiles (Interno)

| Característica | Interno | Externo |
|----------------|---------|---------|
| **Público objetivo** | Dependencias UNAL | Entidades externas |
| **Número de perfiles** | Múltiples por envío | Uno por envío |
| **Campo teléfono** | ❌ No | ✅ Sí |
| **Campo habilidades** | ❌ No (solo competencias) | ✅ Sí (campo separado) |
| **Tipo de modalidad** | Práctica/Pasantía | Solo modalidad de trabajo |
| **Cantidad estudiantes** | ✅ Sí | ❌ No |
| **Color tema** | Verde institucional | Azul (diferenciación) |
| **Hoja destino** | `Banco de Perfiles` | `Perfiles Externos` |

---

## Desarrollo Local

Para probar el formulario sin backend:

1. Abre `banco-perfiles-externos.html` directamente en navegador
2. El código detecta ausencia de `google.script.run`
3. Activa modo mock: simula envío exitoso después de 1.5s
4. Los datos se imprimen en la consola del navegador

```javascript
// Modo desarrollo automático
if (typeof google !== 'undefined' && google.script && google.script.run) {
  // Producción: llama al backend
} else {
  // Desarrollo: modo mock
  console.log('Datos del formulario (modo desarrollo):', formData);
}
```

---

## Seguridad

### Protecciones implementadas:
- ✅ **Escape de HTML** en emails (función `escapeHtml()`)
- ✅ **Validación de datos** en frontend y backend
- ✅ **Fail-closed**: retorna error si falta data requerida
- ✅ **No expone Sheet ID** en frontend
- ✅ **Script Properties** para configuración sensible

### Precauciones:
- ⚠️ `postMessage` usa wildcard `'*'` (limitación de iframe cross-origin)
- ⚠️ `XFrameOptionsMode.ALLOWALL` permite embedding en cualquier sitio

---

## Mantenimiento

### Agregar un nuevo programa académico

1. **Frontend** (`banco-perfiles-externos.html`):
   ```html
   <label class="checkbox-label">
     <input type="checkbox" name="programas" value="L007 - Nuevo Programa">
     L007 - Nuevo Programa
   </label>
   ```

2. **Backend**: No requiere cambios (lee dinámicamente los checkboxes marcados)

### Cambiar email de notificación

```javascript
// Opción A: Editar en setupBancoPerfilesExternos() y re-ejecutar
const config = {
  'EMAIL_NOTIFICACION_EXTERNOS': 'nuevo_email@unal.edu.co'
};

// Opción B: Editar directamente Script Properties en Apps Script
```

### Modificar campos del formulario

1. Edita HTML del campo en `banco-perfiles-externos.html`
2. Edita recolección de datos en función `submitForm()`
3. Edita backend `submitBancoPerfilesExternos()` si hay validaciones
4. Edita `saveToSheetExternos()` para incluir nueva columna
5. Edita `initializeSheetExternos()` para agregar header
6. Edita `buildEmailTemplateExternos()` para mostrar en email

---

## Solución de Problemas

### Error: "Sheet ID no configurado"
**Causa:** No ejecutaste `setupBancoPerfilesExternos()` o usaste el ID por defecto  
**Solución:** Edita el Sheet ID en `setupBancoPerfilesExternos()` y ejecuta la función

### Error: "No tienes permisos de edición en el Sheet"
**Causa:** El Sheet ID apunta a un archivo que no posees  
**Solución:** Verifica que seas propietario o tengas permisos de edición

### Formulario no envía datos
**Causa:** URL incorrecta o no está implementado como Web App  
**Solución:** Verifica que uses la URL `/exec` (no `/dev`) y que esté implementado

### Email no llega
**Causa:** Límites de cuota de MailApp o email incorrecto  
**Solución:** 
- Verifica el email en Script Properties
- Revisa logs: `Ver > Registros de ejecución`
- Cuota diaria: 100 emails/día para cuentas gratuitas

### Altura del iframe incorrecta
**Causa:** `postMessage` no funciona en todos los navegadores/contextos  
**Solución:** Establece altura mínima manual en Google Sites (1200-1500px)

---

## Contacto y Soporte

**Universidad Nacional de Colombia - Sede de La Paz**  
Escuela de Pregrados  
Email: practicas_paz@unal.edu.co

---

## Licencia

Este código es propiedad de la Universidad Nacional de Colombia - Sede de La Paz.  
Uso interno exclusivo para gestión de prácticas y pasantías.
