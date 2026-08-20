import themesIndex from './themes.index.json';

/* The dropdown's palette dots need each theme's four accents as literal colors —
   an inline style per dot, because no box-shadow can read a background.
   themes.index.json carries no swatch field; only the generated theme-select.js
   does, baked in at build time. Hand-copying that array would go stale the
   moment a theme is added, so read the accents out of the vendored theme.css
   instead: it writes `[data-theme="<id>"]` as an UNQUALIFIED attribute selector,
   so the rules apply to any element carrying the attribute, not just <html>.
   One off-screen probe answers for every theme.

   Order matters — pink, green, blue, purple, matching the .tc-lamps beside the
   trigger and the t-h1..t-h4 type scale. */
const ACCENTS = ['--accent-pink', '--accent-green', '--accent-blue', '--accent-purple'];

function probe(): Record<string, string> {
  const el = document.createElement('div');
  el.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden;pointer-events:none';
  document.body.appendChild(el);

  const out: Record<string, string> = {};
  const read = (id: string) => {
    el.setAttribute('data-theme', id);
    const cs = getComputedStyle(el);
    return ACCENTS.map((t) => cs.getPropertyValue(t).trim()).join(',');
  };

  for (const t of themesIndex.themes) out[t.id] = read(t.id);
  // "Auto" renders the default theme, which is dark unless the OS asks for light.
  out[''] = read(themesIndex.default.dark);

  el.remove();
  return out;
}

let cache: Record<string, string> | null = null;

/** The four accents of a theme as a comma-separated list, for data-dropdown-swatch. */
export function themeSwatch(id: string): string {
  if (!cache) cache = probe();
  return cache[id] ?? '';
}
