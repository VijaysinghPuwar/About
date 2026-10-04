import { useRef, useState, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Shared: fires once when `ref` first scrolls into view.
 *
 * It triggers on the element's top edge crossing a line a little above the
 * bottom of the viewport, not on a share of its area. The old trigger was
 * `threshold: 0.15`, 15% of the element visible at once, and a section can be
 * far taller than the viewport: on a phone the Work section is several screens
 * long, so it sat invisible while the reader scrolled through the empty space
 * where it should have been, and a section more than about six screens tall
 * could never reach 15% at all.
 */
function useEnteredView(ref: React.RefObject<HTMLElement>, skip: boolean) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (skip) {
      setEntered(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setEntered(true);
      },
      { threshold: 0, rootMargin: '0px 0px -12% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, skip]);

  return entered;
}

/**
 * The divider that draws itself across the top of a section and then fades.
 *
 * Render it as the first child of a `relative` section. The section carries no
 * `border-t`: it used to, and the hairline that stayed behind after the rule
 * faded read as a seam cutting the page into slabs. Spacing separates the
 * sections now, and the rule leaves nothing behind. One solid accent. The original swept a primary-to-violet gradient, which put a second hue on screen
 * four times per scroll.
 */
export function SectionRule() {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const entered = useEnteredView(ref, !!prefersReducedMotion);

  return (
    <span ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-px block h-px">
      {entered && !prefersReducedMotion && (
        <span className="section-rule-draw absolute inset-0 block origin-center bg-primary" />
      )}
    </span>
  );
}

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Section content entrance: a short lift, nothing else. The previous version
 * held the content back 300ms behind the rule above, so every section arrived
 * late; the two now run together.
 *
 * Plain CSS transitions on `opacity` and `transform` (see `.section-reveal` in
 * index.css), so the browser runs them on the compositor instead of a
 * JavaScript loop stepping each frame, which is the difference between a
 * smooth lift and a stutter on a low-power machine.
 */
export function SectionReveal({ children, className = '' }: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const triggered = useEnteredView(ref, !!prefersReducedMotion);

  return (
    <div
      ref={ref}
      className={`section-reveal relative ${className}`}
      data-revealed={triggered || prefersReducedMotion ? '' : undefined}
    >
      {children}
    </div>
  );
}
