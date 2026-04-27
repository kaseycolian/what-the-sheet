import styles from './ResultTable.module.css';

type Props = {
  title: string;
  rows: Record<string, string>[];
  columns: string[];
  id: string;
  variant: 'in' | 'out';
  tableRef?: React.RefObject<HTMLHeadingElement | null>;
};

export function ResultTable({ title, rows, columns, id, variant, tableRef }: Props) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <h2
        id={id}
        ref={tableRef}
        tabIndex={-1}
        className={`${styles.heading} ${styles[variant]}`}
      >
        {title}{' '}
        <span className={styles.count}>({rows.length} row{rows.length !== 1 ? 's' : ''})</span>
      </h2>

      {rows.length === 0 ? (
        <p role="status" className={styles.empty}>
          No results.
        </p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table} aria-labelledby={id}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col} scope="col" className={styles.th}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={styles.tr}>
                  {columns.map((col) => (
                    <td key={col} className={styles.td}>
                      {row[col] ?? ''}
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
