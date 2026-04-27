import Select from 'react-select';
import type { MultiValue } from 'react-select';
import type { SelectOption } from '../../../types';
import styles from './PerHeaderSelect.module.css';

type Props = {
  header: string;
  options: SelectOption[];
  selectedValues: string[];
  onChange: (header: string, values: string[]) => void;
};

export function PerHeaderSelect({ header, options, selectedValues, onChange }: Props) {
  const inputId = `col-filter-${header.replace(/\s+/g, '-').toLowerCase()}`;
  const value = options.filter((o) => selectedValues.includes(o.value));

  function handleChange(chosen: MultiValue<SelectOption>) {
    onChange(header, chosen.map((c) => c.value));
  }

  return (
    <div className={styles.wrapper}>
      <label htmlFor={inputId} className={styles.label}>
        {header}
      </label>
      <Select<SelectOption, true>
        inputId={inputId}
        isMulti
        options={options}
        value={value}
        onChange={handleChange}
        placeholder={`Select values for ${header}…`}
        aria-label={`Filter values for column ${header}`}
        classNamePrefix="rs"
      />
    </div>
  );
}
