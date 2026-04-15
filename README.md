# Tex2SVG

A TeX-to-SVG renderer webapp for academic use (journals, proceedings, presentations).

## Why this exists

Existing TeX-to-SVG tools don't cover all the needs:

- Most output HTML/CSS-dependent SVG that breaks in Inkscape or LaTeX pipelines
- Few support custom output dimensions or DPI-based resolution scaling
- Equation numbering and `align` environments are often missing or inconsistent

Tex2SVG is built specifically for **pure SVG output** — every exported file opens correctly in any standards-compliant SVG renderer, with no browser dependency.

## Features

- **Pure SVG output** — paths only, no `<foreignObject>`, no HTML, no canvas
- **Size control** — auto, fixed (px), or resolution (DPI) mode
- **Equation tag side** — place equation tags on the left or right
- **`align` / `equation` / `gather` environments** — full AMS support via MathJax 4
- **Configurable wrap environment** — auto-wrap bare TeX in `equation*`, `align*`, or none
- **Copy to clipboard** or **download as `.svg`**
- **Theme** — light, dark, or system default
- **Persistent settings** — all settings and TeX input saved in `localStorage`
- **TeX Tips** — collapsible snippet panel with one-click Insert
- **Supported editors** — verified compatible with Inkscape and Hancom (한글)

## Usage

### Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Writing TeX

Enter any TeX expression in the editor panel. Press **Ctrl+Enter** (or **Cmd+Enter** on Mac) to render.

Examples:

```tex
E = mc^2
```

```tex
\begin{align}
  \nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0} \\
  \nabla \times \mathbf{B} &= \mu_0 \mathbf{J} + \mu_0\varepsilon_0 \frac{\partial \mathbf{E}}{\partial t}
\end{align}
```

```tex
\begin{equation}
  \int_0^\infty e^{-x^2}\,dx = \frac{\sqrt{\pi}}{2}
\end{equation}
```

### Settings

Click **▼ Settings** in the sidebar to configure:

| Setting | Options |
| --- | --- |
| Size mode | Auto (MathJax native), Fixed (px), Resolution (DPI) |
| Width / Height | Target dimensions in pixels (Fixed mode) |
| DPI | Scale factor relative to 96 dpi baseline (Resolution mode) |
| Font size | Base font size in px |
| Tag side | Right / Left — which side equation tags appear on |
| Wrap environment | `equation*` / `align*` / None — auto-wrap for bare TeX input |
| Theme | Light / Dark / System |
| Export filename | Base name for downloaded `.svg` files |

### Exporting

- **Copy SVG** — copies the cleaned SVG string to clipboard
- **Download .svg** — saves a self-contained `.svg` file using the configured filename

Exported SVG is post-processed for compatibility: MathJax internal IDs are stripped, `xlink:href` attributes are migrated to `href`, and nested SVG overflow is corrected for Inkscape and Hancom.

## Building for production

```bash
npm run build
```

Output is written to `dist/`. The build uses relative asset paths (`base: './'`) so it can be served from any subdirectory — including university web servers.

## Deploying

### Docker (recommended for self-hosting)

```bash
docker build -t tex2svg .
docker run -p 8080:80 tex2svg
```

Open `http://localhost:8080`.

For Portainer (Git stack), point to this repository with `docker-compose.yml` as the compose path.

### Static hosting (GitHub Pages, Netlify, Vercel)

```bash
npm run build
# deploy the dist/ directory
```

### Self-hosted (nginx example)

```nginx
server {
    listen 80;
    server_name your-domain.example;
    root /var/www/tex2svg/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Copy the `dist/` directory to `/var/www/tex2svg/dist` after running `npm run build`.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full directory structure, data flow, and design decisions.
