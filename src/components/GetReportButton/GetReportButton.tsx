import styles from './GetReportButton.module.css';

type Props = {
  onClick: () => void;
  disabled: boolean;
};

export function GetReportButton({ onClick, disabled }: Props) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      Get Report
    </button>
  );
}
