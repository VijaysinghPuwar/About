import { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

/** Shared: fires once when `ref` first scrolls into view. */
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
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, skip]);

  return entered;
}

/**
 * The divider that draws itself across the top of a section and then fades.
 *
 * Render it as the first child of a `relative` section that carries the static
 * `border-t`; the rule sits exactly on that border, so once it fades the plain
 * hairline is what remains. One solid accent — the original swept a
 * primary-to-violet gradient, which put a second hue on screen four times per
 * scroll.
 */
export function SectionRule() {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const entered = useEnteredView(ref, !!prefersReducedMotion);

  return (
    <span ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-px block h-px">
      {entered && !prefersReducedMotion && (
        <motion.span
          className="absolute inset-0 block origin-center bg-primary"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{
            scaleX: { duration: 0.6, ease: 'easeOut' },
            opacity: { duration: 0.45, delay: 0.65, ease: 'easeIn' },
          }}
        />
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
 */
export function SectionReveal({ children, className = '' }: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const triggered = useEnteredView(ref, !!prefersReducedMotion);
  const isMobile = useIsMobile();
  const translateY = isMobile ? 12 : 20;

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      initial={prefersReducedMotion ? false : { opacity: 0, y: translateY }}
      animate={triggered ? { opacity: 1, y: 0 } : { opacity: 0, y: translateY }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
