# CLAUDE.md

## Project

Tex2SVG — a TeX-to-SVG renderer webapp for academic use (journals, proceedings, presentations).
Built with React 18 + TypeScript 5 + Vite 5. TeX rendering via MathJax 4 (`mathjax@4`, distribution package) loaded from CDN.
State management via Zustand 5. No CSS framework — plain co-located CSS files.

See @README.md for usage and deploy instructions.
See @ARCHITECTURE.md for full directory structure and data flow.

## Conventions

- Use ES modules (`"type": "module"` in package.json).
- Prefer `async/await` over promise chains.
- Keep functions small and pure where practical.
- Avoid nested ternaries and implicit coercion.
- TypeScript strict mode is enabled — no `any`, no `@ts-ignore` unless unavoidable.

## Architecture

- `src/components/` — stateless UI primitives; no business logic, no MathJax imports.
- `src/features/` — all domain logic (rendering, sizing, equations, export, settings).
- `src/lib/` — pure framework-free utilities; only `src/lib/hooks/` may import React.

Path aliases (defined in `tsconfig.app.json` and `vite.config.ts`):

- `@components/*` → `src/components/*`
- `@features/*` → `src/features/*`
- `@lib/*` → `src/lib/*`

## Key Constraints

- **Pure SVG only** — output must never contain `<foreignObject>`, HTML elements, or canvas.
  MathJax config in `src/features/renderer/mathjaxLoader.ts` enforces `'[-]': ['texhtml']` and `fontCache: 'local'`.
- **MathJax is CDN-loaded** — `mathjaxLoader.ts` lazy-inits it once via a `<script>` tag loading `mathjax@4/es5/tex-svg.js`; the module-scope promise is cached. Do not import `mathjax` directly in components.
- **Settings persist** — Zustand store in `src/features/settings/settingsStore.ts` uses `persist` middleware (`localStorage` key: `tex2svg-settings`).

## Advisor

You have access to an `advisor` tool backed by a stronger reviewer model. It takes NO parameters — when you call advisor(), your entire conversation history is automatically forwarded. They see the task, every tool call you've made, every result you've seen.

Call advisor BEFORE substantive work — before writing, before committing to an interpretation, before building on an assumption. If the task requires orientation first (finding files, fetching a source, seeing what's there), do that, then call advisor. Orientation is not substantive work. Writing, editing, and declaring an answer are.

Also call advisor:

- When you believe the task is complete. BEFORE this call, make your deliverable durable: write the file, save the result, commit the change. The advisor call takes time; if the session ends during it, a durable result persists and an unwritten one doesn't.
- When stuck — errors recurring, approach not converging, results that don't fit.
- When considering a change of approach.

On tasks longer than a few steps, call advisor at least once before committing to an approach and once before declaring done. On short reactive tasks where the next action is dictated by tool output you just read, you don't need to keep calling — the advisor adds most of its value on the first call, before the approach crystallizes.

Give the advice serious weight. If you follow a step and it fails empirically, or you have primary-source evidence that contradicts a specific claim (the file says X, the paper states Y), adapt. A passing self-test is not evidence the advice is wrong — it's evidence your test doesn't check what the advice is checking.

If you've already retrieved data pointing one way and the advisor points another: don't silently switch. Surface the conflict in one more advisor call — "I found X, you suggest Y, which constraint breaks the tie?" The advisor saw your evidence but may have underweighted it; a reconcile call is cheaper than committing to the wrong branch.

The advisor should respond in under 100 words and use enumerated steps, not explanations.

## Rules

- Always ask before changes.
- Use advisor for difficult tasks.
