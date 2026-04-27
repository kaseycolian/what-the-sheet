import { useCallback, useRef, useState } from 'react';
import { FileUpload } from './components/FileUpload/FileUpload';
import { HeaderSelector } from './components/HeaderSelector/HeaderSelector';
import { ColumnFilters } from './components/ColumnFilters/ColumnFilters';
import { ReturnColumnsSelector } from './components/ReturnColumnsSelector/ReturnColumnsSelector';
import { GetReportButton } from './components/GetReportButton/GetReportButton';
import { ResultTable } from './components/ResultTable/ResultTable';
import { ThemeSelector } from './components/ThemeSelector/ThemeSelector';
import { filterRows } from './utils/filterRows';
import type { FilterState, ParsedCSV, ReportResult } from './types';
import styles from './App.module.css';

export default function App() {
  const [parsedData, setParsedData] = useState<ParsedCSV | null>(null);
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>([]);
  const [filterState, setFilterState] = useState<FilterState>({});
  const [returnColumns, setReturnColumns] = useState<string[]>([]);
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);

  const inTableRef = useRef<HTMLHeadingElement>(null);

  const handleFileParsed = useCallback((data: ParsedCSV) => {
    setParsedData(data);
    setSelectedHeaders([]);
    setFilterState({});
    setReturnColumns(data.headers.length > 0 ? [data.headers[0]] : []);
    setReportResult(null);
  }, []);

  const handleHeaderChange = useCallback((headers: string[]) => {
    setSelectedHeaders(headers);
    setFilterState((prev) => {
      const next: FilterState = {};
      for (const h of headers) next[h] = prev[h] ?? [];
      return next;
    });
    setReportResult(null);
  }, []);

  const handleFilterChange = useCallback((header: string, values: string[]) => {
    setFilterState((prev) => ({ ...prev, [header]: values }));
    setReportResult(null);
  }, []);

  const handleReturnColumnsChange = useCallback((cols: string[]) => {
    setReturnColumns(cols);
    setReportResult(null);
  }, []);

  const hasActiveFilters = Object.values(filterState).some((v) => v.length > 0);

  const handleGetReport = useCallback(() => {
    if (!parsedData) return;
    const result = filterRows(parsedData.rows, filterState, returnColumns);
    setReportResult(result);
    requestAnimationFrame(() => {
      inTableRef.current?.focus();
    });
  }, [parsedData, filterState, returnColumns]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>What the Sheet</h1>
            <p className={styles.subtitle}>
              Upload a CSV, choose filter criteria, and instantly find matching rows.
            </p>
          </div>
          <ThemeSelector />
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.card} aria-label="File upload">
          <FileUpload onFileParsed={handleFileParsed} />
        </section>

        {parsedData && (
          <>
            <section className={styles.card} aria-label="Filter configuration">
              <div className={styles.filterStack}>
                <HeaderSelector
                  headers={parsedData.headers}
                  selectedHeaders={selectedHeaders}
                  onChange={handleHeaderChange}
                />

                <ColumnFilters
                  selectedHeaders={selectedHeaders}
                  rows={parsedData.rows}
                  filterState={filterState}
                  onFilterChange={handleFilterChange}
                />

                <ReturnColumnsSelector
                  headers={parsedData.headers}
                  selectedReturnColumns={returnColumns}
                  onChange={handleReturnColumnsChange}
                />

                <GetReportButton
                  onClick={handleGetReport}
                  disabled={!hasActiveFilters || returnColumns.length === 0}
                />
              </div>
            </section>

            {reportResult && (
              <section className={styles.results} aria-label="Report results">
                <ResultTable
                  id="in-table-heading"
                  title="Matched rows"
                  rows={reportResult.inRows}
                  columns={returnColumns}
                  variant="in"
                  tableRef={inTableRef}
                />
                <ResultTable
                  id="out-table-heading"
                  title="Not matched rows"
                  rows={reportResult.notInRows}
                  columns={returnColumns}
                  variant="out"
                />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
