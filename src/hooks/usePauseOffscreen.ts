import { useCallback, useRef } from 'react';

/**
 * Pause every looping animation inside an element while it is out of view.
 *
 * The site keeps a few small loops (the live line's glow, the schematic's
 * travelling dots, the timeline's current-role cursor and the activity dot).
 * Each is cheap on its own, but the browser keeps running them for the life of
 * the page, scrolled away or not, and on a low-power machine that is a repaint
 * every frame spent on things nobody can see.
 *
 * Out of view, the element gets `data-offscreen`, which index.css turns into
 * `animation-play-state: paused` for the whole subtree, and any SVG inside has
 * its SMIL timeline paused (`animateMotion` ignores CSS). Back in view, both
 * resume from where they stopped, so nothing visibly jumps.
 *
 * Returns a callback ref rather than taking one, so an element that mounts
 * late (the activity line waits on GitHub) is still picked up.
 */
export function usePauseOffscreen<T extends Element>() {
  const cleanup = useRef<(() => void) | null>(null);

  return useCallback((el: T | null) => {
    cleanup.current?.();
    cleanup.current = null;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const svgs = () =>
      (el instanceof SVGSVGElement ? [el] : Array.from(el.querySelectorAll('svg'))) as SVGSVGElement[];

    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      el.toggleAttribute('data-offscreen', !visible);
      for (const svg of svgs()) {
        if (visible) svg.unpauseAnimations?.();
        else svg.pauseAnimations?.();
      }
    });
    observer.observe(el);
    cleanup.current = () => {
      observer.disconnect();
      el.removeAttribute('data-offscreen');
    };
  }, []);
}
