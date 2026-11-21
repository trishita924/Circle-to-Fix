# Testing Checklist — Circle to Fix (Web Edition)

> **Environment Note:** Automated JavaScript syntax (`node --check`), pure-web compliance (zero Chrome extension APIs or Manifest V3), HTML relative asset path verification, `localStorage` report persistence unit tests, and AI prompt builder tests were executed in Node.js. Interactive Canvas drawing, clipboard paste, and PNG download require verification in a live browser because headless Chromium in the build sandbox blocks `127.0.0.1` and `file://` URLs.

| # | Feature / Scenario | Status | Verification Details |
|---|--------------------|--------|----------------------|
| 1 | Pure static website (no Manifest V3, no Chrome APIs) | **Passed (Automated)** | Verified zero `chrome.*` APIs and no extension `manifest.json`. |
| 2 | Relative asset paths & JS syntax | **Passed (Automated)** | All 4 JS files passed `node --check` and all 6 `./` references in `index.html` exist on disk. |
| 3 | Structured AI prompt generation | **Passed (Automated)** | Tested `CircleToFixPrompt.buildPrompt()` with annotations summary, issue category, description, and HTML/CSS snippet. |
| 4 | Recent bug reports persistence (`localStorage`) | **Passed (Automated)** | Tested `CircleToFixStorage.saveReport()`, `getReports()`, and `deleteReport()` in Node.js `localStorage` mock. |
| 5 | Interactive Canvas drawing (Circle, Box, Arrow, Pen, Text, Undo) | **Pending Live Browser Verification** | Implemented with Pointer Events (`pointerdown`/`pointermove`/`pointerup`) in `canvas.js`; verify in browser. |
| 6 | Screenshot upload, drag-and-drop, `Ctrl+V` paste & PNG download | **Pending Live Browser Verification** | Implemented in `app.js` and `canvas.js`; verify in browser. |
