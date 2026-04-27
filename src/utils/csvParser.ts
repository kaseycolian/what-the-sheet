import Papa from 'papaparse';
import type { ParsedCSV } from '../types';

const ISBN_HEADER = 'ISBNs';

function normalizeIsbn(value: string): string {
  // Strip trailing decimal from numeric strings (e.g. "9780141036144.0" → "9780141036144")
  // Uses string operation only — no parseFloat — to preserve 13-digit precision.
  return /^\d+\.\d+$/.test(value.trim()) ? value.trim().replace(/\.\d+$/, '') : value;
}

export function parseCsv(file: File): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete(results) {
        const headers = (results.meta.fields ?? []).filter(Boolean);
        const rows = results.data.map((row) => {
          if (ISBN_HEADER in row) {
            return { ...row, [ISBN_HEADER]: normalizeIsbn(row[ISBN_HEADER] ?? '') };
          }
          return row;
        });
        resolve({ headers, rows });
      },
      error(err) {
        reject(new Error(err.message));
      },
    });
  });
}
