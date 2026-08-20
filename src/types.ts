/** One tab of loaded data: a worksheet from a workbook, or a whole CSV file. */
export type Sheet = {
  name: string;
  headers: string[];
  rows: Record<string, string>[];
};

export type Workbook = {
  sheets: Sheet[];
};

/* A row keeps its tab in a sibling field rather than as an injected key, so a
   real column literally named "Tab" (or anything else) can never collide with
   it. Everything downstream of parsing works on DataRow, not bare cell maps. */
export type DataRow = {
  sheet: string;
  cells: Record<string, string>;
};

export type SelectOption = {
  label: string;
  value: string;
};

export type FilterState = Record<string, string[]>;

export type ReportResult = {
  inRows: DataRow[];
  notInRows: DataRow[];
};
