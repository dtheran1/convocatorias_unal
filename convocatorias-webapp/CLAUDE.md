# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Architecture

This is a **Google Apps Script** web application — there is no build step, bundler, or package manager. Files are authored locally and uploaded directly to a Google Apps Script project via the Apps Script IDE or clasp. The app runs entirely inside **Google Sites** as embedded iframes.

### Two-tier layout

```
Root project (main app)
├── Code.gs          ← Backend: serves page, reads/writes Google Sheets, sends email
└── Index.html       ← Frontend: convocatorias grid + postulación form (self-contained)

sections/            ← Independent embeddable components, each deployed as its own Apps Script project
├── convenios/
│   ├── Code.gs      ← Backend for this section only
│   └── convenios.html
├── tdg/
│   └── tdg-complete.html   ← No backend; static content
├── hero/hero.html
├── stats/stats.html
├── comparison/comparison.html
├── requirements/requirements.html
├── process/process.html
├── documents/documents.html
├── contact/contact.html
└── vacantes/vacantes-restricted.html
```

Each section is **fully self-contained** — its own CSS, JS, and (if needed) its own `Code.gs` and Apps Script deployment. They do not share state or import from each other.

### Frontend ↔ Backend communication

The frontend never makes HTTP requests. It calls backend functions exclusively through the Apps Script RPC bridge:

```javascript
google.script.run
  .withSuccessHandler(callback)
  .withFailureHandler(errorCallback)
  .functionName(args);
```

This means:
- All backend functions that the frontend calls must be **top-level functions in Code.gs** (not nested).
- There is no REST API, no routing, no middleware. Each callable function is an isolated entry point.

### Local development (no Apps Script available)

Every HTML file that calls `google.script.run` checks for its absence and falls back to **inline mock data**. Example pattern in `convenios.html`:

```javascript
if (typeof google !== 'undefined' && google.script && google.script.run) {
  google.script.run.withSuccessHandler(...).getConvenios();
} else {
  // Mock path — used when opening the file locally in a browser
  handleConveniosSuccess({ success: true, data: MOCK_CONVENIOS });
}
```

To develop locally, simply open the HTML file in a browser. No server needed.

### Iframe height auto-adjustment

Every section communicates its content height to the Google Sites parent via `postMessage`:

```javascript
window.parent.postMessage({ type: 'setHeight', height: calculatedHeight }, '*');
```

This pattern appears in every HTML file. The parent page listens for this message and resizes the iframe. Do not remove or break this contract when editing sections.

---

## Deployment

There is no build or lint command. Deployment is manual:

1. Open the target Apps Script project (script.google.com).
2. Upload (or paste) `Code.gs` and the corresponding `.html` file.
3. For the **root project**: run `setupConfiguration()` once in the Script Editor to write Spreadsheet IDs into Script Properties.
4. Click **Implementar → Nueva implementación → App web**. Set "Execute as" and access permissions.
5. Copy the `/exec` URL and embed it in Google Sites.

Each section in `sections/` that has its own `Code.gs` is deployed as a **separate** Apps Script project.

---

## Data layer

All persistent data lives in **Google Sheets**. The backend reads/writes sheets using the Apps Script Spreadsheet API (`SpreadsheetApp`). Column positions are mapped via explicit constant objects — never by column letter:

```javascript
// Root Code.gs
const COLUMNAS = { ESTADO: 0, DEPENDENCIA_ENTIDAD: 1, ... };

// sections/convenios/Code.gs
const COL_CONV = { NUMERO: 0, ANIO: 1, INSTITUCION: 5, ENLACE: 13, ... };
```

If the sheet structure changes, update the corresponding column map — not the read logic.

Sheet IDs are stored in **Script Properties** (set by `setupConfiguration()`), with hardcoded fallbacks in `getConfig()`. The fallbacks exist for convenience but the CODE_REVIEW flags them as a security risk; prefer removing them once properties are confirmed set.

---

## Key conventions

- **Language:** UI and variable names are predominantly Spanish. Some utility functions use English (`normalize`, `escapeHtml`). Do not introduce a new naming language — follow what the surrounding file uses.
- **CSS:** All files use CSS custom properties (`--unal-green`, `--primary`, `--border`, etc.) defined in `:root`. Extend with new variables; do not hardcode colours.
- **Responsive breakpoints:** 480px, 600px, 768px, 992px. Mobile-first where applicable. Sections switch from table → card layout at 768px.
- **Icons:** Material Icons via Google CDN (`<link href="https://fonts.googleapis.com/icon?family=Material+Icons">`). Use icon ligature names (`<span class="material-icons">download</span>`).
- **No frameworks.** Everything is vanilla JS. No jQuery, no React, no bundler. Keep it that way.

---

## Open security issues (from CODE_REVIEW.md)

These are known and tracked but **not yet fixed**. Do not re-introduce these patterns, and fix them opportunistically when touching the relevant code:

| # | Issue | Location |
|---|-------|----------|
| 1 | XSS in email templates — user/admin data interpolated into HTML without escaping | Root `Code.gs`, email template functions |
| 2 | XSS in frontend error/success messages — `innerHTML` with unsanitised strings | Root `Index.html` |
| 3 | Fail-open error handling — `validarEstadoEstudiante()` allows application on exception | Root `Code.gs` |
| 4 | Spreadsheet IDs hardcoded as fallbacks in `getConfig()` | Root `Code.gs` and `sections/convenios/Code.gs` |
| 5 | `postMessage` uses wildcard origin `'*'` instead of the Sites domain | All HTML files |
| 6 | Loose equality (`==`) in critical validation paths | Root `Code.gs` |

An `escapeHtml` helper already exists in `Index.html`. A similar one is needed in `Code.gs` for the email templates.

---

## Common gotchas

- **Apps Script has no module system.** All functions in a `.gs` file are global. Name collisions across files in the same project will silently overwrite each other.
- **`doGet()` must exist** in every Apps Script project that serves an HTML page. It is the entry point for the web app URL.
- **Google Sheets triggers** (`onEdit`) run in Apps Script's context, not the browser's. `onEditPostulaciones()` in the root `Code.gs` is one such trigger — it fires server-side when an admin edits the Postulaciones sheet.
- **Iframe min-heights are hardcoded in CSS** for each section to prevent layout collapse before content loads. If you change content length significantly, update these.
- **Rate limiting state** is stored in Apps Script's `CacheService` (ephemeral, per-project). It resets on cache expiry (~6 hours), not on deployment.
