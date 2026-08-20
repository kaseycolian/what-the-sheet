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
    <section className={styles.section} aria-labelledby={id}>
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
        <p role="status" className={`t-muted ${styles.empty}`}>
          No results.
        </p>
      ) : (
        <div className={`fx-scroll ${styles.tableWrapper}`}>
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
