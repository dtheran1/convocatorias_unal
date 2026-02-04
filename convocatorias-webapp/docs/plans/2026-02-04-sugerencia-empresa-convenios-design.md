# Diseño: Sugerencia de empresa — Sección Convenios

**Fecha:** 2026-02-04
**Archivos impactados:** `sections/convenios/convenios.html`, `sections/convenios/Code.gs`

---

## Contexto

Los estudiantes revisan la lista de convenios para encontrar empresas donde hacer prácticas o pasantías. Si la empresa que les interesa no está listada, actualmente no tienen forma de comunicarlo. Esta feature les da esa posibilidad sin salir de la sección.

---

## 1. Ubicación y trigger

Se agrega una sección informativa **después de la tabla/cards**, dentro de `#mainContent`. Siempre visible, independiente de filtros.

- Estilo: fondo tenue gris claro, borde redondeado, similar al `info-bar` existente.
- Contenido: texto explicativo breve + un botón centrado "Sugerir una empresa".
- El botón abre el modal del formulario.

---

## 2. Formulario (modal)

Reutiliza los estilos del modal existente (`modal-overlay`, `modal-container`, `modal-header`, `modal-footer`). Dividido en 3 bloques visuales:

### Datos de la empresa
| Campo | Requerido | Validación |
|-------|-----------|------------|
| Nombre de la empresa | Sí | No vacío |
| Sector / Rubro | No | — |
| Ciudad | No | — |

### Contacto de la empresa
| Campo | Requerido | Validación |
|-------|-----------|------------|
| Nombre del representante | Sí | No vacío |
| Email de la empresa | Sí | No vacío |
| Teléfono de la empresa | Sí | No vacío |

### Datos del estudiante y modalidad
| Campo | Requerido | Validación |
|-------|-----------|------------|
| Nombre completo | Sí | No vacío |
| Correo del estudiante | Sí | Debe terminar en `@unal.edu.co` |
| Modalidad de interés | Sí | Radio: Práctica / Pasantía |

**Comportamiento:**
- Errores se muestran debajo del campo correspondiente (mismo patrón del proyecto).
- Botón "Enviar sugerencia" se deshabilita mientras el request está en vuelo (evita doble envío).
- Al éxito: el modal muestra un mensaje de confirmación.
- Al error: se muestra el mensaje de error retornado por el backend.

---

## 3. Backend (`Code.gs`)

Nueva función: `enviarSugerencia(datos)`

**Flujo:**
1. Valida server-side que los campos obligatorios no estén vacíos y que el correo del estudiante termine en `@unal.edu.co`. Retorna `{ success: false, error: '...' }` si falla.
2. Envía correo con `MailApp.sendEmail()` a `practicas_paz@unal.edu.co`.
3. Retorna `{ success: true }`.

**Correo:**
- Asunto: `[Sugerencia de empresa] – <nombre empresa> – <nombre estudiante>`
- Cuerpo: tabla HTML simple con los datos agrupados en los mismos bloques del formulario.

**Desarrollo local:**
- Sin `google.script.run` disponible, el frontend simula éxito directamente (mock), igual que hace el resto de la sección.

---

## 4. Correo destino

`practicas_paz@unal.edu.co` — configurado como constante en `Code.gs`, mismo correo usado en el proyecto raíz.
