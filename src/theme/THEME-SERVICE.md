# Theme Service

This app's theming comes from the shared **theme-service** — currently on version `1.2.0`.
The files in this folder are vendored copies of the source of truth; do not hand-edit generated
token files, and do not hardcode colors — consume the theme tokens (`var(--…)`).

## For agents working in this repo
This repo **already uses the theme-service** (see History below). Use the **theme-service skill**
(or its `AGENTS.md`) for any theme work here — don't improvise, and don't re-apply from scratch.
- Update to latest:  "Update this repo to the latest theme-service version."
- Add/change themes:  see the theme-service repo's `CREATING-THEMES.md`.
Rules: keep WCAG AA 2.2 · default theme is Rink Classic · the selector uses the **external**
`theme-init.js` / `theme-select.js` (never inline scripts — MV3/strict CSP blocks them).

## Applied configuration (current decisions on record)
- Component styling: `full-restyle`
- Fonts: `kept app fonts` — `--font-ui` / `--font-mono` are overridden in `src/index.css` to the
  app's system-ui stack, so the components.css classes render in the app's own typeface
- Background effect: `page background` — `.fx-grid` on: `<body>` (`index.html`)
- Selector: `theme-service selector` — placement: app header, right of the title block
  (`src/components/ThemeSelector/ThemeSelector.tsx`), plus a "Reduce motion" `.switch`
- Default theme: **Acid Arcade, not the service's Rink Classic** — a deliberate deviation from the
  rule above. `theme.css` is generated and not hand-edited, so the override lives in
  `src/theme/theme.local.css`, loaded straight after it. Three things to know:
  - It is scoped `:root:not([data-theme])`, never a bare `:root`. A bare `:root` is (0,1,0), the
    same as every `[data-theme="…"]` block, and would win on source order — repainting all 16
    themes as Acid Arcade. Scoped, it simply stops matching once a theme is stamped.
  - The tokens are copied verbatim from the service's own `acid-arcade-dark` / `acid-arcade-light`
    blocks, so nothing here invents a color or needs re-validating. Re-copy them if `theme.css`
    is regenerated.
  - `themes.index.json` still names Rink Classic as `default`; it is generated too. The one place
    that read it — the Auto option's swatch — now asks for `acid-arcade-dark` by id in
    `ThemeSelector.tsx`, and the option reads "Auto (Acid Arcade)".
- Existing themes: `removed` — the app's own `neon` / `classic` token blocks and the `wts-theme`
  localStorage key are gone (the provider clears the stale key on mount)

### Vendored files
`theme.css`, `effects.css`, `components.css`, `themes.index.json` in this folder;
`theme-init.js` in `public/` (Vite serves it at the deploy base path).
Imported in load order from `src/main.tsx`: theme → effects → components → `src/index.css`.

### Deliberate omissions
- **`theme-select.js`** — `src/contexts/ThemeContext.tsx` is the React equivalent. It uses the same
  `theme` / `motion` localStorage keys as `theme-init.js`, so the pre-paint bootstrap still applies.

### Now adopted (was omitted on the first apply)
- **`dropdown.css` / `dropdown.js`** — vendored on 2026-08-19 for the header's theme console; see
  `A11Y-WAY-PAGES.md`. The theme picker is now that accessible listbox, enhanced from a `useEffect`.
  It is safe here because the console's children and the option list are static JSX, so React never
  re-inserts the `<select>` the script reparents. The **data** multi-selects are still `react-select`
  with the token-driven config in `src/hooks/useReactSelectStyles.ts` — that stays.

### App-specific styling not covered by components.css
- **Results tables** — `components.css` has no table class, so `ResultTable` keeps its own markup
  and is repainted on tokens (row tints via `color-mix`).
- **CSV drop zone** — no dashed drop-zone class exists; `FileUpload` keeps its own zone, repainted
  on `--accent-purple` / `--accent-blue` / `--accent-pink` for rest / hover / dragging.
- **Header** — since 2026-08-19 the header is the shared site rail, not app CSS. See
  `A11Y-WAY-PAGES.md`.

## History
<!-- Append one entry per apply/update. Most recent last. Never edit past entries. -->
- `2026-08-19` — Applied theme-service `v1.2.0` (first apply). Replaced the app's hand-rolled
  two-theme system (`neon` / `classic`, ~45 bespoke tokens) with all 16 theme-service themes;
  full restyle onto the components.css classes, app fonts kept, `.fx-grid` on `<body>` only,
  2-button selector replaced with a family-grouped `<select>` + reduce-motion switch, and
  `useReactSelectStyles` collapsed from two hardcoded palettes to one token-driven config.
- `2026-08-19` — No theme changes. Recorded here because the theme picker moved: `dropdown.css` /
  `dropdown.js` are now vendored (reversing this file's original omission) and the header adopted
  the shared site rail. Details in `A11Y-WAY-PAGES.md`.
