/* The header lockup's mark, inlined rather than loaded through <img src>.

   An <img> is an isolated document that the page's CSS never reaches, so a mark
   loaded that way resolves its var() references to the hex fallbacks and stays
   frozen on the default palette while the rest of the header re-themes around
   it. Inlined, the same tokens resolve live against whichever theme is active.

   The geometry is kept in step with src/assets/mark-sheet-funnel-soft-rim.svg,
   which is the same drawing shipped as a standalone file for the favicon — that
   one keeps its hex fallbacks precisely because it IS loaded standalone.

   aria-hidden because the wordmark beside it already names the lockup; focusable
   ="false" because IE/legacy edge cases aside, an <svg> with no role should never
   take a tab stop. */
export function BrandMark() {
  return (
    <svg
      className="brand-mark"
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      {/* Sheet frame. Radius 3 rather than the drawing's original 4.5 so the
          header cap can close higher up and leave the funnel more height. */}
      <rect
        x="4.5"
        y="4"
        width="23"
        height="24"
        rx="3"
        fill="none"
        stroke="var(--accent-blue, #3ceaff)"
        strokeWidth="3"
      />

      {/* Header row, capping the frame's top corners. Same token as the frame:
          the two shapes touch, and two DIFFERENT accents that touch can merge —
          accent against accent falls to 1.0:1 in some themes. */}
      <path
        d="M 4.5 7 A 3 3 0 0 1 7.5 4 H 24.5 A 3 3 0 0 1 27.5 7 Z"
        fill="var(--accent-blue, #3ceaff)"
      />

      {/* The filter. Filled and stroked in one token with a round linejoin —
          that is what softens the corners, without arc segments in the path and
          with no way for fill and outline to disagree in any theme. The stroke
          grows the shape by 0.7 units on every side, which the clearances from
          the frame already account for. */}
      <path
        d="M 8.5 9.5 H 23.5 V 10.5 L 18 16.5 V 24.5 L 14 22.4 V 16.5 L 8.5 10.5 Z"
        fill="var(--accent-pink, #ff2ec4)"
        stroke="var(--accent-pink, #ff2ec4)"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
