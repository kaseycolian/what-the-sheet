import { useEffect, useMemo, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import themesIndex from '../../theme/themes.index.json';
import { themeSwatch } from '../../theme/themeSwatches';
import styles from './ThemeSelector.module.css';

type ThemeEntry = {
  id: string;
  name: string;
  group: string;
  description: string;
  label: string;
};

/* Rows are grouped by theme name (the family), so the name isn't repeated on every
   line — each option shows only its group + description, e.g. "Dark · No Background". */
function rowLabel({ group, description }: ThemeEntry) {
  return [group, description].filter(Boolean).join(' · ');
}

export function ThemeSelector() {
  const { themeId, setThemeId, motionOff, setMotionOff } = useTheme();
  const selectRef = useRef<HTMLSelectElement>(null);
  const dropdownRef = useRef<ThemeServiceDropdown | null>(null);

  const families = useMemo(() => {
    const byName = new Map<string, ThemeEntry[]>();
    for (const t of themesIndex.themes as ThemeEntry[]) {
      const list = byName.get(t.name);
      if (list) list.push(t);
      else byName.set(t.name, [t]);
    }
    return [...byName];
  }, []);

  /* Upgrade the native <select> to the accessible listbox from public/dropdown.js —
     the a11y-component-examples `dropdown` pattern, ported into the theme service.
     Real DOM focus rather than aria-activedescendant, and a position:fixed panel in
     the top layer, so the header's backdrop-filter can neither clip nor re-anchor it.

     If the script never loads, the native <select> stays and site-header.css styles
     that fallback, caret included. createDropdown is idempotent and destroy() puts
     the <select> back where its wrapper was, so StrictMode's double-invoke is safe. */
  useEffect(() => {
    const select = selectRef.current;
    if (!select) return;
    const dd = window.ThemeService?.createDropdown?.(select) ?? null;
    dropdownRef.current = dd;
    return () => {
      dd?.destroy();
      dropdownRef.current = null;
    };
  }, []);

  /* The dropdown re-reads the <select> on its own `change`, but not when React sets
     the value from anywhere else — sync the trigger label for that case. */
  useEffect(() => {
    dropdownRef.current?.sync();
  }, [themeId]);

  return (
    /* One cluster, so the preference and the theme control read as a pair against
       the wordmark — and so they wrap to a second row together rather than
       separately. */
    <div className="hdr-controls">
      <label className={`switch motion ${styles.motion}`}>
        <input
          type="checkbox"
          checked={motionOff}
          onChange={(e) => setMotionOff(e.target.checked)}
        />
        <span className="track">
          <span className="thumb" />
        </span>
        Reduce motion
      </label>

      {/* A <div>, not a <label>: once dropdown.js enhances this the real control is
          a <button>, which a wrapping label would neither name nor focus. .tc-cap is
          the accessible name via aria-labelledby, which is why site-header.css clips
          it rather than hiding it below 620px — a name pointing at a display:none
          element resolves to nothing. */}
      <div className="theme-console">
        <span className="tc-cap" id="tc-cap">
          Theme
        </span>
        {/* Live palette readout, painted from --accent-* in CSS, so a theme change
            re-colors them with no JS at all. */}
        <span className="tc-lamps" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <select
          ref={selectRef}
          data-theme-select
          data-dropdown
          data-dropdown-anchor=".theme-console"
          data-dropdown-swatch-style="dots"
          aria-labelledby="tc-cap"
          value={themeId}
          onChange={(e) => setThemeId(e.target.value)}
        >
          <option value="" data-dropdown-swatch={themeSwatch('')}>
            Auto (Rink Classic)
          </option>
          {families.map(([name, entries]) => (
            <optgroup key={name} label={name}>
              {entries.map((t) => (
                <option
                  key={t.id}
                  value={t.id}
                  data-dropdown-swatch={themeSwatch(t.id)}
                  data-dropdown-secondary={t.id}
                  data-dropdown-full-label={t.label}
                >
                  {rowLabel(t)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
}
