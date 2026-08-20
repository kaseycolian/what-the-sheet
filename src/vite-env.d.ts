/// <reference types="vite/client" />

/* public/dropdown.js — the accessible listbox from the theme service (a port of
   the a11y-component-examples `dropdown` component). Loaded as an external
   script from index.html, so it reaches the app as a global. */
interface ThemeServiceDropdown {
  /** Re-read the <select> after its options changed. */
  rebuild(): void;
  /** Re-read the current value after setting select.value programmatically. */
  sync(): void;
  open(): void;
  close(restoreFocus?: boolean): void;
  isOpen(): boolean;
  /** The enhanced wrapper element. */
  element: HTMLElement;
  destroy(): void;
}

interface Window {
  ThemeService?: {
    /** Idempotent: returns the existing instance for an already-enhanced select. */
    createDropdown?: (select: HTMLSelectElement) => ThemeServiceDropdown | null;
  };
}
