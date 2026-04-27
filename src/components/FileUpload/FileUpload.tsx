import { useRef, useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { parseCsv } from '../../utils/csvParser';
import type { ParsedCSV } from '../../types';
import styles from './FileUpload.module.css';

type Props = {
  onFileParsed: (data: ParsedCSV) => void;
};

export function FileUpload({ onFileParsed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a .csv file.');
      return;
    }
    setError(null);
    setFileName(file.name);
    try {
      const data = await parseCsv(file);
      onFileParsed(data);
    } catch {
      setError('Failed to parse CSV. Please check the file and try again.');
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
    const file = e.dataTransfer.files[0];
    if (file) await handleFile(file);
  }

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
  }

  return (
    <div
      role="region"
      aria-label="CSV drop zone"
      className={`${styles.zone} ${isDragging ? styles.dragging : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <label className={styles.label} htmlFor="csv-input">
        {fileName ? (
          <span>
            <strong>{fileName}</strong> loaded — drop or click to replace
          </span>
        ) : (
          <span>Drop a CSV file here, or click to browse</span>
        )}
      </label>
      <input
        id="csv-input"
        ref={inputRef}
        type="file"
        accept=".csv"
        aria-label="Upload CSV file"
        className={styles.input}
        onChange={onChange}
      />
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
