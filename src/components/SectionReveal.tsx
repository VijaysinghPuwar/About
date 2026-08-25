import { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionReveal({ children, className = '' }: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (prefersReducedMotion) {
      setTriggered(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered) setTriggered(true);
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggered, prefersReducedMotion]);

  // A short lift, nothing else. The previous version also drew a
  // primary-to-secondary gradient line across the top of every section and held
  // the content back 300ms behind it — four visible sweeps per scroll, and a
  // section that always arrived late.
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

