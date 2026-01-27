# Sistema de Convocatorias - UNAL Sede de La Paz

## Requisitos Previos

1. Una cuenta de Google con acceso al Google Sheet de convocatorias
2. El Google Sheet debe tener los permisos adecuados

## Paso 1: Preparar el Google Sheet

### Agregar columna de Estado
Agrega una columna llamada **"Estado"** al final de tu hoja (columna R o siguiente disponible) con valores:
- `Activa` - para convocatorias abiertas
- `Cerrada` - para convocatorias que ya no reciben postulaciones

### Obtener el ID del Sheet
El ID esta en la URL de tu Google Sheet:
```
https://docs.google.com/spreadsheets/d/1iNF7VwBPS_Txxk7c14JSefGKFD_D-0eZPc6s8geBGkk/edit
```

## Paso 2: Crear el Proyecto en Apps Script

1. Ve a [script.google.com](https://script.google.com)
2. Clic en **"Nuevo proyecto"**
3. Nombra el proyecto: `Convocatorias UNAL`

## Paso 3: Agregar el Codigo

### Archivo Code.gs
1. En el editor, ya existe un archivo `Code.gs`
2. Borra el contenido existente
3. Copia y pega TODO el contenido del archivo `Code.gs` de esta carpeta
4. **IMPORTANTE**: Cambia `TU_SPREADSHEET_ID_AQUI` por el ID de tu Sheet:
   ```javascript
   const SPREADSHEET_ID = 'abc123xyz...'; // Tu ID real aqui
   ```
5. Verifica que `SHEET_NAME` coincida con el nombre de tu hoja (ej: `'Respuestas de formulario 1'`)

### Archivo Index.html
1. Clic en el icono **"+"** junto a "Archivos"
2. Selecciona **"HTML"**
3. Nombra el archivo: `Index` (sin la extension .html)
4. Copia y pega TODO el contenido del archivo `Index.html` de esta carpeta

## Paso 4: Ajustar el Mapeo de Columnas (si es necesario)

Si tu Sheet tiene las columnas en orden diferente, edita el objeto `COLUMNAS` en `Code.gs`:

```javascript
const COLUMNAS = {
  DEPENDENCIA_ENTIDAD: 0,      // Columna A = indice 0
  NOMBRE_VACANTE: 1,           // Columna B = indice 1
  EMAIL_CONTACTO: 2,           // Columna C = indice 2
  // ... ajusta segun tu sheet
};
```

## Paso 5: Implementar como Web App

1. Clic en **"Implementar"** > **"Nueva implementacion"**
2. Configuracion:
   - **Tipo**: Aplicacion web
   - **Descripcion**: Convocatorias v1.0
   - **Ejecutar como**: Tu cuenta
   - **Quien tiene acceso**:
     - `Solo yo` - para pruebas
     - `Cualquier persona de Universidad Nacional de Colombia` - para usuarios UNAL
     - `Cualquier persona` - acceso publico

3. Clic en **"Implementar"**
4. **Autoriza** el acceso cuando se solicite
5. Copia la **URL de la Web App**

## Paso 6: Embeber en Google Sites

1. Abre tu sitio en [sites.google.com](https://sites.google.com)
2. Edita la pagina donde quieres las convocatorias
3. En el menu lateral: **Insertar** > **Incorporar** > **Por URL**
4. Pega la URL de tu Web App
5. Ajusta el tamano del marco (recomendado: ancho completo, alto 800px minimo)
6. Publica los cambios

## Actualizaciones Futuras

Cada vez que hagas cambios en el codigo:
1. Guarda los cambios (Ctrl+S)
2. **Implementar** > **Administrar implementaciones**
3. Clic en el lapiz (editar)
4. Cambia la version a **"Nueva version"**
5. Clic en **"Implementar"**

## Solucion de Problemas

### "No se encontro la hoja"
- Verifica que `SHEET_NAME` en Code.gs coincida exactamente con el nombre de tu hoja

### "Error de autorizacion"
- Vuelve a autorizar: Implementar > Probar la implementacion > Autorizar

### Los datos no se muestran
- Verifica que el Sheet tenga datos
- Revisa que el mapeo de columnas sea correcto
- Abre la consola del navegador (F12) para ver errores

### El iframe no carga en Google Sites
- Asegura que la Web App este configurada como "Cualquier persona" o el grupo correcto
- Prueba la URL directamente en el navegador primero

## Estructura de Archivos

```
convocatorias-webapp/
├── Code.gs          # Logica del servidor (Apps Script)
├── Index.html       # Interfaz de usuario (HTML/CSS/JS)
└── INSTRUCCIONES.md # Este archivo
```

## Personalizacion

### Cambiar colores
Edita las variables CSS en `Index.html`:
```css
:root {
  --unal-green: #4CAF50;       /* Color principal */
  --unal-green-dark: #388E3C;  /* Color hover */
  /* ... */
}
```

### Cambiar titulo
Edita el header en `Index.html`:
```html
<header class="header">
  <h1>Tu Titulo Aqui</h1>
  <p>Tu subtitulo</p>
</header>
```

### Agregar mas filtros
Agrega botones en la seccion `.filters` y actualiza la funcion `handleFilterClick()`.
