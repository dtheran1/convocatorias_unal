# Secciones Embebibles - Prácticas y Pasantías UNAL

Este directorio contiene secciones independientes de la página de Prácticas y Pasantías, diseñadas para ser embebidas individualmente en Google Sites u otras plataformas.

## 📁 Estructura de Carpetas

```
sections/
├── hero/
│   └── hero.html                    # Sección principal con título y botones
├── stats/
│   └── stats.html                   # Tarjetas de estadísticas
├── comparison/
│   └── comparison.html              # Comparación Práctica vs Pasantía
├── requirements/
│   └── requirements.html            # Requisitos por programa (acordeón)
├── documents/
│   └── documents.html               # Documentos descargables
├── process/
│   └── process.html                 # Proceso de inscripción (timeline)
└── contact/
    └── contact.html                 # Información de contacto
```

## 🎯 Características de Cada Sección

### 1. Hero Section
- **Archivo**: `sections/hero/hero.html`
- **Altura mínima**: 400px (desktop), 500px (mobile)
- **Contenido**: Título principal, descripción y botones CTA
- **Ideal para**: Encabezado de página principal

### 2. Stats Section
- **Archivo**: `sections/stats/stats.html`
- **Altura mínima**: 300px (desktop), 350px (mobile)
- **Contenido**: 4 tarjetas con estadísticas clave
- **Grid**: 4 columnas (desktop) → 2 columnas (mobile)

### 3. Comparison Section
- **Archivo**: `sections/comparison/comparison.html`
- **Altura mínima**: 600px (desktop), 900px (mobile)
- **Contenido**: Comparación detallada entre Práctica y Pasantía
- **Grid**: 2 columnas (desktop) → 1 columna (mobile)

### 4. Requirements Section
- **Archivo**: `sections/requirements/requirements.html`
- **Altura mínima**: 800px (desktop), 1000px (mobile)
- **Contenido**: Acordeón con requisitos de cada programa
- **Interactivo**: La altura se actualiza al expandir acordeones

### 5. Documents Section
- **Archivo**: `sections/documents/documents.html`
- **Altura mínima**: 500px (desktop), 650px (mobile)
- **Contenido**: 3 documentos descargables con enlaces
- **Grid**: 3 columnas (desktop) → 1 columna (mobile)

### 6. Process Section
- **Archivo**: `sections/process/process.html`
- **Altura mínima**: 600px (desktop), 800px (mobile)
- **Contenido**: Timeline de 4 pasos para inscripción
- **Grid**: 4 columnas (desktop) → 1 columna (mobile)

### 7. Contact Section
- **Archivo**: `sections/contact/contact.html`
- **Altura mínima**: 350px (desktop), 450px (mobile)
- **Contenido**: Información de contacto (email, ubicación, horario)

## 🚀 Cómo Embeberlas en Google Sites

### Opción 1: Publicar en Google Apps Script

1. **Crea un proyecto de Google Apps Script** para cada sección
2. **Copia el contenido HTML** del archivo correspondiente
3. **Crea un archivo HTML** en Apps Script con el contenido
4. **Implementa como Web App**:
   - Ve a "Implementar" → "Nueva implementación"
   - Tipo: "Aplicación web"
   - Ejecutar como: "Yo"
   - Quién tiene acceso: "Cualquier persona"
5. **Copia la URL** de la implementación

### Opción 2: Usar las URLs Directamente

Si subes los archivos a un servidor web, puedes usar las URLs directamente.

### Configuración del Iframe en Google Sites

Para cada sección, configura el iframe así:

```html
<iframe
  src="URL_DE_TU_SECCION"
  width="100%"
  height="AUTO"
  frameborder="0"
  scrolling="no"
  style="border: none;">
</iframe>
```

**Alturas recomendadas por sección:**

| Sección | Desktop | Mobile |
|---------|---------|---------|
| Hero | 450px | 550px |
| Stats | 350px | 400px |
| Comparison | 700px | 1000px |
| Requirements | 900px | 1100px |
| Documents | 550px | 700px |
| Process | 650px | 850px |
| Contact | 400px | 500px |

## 🔧 Características Técnicas

### Responsive Design
- ✅ Mobile-first approach
- ✅ Breakpoints: 480px, 600px, 768px, 992px
- ✅ Touch-friendly (mínimo 44px para elementos interactivos)

### Comunicación con Iframe Padre
Todas las secciones incluyen:
- Detección automática de iframe
- Envío de altura al padre mediante `postMessage`
- Actualización dinámica en cambios de tamaño

### Optimizaciones para Mobile
- Font-size: 16px en inputs (previene zoom en iOS)
- `-webkit-overflow-scrolling: touch` para scroll suave
- `touch-action: manipulation` para evitar delay
- Alturas mínimas adaptativas según viewport

## 📝 Personalización

### Variables CSS
Cada sección usa las mismas variables CSS para consistencia:

```css
--unal-green: #4CAF50;
--unal-green-dark: #388E3C;
--unal-green-light: #C8E6C9;
--text-primary: #1e293b;
--text-secondary: #64748b;
```

### Modificar Contenido
Los textos y enlaces están en el HTML y son fáciles de modificar directamente.

### Cambiar Colores
Modifica las variables CSS en la sección `<style>` de cada archivo.

## 🎨 Orden Sugerido en Google Sites

Para una experiencia óptima, organiza las secciones así:

1. **Hero** - Presentación inicial
2. **Stats** - Números clave
3. **Comparison** - Entender las modalidades
4. **Requirements** - Verificar elegibilidad
5. **Process** - Conocer los pasos
6. **Documents** - Descargar formatos
7. **Contact** - Información de contacto

## ⚠️ Notas Importantes

- Las secciones son **independientes** entre sí
- Cada una tiene sus **propios estilos** (no hay dependencias externas)
- La **comunicación con el iframe padre** es automática
- Todas las secciones usan **Google Fonts** (requieren conexión a internet)
- Los **Material Icons** también se cargan desde CDN

## 🔄 Actualización de Contenido

Para actualizar el contenido de una sección:

1. Edita el archivo HTML correspondiente
2. Re-implementa la Web App en Google Apps Script
3. La URL permanece igual, los cambios se reflejan automáticamente

## 📱 Testing en Mobile

Para probar cómo se ven en mobile:

1. Usa Chrome DevTools (F12)
2. Activa el modo responsive (Ctrl+Shift+M)
3. Prueba con diferentes tamaños: iPhone SE, iPhone 12, iPad

## 🆘 Soporte

Si encuentras problemas:

1. Verifica que la URL de la Web App esté correcta
2. Asegúrate de que los permisos de compartir estén en "Cualquier persona"
3. Revisa la consola del navegador (F12) para errores
4. Verifica la configuración de altura del iframe en Google Sites

---

**Creado para**: Universidad Nacional de Colombia - Sede de La Paz
**Proyecto**: Sistema de Prácticas y Pasantías
**Año**: 2026
