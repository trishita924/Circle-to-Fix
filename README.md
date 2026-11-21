# Circle to Fix — Web Edition

**Point at the problem. Let AI fix the rest.**

**Circle to Fix** is a 100% browser-based, GitHub Pages–compatible web application that helps developers explain UI bugs to AI coding agents (Gemini, Claude, or ChatGPT) in seconds. Upload or paste a screenshot, draw a circle, box, arrow, or label over the broken UI element, optionally paste your HTML/CSS snippet, and export both a structured bug-fixing prompt and the annotated PNG screenshot.

---

## Features

- **Landing Dashboard**: Hero overview, How It Works, Feature cards, Privacy guarantee, and Recent Bug Reports persisted in `localStorage`.
- **Interactive HTML5 Canvas Bug Studio**:
  - Upload via file picker, drag-and-drop, or `Ctrl+V` / `Cmd+V` clipboard paste (plus a built-in **Try Sample Screenshot** generator).
  - Draw **Circles**, **Rectangles**, **Arrows**, **Freehand Pen**, and **Text Labels** with customizable colors and stroke widths, plus **Undo** (`Ctrl+Z`) and **Clear**.
- **AI Bug-Fixing Prompt Generator**: Builds a structured Markdown prompt summarizing your visual annotations, issue category, expected behavior, and optional HTML/CSS snippet.
- **One-Click Export**: Copy the prompt to your clipboard and download the annotated screenshot as a high-resolution PNG.
- **100% Local & Private**: Pure HTML, CSS, and JavaScript—no Chrome extension, no backend, no login, and no external APIs.

---

## Folder Structure

```text
Circle-to-Fix-Web/
├── index.html
├── README.md
├── TESTING-CHECKLIST.md
└── assets/
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── app.js
    │   ├── canvas.js
    │   ├── prompt.js
    │   └── storage.js
    └── icons/
        ├── favicon.png
        ├── icon-192.png
        └── icon-512.png
```

---

## How to Run Locally

Open `Circle-to-Fix-Web/index.html` directly in any modern browser, or serve it with a local static server:

```bash
cd Circle-to-Fix-Web
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

---

## How to Deploy to GitHub Pages

1. Extract `Circle-to-Fix-Web.zip` and push the contents of `Circle-to-Fix-Web/` (with `index.html` at the repository root) to GitHub.
2. Open **Settings → Pages** in your repository.
3. Under **Build and deployment**, select **Deploy from a branch**, choose `main` and `/ (root)`, and click **Save**.
4. Your app will be live at `https://<your-username>.github.io/<repo-name>/`.
