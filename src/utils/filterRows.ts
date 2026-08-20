import type { DataRow, FilterState, ReportResult } from '../types';

function projectRow(row: DataRow, columns: string[]): DataRow {
  const cells: Record<string, string> = {};
  for (const col of columns) cells[col] = row.cells[col] ?? '';
  return { sheet: row.sheet, cells };
}

/** `rows` must already be scoped to the selected tabs — the tab filter is an
    AND that decides which rows exist at all, so out-of-scope rows belong in
    neither result table. Within that scope the match is OR across every active
    column filter, and OR again across a cell's comma-separated values. */
export function filterRows(
  rows: DataRow[],
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

  const inRows: DataRow[] = [];
  const notInRows: DataRow[] = [];

  for (const row of rows) {
    const matched = activeFilters.some(([header, selectedVals]) => {
      const cell = row.cells[header] ?? '';
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
