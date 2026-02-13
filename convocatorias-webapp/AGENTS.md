# AGENTS.md

Agent instructions for the convocatorias-webapp codebase.

---

## Build / Lint / Test

**This project has a custom testing framework for Google Apps Script.** No npm, no bundler, no external test framework.

### Running tests (Backend - Code.gs)
1. Open your Apps Script project at script.google.com
2. Add file `CodeTests.gs` from `tests/CodeTests.gs`
3. Select function `runAllTests()` from dropdown
4. Click Run ▶️ and authorize permissions
5. View results: View → Logs (Ctrl+Enter)

**Quick test coverage:**
- ✅ Validation (emails, PAPA, PBM, phone, documents)
- ✅ Sanitization (trim, lowercase, formatting)
- ✅ Rate limiting (3 attempts / 10 min)
- ⚠️ XSS prevention (pending `escapeHtml()` implementation)
- ⚠️ Business logic (requires mock data spreadsheet)

See `tests/QUICKSTART.md` for 5-minute setup guide.

### Running a single test (Frontend - HTML)
No automated test suite for frontend. Manual testing workflow:
1. Open specific `.html` file in browser (uses mock data automatically)
2. Test UI interactions locally with browser DevTools
3. For full integration: Deploy to Apps Script staging and test via `/dev` URL
4. Check Apps Script logs: View → Logs (Ctrl+Enter in script editor)

### Local development
Open any `.html` file directly in a browser. Each file checks for `google.script.run` and falls back to inline mock data when unavailable.

**Mock data pattern:**
```javascript
if (typeof google !== 'undefined' && google.script && google.script.run) {
  google.script.run.withSuccessHandler(handleData).getData();
} else {
  handleData({ success: true, data: MOCK_DATA }); // Local fallback
}
```

### Deployment (manual)
1. Open target Apps Script project at script.google.com
2. Paste `Code.gs` and `.html` files
3. Run `setupConfiguration()` once (root project only)
4. Deploy: Implementar → Nueva implementación → App web
5. Embed `/exec` URL in Google Sites iframe

---

## Architecture

**Google Apps Script** web app embedded in Google Sites as iframes. No REST API—frontend calls backend via `google.script.run` RPC bridge.

```
Root project
├── Code.gs       # Backend: Sheets read/write, email, validation
└── Index.html    # Frontend: convocatorias grid + postulación form

sections/         # Independent embeddable components (separate deployments)
├── convenios/    # Has its own Code.gs
├── banco-perfiles/
├── logoCarrusel/
├── tdg/          # Static only
├── hero/, stats/, comparison/, requirements/, process/, documents/, contact/, vacantes/
```

Each section is **fully self-contained**—own CSS, JS, and optional backend.

---

## Code Style

### Naming conventions
| Context | Convention | Examples |
|---------|------------|----------|
| Functions (domain) | camelCase, Spanish | `validarDatosPostulacion`, `guardarPostulacion` |
| Functions (utility) | camelCase, English | `escapeHtml`, `debounce`, `checkRateLimit` |
| Constants | SCREAMING_SNAKE_CASE | `COLUMNAS`, `COL_POST`, `RATE_LIMIT_CONFIG` |
| CSS variables | kebab-case with prefix | `--unal-green`, `--text-primary`, `--shadow-md` |
| CSS classes | kebab-case, BEM-like | `.card-header`, `.accordion-item`, `.comparison-card` |
| HTML IDs | camelCase | `cardsContainer`, `searchInput`, `modalOverlay` |
| Data attributes | kebab-case | `data-filter`, `data-i18n` |

**Language rule:** Follow the surrounding file. Domain terms are Spanish; utilities are English.

### Formatting
- **No frameworks.** Vanilla JS only—no jQuery, React, or bundlers.
- Template literals for HTML generation
- Early returns for validation
- Object destructuring where appropriate
- 2-space indentation (implicit standard)
- **Strict equality:** Always use `===` and `!==` (never `==` or `!=`)

### Imports and dependencies
- **No imports.** Everything is inline in `.gs` or `.html` files
- External dependencies: Google Fonts (Inter), Material Icons CDN
- No npm packages, no package.json, no bundler

### Column mapping
Always use constant objects for spreadsheet columns—never raw indices or letters:
```javascript
const COLUMNAS = { ESTADO: 0, DEPENDENCIA_ENTIDAD: 1, ... };
const row = data[COLUMNAS.ESTADO];
```

---

## Error Handling

### Backend pattern (Code.gs)
```javascript
try {
  // operation
  return { success: true, data: result };
} catch (error) {
  console.error('Error context:', error);
  return { success: false, error: error.message, tipo: 'VALIDATION_ERROR' };
}
```

### Frontend pattern (HTML)
```javascript
google.script.run
  .withSuccessHandler(handleSuccess)
  .withFailureHandler(handleError)
  .backendFunction(args);
```

### Critical rule: fail-closed
On validation errors, **deny by default**. Never return permissive state on exception.

---

## CSS Design System

Use existing CSS custom properties—do not hardcode colors:
```css
:root {
  --unal-green: #4CAF50;
  --primary: #2563eb;
  --text-primary: #1e293b;
  --border: #e2e8f0;
  --radius: 12px;
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
}
```

**Responsive breakpoints:** 480px, 600px, 768px, 992px (mobile-first).

**Icons:** Material Icons via Google CDN (ligature names: `<span class="material-icons">download</span>`).

---

## Required Patterns

### Iframe height communication
Every HTML section must include:
```javascript
window.parent.postMessage({ type: 'setHeight', height: calculatedHeight }, '*');
```

### Local development fallback
```javascript
if (typeof google !== 'undefined' && google.script && google.script.run) {
  google.script.run.withSuccessHandler(...).getData();
} else {
  handleSuccess({ success: true, data: MOCK_DATA }); // Mock path
}
```

### XSS prevention
Use `escapeHtml()` for all user/admin data interpolated into HTML:
```javascript
function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
```

---

## Known Security Issues (do not re-introduce)

| # | Issue | Location |
|---|-------|----------|
| 1 | XSS in email templates—escape all interpolated data | Code.gs email functions |
| 2 | XSS in frontend messages—use `escapeHtml` with `innerHTML` | Index.html |
| 3 | Fail-open in `validarEstadoEstudiante()`—must fail-closed | Code.gs |
| 4 | Spreadsheet IDs hardcoded in git | Code.gs fallbacks |
| 5 | `postMessage` uses wildcard `'*'` | All HTML files |
| 6 | Loose equality `==` in validation | Code.gs (use `===`) |

See `CODE_REVIEW.md` for full audit (21 issues total).

---

## Common Gotchas

- **No module system.** All `.gs` functions are global. Name collisions silently overwrite.
- **`doGet()` required.** Every Apps Script serving HTML needs this entry point.
- **Sheet triggers run server-side.** `onEditPostulaciones()` fires in Apps Script context.
- **Rate limiting uses `CacheService`.** Ephemeral, resets on cache expiry (~6h).
- **Iframe min-heights are hardcoded.** Update if content length changes significantly.

---

## Quick Reference

| Task | Action |
|------|--------|
| Add new section | Create folder in `sections/`, add self-contained HTML (+ Code.gs if needed) |
| Modify sheet columns | Update `COLUMNAS` or `COL_*` constant—never hardcode indices |
| Add CSS color | Define in `:root` as `--name`, use `var(--name)` |
| Call backend from frontend | `google.script.run.withSuccessHandler(cb).functionName(args)` |
| Test locally | Open `.html` in browser (uses mock data automatically) |
| Deploy changes | Manual upload to script.google.com → new deployment |
