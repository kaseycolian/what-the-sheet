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
      {/* The mark goes on the group, never on the individual selects. Get Report
          needs a value in at LEAST ONE column filter, not in every one — an
          asterisk on each would say the opposite, and a user who filled one and
          left the rest would be looking at four unmet requirements that are
          already satisfied.

          A legend is a fieldset's accessible name, and there is no
          aria-required for a group, so the precise rule is spelled out in
          clipped text: the name becomes "Column Filters (at least one value
          required)". That keeps a screen reader and the asterisk saying the same
          thing, which aria-required does for the single fields.

          Parenthesised rather than led with a comma. accname inserts a
          separator between a node's children, so clipped text starting ", at
          least" computes as "Column Filters , at least one value required" —
          the space before the comma is audible, and there is no way to close it
          while the phrase is its own element. A bracket wants that space. */}
      <legend className={`t-h4 ${styles.legend}`}>
        Column Filters
        <span aria-hidden="true" className={styles.required}>
          *
        </span>
        <span className="visually-hidden">(at least one value required)</span>
      </legend>
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
            itemsLabel={`${header} values`}
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
