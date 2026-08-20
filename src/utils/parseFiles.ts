import Papa from 'papaparse';
import type { Sheet, Workbook } from '../types';

const ISBN_HEADER = 'ISBNs';

const CSV_EXT = ['.csv'];
const WORKBOOK_EXT = ['.xlsx', '.xls', '.xlsm', '.xlsb'];

function normalizeIsbn(value: string): string {
  // Strip trailing decimal from numeric strings (e.g. "9780141036144.0" → "9780141036144")
  // Uses string operation only — no parseFloat — to preserve 13-digit precision.
  return /^\d+\.\d+$/.test(value.trim()) ? value.trim().replace(/\.\d+$/, '') : value;
}

function normalizeRow(row: Record<string, string>): Record<string, string> {
  if (ISBN_HEADER in row) {
    return { ...row, [ISBN_HEADER]: normalizeIsbn(row[ISBN_HEADER] ?? '') };
  }
  return row;
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

function stemOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? name : name.slice(0, dot);
}

/** A sheet with no headers or no data rows carries nothing to filter on —
    blank worksheets are common in real workbooks, so they are dropped rather
    than shown as empty tabs. */
function isUsable(sheet: Sheet): boolean {
  return sheet.headers.length > 0 && sheet.rows.length > 0;
}

function parseCsvFile(file: File): Promise<Sheet[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete(results) {
        const headers = (results.meta.fields ?? []).filter(Boolean);
        const rows = results.data.map(normalizeRow);
        resolve([{ name: stemOf(file.name), headers, rows }]);
      },
      error(err) {
        reject(new Error(err.message));
      },
    });
  });
}

async function parseWorkbookFile(file: File): Promise<Sheet[]> {
  /* SheetJS is ~430 kB of the bundle — several times the rest of the app. Loaded
     on demand so someone who only ever drops CSVs never pays for it. */
  const { read, utils } = await import('xlsx');
  const workbook = read(await file.arrayBuffer());
  const sheets: Sheet[] = [];

  for (const name of workbook.SheetNames) {
    const worksheet = workbook.Sheets[name];
    if (!worksheet) continue;

    /* header: 1 (array-of-arrays) rather than object mode: it leaves duplicate
       and blank header cells for us to handle, instead of silently renaming
       them to "Foo_1". raw: false yields Excel's own formatted strings, which
       matches the CSV path's all-strings contract. */
    const grid = utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      raw: false,
      defval: '',
      blankrows: false,
    });

    const [headerRow, ...bodyRows] = grid;
    if (!headerRow) continue;

    const headers: string[] = [];
    const headerIndexes: number[] = [];
    headerRow.forEach((cell, i) => {
      const header = String(cell ?? '').trim();
      // Skip blanks, and keep only the first of any duplicated header — a
      // second column of the same name would otherwise overwrite the first.
      if (header && !headers.includes(header)) {
        headers.push(header);
        headerIndexes.push(i);
      }
    });

    const rows = bodyRows
      .filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''))
      .map((row) => {
        const cells: Record<string, string> = {};
        headers.forEach((header, h) => {
          cells[header] = String(row[headerIndexes[h]] ?? '');
        });
        return normalizeRow(cells);
      });

    sheets.push({ name, headers, rows });
  }

  return sheets;
}

/** Sheet names double as the tab filter's values, so they have to be unique
    across every loaded file. Collisions get " (2)", " (3)", … */
function uniqueName(name: string, taken: Set<string>): string {
  if (!taken.has(name)) return name;
  let n = 2;
  while (taken.has(`${name} (${n})`)) n += 1;
  return `${name} (${n})`;
}

export type ParseOutcome = {
  workbook: Workbook;
  /** Names of the files that yielded at least one usable sheet. Reported
      separately from the workbook because one file can contribute many sheets,
      and the upload UI lists what the user handed over, not what came out. */
  loadedFiles: string[];
  /** Per-file messages for anything that could not be loaded. Files that did
      parse are still returned in `workbook`. */
  errors: string[];
};

export async function parseFiles(files: File[]): Promise<ParseOutcome> {
  const sheets: Sheet[] = [];
  const loadedFiles: string[] = [];
  const errors: string[] = [];
  const taken = new Set<string>();

  for (const file of files) {
    const ext = extensionOf(file.name);
    try {
      let parsed: Sheet[];
      if (CSV_EXT.includes(ext)) {
        parsed = await parseCsvFile(file);
      } else if (WORKBOOK_EXT.includes(ext)) {
        parsed = await parseWorkbookFile(file);
      } else {
        errors.push(`${file.name}: not a CSV or Excel file.`);
        continue;
      }

      const usable = parsed.filter(isUsable);
      if (usable.length === 0) {
        errors.push(`${file.name}: no sheet with both headers and data rows.`);
        continue;
      }

      for (const sheet of usable) {
        const name = uniqueName(sheet.name, taken);
        taken.add(name);
        sheets.push({ ...sheet, name });
      }
      loadedFiles.push(file.name);
    } catch {
      errors.push(`${file.name}: could not be read.`);
    }
  }

  return { workbook: { sheets }, loadedFiles, errors };
}
