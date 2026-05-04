# 🎤 Guion para Entrevista - Proyecto Convocatorias UNAL

## 📋 Información del Proyecto

**Nombre:** Sistema de Convocatorias - UNAL Sede de La Paz  
**Tipo:** Plataforma web modular para gestión de prácticas, pasantías y convenios institucionales  
**Cliente:** Universidad Nacional de Colombia - Sede de La Paz (Oficina de Prácticas y Pasantías)  
**Duración:** Desarrollo iterativo con +30 commits documentados  
**Rol:** Desarrollador Full-Stack con desarrollo asistido por IA  
**Stack:** Google Apps Script, Google Sheets, HTML/CSS/JS vanilla, Google Sites  
**Repositorio:** Git con control de versiones completo

---

## 🗣️ Versión Corta (30-45 segundos)

> "Desarrollé una **plataforma web modular para gestionar prácticas, pasantías y convenios institucionales** de la Universidad Nacional de Colombia - Sede de La Paz. Es un sistema completo basado en Google Apps Script que integra Google Sheets como base de datos y se embebe en Google Sites.
>
> El sistema consta de un **módulo principal** para que estudiantes vean vacantes y postulen en línea, un **banco de perfiles externos** donde empresas publican vacantes, un **gestor de convenios** con sugerencias automáticas, y **guías interactivas** sobre modalidades de grado.
>
> Implementé validaciones robustas, rate limiting, notificaciones automáticas por email con plantillas HTML profesionales, y un sistema de triggers que detecta cambios de estado y notifica a los estudiantes.
>
> Todo el desarrollo lo hice con **asistencia de IA como copiloto**, lo que me permitió seguir mejores prácticas, implementar funcionalidades complejas más rápido, y mantener un código limpio con +1,300 líneas de backend y +3,600 líneas de frontend."

---

## 🗣️ Versión Expandida (1-2 minutos)

> "Desarrollé un **sistema completo y modular de gestión académica** para la Oficina de Prácticas y Pasantías de la UNAL Sede de La Paz. El proyecto consiste en múltiples módulos independientes basados en **Google Apps Script** que se embeben en Google Sites como iframes.
>
> ### Módulos principales desarrollados:
>
> **1. Sistema de Convocatorias (módulo core):**
> - Visualización de vacantes con filtros dinámicos (programa académico, modalidad, tipo de entidad)
> - Sistema de postulación en línea con validación exhaustiva (PAPA 0-5 con 2 decimales, PBM 0-100, correo institucional @unal.edu.co, teléfono móvil colombiano)
> - Control de límites: rate limiting de 3 intentos cada 10 minutos, máximo 2 postulaciones pendientes por estudiante
> - Sistema de estados: Pendiente → Pre-seleccionado → Seleccionado/No seleccionado
> - Triggers automáticos que detectan cambios de estado en Google Sheets y envían notificaciones
> - 4 tipos de emails automáticos con plantillas HTML responsive: confirmación, pre-selección, selección y no selección
> - Panel de estadísticas en tiempo real
>
> **2. Banco de Perfiles Externos:**
> - Formulario público para que entidades externas (empresas, ONGs) registren vacantes
> - Diferenciado del banco interno con campos específicos (teléfono, tipos de apoyo, habilidades/actitudes)
> - Notificación automática al equipo administrativo
> - Framework de testing custom con casos de prueba unitarios
>
> **3. Sistema de Gestión de Convenios:**
> - CRUD completo para convenios institucionales vigentes
> - Sistema de sugerencias para que estudiantes propongan nuevas entidades
> - Validación y sanitización de números telefónicos
> - Funciones de reparación automática de datos legacy
>
> **4. Guías Interactivas:**
> - Guía de modalidades de trabajo de grado (monografía, pasantías, investigación, asignaturas de postgrado)
> - Proceso de pre-inscripción PAE con infografías embebidas
> - Comparación de requisitos entre modalidades
> - Carrusel de logos de empresas aliadas
>
> ### Arquitectura y tecnologías:
>
> - **Backend:** Google Apps Script (JavaScript server-side) - 1,393 líneas en módulo principal
> - **Frontend:** HTML5, CSS3, JavaScript vanilla (sin frameworks) - 3,622 líneas en módulo principal
> - **Base de datos:** Google Sheets con múltiples hojas especializadas
> - **Notificaciones:** MailApp con templates HTML profesionales
> - **Despliegue:** Google Sites mediante iframes con comunicación postMessage
> - **Testing:** Framework custom para Google Apps Script + tests frontend con Jest
> - **Control de versiones:** Git con +30 commits documentados
>
> ### Sistema de diseño y arquitectura modular:
>
> - CSS Design System completo con variables reutilizables (colores institucionales UNAL, sombras, espaciados)
> - Arquitectura modular: cada sección es completamente autocontenida con su propio backend opcional
> - Responsive design mobile-first con breakpoints: 480px, 600px, 768px, 992px
> - Accesibilidad WCAG 2.1 AA: gestión de focus, roles ARIA, navegación por teclado
> - Sistema de modales accesibles con función `initAccessibleModal()`
>
> ### ¿Por qué destaco la IA?
>
> Utilicé **asistencia de IA como copiloto de desarrollo** durante todo el proceso:
> - **Planificación:** Diseño de arquitectura modular y decisiones técnicas
> - **Desarrollo:** Escritura de código con sugerencias contextuales
> - **Refactoring:** Mejora continua de código legacy
> - **Debugging:** Identificación y resolución rápida de bugs
> - **Documentación:** Generación de READMEs detallados, guías de instalación, AGENTS.md con 1,187 líneas
> - **Code reviews:** Detección de issues de seguridad (XSS, fail-open, validaciones débiles)
> - **Testing:** Diseño de casos de prueba y framework de testing
>
> Esto me permitió:
> - ✅ **Entregar 10+ módulos funcionales** en tiempo récord
> - ✅ **Seguir mejores prácticas de seguridad** (validaciones estrictas, fail-closed, XSS prevention, escape de HTML)
> - ✅ **Producir código limpio y mantenible** con documentación exhaustiva (AGENTS.md, CLAUDE.md, READMEs por módulo)
> - ✅ **Implementar funcionalidades complejas** (rate limiting con CacheService, triggers automáticos, validación de estados)
> - ✅ **Diseñar un sistema escalable** que permite agregar nuevas secciones sin afectar las existentes

---

## 💡 Frases Clave para Diferentes Contextos

| Contexto de la pregunta | Frase recomendada |
|--------------------------|-------------------|
| **Uso de IA** | "Usé IA como copiloto de desarrollo durante todo el proceso, desde la planificación hasta el deployment" |
| **Calidad de código** | "El código es mantenible, bien estructurado y cuenta con validaciones estrictas siguiendo el principio fail-closed" |
| **Tecnologías** | "Integración completa con el ecosistema Google: Apps Script, Sheets, Sites y MailApp" |
| **Impacto** | "Automatización de procesos administrativos que antes eran manuales, reduciendo errores y mejorando la experiencia del estudiante" |
| **Seguridad** | "Implementé validaciones en frontend y backend, rate limiting, y prevención de XSS" |
| **Escalabilidad** | "Arquitectura modular con secciones independientes que pueden desplegarse por separado" |
| **Testing** | "Incluye framework de testing custom para Google Apps Script con casos de prueba unitarios" |

---

## 🎯 Puntos Fuertes a Destacar

### 1. **Desarrollo asistido por IA**
   - Aceleración del tiempo de desarrollo
   - Mejora en la calidad del código
   - Implementación de mejores prácticas de forma consistente

### 2. **Solución completa end-to-end**
   - Desde la recolección de requisitos hasta el deployment
   - Interfaz de usuario + backend + base de datos + notificaciones

### 3. **Enfoque en experiencia de usuario**
   - Interfaz limpia y responsive
   - Filtros dinámicos y búsqueda en tiempo real
   - Notificaciones por email con diseño profesional

### 4. **Seguridad y validación**
   - Validación de datos en frontend y backend
   - Rate limiting para prevenir abuso
   - Autenticación mediante correo institucional

### 5. **Documentación y mantenibilidad**
   - Código bien documentado
   - Guías de deployment y testing
   - Arquitectura modular y reutilizable

---

## 📊 Métricas de Impacto

### Estadísticas del código:
- **Backend principal:** 1,393 líneas (Code.gs)
- **Frontend principal:** 3,622 líneas (Index.html)
- **Documentación:** 1,187 líneas (AGENTS.md) + READMEs por módulo
- **Commits:** +30 commits documentados con convenciones semánticas
- **Módulos independientes:** 10+ secciones embebibles
- **Testing:** Framework custom + casos de prueba unitarios

### Funcionalidades implementadas:
- **4 tipos de emails** automáticos con HTML responsive
- **7+ validaciones** de datos académicos y personales
- **3 sistemas de gestión** (convocatorias, perfiles, convenios)
- **6 programas académicos** soportados
- **Rate limiting:** 3 intentos / 10 minutos
- **Estados de postulación:** Pendiente → Pre-seleccionado → Seleccionado/No seleccionado

### Impacto operativo:
- **Automatización:** Proceso antes 100% manual ahora es automático
- **Reducción de errores:** Validación exhaustiva previene datos inválidos
- **Accesibilidad 24/7:** Estudiantes postulan sin horarios de oficina
- **Trazabilidad:** Registro automático con timestamps en Google Sheets
- **Escalabilidad:** Arquitectura modular permite agregar features sin refactoring

---

## 🔄 Posibles Preguntas y Respuestas

### ¿Por qué Google Apps Script y no una stack moderna?

> "Elegí Google Apps Script porque el cliente ya usaba Google Workspace (Sheets, Sites) para su operación. Esto permitió una integración nativa sin costos adicionales de infraestructura, y el personal administrativo puede gestionar las vacantes directamente desde Google Sheets sin necesidad de un panel de administración complejo."

### ¿Cómo fue trabajar con IA en este proyecto?

> "La IA fue un **copiloto constante** que amplificó mi productividad. Algunos ejemplos concretos:
>
> **Durante el desarrollo:**
> - Me ayudó a explorar diferentes enfoques antes de escribir código (ej: PropertiesService vs CacheService para rate limiting)
> - Detectó bugs más rápido (ej: fail-open en `validarEstadoEstudiante()` que permitía postulación en excepción)
> - Mantuvo un estilo consistente en +1,300 líneas de backend
>
> **En el diseño:**
> - Generó las 4 plantillas HTML de emails con diseño responsive y colores institucionales
> - Sugirió mejores prácticas de deliverability (asunto claro, texto alternativo, botones visibles)
> - Ayudó a diseñar el sistema de diseño CSS con variables reutilizables
>
> **En la documentación:**
> - Generó `AGENTS.md` de 1,187 líneas con patrones de componentes, convenciones de código, y checklists
> - Creó READMEs detallados para cada módulo con guías de instalación paso a paso
> - Documentó 21 issues de seguridad conocidos para evitar regresiones
>
> **En el testing:**
> - Diseñó framework de testing custom para Google Apps Script (no tiene soporte nativo de Jest/Mocha)
> - Generó casos de prueba para validaciones, sanitización y rate limiting
>
> Lo más valioso: la IA me permitió **mantener alto nivel de calidad** sin sacrificar velocidad de entrega. Por ejemplo, implementé accesibilidad WCAG 2.1 AA en los modales sin haber trabajado antes con gestión de focus programático."

### ¿Cuál fue el mayor desafío técnico?

> "El mayor desafío fue implementar el **sistema de triggers automáticos** para detectar cambios de estado en el spreadsheet de postulaciones. Tuve que:
>
> 1. Entender las limitaciones de los triggers `onEdit()` de Google Apps Script (no pueden recibir parámetros externos)
> 2. Diseñar una solución que detectara cambios específicamente en la columna Estado (índice exacto)
> 3. Evitar duplicación de notificaciones si el valor no cambió realmente
> 4. Manejar 4 transiciones de estado diferentes con plantillas de email distintas
> 5. Implementar función de instalación única `instalarTriggerPostulaciones()` que elimina triggers duplicados
>
> Otro desafío importante fue el **rate limiting sin base de datos tradicional**. Lo resolví usando `PropertiesService` de Google Apps Script como caché temporal, almacenando timestamps de intentos en formato JSON y filtrando por ventana de tiempo. Incluí una función de limpieza automática `cleanupRateLimitData()` para evitar acumulación de datos obsoletos."

### ¿Qué aprendí de este proyecto?

> "Este proyecto me enseñó varias lecciones valiosas:
>
> **1. Arquitectura modular desde el inicio:**
> Aprendí a diseñar sistemas donde cada módulo es completamente autocontenido. La carpeta `sections/` tiene 10+ componentes que se pueden deployar, actualizar y mantener independientemente sin afectar otros módulos.
>
> **2. Diseñar para usuarios no técnicos:**
> El personal administrativo gestiona vacantes directamente desde Google Sheets (sin panel de admin complejo). Esto requirió pensar en la experiencia del usuario administrativo, no solo del estudiante.
>
> **3. Documentación como código:**
> Generé `AGENTS.md` (1,187 líneas) pensando en futuros mantenedores y agentes de IA. Incluye checklists, patrones de componentes, gotchas importantes y convenciones de nomenclatura. Es documentación ejecutable.
>
> **4. Seguridad fail-closed:**
> Implementé el principio de denegar por defecto. Si una validación falla con excepción, el sistema rechaza la operación (no la permite por error). Documenté 21 issues de seguridad conocidos para evitar regresiones.
>
> **5. Testing en entornos restrictivos:**
> Google Apps Script no soporta npm ni frameworks de testing tradicionales. Diseñé un framework custom que se ejecuta directamente en el editor de Apps Script con logging a consola.
>
> **6. Integración con sistemas legacy:**
> Aprendí a trabajar con Google Sheets como base de datos (con sus limitaciones: sin índices, sin transacciones, sin constraints). Diseñé constantes `COLUMNAS` y `COL_POST` para mapear columnas y evitar errores de índices hardcodeados.
>
> **7. IA como amplificador, no reemplazo:**
> La IA aceleró mi trabajo, pero yo tomé todas las decisiones de arquitectura, entendí los requisitos del cliente, y validé cada implementación. El juicio humano fue crítico."

---

## 📁 Recursos de Apoyo para Mostrar

Si te piden ejemplos concretos, puedes mencionar:

1. **Sistema de validación exhaustivo** (`Code.gs:411-470`) - Validación de 7+ reglas de negocio:
   - Email institucional @unal.edu.co con regex
   - PAPA 0-5 con máximo 2 decimales
   - PBM 0-100 entero
   - Documento 6-12 dígitos
   - Teléfono móvil colombiano (10 dígitos, inicia con 3)
   - Nombres solo con letras y acentos (máx 50 caracteres)

2. **Sistema de notificaciones** (`Code.gs:820-1100`) - 4 plantillas HTML responsive:
   - Confirmación de postulación
   - Notificación de pre-selección
   - Notificación de selección (con felicitaciones)
   - Notificación de no selección (con observaciones y ánimo)

3. **Rate limiting con CacheService** (`Code.gs:242-293`) - Implementación custom:
   - 3 intentos máximo cada 10 minutos por usuario
   - Cleanup automático de datos antiguos
   - Mensajes de error personalizados con tiempo de espera

4. **Arquitectura modular** (`sections/`) - 10+ componentes independientes:
   - Cada sección con su propio HTML, CSS y backend opcional
   - Fallback mock para desarrollo local
   - Comunicación de altura con iframe padre
   - Sistema de diseño unificado con CSS variables

5. **Triggers automáticos** (`Code.gs:701-780`) - Sistema reactivo:
   - Detecta cambios en columna Estado del spreadsheet
   - Envía notificaciones según nuevo estado
   - Previene duplicados y maneja errores gracefully

6. **Documentación completa**:
   - `AGENTS.md` (1,187 líneas): Guía para agentes de IA y desarrolladores
   - `CLAUDE.md`: Sistema de diseño, patrones de componentes, convenciones
   - READMEs por módulo con instrucciones de instalación
   - `INSTRUCCIONES.md`: Guía paso a paso para deployment

7. **Framework de testing custom** (`tests/`):
   - Testing unitario para Google Apps Script
   - Casos de prueba para validaciones
   - Testing de sanitización de datos
   - Simulación de rate limiting

---

## ✨ Cierre Recomendado

> "Este proyecto me enseñó que **la IA no reemplaza al desarrollador**, sino que **amplifica sus capacidades**. Mi trabajo fue:
>
> - Entender los requisitos del cliente (oficina de prácticas con procesos manuales)
> - Tomar decisiones de arquitectura (modular, embebible, sin build step)
> - Diseñar la experiencia de usuario (estudiantes, admin, entidades externas)
> - Validar cada implementación (testing, code review)
> - Documentar para futuros mantenedores
>
> La IA fue mi copiloto para ejecutar más rápido y con mayor calidad.
>
> **El resultado es un sistema que:**
> - ✅ Resuelve un problema real (automatiza gestión 100% manual)
> - ✅ Mejora la experiencia de los estudiantes (postulaciones 24/7, feedback automático)
> - ✅ Es mantenible (arquitectura modular, documentación exhaustiva)
> - ✅ Es escalable (fácil agregar nuevos módulos sin refactoring)
> - ✅ Sigue mejores prácticas (seguridad fail-closed, accesibilidad WCAG 2.1 AA, responsive design)
>
> El proyecto está en producción, con control de versiones en Git, y cuenta con guías de instalación detalladas para que cualquier desarrollador pueda continuar el trabajo.
>
> **Métricas finales:**
> - 10+ módulos independientes
> - 1,393 líneas de backend + 3,622 líneas de frontend (módulo principal)
> - 1,187 líneas de documentación ejecutable
> - +30 commits con convenciones semánticas
> - Framework de testing custom
> - 4 tipos de emails automáticos
> - 7+ validaciones de datos académicos
>
> Este proyecto demuestra mi capacidad para **entregar soluciones completas end-to-end**, desde la recolección de requisitos hasta el deployment y la documentación, utilizando IA como herramienta para **maximizar calidad y velocidad**."

---

## 🔗 Enlaces Útiles (si aplica)

- **Demo en vivo:** [URL de Google Sites]
- **Repositorio:** [GitHub URL si es público]
- **Documentación:** [Link a docs]

---

**Última actualización:** [Fecha]
