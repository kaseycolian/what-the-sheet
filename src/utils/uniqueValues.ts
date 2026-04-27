import type { SelectOption } from '../types';

export function getUniqueValues(
  rows: Record<string, string>[],
  header: string,
): SelectOption[] {
  const seen = new Set<string>();

  for (const row of rows) {
    const cell = row[header] ?? '';
    for (const segment of cell.split(',')) {
      const trimmed = segment.trim();
      if (trimmed) seen.add(trimmed);
    }
  }

  return Array.from(seen)
    .sort((a, b) => a.localeCompare(b))
    .map((v) => ({ label: v, value: v }));
}
