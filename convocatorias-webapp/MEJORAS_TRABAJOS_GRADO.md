# Propuesta de Mejoras - Sección Trabajos de Grado

> **Página actual:** https://sites.google.com/unal.edu.co/diracademicadelapaz/escuela-de-pregrados/trabajos-de-grado
> **Objetivo:** Mejorar experiencia de usuario y accesibilidad
> **Fecha:** 2026-01-31

---

## 📊 Análisis de la Página Actual

### ✅ Fortalezas
- Estructura clara con secciones bien definidas
- Documentos descargables disponibles
- Información completa de normativa
- Responsive básico

### ❌ Problemas Identificados

| Problema | Impacto | Severidad |
|----------|---------|-----------|
| **Navegación compleja** | Múltiples clics para encontrar info | 🔴 ALTA |
| **Sin wizard/guía paso a paso** | Estudiantes se pierden en el proceso | 🔴 ALTA |
| **Documentos dispersos** | Difícil encontrar formato correcto | 🟡 MEDIA |
| **Sin seguimiento de estado** | No saben en qué fase están | 🟡 MEDIA |
| **Normativa no actualizada visualmente** | Difícil leer PDFs legales | 🟡 MEDIA |
| **Sin FAQ interactivo** | Preguntas repetitivas sin respuesta | 🟢 BAJA |
| **Sin notificaciones** | No hay recordatorios de fechas | 🟢 BAJA |

---

## 🎯 Propuesta de Mejora: Sistema Interactivo de TDG

### Concepto General

Transformar la página estática en una **aplicación web interactiva** similar al sistema de convocatorias, con:

1. **Wizard paso a paso** para el proceso completo
2. **Dashboard personal** para seguimiento
3. **Documentos centralizados** con pre-llenado automático
4. **Timeline visual** del proceso
5. **FAQ interactivo** con búsqueda
6. **Notificaciones automáticas** de plazos

---

## 🎨 Mockups de las Mejoras

### 1. Página de Inicio Rediseñada

```
┌────────────────────────────────────────────────────────────┐
│ TRABAJOS DE GRADO - UNAL SEDE LA PAZ               [Login] │
├────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────┐      │
│   │  🎓 ¿Listo para tu Trabajo de Grado?             │      │
│   │                                                   │      │
│   │  Te guiaremos paso a paso en el proceso          │      │
│   │                                                   │      │
│   │  [Iniciar Proceso] [Ver mi Progreso]            │      │
│   └─────────────────────────────────────────────────┘      │
│                                                              │
│   ┌──────────────┬──────────────┬──────────────┐          │
│   │ 📋 Modalidades│ 📄 Documentos│ ❓ FAQ       │          │
│   │              │              │              │          │
│   │ TDG vs PAE   │ Formatos     │ Preguntas    │          │
│   │ ¿Cuál elegir?│ Normativas   │ frecuentes   │          │
│   │              │              │              │          │
│   │ [Ver más]    │ [Descargar]  │ [Buscar]     │          │
│   └──────────────┴──────────────┴──────────────┘          │
│                                                              │
│   📊 ESTADÍSTICAS                                           │
│   ┌─────────┬─────────┬─────────┬─────────┐              │
│   │ 45      │ 12      │ 8       │ 25      │              │
│   │ TDG     │ PAE     │ En curso│ Próximos│              │
│   │ Activos │ Activos │ Defensa │ Plazos  │              │
│   └─────────┴─────────┴─────────┴─────────┘              │
└────────────────────────────────────────────────────────────┘
```

---

### 2. Wizard Interactivo (Paso a Paso)

```
┌────────────────────────────────────────────────────────────┐
│ ASISTENTE DE TRABAJO DE GRADO                       [X]    │
├────────────────────────────────────────────────────────────┤
│                                                              │
│   Paso 1 de 5: Elige tu Modalidad                          │
│   ●━━━━○━━━━○━━━━○━━━━○                                    │
│                                                              │
│   ┌──────────────────────────────────────────────┐         │
│   │ 📘 TRABAJO DE GRADO (TDG)                     │         │
│   │                                                │         │
│   │ ✓ Investigación original                      │         │
│   │ ✓ Duración: 1-2 semestres                     │         │
│   │ ✓ Requiere: Director + Jurados                │         │
│   │ ✓ Programas: Todos                            │         │
│   │                                                │         │
│   │ [Seleccionar TDG]                             │         │
│   └──────────────────────────────────────────────┘         │
│                                                              │
│   ┌──────────────────────────────────────────────┐         │
│   │ 📗 PROYECTO APLICADO (PAE)                    │         │
│   │                                                │         │
│   │ ✓ Aplicación práctica                         │         │
│   │ ✓ Duración: 1 semestre                        │         │
│   │ ✓ Requiere: Supervisor                        │         │
│   │ ✓ Programas: Ingeniería, Biología             │         │
│   │                                                │         │
│   │ [Seleccionar PAE]                             │         │
│   └──────────────────────────────────────────────┘         │
│                                                              │
│   ❓ ¿No sabes cuál elegir? [Ver comparación detallada]    │
│                                                              │
│   [Cancelar] ──────────────────────────── [Siguiente →]   │
└────────────────────────────────────────────────────────────┘
```

**Siguientes pasos del wizard:**
- Paso 2: Información personal (auto-completada si está logueado)
- Paso 3: Detalles del proyecto (título, resumen, director propuesto)
- Paso 4: Revisión de documentos
- Paso 5: Confirmación y envío

---

### 3. Dashboard Personal del Estudiante

```
┌────────────────────────────────────────────────────────────┐
│ Mi Trabajo de Grado                    Juan Pérez [Salir] │
├────────────────────────────────────────────────────────────┤
│                                                              │
│   📊 ESTADO ACTUAL                                          │
│   ┌────────────────────────────────────────────────┐       │
│   │ Estado: PREINSCRITO ✅                          │       │
│   │ Modalidad: Trabajo de Grado (TDG)              │       │
│   │ Director: Dr. Carlos Martínez                   │       │
│   │ Fecha de inicio: 15/01/2026                    │       │
│   └────────────────────────────────────────────────┘       │
│                                                              │
│   📅 TIMELINE DE PROCESO                                    │
│   ┌────────────────────────────────────────────────┐       │
│   │ ✅ 1. Preinscripción ────────── Completado     │       │
│   │                                  15/01/2026    │       │
│   │                                                 │       │
│   │ 🔄 2. Aprobación Comité ────── En proceso      │       │
│   │                                 Esperando...   │       │
│   │                                                 │       │
│   │ ⏳ 3. Desarrollo ────────────── Pendiente      │       │
│   │                                                 │       │
│   │ ⏳ 4. Entrega Final ─────────── Pendiente      │       │
│   │                                                 │       │
│   │ ⏳ 5. Sustentación ──────────── Pendiente      │       │
│   └────────────────────────────────────────────────┘       │
│                                                              │
│   📄 MIS DOCUMENTOS                                         │
│   ┌────────────────────────────────────────────────┐       │
│   │ ✅ Formato de Preinscripción       [Ver] [PDF] │       │
│   │ ✅ Plan General TDG                [Ver] [PDF] │       │
│   │ ⏳ Anteproyecto                    [Subir]     │       │
│   │ ⏳ Documento Final                 [Subir]     │       │
│   └────────────────────────────────────────────────┘       │
│                                                              │
│   🔔 NOTIFICACIONES (2)                                     │
│   ┌────────────────────────────────────────────────┐       │
│   │ • Comité se reúne el 05/02/2026                │       │
│   │ • Recuerda actualizar tu anteproyecto          │       │
│   └────────────────────────────────────────────────┘       │
│                                                              │
│   [Editar Información] [Descargar Todo] [Ayuda]           │
└────────────────────────────────────────────────────────────┘
```

---

### 4. Comparador TDG vs PAE (Interactivo)

```
┌────────────────────────────────────────────────────────────┐
│ TDG vs PAE - ¿Cuál es mejor para ti?               [X]    │
├────────────────────────────────────────────────────────────┤
│                                                              │
│   Aspecto          │ TDG                │ PAE              │
│   ─────────────────┼───────────────────┼──────────────────┤
│   Tipo             │ Investigación      │ Aplicación       │
│   Duración         │ 1-2 semestres      │ 1 semestre       │
│   Requisito PAPA   │ > 3.5              │ > 3.5            │
│   Director         │ Obligatorio        │ Supervisor       │
│   Jurados          │ 2 evaluadores      │ 1 evaluador      │
│   Defensa Pública  │ SÍ                 │ NO               │
│   Publicación      │ Recomendada        │ Opcional         │
│   Programas        │ Todos              │ Algunos          │
│   ─────────────────┴───────────────────┴──────────────────┤
│                                                              │
│   💡 RECOMENDACIÓN PERSONALIZADA                            │
│   ┌────────────────────────────────────────────────┐       │
│   │ Basado en tu perfil:                           │       │
│   │ • PAPA: 4.2                                    │       │
│   │ • Programa: Ingeniería Mecatrónica             │       │
│   │ • Intereses: Investigación + Práctica          │       │
│   │                                                 │       │
│   │ ✅ Recomendamos: TRABAJO DE GRADO (TDG)        │       │
│   │                                                 │       │
│   │ Razones:                                       │       │
│   │ ✓ Tu PAPA te permite aspirar a investigación  │       │
│   │ ✓ Mejor para continuar estudios de posgrado   │       │
│   │ ✓ Más oportunidades de publicación            │       │
│   └────────────────────────────────────────────────┘       │
│                                                              │
│   [Iniciar TDG] [Iniciar PAE] [Aún no decido]            │
└────────────────────────────────────────────────────────────┘
```

---

### 5. Centro de Documentos Inteligente

```
┌────────────────────────────────────────────────────────────┐
│ CENTRO DE DOCUMENTOS                              [Buscar]│
├────────────────────────────────────────────────────────────┤
│                                                              │
│   Filtros: [Todos ▼] [Mi Programa ▼] [TDG/PAE ▼]          │
│                                                              │
│   📋 FORMATOS PARA ESTUDIANTES                              │
│   ┌────────────────────────────────────────────────┐       │
│   │ 📄 Formato de Preinscripción TDG               │       │
│   │    Última actualización: 10/01/2026            │       │
│   │    [Llenar Online] [Descargar PDF]             │       │
│   │    💡 Pre-llenado con tus datos                │       │
│   ├────────────────────────────────────────────────┤       │
│   │ 📄 Plan General de Trabajo de Grado            │       │
│   │    Última actualización: 10/01/2026            │       │
│   │    [Llenar Online] [Descargar DOCX]            │       │
│   │    ✍️ Plantilla editable                       │       │
│   ├────────────────────────────────────────────────┤       │
│   │ 📄 Formato PAE                                 │       │
│   │    Última actualización: 10/01/2026            │       │
│   │    [Llenar Online] [Descargar PDF]             │       │
│   └────────────────────────────────────────────────┘       │
│                                                              │
│   📜 NORMATIVA (por programa)                               │
│   ┌────────────────────────────────────────────────┐       │
│   │ ⚖️ Acuerdo 026 de 2012 (General)               │       │
│   │    [Ver Resumen] [Leer Completo] [PDF]         │       │
│   │    📌 Puntos clave destacados                  │       │
│   ├────────────────────────────────────────────────┤       │
│   │ ⚖️ Ingeniería Mecatrónica                      │       │
│   │    Acuerdo 173 de 2014                         │       │
│   │    [Ver Resumen] [Leer Completo]               │       │
│   ├────────────────────────────────────────────────┤       │
│   │ ⚖️ Biología                                    │       │
│   │    Acuerdo 123 de 2013                         │       │
│   │    [Ver Resumen] [Leer Completo]               │       │
│   └────────────────────────────────────────────────┘       │
│                                                              │
│   💾 [Descargar Todo como ZIP]                             │
└────────────────────────────────────────────────────────────┘
```

---

### 6. FAQ Interactivo con Búsqueda

```
┌────────────────────────────────────────────────────────────┐
│ PREGUNTAS FRECUENTES                              [X]      │
├────────────────────────────────────────────────────────────┤
│                                                              │
│   🔍 Buscar pregunta...                                     │
│   [_______________________________________________] [Buscar]│
│                                                              │
│   📊 Categorías:                                            │
│   [Todas] [Requisitos] [Proceso] [Documentos] [Plazos]    │
│                                                              │
│   ❓ TOP 10 PREGUNTAS MÁS FRECUENTES                        │
│                                                              │
│   ┌────────────────────────────────────────────────┐       │
│   │ 1. ¿Cuál es la diferencia entre TDG y PAE? ▼   │       │
│   │                                                 │       │
│   │    El Trabajo de Grado (TDG) es una            │       │
│   │    investigación original que requiere...      │       │
│   │                                                 │       │
│   │    El Proyecto Aplicado (PAE) es una...        │       │
│   │                                                 │       │
│   │    [Ver comparación completa]                  │       │
│   └────────────────────────────────────────────────┘       │
│                                                              │
│   ┌────────────────────────────────────────────────┐       │
│   │ 2. ¿Qué requisitos de PAPA necesito? ▼         │       │
│   │                                                 │       │
│   │    Para TDG: PAPA mínimo de 3.5                │       │
│   │    Para PAE: PAPA mínimo de 3.5                │       │
│   │                                                 │       │
│   │    Algunos programas pueden tener...           │       │
│   └────────────────────────────────────────────────┘       │
│                                                              │
│   ┌────────────────────────────────────────────────┐       │
│   │ 3. ¿Cómo elijo un director de TDG? ▶           │       │
│   └────────────────────────────────────────────────┘       │
│                                                              │
│   ┌────────────────────────────────────────────────┐       │
│   │ 4. ¿Cuánto tiempo toma completar un TDG? ▶     │       │
│   └────────────────────────────────────────────────┘       │
│                                                              │
│   ┌────────────────────────────────────────────────┐       │
│   │ 5. ¿Puedo cambiar de modalidad después? ▶      │       │
│   └────────────────────────────────────────────────┘       │
│                                                              │
│   🤔 ¿No encontraste tu pregunta?                          │
│   [Enviar nueva pregunta al equipo académico]              │
└────────────────────────────────────────────────────────────┘
```

---

### 7. Timeline Visual del Proceso

```
┌────────────────────────────────────────────────────────────┐
│ PROCESO COMPLETO DE TRABAJO DE GRADO                       │
├────────────────────────────────────────────────────────────┤
│                                                              │
│        ①                  ②                  ③              │
│   Preinscripción    Desarrollo del       Evaluación        │
│                     Proyecto                                │
│        │                  │                  │              │
│        ▼                  ▼                  ▼              │
│   ┌─────────┐       ┌─────────┐       ┌─────────┐         │
│   │ Formato │──────▶│Anteproyec│──────▶│ Documento│        │
│   │ Inicial │       │   to     │       │  Final   │        │
│   └─────────┘       └─────────┘       └─────────┘         │
│        │                  │                  │              │
│        │                  │                  │              │
│   ┌─────────┐       ┌─────────┐       ┌─────────┐         │
│   │Aprobación│      │Seguimien│       │ Entrega │         │
│   │ Comité  │       │   to    │       │ Final   │         │
│   └─────────┘       └─────────┘       └─────────┘         │
│        │                  │                  │              │
│   ⏱ 2 semanas        ⏱ 1-2 semestres    ⏱ 1 mes           │
│                                                │             │
│                                                ▼             │
│                                          ┌─────────┐        │
│                                          │Sustenta-│        │
│                                          │  ción   │        │
│                                          └─────────┘        │
│                                               │             │
│                                          ⏱ 1 semana        │
│                                               │             │
│                                               ▼             │
│                                          ┌─────────┐        │
│                                          │ ¡GRADO! │        │
│                                          └─────────┘        │
│                                                              │
│   Tiempo estimado total: 1-2 semestres + 1 mes             │
│                                                              │
│   [Ver detalles de cada fase]                              │
└────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementación Técnica

### Opción 1: Componente Embebible en Google Sites (RECOMENDADA)

**Ventajas:**
- ✅ Se integra directamente en Google Sites
- ✅ Reutiliza infraestructura de Convocatorias
- ✅ Mismo diseño y UX consistente
- ✅ Rápida implementación

**Arquitectura:**
```
Google Sites
     │
     ├─ <iframe> → TDG Web App (Google Apps Script)
     │
Google Sheets
     │
     ├─ Sheet "TDG_Registros"
     ├─ Sheet "PAE_Registros"
     └─ Sheet "FAQ"
```

**Archivos necesarios:**
```
sections/tdg/
├── index.html           → Página principal
├── wizard.html          → Wizard paso a paso
├── dashboard.html       → Dashboard personal
├── documents.html       → Centro de documentos
├── faq.html            → FAQ interactivo
├── comparison.html      → TDG vs PAE
└── Code.gs             → Backend (Google Apps Script)
```

---

### Opción 2: Mejora Incremental de Google Sites

**Ventajas:**
- ✅ Sin desarrollo de código
- ✅ Solo mejora de contenido
- ✅ Implementación inmediata

**Cambios:**
- Reorganizar contenido en acordeones
- Agregar tabla comparativa TDG vs PAE
- Mejorar títulos y descripciones
- Agregar timeline visual (imagen)
- Reorganizar documentos por categoría

---

## 📋 Plan de Implementación Recomendado

### Fase 1: Quick Wins (1 semana)

**Mejoras inmediatas en Google Sites:**

1. **Reorganizar contenido con acordeones**
   ```
   ▼ ¿Qué modalidad debo elegir?
     → Tabla comparativa TDG vs PAE
     → Casos de uso
     → Recomendaciones

   ▼ Proceso paso a paso
     → Paso 1: Preinscripción
     → Paso 2: Aprobación
     → Paso 3: Desarrollo
     → Paso 4: Entrega
     → Paso 5: Sustentación

   ▼ Documentos por programa
     → Ingeniería Mecatrónica
     → Biología
     → ...
   ```

2. **Agregar sección "Inicio Rápido"**
   ```
   🚀 INICIO RÁPIDO

   1️⃣ Lee: ¿TDG o PAE? [Ver comparación]
   2️⃣ Descarga: Formato de Preinscripción [PDF]
   3️⃣ Revisa: Normativa de tu programa [Enlaces]
   4️⃣ Contacta: Director Académico [Email]
   ```

3. **Tabla comparativa visual**
   | Característica | TDG | PAE |
   |----------------|-----|-----|
   | Tipo | Investigación | Aplicación |
   | Duración | 1-2 sem | 1 sem |
   | PAPA mínimo | 3.5 | 3.5 |
   | Director | Sí | Supervisor |
   | Defensa | Sí | No |

4. **Timeline con imágenes**
   - Crear infografía del proceso
   - Incluir tiempos estimados
   - Destacar puntos críticos

5. **Sección FAQ al final**
   - Top 10 preguntas frecuentes
   - Respuestas concisas
   - Enlaces a normativa

**Esfuerzo:** 4-6 horas
**Impacto:** MEDIO
**Costo:** $0

---

### Fase 2: Aplicación Web Embebible (2-3 semanas)

**Desarrollo de app interactiva:**

1. **Wizard de Preinscripción**
   - 5 pasos guiados
   - Validación en tiempo real
   - Auto-guardado de borrador
   - Generación automática de PDF

2. **Dashboard Personal**
   - Login con @unal.edu.co
   - Ver estado actual
   - Timeline de proceso
   - Documentos subidos
   - Notificaciones

3. **Centro de Documentos**
   - Búsqueda y filtros
   - Pre-llenado de formularios
   - Descarga masiva (ZIP)
   - Resúmenes de normativa

4. **FAQ Interactivo**
   - Búsqueda full-text
   - Categorías
   - Upvote/downvote
   - Sugerir nueva pregunta

5. **Comparador TDG vs PAE**
   - Tabla interactiva
   - Recomendación personalizada
   - Casos de ejemplo

**Tecnologías:**
- Google Apps Script (backend)
- HTML + CSS + JavaScript (frontend)
- Google Sheets (base de datos)
- Google Drive (almacenamiento docs)

**Integración en Google Sites:**
```html
<iframe
  src="https://script.google.com/macros/s/[SCRIPT_ID]/exec?page=tdg"
  width="100%"
  height="1200px"
  frameborder="0">
</iframe>
```

**Esfuerzo:** 20-30 horas
**Impacto:** ALTO
**Costo:** $0 (usa infraestructura Google)

---

### Fase 3: Features Avanzados (1-2 semanas)

1. **Notificaciones automáticas**
   - Email de recordatorio de plazos
   - Notificación de cambio de estado
   - Alertas de documentos pendientes

2. **Sistema de seguimiento**
   - QR code único por estudiante
   - Consulta pública de estado
   - Historial de cambios

3. **Analytics**
   - Estadísticas de uso
   - Programas más activos
   - Tiempo promedio por fase

4. **Exportación de reportes**
   - Dashboard administrativo
   - Exportar a Excel
   - Gráficos de métricas

**Esfuerzo:** 15-20 horas
**Impacto:** MEDIO
**Costo:** $0

---

## 📊 Comparación de Opciones

| Aspecto | Opción 1: Quick Wins | Opción 2: App Web |
|---------|---------------------|-------------------|
| Tiempo | 1 semana | 2-3 semanas |
| Esfuerzo | 4-6 horas | 20-30 horas |
| Costo | $0 | $0 |
| Impacto UX | Medio | Alto |
| Mantenimiento | Bajo | Medio |
| Escalabilidad | Baja | Alta |
| Interactividad | Baja | Alta |
| Notificaciones | No | Sí |
| Dashboard | No | Sí |

---

## 🎯 Recomendación

### Enfoque Híbrido: Quick Wins + App Web

**Semana 1-2:** Implementar Quick Wins
- Reorganizar contenido actual
- Agregar tabla comparativa
- Mejorar FAQ
- Agregar timeline visual

**Semana 3-5:** Desarrollar App Web
- Wizard de preinscripción
- Dashboard personal
- Centro de documentos
- FAQ interactivo

**Semana 6:** Integración y Testing
- Embedder app en Google Sites
- Testing con usuarios reales
- Ajustes finales

**Beneficios:**
- ✅ Mejora inmediata con Quick Wins
- ✅ Valor incremental con App Web
- ✅ Bajo riesgo (si App falla, Quick Wins ya están)
- ✅ Costo $0

---

## 📝 Checklist de Implementación

### Quick Wins (Semana 1)
- [ ] Reorganizar contenido con acordeones
- [ ] Crear tabla comparativa TDG vs PAE
- [ ] Agregar sección "Inicio Rápido"
- [ ] Crear timeline visual (infografía)
- [ ] Agregar FAQ top 10
- [ ] Mejorar títulos y descripciones
- [ ] Testing con 3-5 estudiantes

### App Web - MVP (Semanas 2-4)
- [ ] Setup proyecto (Code.gs + HTML files)
- [ ] Implementar wizard (5 pasos)
- [ ] Crear Sheet "TDG_Registros"
- [ ] Implementar login con @unal.edu.co
- [ ] Dashboard básico (ver estado)
- [ ] Centro de documentos (descargas)
- [ ] FAQ interactivo (búsqueda)
- [ ] Comparador TDG vs PAE
- [ ] Testing unitario
- [ ] Testing de integración

### App Web - Features Avanzados (Semana 5)
- [ ] Timeline visual del proceso
- [ ] Pre-llenado de formularios
- [ ] Generación automática de PDF
- [ ] Notificaciones por email
- [ ] Dashboard administrativo
- [ ] Exportación a Excel
- [ ] Analytics básico
- [ ] Testing con usuarios reales

### Integración (Semana 6)
- [ ] Embedder iframe en Google Sites
- [ ] Ajustar altura dinámica
- [ ] Testing responsive (móvil/desktop)
- [ ] Documentación de uso
- [ ] Capacitación a staff
- [ ] Launch 🚀

---

## 🎨 Recursos Necesarios

### Diseño
- [ ] Logo/iconos (usar Material Icons - gratis)
- [ ] Paleta de colores UNAL (ya definida)
- [ ] Infografía timeline (crear en Canva - gratis)
- [ ] Screenshots para documentación

### Contenido
- [ ] Textos revisados (de página actual)
- [ ] FAQ completo (recopilar preguntas frecuentes)
- [ ] Normativa resumida (puntos clave)
- [ ] Casos de ejemplo (éxitos de estudiantes)

### Técnico
- [ ] Acceso a Google Apps Script
- [ ] Crear Google Sheet "TDG_Registros"
- [ ] Permisos de edición en Google Sites
- [ ] Email institucional para notificaciones

### Humano
- [ ] 1 Desarrollador (20-30 horas)
- [ ] 1 Diseñador de contenido (4-6 horas)
- [ ] 3-5 Estudiantes para testing
- [ ] 1 Staff académico para validación

---

## 💰 Presupuesto

| Item | Costo | Notas |
|------|-------|-------|
| Desarrollo | $0 | Reutiliza sistema Convocatorias |
| Hosting | $0 | Google Apps Script (gratis) |
| Base de datos | $0 | Google Sheets (gratis) |
| Dominio | $0 | Subdominio UNAL |
| Diseño | $0 | Material Icons + Canva |
| **TOTAL** | **$0** | 🎉 |

---

## 📈 Métricas de Éxito

### KPIs
- **Reducción de tiempo:** 50% menos tiempo para completar preinscripción
- **Satisfacción:** 80%+ estudiantes satisfechos
- **Completitud:** 90%+ formularios completos sin errores
- **Uso:** 70%+ estudiantes usan wizard vs manual
- **Soporte:** 40% reducción de preguntas al equipo académico

### Medición
- Encuesta post-uso (Google Forms)
- Analytics de uso (Google Analytics)
- Tiempo promedio por fase
- Tasa de abandono en wizard
- Número de preguntas en FAQ buscadas

---

## 🚀 Próximos Pasos

1. **Revisar propuesta** con equipo académico
2. **Priorizar features** (Quick Wins vs App completa)
3. **Asignar recursos** (desarrollador, contenido)
4. **Crear cronograma** detallado
5. **Iniciar implementación** con Quick Wins

---

## ❓ Preguntas para el Equipo

Antes de empezar, necesito aclarar:

1. **Prioridad:** ¿Quick Wins primero o App completa directamente?
2. **Plazo:** ¿Hay fecha límite? (ej: inicio de semestre)
3. **Acceso:** ¿Tengo permisos para editar Google Sites + crear Apps Script?
4. **Contenido:** ¿Quién valida textos y normativa?
5. **Testing:** ¿Podemos reclutar 3-5 estudiantes para testing?
6. **Datos:** ¿Qué información debo capturar en el formulario?
7. **Notificaciones:** ¿A quién se notifica cuando hay nueva preinscripción?
8. **Integración:** ¿Existe algún sistema actual que deba integrarse?

---

**¿Listo para empezar?** 🎓

Podemos comenzar con Quick Wins (1 semana) mientras planifico la App Web completa.

