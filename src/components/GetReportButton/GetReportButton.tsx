import { useId } from 'react';
import styles from './GetReportButton.module.css';

type Props = {
  onClick: () => void;
  disabled: boolean;
  /** What is still missing, shown and announced while disabled. */
  reason?: string;
};

/* Soft-disabled, not disabled. A `disabled` button is removed from the tab
   order and announces nothing at all, so the one question it raises — why is
   this off? — is the one question it cannot answer. aria-disabled keeps the
   button focusable and reachable, aria-describedby gives it the answer, and the
   click handler is what actually holds the line.

   WCAG exempts disabled controls from contrast; the styling in the module CSS
   deliberately ignores that exemption, and this ignores the tab-order half. */
export function GetReportButton({ onClick, disabled, reason }: Props) {
  const hintId = useId();
  const describe = disabled && reason ? hintId : undefined;

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={`btn btn-solid a-pink ${styles.button}`}
        aria-disabled={disabled}
        aria-describedby={describe}
        onClick={() => {
          if (!disabled) onClick();
        }}
      >
        Get Report
      </button>
      {/* Visible as well as announced — the requirements are not obvious from
          the controls above, and SC 3.3.2 wants them stated rather than
          discovered. Only rendered while it is true, so aria-describedby never
          points at an id that is not there. */}
      {disabled && reason && (
        <p id={hintId} className={`t-muted ${styles.hint}`}>
          {reason}
        </p>
      )}
    </div>
  );
}
