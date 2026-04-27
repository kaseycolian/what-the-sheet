export type ParsedCSV = {
  headers: string[];
  rows: Record<string, string>[];
};

export type SelectOption = {
  label: string;
  value: string;
};

export type FilterState = Record<string, string[]>;

export type ReportResult = {
  inRows: Record<string, string>[];
  notInRows: Record<string, string>[];
};
