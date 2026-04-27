import { getUniqueValues } from '../../utils/uniqueValues';
import type { FilterState } from '../../types';
import { PerHeaderSelect } from './PerHeaderSelect/PerHeaderSelect';
import styles from './ColumnFilters.module.css';

type Props = {
  selectedHeaders: string[];
  rows: Record<string, string>[];
  filterState: FilterState;
  onFilterChange: (header: string, values: string[]) => void;
};

export function ColumnFilters({
  selectedHeaders,
  rows,
  filterState,
  onFilterChange,
}: Props) {
  if (selectedHeaders.length === 0) return null;

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Column Filters</legend>
      <div className={styles.grid}>
        {selectedHeaders.map((header) => (
          <PerHeaderSelect
            key={header}
            header={header}
            options={getUniqueValues(rows, header)}
            selectedValues={filterState[header] ?? []}
            onChange={onFilterChange}
          />
        ))}
      </div>
    </fieldset>
  );
}
