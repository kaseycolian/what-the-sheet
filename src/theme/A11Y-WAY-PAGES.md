# A11Y Way pages

This app's header and footer furniture comes from the shared **a11y-way-pages** assets in the
theme-service repo — currently on version `1.3.0`. (The source moved to
`a11y-way-pages/assets/` in that release; `assets/` at the repo root is now empty.) `site-header.css` and `dropdown.css` in this folder and
`public/dropdown.js` are vendored copies of the source of truth: **do not hand-edit them.** Every
adaptation this app needs lives in `site-header.local.css`, which is what keeps the next update a
clean overwrite.

This furniture **consumes** theme tokens and never defines them. Anything about colors, palettes or
themes belongs to the **theme-service skill** — see `THEME-SERVICE.md` beside this file.

## For agents working in this repo
This repo **already has the header furniture** (see History below). Use the **a11y-way-pages skill**
for any work on it — don't improvise, and don't re-apply from scratch.
- Update to latest:  "Update this repo's header/footer to the latest version."
- Rules: WCAG 2.2 AA is the floor in **every** theme · no invented colors, only tokens · no inline
  scripts (`dropdown.js` is external for MV3/strict-CSP) · never edit the vendored files.

## Applied configuration (current decisions on record)
- Scope: **header and footer.**
- Brand: **mark and favicon both filled.** One drawing, shipped two ways, because the two contexts
  need opposite things:
  - **Header** — `src/components/BrandMark/BrandMark.tsx`, inline SVG in the DOM. Inline is the only
    form that re-themes: an `<img>` is an isolated document the page's CSS never reaches, so its
    `var()` references resolve to the hex fallbacks and the mark freezes on the default palette
    while the rest of the header follows the theme selector.
  - **Favicon** — `src/assets/mark-sheet-funnel-soft-rim.svg`, linked from `index.html` by a
    *relative* path so Vite treats it as a build input and emits it with a content hash under the
    Pages base. A root-relative path would only work from `public/`. This copy keeps
    `var(--token, #fallback)` throughout, because standalone is exactly where the fallbacks render.
  - Keep the two in step when the drawing changes — they are the same geometry by hand, not one
    generated from the other.
- Brand mark size: **32px, not the vendored 26px.** `site-header.css` sizes its mark against a 17px
  wordmark; this app's `<h1>` carries `.t-h1` at 28px, which left 26px reading undersized. 32 also
  lands the drawing 1:1 on its own 32-unit viewBox. The 430px step is 28px rather than the vendored
  24px, because `.t-h1` sets the size on the element and so the wordmark does *not* step down there
  — the mark steps for room, not to stay on a ladder.
- Lockup: the full three-part reference shape — wordmark (`What the Sheet`) · separator dot ·
  descriptor (`Spreadsheet Row Finder`) — with the wordmark kept as a heading rather than a link
  because there is nowhere for a home link to go.
- Page nav: **none.** Single-page app.
- Rail: **sticky**, glass, with the `::after` lit tube.
- Skip link: **added** — the one new string on the page (`Skip to content`), targeting `#main`.
- Theme picker: the **theme console** (`.tc-cap` + `.tc-lamps` + the accessible listbox), replacing
  the app's `.field` + native `<select>`. Reduce-motion switch kept beside it as `.switch.motion`.
- Subtitle: the original sentence stays in `<main>` as the page lede. It cannot be the brand
  descriptor — measured at **585px** in `.brand-tag` type, it makes a 772px brand zone and forces the
  controls to a second row at every width below ~1400px — so the descriptor is the short
  `CSV Row Finder` (115px) and the sentence explains the app in the page. Its title casing is part
  of the words, so the override cancels the vendored `text-transform: uppercase` the `<=620px` block
  applies to `.brand-tag` — it reads the same at every width.
- Controls: the motion switch and the theme console are wrapped in one `.hdr-controls` cluster, so
  they read as a pair against the wordmark and wrap to a second row together.

### Vendored files
`site-header.css`, `site-footer.css`, `dropdown.css` (this folder) · `dropdown.js` (`public/`,
external script).
Imported from `src/main.tsx` **after** `components.css`, which both files deliberately override at
equal specificity. `theme-select.js` is **not** vendored: its own header says React apps should use
their provider instead, and it is `DOMContentLoaded`-gated so it would find no `<select>` in an SPA.
`src/contexts/ThemeContext.tsx` does that job.

## Deliberate deviations
- **`site-header.local.css` — the three-zone rail.** The reference header has four zones; this one
  has three (no page nav). The vendored `≤1080px` block lays `.hdr-inner` out as a two-column grid
  to pair four zones two per row, which with three children strands the console beside an empty
  cell. The override restores a wrapping flex rail, moves `margin-right: auto` from `.pagenav` to
  `.brand`, and cancels the console's `width: 100%`.
- **`h1.t-h1.brand-title`** — the wordmark is a real heading here. `.brand-name` stays a wrapping
  `<div>` so it keeps owning the flex row (and the `<=620px` stack), and the `<h1>` sits inside it as
  `.brand-title`, which keeps the page heading's accessible name exactly "What the Sheet" instead of
  absorbing the descriptor. It also carries **`.t-h1`** by request, so the wordmark takes the type
  scale's voice (28px, italic, `--accent-pink`, glow) rather than the reference rail's 17px. Three
  consequences, all handled in the override:
  - The override may reset only the UA `margin`. An `h1.brand-title { font-size }` rule is (0,1,1)
    and would beat `.t-h1`'s (0,1,0), silently pinning the wordmark back to the inherited 17px.
  - The rail is taller and wraps to two rows from **956px** (default face) / **1020px** (Verdana),
    against 836/888 with the small wordmark.
  - At the narrow end the 28px wordmark is wider than a 320px viewport on Verdana. It is allowed to
    **wrap** (`white-space: normal`), which is what SC 1.4.10 asks for instead of horizontal scroll —
    and that needs `.brand` to be shrinkable too, because the vendored `<=620px` block sets
    `flex: none`, which keeps the lockup at max-content so the text never gets a narrower box to
    wrap into. Allowing the wrap without that does nothing.
- **Rail inner measures from the app's content column**, not the vendored `1600px` + `clamp()`
  gutters: `--wts-content` / `--wts-gutter` are shared with `<main>`, so the wordmark's left edge and
  the console's right edge land exactly on the panel edges below. Only the inner is constrained — the
  rail itself stays full-bleed, so the glass and the lit tube still span the viewport.
- **Three zones, not four → the vendored responsive blocks are re-cut.** The `<=1080px` two-column
  grid is replaced with a wrapping flex rail (a grid track cannot wrap, and it overflowed from 621px
  up), and the `<=620px` block's `order` values are reset to `0`. That last one is not cosmetic: the
  block gives `.brand { order: 1 }` to slot a generated break between its four zones, and the new
  cluster's default `order: 0` sorted it **ahead** of the wordmark — the controls rendered above the
  identity while tab order stayed in DOM order (SC 2.4.3).
- **The console's shed order is inverted from the vendored file.** `site-header.css` clips `.tc-cap`
  at 620px and keeps the lamps; here the lamps go first (620px, `display: none` — they are
  `aria-hidden` decoration) and the cap second (520px, **clipped, not hidden**, since it is the
  control's accessible name). The panel rows' `.dropdown-swatch` dots are never touched.
- **Console border contrast (SC 1.4.11).** The vendored border,
  `color-mix(in srgb, var(--accent-purple) 50%, var(--border))`, measures **2.84:1** against the
  rail glass and **2.47:1** against the console's own fill on the light themes — under the 3:1 a
  control's boundary needs. Raised to **75%** in the override (worst case 4.42:1 / 3.59:1), which
  stays entirely in tokens and leaves hover, at full `--accent-purple`, a visible step up.
  **This is an upstream characteristic of `site-header.css`, not something this app introduced** —
  worth fixing in the theme-service repo, which this skill must not edit.

## History
<!-- Append one entry per apply/update. Most recent last. Never edit past entries. -->
- `2026-08-19` — Applied a11y-way-pages `v1.2.0` (first apply, Path C — existing furniture).
  Restyled the app's header to the sticky glass rail, added the skip link, moved the subtitle into
  `<main>`, and replaced the native theme `<select>` with the theme console's accessible listbox
  (`dropdown.js`, enhanced from a `useEffect`). Verified in Chromium: full ARIA + keyboard contract,
  the 320–2560px ladder on both `--font-ui` and the Verdana fallback, all 16 themes, forced colors,
  reduce-motion, and 560 contrast pairs at AA.
- `2026-08-19` — Header layout pass. Aligned the rail's inner to the page's content column via
  shared `--wts-content` / `--wts-gutter` tokens; grouped the motion switch and theme console into
  one `.hdr-controls` cluster; replaced the vendored `<=1080px` grid with a wrapping flex rail and
  fixed the `order` bug that put the controls above the wordmark; re-cut the console's shed order to
  lamps-then-cap. Also restored the brand descriptor (`CSV Row Finder`) after the separator dot and
  set the page lede at `1.0625rem`/1.6 in `--text`. Re-derived `--wts-rail-h` against both faces
  (wrap boundary 836px default / 888px Verdana; tallest rail 111px). Verified: alignment at four
  desktop widths, the shed ladder across 320-1440px, 26 a11y assertions, the end-to-end flow, and
  560 contrast pairs at AA.
  **Known limitation:** below ~440px the closed trigger ellipsizes long theme names, and applying
  the SC 1.4.12 text-spacing overrides can trigger it a little sooner. The full name stays available
  in the trigger's accessible name and on the selected row of the open listbox. Keeping the motion
  label visible at every width (a product decision) is what spends the room.
- `2026-08-19` — Typography pass. Every text element now carries a theme-service type class, audited
  in the browser: `.t-h1` on the wordmark, `.t-h4` on the page lede (which also dropped its
  `max-width`, and no longer restates font-size or color so the class actually controls them),
  `.t-h4` on table header cells and `.t-body` on body cells (their module CSS dropped the competing
  `color` / `font-weight`). Re-derived `--wts-rail-h` for the third time — the larger wordmark moved
  the wrap boundary to 956/1020px and the wrapping wordmark raised the tallest rail to 145px, so the
  band is now `<=1120px` at `+120`. Verified: the rail-height token covers the rail at every width
  on both faces, the shed ladder, 26 a11y assertions, the end-to-end flow, and contrast on the new
  type pairs (the `t-h1` wordmark checked at the 3:1 large-text threshold, `t-h4` at 4.5:1).
- `2026-08-19` — Header vertical rhythm. The two-row rail carried too much air between its rows: the
  `.t-h1` wordmark inherited the page's 1.5 line-height, which on a 28px font is a 42px box around
  37px of glyphs with no descenders to fill it. Set `.brand-name` to the 1.15 components.css uses for
  headings, cut `row-gap` from 10px to 4px, and tapered the block gutter to
  `clamp(10px, 1.4vw, 22px)` — a **single continuous clamp, not a banded switch**: a media query
  there put a 16px step at the boundary, i.e. the rail growing taller as the viewport grew, which is
  the cliff the vendored file uses a clamp to avoid. Two-row rail 129px -> 98px, inter-row gap
  10px -> 4px, widest screens unchanged (both clamps still top out at 22px). `--wts-rail-h` re-cut
  into three bands matching the rail's three shapes; verified it covers the rail at every width on
  both faces, with no height step anywhere.
- `2026-08-19` — Added a "How it works" label above the intro sentence: an `<h2>` on `.t-h4` over
  the sentence on `.t-body`. The hierarchy is carried by case, weight and
  color rather than size, which is how the theme's own scale already separates a label from body
  text — so neither element restates font-size or color locally. The heading is written in sentence
  case and uppercased by CSS, because screen readers can spell out all-caps text and the accessible
  name should stay the natural words. Heading outline is h1 -> h2, no level skipped.
- `2026-08-19` — Added the footer, and re-synced the vendored set to `v1.3.0`. The footer carries one
  item: the `.ftr-src` source link to this repo. The reference footer's two zones (brand lede,
  cross-linked product index) are deliberately unused — this app is not part of a product family and
  its identity is already in the header, so restating it would only add a tab stop to nothing.
  `.ftr-inner` measures from the shared `--wts-content` / `--wts-gutter`, and the link is
  right-aligned so it ends on the same edge the theme console holds in the header; the vendored
  two-column grid at 1080px is collapsed to one, since with a single child it was ending the link
  against a 330px track instead of the content column. `.page` became a flex column so the slab
  settles at the bottom of a short page. The 1.3.0 re-sync was a no-op in behavior — the only diffs
  in `site-header.css` and `dropdown.css` were comments describing the repo's own layout. Verified:
  one `contentinfo`, keyboard-reachable link with a visible ring, 32px target height (SC 2.5.8),
  no unrequested new tab, right edge aligned with the console and the panels at 320-1600px, and
  336 contrast pairs at AA.
- `2026-08-20` — Accessibility pass across the whole app, against the `a11y-library` skill, plus a
  Playwright + axe harness (`npm run test:a11y`, `tests/a11y.spec.mjs`) that runs the checks from
  its `verify.md`. What it found and what changed:
  - **The chip remove control was mouse-only.** react-select ships it as `<div role="button">` with
    no `tabindex` and no key handler — its `removeProps` carry `onClick` / `onTouchEnd` /
    `onMouseDown` only — and the one keyboard route it does offer, Backspace, pops the *last* value.
    Removing a chosen chip was unreachable: **SC 2.1.1**. Replaced with a real `<button>` named by
    `aria-labelledby` pointing at a clipped "Remove" plus the chip's own `rs__multi-value__label`,
    so both halves of the name are text a translator can see. The group is a **roving tabindex**:
    one tab stop however many chips there are, arrows and Home/End move within, Enter/Space and
    Delete/Backspace remove. `stopPropagation` on every key it consumes, or react-select's own
    container handler opens the menu underneath. Focus after a removal is moved deliberately — left
    alone it falls to `<body>` and the next Tab restarts at the top of the page.
  - **Clear-all was invisible and unreachable.** react-select's `ClearIndicator` is a `<div>`
    carrying `aria-hidden="true"` and a mousedown handler. Now a real `<button>` with clipped text
    ("Clear all header filters"), named from a separate `itemsLabel` prop because several visible
    labels are phrased as instructions and "Clear all Filter by headers" is not a sentence.
  - **Two names on one control.** Every field had both a visible `<label>` and an `aria-label`,
    and the `aria-label` wins — so "Filter by headers" announced as "Select headers to filter by",
    a **SC 2.5.3** failure since the visible string was not contained in the name. The
    `ariaLabel` prop is gone; the visible label is the name.
  - **Three live regions that never announced.** `pitfalls.md`: a region only announces what
    changes *inside it while it is being observed*. FileUpload's `<p role="alert">` and
    ResultTable's `<p role="status">` were both mounted with their text already in place. Replaced
    with one always-present, empty `role="status"` container per component; a successful upload now
    announces "Loaded 2 files: …" (names included, because the same count twice running is one
    state and stays silent).
  - **The table's scroll wrapper was a silent tab stop.** Chromium hands one to any user-scrollable
    box with no role, no name and its own 1px hairline ring; Safari hands out none. Declared
    `tabindex="0" role="region" aria-labelledby` with a real ring, per `data-table.md`. The
    wrapping `<section>` gave up its `aria-labelledby` in exchange — two regions with the same name
    is `landmark-unique`, which axe caught.
  - **SC 2.4.11 across the page.** The rail is sticky and the browser's scroll-into-view aligns a
    focused element's *top* edge, so anything reached backwards lands under it. `ResultTable`'s
    heading already carried `scroll-margin-top`; it is now a zero-specificity `:where()` rule on
    everything focusable, off the existing `--wts-rail-h`.
  - **SC 2.5.8.** The chip remove was 22x22 and react-select's combobox input is 4px wide while
    empty (axe: `target-size`). Both now clear 24 in both dimensions.
  - **Motion.** react-select emits `transition: all 100ms` and `color 150ms` from emotion, which
    neither `prefers-reduced-motion` nor the in-page switch can reach. Both now read `var(--dur)`,
    which is `calc(var(--motion) * 0.15s)` and is zeroed by both routes.
  - **Forced colors.** The app's own CSS had no `@media (forced-colors: active)` block anywhere, so
    the drop zone's drag state, the disabled button's grey wash, the table hover, the dialog's
    elevation and every chip tint disappeared in Windows High Contrast. Each module now has one;
    react-select needs `!important` in a plain stylesheet, because emotion injects single-class
    rules at runtime and the tie is broken by injection order. See `THEME-SERVICE.md` for the
    matching gap in the vendored `components.css`.
  - **Get Report is soft-disabled.** `aria-disabled` plus `aria-describedby` naming what is
    missing, instead of `disabled` — which removes the button from the tab order and answers
    nothing. The measured grey wash is unchanged; it already targeted `[aria-disabled='true']`.
  - Also: the drop zone demoted from `role="region"` to `role="group"` (it sat inside a
    near-identically-named `<section>`), and the dead `id="csv-input"` removed.

  Verified by `npm run test:a11y` — 12 checks, all passing: axe over `wcag2a/aa`, `wcag21a/aa`,
  `wcag22aa` and `best-practice`; `color-contrast` in all 17 themes plus auto in both modes; no
  positive tabindex; every tab stop reachable and indicated (the ring is allowed to be drawn on an
  ancestor, which is how both react-select and the theme console do it); nothing left under the
  rail; every pointer target over 24x24; both reduced-motion routes; forced colors actually
  repainting; no sideways scroll at 320px; and the chip and clear-all keyboard paths end to end.
- `2026-08-20` — Enter now opens a focused combobox. react-select's key handler falls straight
  through for Enter while the menu is closed (`case 'Enter': if (menuIsOpen) {…} return;`), so it
  was a dead key: ArrowDown, ArrowUp and Space all opened the list and the key most people reach
  for first did nothing, which reads as broken. Handled through react-select's own `onKeyDown`
  prop, which it calls before its handler and then honours `defaultPrevented`. Guarded three ways
  — only while the menu is closed, only from the text input (the clear-all button does not stop
  Enter, and clearing should not also open the menu), and never mid-IME-composition, where Enter
  commits a candidate rather than being a press. Nothing was given up: the arrows and Space still
  open it, and Enter still selects the focused option once open. The APG's editable-combobox
  pattern only requires the arrows, so this is a superset of it. Asserted in `tests/a11y.spec.mjs`
  across all four open keys plus Escape, and for Enter still selecting when the menu is open.
- `2026-08-20` — Required fields marked. Each required field carries an asterisk on its label and
  `aria-required` on its combobox — both, because an asterisk alone is decoration nobody hears and
  `aria-required` alone is a state nobody sees. The asterisk is `aria-hidden` and takes no color of
  its own, inheriting `.field-label`'s validated `--accent-green` / `--accent-purple` so it clears
  AA in all 17 palettes without a measurement of its own. A one-line key above the fields explains
  the convention (SC 3.3.2): "Fields marked with * are required." The asterisk in that sentence is
  real text, unlike the aria-hidden ones on the labels — it is the character being defined, so it
  has to be readable there.

  Three details worth keeping:
  - **Not react-select's `required` prop.** It also mounts a hidden `<input required>` across the
    bottom of the control for native form validation. There is no `<form>` on this page for that to
    serve, and the element is a full-width, non-hidden input around 21px tall that the target-size
    sweep has every reason to report. A `components.Input` override adds the attribute and nothing
    else.
  - **The mark is on the Column Filters *group*, not on each column select.** Get Report needs a
    value in at least one filter, not in every one; an asterisk per select would state the opposite.
    There is no `aria-required` for a group, so the legend carries clipped text and the fieldset's
    name becomes "Column Filters (at least one value required)".
  - **Parenthesised, not comma-led.** accname inserts a separator between a node's children, so
    clipped text beginning ", at least" computed as "Column Filters **,** at least one value
    required" — an audible space before the comma, with no way to close it while the phrase is its
    own element. Caught by the suite, not by reading the markup.

  No per-field error messages: the Get Report button already carries one description naming
  everything still missing, and a second copy under each field would say the same thing three times.
