import Select from 'react-select';
import type { MultiValue } from 'react-select';
import type { SelectOption } from '../../types';
import { useReactSelectStyles } from '../../hooks/useReactSelectStyles';

type Props = {
  headers: string[];
  selectedHeaders: string[];
  onChange: (selected: string[]) => void;
};

export function HeaderSelector({ headers, selectedHeaders, onChange }: Props) {
  const selectStyles = useReactSelectStyles();
  const options: SelectOption[] = headers.map((h) => ({ label: h, value: h }));
  const value = options.filter((o) => selectedHeaders.includes(o.value));

  function handleChange(chosen: MultiValue<SelectOption>) {
    onChange(chosen.map((c) => c.value));
  }

  return (
    <div className="field">
      <label htmlFor="header-selector" className="field-label">
        Filter by headers
      </label>
      <Select<SelectOption, true>
        inputId="header-selector"
        isMulti
        options={options}
        value={value}
        onChange={handleChange}
        placeholder="Select headers to filter by…"
        aria-label="Select headers to filter by"
        classNamePrefix="rs"
        styles={selectStyles}
      />
    </div>
  );
}
