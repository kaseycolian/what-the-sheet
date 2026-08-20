import Select from 'react-select';
import type { MultiValue } from 'react-select';
import type { SelectOption } from '../../types';
import { useReactSelectStyles } from '../../hooks/useReactSelectStyles';

type Props = {
  headers: string[];
  selectedReturnColumns: string[];
  onChange: (cols: string[]) => void;
};

export function ReturnColumnsSelector({
  headers,
  selectedReturnColumns,
  onChange,
}: Props) {
  const selectStyles = useReactSelectStyles();
  const options: SelectOption[] = headers.map((h) => ({ label: h, value: h }));
  const value = options.filter((o) => selectedReturnColumns.includes(o.value));

  function handleChange(chosen: MultiValue<SelectOption>) {
    onChange(chosen.map((c) => c.value));
  }

  return (
    <div className="field">
      <label htmlFor="return-cols" className="field-label">
        Columns to display in results
      </label>
      <Select<SelectOption, true>
        inputId="return-cols"
        isMulti
        options={options}
        value={value}
        onChange={handleChange}
        placeholder="Select columns to display…"
        aria-label="Select columns to display in results"
        classNamePrefix="rs"
        styles={selectStyles}
      />
    </div>
  );
}
