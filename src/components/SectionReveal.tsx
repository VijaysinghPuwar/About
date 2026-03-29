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
  const [linePhase, setLinePhase] = useState<'idle' | 'expanding' | 'fading' | 'done'>('idle');
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (prefersReducedMotion) {
      setTriggered(true);
      setLinePhase('done');
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered) {
          setTriggered(true);
          setLinePhase('expanding');
          // Line expands for 0.6s, holds for 0.3s, then fades
          setTimeout(() => setLinePhase('fading'), 900);
          setTimeout(() => setLinePhase('done'), 1200);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggered, prefersReducedMotion]);

  const translateY = isMobile ? 15 : 30;

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Horizontal line wipe */}
      {linePhase !== 'idle' && linePhase !== 'done' && (
        <div
          className="absolute top-0 left-0 right-0 h-px z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(var(--secondary)), transparent)',
            transform: linePhase === 'expanding' ? 'scaleX(1)' : 'scaleX(1)',
            opacity: linePhase === 'fading' ? 0 : 1,
            transformOrigin: 'center',
            animation: linePhase === 'expanding' ? 'section-line-wipe 0.6s ease-out forwards' : undefined,
            transition: 'opacity 0.3s ease-out',
          }}
        />
      )}

      {/* Content with fade-up */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: translateY }}
        animate={triggered ? { opacity: 1, y: 0 } : { opacity: 0, y: translateY }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: prefersReducedMotion ? 0 : 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* Letter-by-letter reveal label */
interface RevealLabelProps {
  text: string;
  className?: string;
  /** Delay before letter animation starts (after line wipe) */
  startDelay?: number;
}

export function RevealLabel({ text, className = '', startDelay = 0.6 }: RevealLabelProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [triggered, setTriggered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setTriggered(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <span className={`section-heading ${className}`}>{text}</span>;
  }

  return (
    <span ref={ref} className={`section-heading inline-flex ${className}`} aria-label={text}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: -10 }}
          animate={triggered ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{ delay: startDelay + i * 0.04, duration: 0.15, ease: 'easeOut' }}
          style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}
