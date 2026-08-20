import type { StylesConfig } from 'react-select';
import type { SelectOption } from '../types';

/* react-select is styled with inline style objects, so it can't use the
   components.css classes directly — instead it reads the same theme-service tokens
   those classes do, mirroring .input for the control and .drop-panel for the menu.
   Because the values are var() references, every theme re-skins these selects with
   no per-theme branching. */
const selectStyles: StylesConfig<SelectOption, true> = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    backgroundColor: 'color-mix(in srgb, var(--accent-purple) 8%, var(--bg-panel))',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: state.isFocused ? 'var(--accent-blue)' : 'var(--accent-purple)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: state.isFocused
      ? '0 0 0 3px color-mix(in srgb, var(--focus-ring) 45%, transparent)'
      : 'none',
    '&:hover': { borderColor: 'var(--accent-blue)' },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
  }),
  menuList: (base) => ({ ...base, padding: 0 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'color-mix(in srgb, var(--accent-pink) 26%, var(--bg-elevated))'
      : state.isFocused
        ? 'color-mix(in srgb, var(--accent-pink) 14%, var(--bg-elevated))'
        : 'transparent',
    /* Text stays --text on every state, matching the .drop-row pattern in
       components.css: only the background carries the accent, so the tint can
       never eat into the label's contrast. Selection also gets extra weight so
       it isn't signalled by color alone. */
    color: 'var(--text)',
    fontWeight: state.isSelected ? 600 : 400,
    cursor: 'pointer',
    ':active': {
      backgroundColor: 'color-mix(in srgb, var(--accent-pink) 34%, var(--bg-elevated))',
    },
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'color-mix(in srgb, var(--accent-pink) 20%, var(--bg-panel))',
    borderRadius: 'var(--radius-sm)',
  }),
  multiValueLabel: (base) => ({ ...base, color: 'var(--text)', fontWeight: 600 }),
  multiValueRemove: (base) => ({
    ...base,
    color: 'var(--text)',
    ':hover': {
      backgroundColor: 'color-mix(in srgb, var(--accent-pink) 38%, var(--bg-panel))',
      color: 'var(--text)',
    },
  }),
  placeholder: (base) => ({ ...base, color: 'var(--text-muted)' }),
  singleValue: (base) => ({ ...base, color: 'var(--text)' }),
  input: (base) => ({ ...base, color: 'var(--text)' }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'var(--text-muted)',
    ':hover': { color: 'var(--accent-blue)' },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: 'var(--text-muted)',
    ':hover': { color: 'var(--accent-blue)' },
  }),
  indicatorSeparator: (base) => ({ ...base, backgroundColor: 'var(--border)' }),
  noOptionsMessage: (base) => ({ ...base, color: 'var(--text-muted)' }),
};

export function useReactSelectStyles(): StylesConfig<SelectOption, true> {
  return selectStyles;
}
