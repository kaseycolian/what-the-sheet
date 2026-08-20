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
      {/* First focusable thing on the page. Off-screen via transform, not
          display:none, so it stays focusable. */}
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="hdr-inner">
          {/* Icon slot: <img class="brand-mark" src="…" alt=""> goes here — alt=""
              because the wordmark beside it already names the lockup. */}
          <div className="brand">
            {/* .brand-name owns the flex row and the type ladder, so it stays a
                wrapper: below 620px it turns into a column and stacks the
                wordmark over the descriptor. The <h1> is .brand-title inside it,
                which keeps the page heading's accessible name exactly
                "What the Sheet" rather than absorbing the descriptor. */}
            <div className="brand-name">
              <h1 className="t-h1 brand-title">What the Sheet</h1>
              <span className="brand-dot" aria-hidden="true">
                ·
              </span>
              <span className="brand-tag">CSV Row Finder</span>
            </div>
          </div>
          <ThemeSelector />
        </div>
      </header>

      <main id="main" tabIndex={-1} className={styles.main}>
        <div className={styles.intro}>
          {/* Written in sentence case and uppercased by .t-h4 in CSS, not typed in
              caps: screen readers can spell out all-caps text letter by letter, so
              the accessible name should stay the natural words. */}
          <h2 className={`t-h4 ${styles.introTitle}`}>How it works</h2>
          <p className={`t-body ${styles.introText}`}>
            Upload a CSV, choose filter criteria, and instantly find matching rows.
          </p>
        </div>

        <section className={`panel ${styles.card}`} aria-label="File upload">
          <FileUpload onFileParsed={handleFileParsed} />
        </section>

        {parsedData && (
          <>
            <section className={`panel ${styles.card}`} aria-label="Filter configuration">
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
              <section className={`panel ${styles.results}`} aria-label="Report results">
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

      {/* Direct child of the page wrapper, not of <main>, so it maps to the
          page's one contentinfo landmark. One item only — see
          src/theme/site-footer.local.css for why the reference footer's brand
          lede and product index are not used here. */}
      <footer className="site-footer">
        <div className="ftr-inner">
          <a className="ftr-src" href="https://github.com/kaseycolian/what-the-sheet">
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
