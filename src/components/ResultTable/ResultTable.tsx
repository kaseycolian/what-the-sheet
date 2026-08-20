import type { DataRow } from '../../types';
import styles from './ResultTable.module.css';

type Props = {
  title: string;
  rows: DataRow[];
  columns: string[];
  id: string;
  variant: 'in' | 'out';
  /* Only when more than one tab is in scope. A cross-tab report otherwise gives
     no way to tell which sheet a row came from, and keeping this out of the
     return-column list stops a pseudo-column leaking into the header union. */
  showTab?: boolean;
  tableRef?: React.RefObject<HTMLHeadingElement | null>;
};

export function ResultTable({
  title,
  rows,
  columns,
  id,
  variant,
  showTab = false,
  tableRef,
}: Props) {
  return (
    /* Deliberately unnamed. A <section> only becomes a region landmark once it
       has an accessible name, and naming this one from the heading gave the
       page two regions with identical names — this and the scroll wrapper
       below, which needs the name far more (axe: landmark-unique). The heading
       is what carries the structure here; the landmark is the table's. */
    <section className={styles.section}>
      <h2
        id={id}
        ref={tableRef}
        tabIndex={-1}
        className={`t-h2 ${styles.heading} ${styles[variant]}`}
      >
        {title}{' '}
        <span className={`t-muted ${styles.count}`}>({rows.length} row{rows.length !== 1 ? 's' : ''})</span>
      </h2>

      {rows.length === 0 ? (
        /* No role="status" here. A live region only announces what changes
           inside it while it is being observed, and this paragraph is inserted
           with its text already in place — so the role announced nothing and
           only added a region to the tree. The empty case is already carried
           twice over: the heading takes focus when a report runs, and its own
           name ends "(0 rows)". */
        <p className={`t-muted ${styles.empty}`}>No results.</p>
      ) : (
        /* The scroll wrapper is a tab stop whether or not one is declared:
           Chromium hands a free one to any user-scrollable box, with no role,
           no name, and the UA's own 1px hairline ring — invisible on a dark
           page. Safari hands out nothing at all, so the stop has to be declared
           either way, and then named and given a real ring (SC 2.1.1, 4.1.2,
           2.4.7). aria-labelledby reuses the heading, so the region and the
           table it holds answer to the same name. */
        <div
          className={`fx-scroll ${styles.tableWrapper}`}
          role="region"
          aria-labelledby={id}
          tabIndex={0}
        >
          <table className={styles.table} aria-labelledby={id}>
            <thead>
              <tr>
                {showTab && (
                  <th scope="col" className={`t-h4 ${styles.th}`}>
                    Tab
                  </th>
                )}
                {columns.map((col) => (
                  <th key={col} scope="col" className={`t-h4 ${styles.th}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={styles.tr}>
                  {showTab && <td className={`t-body ${styles.td}`}>{row.sheet}</td>}
                  {columns.map((col) => (
                    <td key={col} className={`t-body ${styles.td}`}>
                      {row.cells[col] ?? ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
