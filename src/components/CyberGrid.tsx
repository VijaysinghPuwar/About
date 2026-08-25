/**
 * A static 60px rule grid, radially masked so it fades out below the hero.
 *
 * This replaced a 300-line canvas that tracked the cursor, lerped dot opacity,
 * drew proximity lines and emitted click ripples on every frame. None of that
 * was legible at 5% opacity; all of it ran a rAF loop for the life of the page.
 * A masked CSS background reads the same and costs nothing.
 */
export function CyberGrid() {
  const mask = 'radial-gradient(ellipse 76% 42% at 50% 8%, #000 14%, transparent 70%)';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none bg-rule-grid"
      style={{
        backgroundSize: '60px 60px',
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}
