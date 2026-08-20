import { useMemo } from 'react';
import { getUniqueValues } from '../../utils/uniqueValues';
import type { DataRow, FilterState } from '../../types';
import { MultiSelectField } from '../MultiSelectField/MultiSelectField';
import styles from './ColumnFilters.module.css';

type Props = {
  selectedHeaders: string[];
  rows: DataRow[];
  filterState: FilterState;
  onFilterChange: (header: string, values: string[]) => void;
};

export function ColumnFilters({
  selectedHeaders,
  rows,
  filterState,
  onFilterChange,
}: Props) {
  /* One pass over the scoped rows per selected header, memoized together: this
     used to run inline in the render loop, re-scanning every row for every
     visible column on each keystroke. "Select all" makes that path much hotter,
     since picking it re-renders with a chip per distinct value. */
  const optionsByHeader = useMemo(() => {
    const map: Record<string, ReturnType<typeof getUniqueValues>> = {};
    for (const header of selectedHeaders) map[header] = getUniqueValues(rows, header);
    return map;
  }, [selectedHeaders, rows]);

  if (selectedHeaders.length === 0) return null;

  return (
    <fieldset className={`group ${styles.fieldset}`}>
      <legend className={`t-h4 ${styles.legend}`}>Column Filters</legend>
      <div className={styles.grid}>
        {selectedHeaders.map((header, i) => (
          <MultiSelectField
            key={header}
            /* Index-suffixed: headers are unique per tab but the union across
               tabs can contain two that slugify identically ("Sub Genre" and
               "sub genre"), which would break the label's for= association. */
            inputId={`col-filter-${i}-${header.replace(/\s+/g, '-').toLowerCase()}`}
            label={header}
            sublabel
            ariaLabel={`Filter values for column ${header}`}
            options={optionsByHeader[header] ?? []}
            selectedValues={filterState[header] ?? []}
            placeholder={`Select values for ${header}…`}
            onChange={(values) => onFilterChange(header, values)}
          />
        ))}
      </div>
    </fieldset>
  );
}
