/**
 * A 60px rule grid behind the first screen, radially masked so it fades out
 * before the content, drifting one cell diagonally every two minutes.
 *
 * This replaced a 300-line canvas that tracked the cursor, lerped dot opacity,
 * drew proximity lines and emitted click ripples on every frame. None of that
 * was legible at 5% opacity; all of it ran a rAF loop for the life of the page.
 *
 * Two things here exist for low-power machines, where the previous version was
 * the single most expensive thing on the page:
 *
 *  - It scrolls with the document instead of being `position: fixed`. Fixed, it
 *    sat behind the top of every section (its rules ran through the Journey and
 *    Capabilities headings) and had to be composited on every scroll frame.
 *    Anchored to the top of the page it is behind the hero only, which is what
 *    it was always described as, and once scrolled past it costs nothing.
 *  - The drift moves an oversized inner layer with `transform`, not the
 *    `background-position` of the masked element. A background-position
 *    animation cannot be composited, so it repainted the whole masked viewport
 *    on every frame for as long as the tab was open: on an integrated GPU that
 *    alone held the idle page under 30fps. A transform runs on the compositor
 *    and the grid is rasterised once.
 *
 * The drift stops entirely under `prefers-reduced-motion`. See
 * `.rule-grid-drift` in index.css.
 */
export function CyberGrid() {
  const mask = 'radial-gradient(ellipse 76% 42% at 50% 8%, #000 14%, transparent 70%)';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[100svh] overflow-hidden"
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      <div
        className="rule-grid-drift absolute -left-[60px] -top-[60px] bottom-0 right-0 bg-rule-grid"
        style={{ backgroundSize: '60px 60px' }}
      />
    </div>
  );
}
