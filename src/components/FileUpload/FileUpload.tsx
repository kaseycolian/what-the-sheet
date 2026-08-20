import { useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { parseFiles } from '../../utils/parseFiles';
import type { Workbook } from '../../types';
import styles from './FileUpload.module.css';

type Props = {
  onFilesParsed: (workbook: Workbook) => void;
};

export function FileUpload({ onFilesParsed }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [loaded, setLoaded] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  async function handleFiles(files: File[]) {
    if (files.length === 0) return;
    try {
      const { workbook, loadedFiles, errors: parseErrors } = await parseFiles(files);
      setErrors(parseErrors);
      if (workbook.sheets.length === 0) {
        setLoaded([]);
        if (parseErrors.length === 0) {
          setErrors(['Nothing to load — no sheet had both headers and data rows.']);
        }
        return;
      }
      // Files, not sheet names: the drop zone reports what was handed over. What
      // came out of it — the tabs — belongs to the filter below, not here.
      setLoaded(loadedFiles);
      onFilesParsed(workbook);
    } catch {
      setLoaded([]);
      setErrors(['Failed to read the files. Please check them and try again.']);
    }
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave() {
    setIsDragging(false);
  }

  async function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    await handleFiles(Array.from(e.dataTransfer.files));
  }

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    await handleFiles(Array.from(e.target.files ?? []));
  }

  return (
    <div
      role="region"
      aria-label="Spreadsheet drop zone"
      className={`${styles.zone} ${isDragging ? styles.dragging : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <p className={`t-body ${styles.prompt}`}>
        {loaded.length > 0 ? (
          <span>
            <strong>
              {loaded.length} file{loaded.length !== 1 ? 's' : ''}
            </strong>{' '}
            loaded — drop or choose files to replace
          </span>
        ) : (
          <span>Drop CSV or Excel files here</span>
        )}
      </p>

      {/* The native control renders its button and its "no file chosen" text on
          one line, and no CSS can separate them. So the input is taken out of the
          visual flow and a <label> stands in as the button: clicking the label
          still opens the picker, and the input keeps its own focus and keyboard
          behaviour rather than having it reimplemented on a <div>.

          Clipped rather than display:none — a hidden input is not focusable, which
          would drop the control out of the tab order altogether. The focus ring is
          drawn on the label by a sibling rule in the stylesheet, so the input has
          to stay immediately before it. */}
      <input
        id="csv-input"
        type="file"
        multiple
        accept=".csv,.xlsx,.xls,.xlsm,.xlsb"
        className={styles.input}
        onChange={onChange}
      />
      <label htmlFor="csv-input" className={`btn btn-solid a-blue ${styles.choose}`}>
        Choose files
      </label>

      {loaded.length > 0 && (
        <ul className={styles.fileList}>
          {/* Keyed by position, not by name: selecting the same file twice in one
              go is legal and yields two identical names, which would collide as
              keys. The list is replaced wholesale on every upload and never
              reordered, so the index is stable for as long as it exists. */}
          {loaded.map((name, i) => (
            <li key={`${i}-${name}`} className={`t-muted ${styles.fileName}`}>
              {name}
            </li>
          ))}
        </ul>
      )}

      {errors.map((message, i) => (
        <p key={`${i}-${message}`} role="alert" className={`notice error ${styles.error}`}>
          <span className="icon" aria-hidden="true">
            !
          </span>
          {message}
        </p>
      ))}
    </div>
  );
}
