import { useEffect, useId, useRef } from 'react';
import styles from './ConfirmDialog.module.css';

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/* A native <dialog> opened with showModal(), which is what supplies the top
   layer, ::backdrop, inertness for the rest of the page, the focus trap, Escape,
   and focus returned to whatever opened it. Only the gaps are handled here.

   role="alertdialog" is the one role that legitimately overrides a native
   <dialog>: it says the dialog is interrupting with something that has to be
   answered, and it REQUIRES aria-describedby as well as aria-labelledby — a name
   alone does not say what is lost. Note what is deliberately absent:
   aria-modal="true" and role="dialog" are both implied by showModal(), and
   hand-adding aria-modal has made VoiceOver skip the dialog's own content. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const downOnBackdrop = useRef(false);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      /* Cleared before every open. close() with no argument does NOT reset
         returnValue, and neither does dismissing with Escape in every engine —
         so a 'confirm' left over from last time would make the next Escape read
         as a confirmation. The whole cancel-by-default scheme below rests on
         this being empty at the start. */
      dialog.returnValue = '';
      dialog.showModal();
      /* showModal() focuses the first focusable child, which here would be the
         confirm button. Focus goes to the safe answer instead: Enter is the key
         people press to make a dialog go away, so what sits under it has to be
         the answer that costs nothing. */
      cancelRef.current?.focus();
      // showModal() makes the page inert but leaves it scrolling.
      document.documentElement.setAttribute('data-modal-lock', 'true');
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    return () => document.documentElement.removeAttribute('data-modal-lock');
  }, []);

  /* Every route out except the confirm button leaves returnValue empty, so
     cancelling is the default rather than three separate cases: Escape (which
     fires cancel, then close), the backdrop, and the Cancel button all land here
     with nothing set and cancel.

     Confirming is deliberately NOT handled here. The close event is dispatched
     as a queued task, and a confirmed action may need to open a file picker —
     which browsers allow only while the user activation from the click is still
     live. Running it here risks the picker being blocked, so onConfirm fires
     synchronously in the button handler instead and this only has to know not to
     cancel afterwards. */
  function handleClose() {
    document.documentElement.removeAttribute('data-modal-lock');
    if (ref.current?.returnValue !== 'confirm') onCancel();
  }

  /* A click on ::backdrop is dispatched to the dialog element itself, so
     target === dialog means "outside". Both ends of the click are checked
     because a text drag that starts inside and finishes on the backdrop would
     otherwise close the dialog out from under the pointer. */
  function handlePointerDown(e: React.PointerEvent<HTMLDialogElement>) {
    downOnBackdrop.current = e.target === ref.current;
  }

  function handleClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (!downOnBackdrop.current || e.target !== ref.current) return;
    ref.current?.close('dismiss');
  }

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onClose={handleClose}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      {/* The padding lives on this inner element, not on the dialog: padding on
          the dialog would count as part of it, and a click landing there would
          register as a backdrop click. */}
      <div className={styles.inner}>
        <h2 id={titleId} className={`t-h3 ${styles.title}`}>
          {title}
        </h2>
        <p id={descId} className={`t-body ${styles.body}`}>
          {description}
        </p>
        <div className={styles.actions}>
          {/* Cancel is also the visible way out that touch requires — there is
              no Escape key on a phone. */}
          <button
            ref={cancelRef}
            type="button"
            className="btn btn-outline a-blue"
            onClick={() => ref.current?.close('cancel')}
          >
            {cancelLabel}
          </button>
          {/* onConfirm before close, and inside the click, so whatever it does
              still counts as user-initiated — see handleClose. */}
          <button
            type="button"
            className="btn btn-solid a-pink"
            onClick={() => {
              onConfirm();
              ref.current?.close('confirm');
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
