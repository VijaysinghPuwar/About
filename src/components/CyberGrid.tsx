/**
 * A 60px rule grid, radially masked so it fades out below the hero, drifting
 * one cell diagonally every two minutes.
 *
 * This replaced a 300-line canvas that tracked the cursor, lerped dot opacity,
 * drew proximity lines and emitted click ripples on every frame. None of that
 * was legible at 5% opacity; all of it ran a rAF loop for the life of the page.
 * A masked CSS background reads the same and costs nothing.
 *
 * The drift is the one concession back: half a pixel a second, on
 * `background-position` only, so the page is never quite still without the
 * grid ever becoming something a reader notices. It stops entirely under
 * `prefers-reduced-motion`. See `.rule-grid-drift` in index.css.
 */
export function CyberGrid() {
  const mask = 'radial-gradient(ellipse 76% 42% at 50% 8%, #000 14%, transparent 70%)';

  return (
    <div
      aria-hidden="true"
      className="rule-grid-drift fixed inset-0 z-0 pointer-events-none bg-rule-grid"
      style={{
        backgroundSize: '60px 60px',
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}
