import type { DataRow, Workbook } from '../types';

/** Flatten every sheet into one row list, tagging each row with its tab.
    Done once per upload; tab scoping then filters this list. */
export function flattenRows(workbook: Workbook): DataRow[] {
  const rows: DataRow[] = [];
  for (const sheet of workbook.sheets) {
    for (const cells of sheet.rows) {
      rows.push({ sheet: sheet.name, cells });
    }
  }
  return rows;
}

/** Every header present in any selected tab, in first-seen order across the
    workbook. Sheets rarely share a column order, so first-seen keeps the
    dominant sheet's ordering rather than sorting alphabetically. */
export function unionHeaders(workbook: Workbook, selectedTabs: string[]): string[] {
  const inScope = new Set(selectedTabs);
  const seen = new Set<string>();
  const headers: string[] = [];

  for (const sheet of workbook.sheets) {
    if (!inScope.has(sheet.name)) continue;
    for (const header of sheet.headers) {
      if (!seen.has(header)) {
        seen.add(header);
        headers.push(header);
      }
    }
  }

  return headers;
}

export function scopeRowsToTabs(rows: DataRow[], selectedTabs: string[]): DataRow[] {
  const inScope = new Set(selectedTabs);
  return rows.filter((row) => inScope.has(row.sheet));
}
