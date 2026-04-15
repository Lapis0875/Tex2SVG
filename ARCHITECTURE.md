# Architecture

## Stack

| Layer | Choice | Reason |
| --- | --- | --- |
| Build | Vite 5 | Native ESM, fast HMR, first-class React/TS |
| Language | TypeScript 5 (strict) | Type safety for TeX/SVG/dimension types |
| UI | React 18 | Component model for editor/preview/settings |
| TeX renderer | MathJax 4 (`mathjax@4`) via CDN | Native pure SVG output; full LaTeX/AMS support |
| State | Zustand 5 + `persist` | Minimal store; settings survive page reload |
| Styling | Plain co-located CSS | No framework dependency; precise academic layout |

---

## Directory Structure

```text
src/
├── main.tsx                          # ReactDOM root → <App />
├── App.tsx                           # Top-level layout (sidebar + preview panes)
│                                     # Manages theme, TeX input persistence, render state
│
├── components/                       # Stateless UI primitives
│   ├── Editor/TexEditor              # Textarea for TeX input (Ctrl+Enter to render)
│   ├── Preview/SvgPreview            # Inline SVG display (dangerouslySetInnerHTML)
│   ├── Toolbar/Toolbar               # Copy SVG / Download .svg / Render buttons
│   ├── Settings/SettingsPanel        # Collapsible size/resolution/wrap/theme panel
│   ├── Settings/DimensionInput       # Labeled numeric input (width, height, DPI)
│   ├── EquationNumber/EquationTag    # Equation label overlay
│   ├── LogPanel/LogPanel             # Collapsible error log panel
│   ├── SupportedEnvList/SupportedEnvList  # Collapsible supported editors list
│   ├── TexTips/TexTips               # Collapsible TeX snippet tips with Insert button
│   └── common/                       # Button, Select, IconButton, Tooltip primitives
│
├── features/                         # All domain/business logic (no React imports)
│   ├── renderer/
│   │   ├── mathjaxLoader.ts          # Lazy-init MathJax 4 from CDN; cached module-scope promise
│   │   ├── renderTex.ts              # Core async fn: TeX string → raw SVG string
│   │   ├── renderOptions.ts          # RenderConfig type + defaults
│   │   └── renderPipeline.ts         # Orchestrates all render steps (see Data Flow)
│   ├── sizing/
│   │   ├── svgDimensions.ts          # Rewrites SVG width/height/viewBox to user spec
│   │   ├── svgTagReposition.ts       # Repositions equation tags within SVG geometry
│   │   ├── dimensionTypes.ts         # SvgSize, Resolution, DimensionMode, TagSide types
│   │   └── viewBoxUtils.ts           # em→px conversion, viewBox string builder
│   ├── equations/
│   │   ├── equationNumbering.ts      # Injects \tag{} into TeX source (pre-render)
│   │   ├── alignParser.ts            # Detects environments; wraps bare TeX in display env
│   │   └── equationTypes.ts          # EquationBlock, NumberingStyle, AlignEnv types
│   ├── export/
│   │   ├── svgExporter.ts            # Blob download as .svg file
│   │   ├── svgCleaner.ts             # Post-processing: strip MathJax IDs, fix compat issues
│   │   └── clipboardExport.ts        # Copies SVG string via Clipboard API
│   └── settings/
│       ├── settingsStore.ts          # Zustand store with localStorage persistence
│       ├── settingsTypes.ts          # AppSettings, RenderSettings, ExportSettings, Theme types
│       └── settingsDefaults.ts       # Default values
│
└── lib/                              # Pure utilities — no React (testable in Node)
    ├── svgUtils.ts                   # DOMParser/XMLSerializer wrappers
    ├── stringUtils.ts                # TeX sanitization, whitespace normalization
    ├── errorUtils.ts                 # RenderError, ParseError typed classes
    └── hooks/
        ├── useRender.ts              # Async render state machine + trigger
        ├── useDebounce.ts            # Debounce hook for live-preview keystrokes
        ├── useClipboard.ts           # Clipboard copy with 2-second "Copied!" feedback
        ├── useLocalStorage.ts        # Generic localStorage hook (persists TeX input)
        └── useSettings.ts            # Thin hook over settingsStore
```

---

## Data Flow

```text
<TexEditor> keystroke or Ctrl+Enter
  │
  ▼
useRender hook  (lib/hooks/useRender.ts)
  │  calls
  ▼
renderPipeline.ts  (features/renderer/renderPipeline.ts)
  │
  ├─ 1. sanitizeTex / normalizeTex     (lib/stringUtils.ts)
  │       Strip null bytes, normalize line endings
  │
  ├─ 2. wrapInDisplayMath              (features/equations/alignParser.ts)
  │       Detect existing environment; wrap bare TeX in configured wrapEnvironment
  │       ('equation*' | 'align*' | 'none')
  │
  ├─ 3. renderTex → MathJax            (features/renderer/renderTex.ts)
  │       loadMathJax() lazily loads MathJax 4 CDN script once, caches promise
  │       window.MathJax.tex2svgPromise() → SVGElement
  │       tagSide ('left' | 'right') passed as render option
  │
  └─ 4. applyDimensions               (features/sizing/svgDimensions.ts)
          Rewrite width / height / viewBox per user settings
          (auto | fixed px | DPI-scaled resolution)
  │
  ▼
<SvgPreview>  (components/Preview/SvgPreview.tsx)
  dangerouslySetInnerHTML — SVG is locally generated, not user-supplied HTML
  Pure inline SVG in the DOM; no <canvas>, no <img src="data:…">

Export paths (Toolbar):
  ├── svgCleaner.ts     → Strip MathJax IDs, migrate xlink:href→href,
  │                       inline <use> refs, allow nested SVG overflow
  ├── svgExporter.ts    → Blob + <a download> → .svg file
  └── clipboardExport.ts → navigator.clipboard.writeText()

TeX input persistence:
  useLocalStorage('tex2svg-input') — TeX source survives page reload independently
  of settings (which use Zustand persist under 'tex2svg-settings')
```

---

## Theme System

Theme is stored in `AppSettings.theme` (`'light' | 'dark' | 'system'`). `App.tsx` applies it by setting `data-theme` on `<html>`:

- `'system'` — removes the attribute; CSS `prefers-color-scheme` media query takes over
- `'light'` / `'dark'` — sets `data-theme="light"` or `data-theme="dark"` explicitly

---

## SVG Post-Processing (Export)

`svgCleaner.ts` is applied at export time (not during live preview render) and performs:

1. **Strip MathJax internal IDs** — removes `MJX-*` attributes
2. **Migrate `xlink:href` → `href`** — fixes Hancom (한글) SVG renderer incompatibility
3. **Inline `<use>` references** — resolves cross-SVG-boundary `<use>` elements for renderers that don't support them
4. **Allow nested SVG overflow** — sets `overflow: visible` on nested `<svg>` elements to prevent clipping in Inkscape

---

## Pure SVG Guarantee

MathJax 4's SVG output mode renders all math as `<path>` elements — no rasterization, no canvas, no HTML embedding. The configuration in `mathjaxLoader.ts` enforces this:

```ts
tex: {
  packages: { '[+]': ['ams'], '[-]': ['texhtml'] }, // texhtml explicitly excluded
},
svg: {
  fontCache: 'local', // all <defs> are self-contained per SVG
},
```

- `'[-]': ['texhtml']` — prevents the v4 HTML-in-TeX feature from injecting `<foreignObject>` elements
- `fontCache: 'local'` — each exported SVG is fully self-contained (no cross-document `<use>` references)

The resulting SVG opens correctly in Inkscape, vector editors, LaTeX `\includegraphics`, and any standards-compliant SVG renderer.

---

## Settings Persistence

User settings (dimension mode, size, DPI, font size, tag side, wrap environment, theme, export filename) are stored in `localStorage` under the key `tex2svg-settings` via Zustand's `persist` middleware.

TeX editor input is stored separately under `tex2svg-input` via `useLocalStorage`.

Both survive page reloads and browser restarts.

---

## Architectural Rules

1. **`features/` owns all MathJax coupling** — no component imports MathJax directly. Swapping the renderer only touches `features/renderer/`.
2. **`lib/` is framework-free** — only `lib/hooks/` contains React; all other `lib/` files are pure functions testable in Node without a DOM.
3. **SVG is always inline** — never `<canvas>` or `<img src="data:…">`. This preserves the SVG as a scalable, copy-pasteable, accessible XML tree.
4. **Equation numbering mutates TeX source** (pre-render via `\tag{}`), not the SVG output. This keeps numbering deterministic and renderer-independent.
5. **Path aliases enforce boundaries** — `@components/*`, `@features/*`, `@lib/*` are defined in `tsconfig.app.json`. Cross-layer imports are explicit and auditable.
6. **SVG cleaning is export-only** — `svgCleaner.ts` runs at export/copy time, not during live preview, to keep the render loop fast.
