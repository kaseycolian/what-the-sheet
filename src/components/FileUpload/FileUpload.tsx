import { useRef, useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { parseFiles } from '../../utils/parseFiles';
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog';
import type { Workbook } from '../../types';
import styles from './FileUpload.module.css';

type Props = {
  onFilesParsed: (workbook: Workbook) => void;
};

/* What the user asked for while something was already loaded, parked until they
   answer the dialog. A drop carries its files; the picker has none yet, because
   opening it is the thing being confirmed. */
type Pending = { kind: 'drop'; files: File[] } | { kind: 'picker' };

export function FileUpload({ onFilesParsed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef<Pending | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [confirming, setConfirming] = useState(false);
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

  /* The one gate both entry points pass through. Loading a file resets the whole
     app — workbook, tabs, every column filter, the report — so once there is
     something to lose, the intent is parked until it is confirmed. The first
     upload has nothing to lose and stays a single action. */
  function request(intent: Pending) {
    if (loaded.length === 0) {
      run(intent);
      return;
    }
    pendingRef.current = intent;
    setConfirming(true);
  }

  function run(intent: Pending) {
    if (intent.kind === 'drop') void handleFiles(intent.files);
    else inputRef.current?.click();
  }

  function onConfirm() {
    setConfirming(false);
    const intent = pendingRef.current;
    pendingRef.current = null;
    if (intent) run(intent);
  }

  function onCancelConfirm() {
    setConfirming(false);
    pendingRef.current = null;
  }

  /* preventDefault runs even while the dialog is up, and that is not optional:
     without it the browser handles the drop itself and NAVIGATES to the dropped
     file, which throws away the whole session — far worse than the highlight
     this is suppressing. What is skipped while confirming is the lit state and
     the drop, not the default. */
  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (confirming) {
      // Says "this will not accept a drop" to the OS, so the pointer shows a
      // no-drop cursor rather than the zone simply going quiet.
      e.dataTransfer.dropEffect = 'none';
      return;
    }
    setIsDragging(true);
  }

  function onDragLeave() {
    setIsDragging(false);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    /* Dropped while the question is still on screen: ignored outright. Letting it
       through would quietly swap the parked files for these ones, and Yup would
       then load something the user was never asked about. */
    if (confirming) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) request({ kind: 'drop', files });
  }

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    /* Cleared so picking the same file twice in a row still fires a change event.
       Without this the second attempt is silently ignored — which after a
       confirmation dialog would look like the confirmation itself failed. */
    e.target.value = '';
    await handleFiles(files);
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

      {/* A <label> would open the OS picker natively and immediately, leaving no
          point at which the confirmation can come first — so the visible control
          is a real button that opens the picker itself, and only once the answer
          is in. The input keeps the change event but is out of the tab order:
          the button is the control now, and two tab stops for one job is worse
          than none. No aria-expanded on it either — a modal moves the user
          inside it, so there is nothing to report from out here. */}
      <input
        ref={inputRef}
        id="csv-input"
        type="file"
        multiple
        tabIndex={-1}
        accept=".csv,.xlsx,.xls,.xlsm,.xlsb"
        aria-hidden="true"
        className={styles.input}
        onChange={onChange}
      />
      <button
        type="button"
        className={`btn btn-solid a-blue ${styles.choose}`}
        onClick={() => request({ kind: 'picker' })}
      >
        Choose files
      </button>

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

      <ConfirmDialog
        open={confirming}
        title="You really wanna reset everything?"
        description="'Cause this is how you reset everything."
        confirmLabel="Yup"
        cancelLabel="Cancel"
        onConfirm={onConfirm}
        onCancel={onCancelConfirm}
      />
    </div>
  );
}
