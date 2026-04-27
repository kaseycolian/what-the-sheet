import type { FilterState, ReportResult } from '../types';

function projectRow(
  row: Record<string, string>,
  columns: string[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const col of columns) out[col] = row[col] ?? '';
  return out;
}

export function filterRows(
  rows: Record<string, string>[],
  filterState: FilterState,
  returnColumns: string[],
): ReportResult {
  const activeFilters = Object.entries(filterState).filter(
    ([, vals]) => vals.length > 0,
  );

  if (activeFilters.length === 0) {
    return {
      inRows: [],
      notInRows: rows.map((r) => projectRow(r, returnColumns)),
    };
  }

  const inRows: Record<string, string>[] = [];
  const notInRows: Record<string, string>[] = [];

  for (const row of rows) {
    const matched = activeFilters.some(([header, selectedVals]) => {
      const cell = row[header] ?? '';
      const cellValues = cell
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      return cellValues.some((v) => selectedVals.includes(v));
    });

    (matched ? inRows : notInRows).push(projectRow(row, returnColumns));
  }

  return { inRows, notInRows };
}
