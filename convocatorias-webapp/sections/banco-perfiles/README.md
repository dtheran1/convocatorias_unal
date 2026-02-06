# Banco de Perfiles - Documentación

**Convocatoria Interna**: Formulario para que las dependencias de la Sede de La Paz registren perfiles de prácticas y pasantías disponibles para estudiantes de la Universidad Nacional de Colombia - Sede de La Paz.

## 📋 Contenido

- `banco-perfiles.html` - Formulario web con soporte para múltiples perfiles
- `Code.gs` - Backend que guarda en Google Sheets y envía notificaciones por email
- `README.md` - Esta documentación

## 🚀 Deployment

### Paso 1: Crear Google Sheet Personal

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala: **"Banco de Perfiles - UNAL La Paz"**
4. Copia el **ID del Sheet** desde la URL:
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
   ```
5. **Importante**: Asegúrate de que tienes permisos de edición en este Sheet

### Paso 2: Crear Proyecto en Apps Script

1. Ve a [script.google.com](https://script.google.com)
2. Clic en **"Nuevo proyecto"**
3. Renombra el proyecto a: **"Banco de Perfiles - UNAL La Paz"**

### Paso 3: Subir Archivos

1. En el editor de Apps Script, elimina el archivo `Code.gs` predeterminado
2. Clic en **"+"** junto a "Archivos"
3. Selecciona **"Secuencia de comandos"** y pega el contenido de `Code.gs`
4. Clic en **"+"** junto a "Archivos" nuevamente
5. Selecciona **"HTML"** y nómbralo `banco-perfiles`
6. Pega el contenido de `banco-perfiles.html`
7. Guarda todo (Ctrl+S)

### Paso 4: Configurar el Proyecto

1. En el editor de Apps Script, abre `Code.gs`
2. En la función dropdown, selecciona **`setupBancoPerfiles`**
3. Clic en **"Ejecutar"** (▶)
4. **Autoriza** la aplicación cuando se te solicite:
   - Clic en "Revisar permisos"
   - Selecciona tu cuenta
   - Clic en "Avanzado" → "Ir a [nombre del proyecto]"
   - Clic en "Permitir"
5. Se abrirán dos diálogos:
   - **Primer diálogo**: Pega el ID del Google Sheet que creaste en el Paso 1
   - **Segundo diálogo**: Ingresa el email de notificación (ej: `practicas_paz@unal.edu.co`)
6. Verás un mensaje de confirmación indicando que la configuración fue exitosa

### Paso 5: Implementar como Web App

1. En el editor de Apps Script, clic en **"Implementar"** → **"Nueva implementación"**
2. Clic en el ícono de engranaje ⚙️ junto a "Seleccionar tipo"
3. Selecciona **"Aplicación web"**
4. Configura:
   - **Descripción**: "Formulario Banco de Perfiles v1"
   - **Ejecutar como**: "Yo" (tu cuenta de Google)
   - **Quién tiene acceso**: **"Cualquier usuario"** (importante para que empresas externas puedan acceder)
5. Clic en **"Implementar"**
6. **Copia la URL** que termina en `/exec`
7. Guarda esta URL - la necesitarás para el Paso 6

### Paso 6: Insertar en Google Sites

1. Ve a tu Google Site
2. Edita la página donde quieres agregar el formulario
3. Clic en **"Insertar"** → **"Incrustar URL"**
4. Pega la URL `/exec` que copiaste en el Paso 5
5. Ajusta el tamaño del iframe (recomendado: altura mínima 1200px)
6. Clic en **"Insertar"**
7. **Publica** los cambios del sitio

## 📊 Estructura del Google Sheet

El sistema creará automáticamente una hoja llamada **"Banco de Perfiles"** con las siguientes columnas:

| Columna | Descripción |
|---------|-------------|
| Fecha de Registro | Timestamp automático |
| Nombre Dependencia | Nombre de la institución/dependencia |
| Correo Contacto | Email de contacto |
| Responsable | Nombre del responsable |
| Tipo Modalidad | Práctica o Pasantía |
| Descripción Perfil | Descripción detallada del perfil |
| Dependencia/Proyecto | Dónde se desarrollará |
| Cantidad Estudiantes | Número de cupos disponibles |
| Modalidad Trabajo | Presencial, Virtual o Híbrida |
| Programas Académicos | Lista de programas pertinentes |
| Competencias Específicas | Conocimientos técnicos requeridos |
| Habilidades Valoradas | Soft skills y actitudes |
| Apoyo Estudiante | SI, NO u Otro |
| Observaciones | Información adicional |

**Nota**: Si una empresa registra múltiples perfiles en un mismo envío, cada perfil se guardará como una fila separada.

## 📧 Notificaciones por Email

Cada vez que se envía el formulario:

1. Los datos se guardan en el Google Sheet
2. Se envía un email a la dirección configurada (ej: `practicas_paz@unal.edu.co`)
3. El email incluye:
   - Información de la dependencia
   - Todos los perfiles registrados
   - Formato HTML legible

## 🔧 Funciones Administrativas

### Verificar Configuración

Para verificar que todo está configurado correctamente:

1. En el editor de Apps Script, abre `Code.gs`
2. Selecciona la función **`testConfiguration`**
3. Clic en **"Ejecutar"** (▶)
4. Revisa el log (Ver → Registros) para ver el estado

### Obtener Estadísticas

Para obtener un resumen del banco de perfiles:

1. Selecciona la función **`getEstadisticas`**
2. Clic en **"Ejecutar"** (▶)
3. Revisa el log para ver:
   - Total de perfiles registrados
   - Total de dependencias únicas
   - Total de cupos de estudiantes

### Re-configurar el Proyecto

Si necesitas cambiar el Sheet ID o el email de notificación:

1. Ejecuta nuevamente la función **`setupBancoPerfiles`**
2. Ingresa los nuevos valores

## 🔒 Seguridad y Privacidad

- El formulario es **interno** - dirigido a dependencias de la Sede de La Paz
- Los datos se guardan en tu Google Sheet **personal** (temporal)
- Solo tú (y quienes tengas permisos en el Sheet) pueden ver los datos
- Las notificaciones se envían al email configurado (practicas_paz@unal.edu.co)
- Posteriormente, los datos se transfieren manualmente al Sheet institucional
- No se almacenan datos sensibles o personales de estudiantes

## 🐛 Troubleshooting

### El formulario no se envía

1. Verifica que el Sheet ID en la configuración sea correcto
2. Asegúrate de que tienes permisos de edición en el Google Sheet
3. Revisa los logs en Apps Script (Ver → Registros)

### No llegan los emails

1. Verifica que el email en la configuración sea correcto
2. Revisa la carpeta de SPAM
3. Verifica que la cuenta de Apps Script tenga permisos para enviar emails

### El iframe no se ajusta al contenido

1. El formulario envía automáticamente mensajes `postMessage` para ajustar altura
2. Asegúrate de que el iframe permita JavaScript
3. Si es necesario, aumenta manualmente la altura del iframe en Google Sites

### "Error al procesar el formulario"

1. Ejecuta `testConfiguration` para verificar el setup
2. Revisa que el Sheet no esté bloqueado o protegido
3. Verifica los logs en Apps Script para detalles del error

## 📝 Notas Importantes

### Datos Estructurados vs. Múltiples Perfiles

Cuando una dependencia envía el formulario con **3 perfiles**, el sistema crea **3 filas** en el Sheet:

```
Fila 1: Dependencia A | Correo | Responsable | [Datos Perfil 1]
Fila 2: Dependencia A | Correo | Responsable | [Datos Perfil 2]
Fila 3: Dependencia A | Correo | Responsable | [Datos Perfil 3]
```

Esto facilita:
- Filtrar por tipo de modalidad
- Buscar por programa académico
- Contar cupos totales
- Exportar datos

### Transferencia de Datos al Sheet Institucional

Para transferir datos desde tu Sheet personal al institucional:

**Opción 1: Copia Manual**
1. Abre tu Google Sheet personal
2. Selecciona las filas nuevas
3. Copia (Ctrl+C)
4. Pega en el Sheet institucional

**Opción 2: Importación con Fórmula**
```
=IMPORTRANGE("ID_DEL_SHEET_PERSONAL", "Banco de Perfiles!A2:N")
```

**Opción 3: Script de Sincronización Automática**
(Disponible bajo solicitud si lo necesitas)

## 🔄 Actualizaciones y Mantenimiento

### Actualizar el Formulario

Si necesitas modificar el formulario:

1. Edita `banco-perfiles.html` localmente
2. Copia el contenido actualizado
3. En Apps Script, abre el archivo `banco-perfiles`
4. Pega el nuevo contenido
5. Guarda (Ctrl+S)
6. **No es necesario re-implementar** - los cambios se reflejan automáticamente

### Actualizar el Backend

Si necesitas modificar `Code.gs`:

1. Edita `Code.gs` localmente
2. Copia el contenido actualizado
3. En Apps Script, pega el nuevo contenido
4. Guarda (Ctrl+S)
5. **No es necesario re-implementar** - los cambios se reflejan automáticamente

### Versionado de Implementaciones

Apps Script mantiene un historial de implementaciones:

1. En Apps Script, clic en **"Implementar"** → **"Administrar implementaciones"**
2. Verás todas las versiones
3. Puedes crear nuevas versiones o archivar antiguas

## 📞 Contacto y Soporte

Para dudas o problemas:
- Email: practicas_paz@unal.edu.co
- Revisa los logs en Apps Script (Ver → Registros)
- Consulta la documentación de Google Apps Script: [developers.google.com/apps-script](https://developers.google.com/apps-script)

## 📄 Licencia

Este proyecto es de uso interno de la Universidad Nacional de Colombia - Sede de La Paz.
