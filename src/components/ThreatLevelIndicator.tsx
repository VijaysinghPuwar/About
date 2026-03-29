import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const SECTIONS = [
  { id: 'home', dot: '#22c55e', status: 'RECON', label: 'Hero' },
  { id: 'skills', dot: '#eab308', status: 'SCANNING', label: 'Skills & Technologies' },
  { id: 'projects', dot: '#00e5ff', status: 'ACTIVE OPS', label: 'Featured Projects' },
  { id: 'experience', dot: '#a855f7', status: 'CLASSIFIED', label: 'Experience & Education' },
  { id: 'contact', dot: '#22c55e', status: 'CHANNEL OPEN', label: 'Contact' },
] as const;

const GLITCH_CHARS = '█▓░▒▐▌▀▄■□';

function scramble(len: number) {
  let s = '';
  for (let i = 0; i < len; i++) s += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
  return s;
}

export function ThreatLevelIndicator() {
  const location = useLocation();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [glitchText, setGlitchText] = useState<string | null>(null);
  const [transitionGlitch, setTransitionGlitch] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const prevIdxRef = useRef(0);

  // Only show on index page
  if (location.pathname !== '/') return null;

  const current = SECTIONS[activeIdx];

  // Intersection Observer
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const entries = new Map<string, number>();
    const observer = new IntersectionObserver(
      (obs) => {
        obs.forEach((entry) => {
          entries.set(entry.target.id, entry.intersectionRatio);
        });
        let maxRatio = 0;
        let maxIdx = 0;
        SECTIONS.forEach((s, i) => {
          const ratio = entries.get(s.id) || 0;
          if (ratio > maxRatio) {
            maxRatio = ratio;
            maxIdx = i;
          }
        });
        if (maxRatio > 0) setActiveIdx(maxIdx);
      },
      { threshold: [0, 0.1, 0.3, 0.5, 0.7] }
    );

    const timer = setTimeout(() => {
      SECTIONS.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el) observer.observe(el);
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // Transition glitch on section change
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (prevIdxRef.current !== activeIdx) {
      prevIdxRef.current = activeIdx;
      setTransitionGlitch(true);
      const t = setTimeout(() => setTransitionGlitch(false), 100);
      return () => clearTimeout(t);
    }
  }, [activeIdx]);

  // CLASSIFIED periodic glitch
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (current.id !== 'experience') {
      setGlitchText(null);
      return;
    }
    const iv = setInterval(() => {
      setGlitchText(scramble(10));
      setTimeout(() => setGlitchText(null), 150);
    }, 3000);
    return () => clearInterval(iv);
  }, [current.id]);

  // Click outside to close
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!isExpanded) return;
    const handler = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [isExpanded]);

  const navigateTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsExpanded(false);
  }, []);

  const displayStatus = transitionGlitch
    ? scramble(current.status.length)
    : glitchText || current.status;

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-4 left-4 z-50 w-[140px] sm:w-[160px]"
      style={{ pointerEvents: 'auto' }}
    >
      <motion.div
        layout
        className="rounded-xl overflow-hidden"
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(100, 220, 255, 0.1)',
        }}
      >
        {/* Expanded section map */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="px-3 pt-3 pb-1 space-y-0.5">
                {SECTIONS.map((s, i) => {
                  const isCurrent = i === activeIdx;
                  return (
                    <button
                      key={s.id}
                      onClick={() => navigateTo(s.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors hover:bg-white/5"
                      style={{
                        borderLeft: isCurrent
                          ? '2px solid'
                          : '2px solid transparent',
                        borderImage: isCurrent
                          ? 'linear-gradient(180deg, #00e5ff, #a855f7) 1'
                          : undefined,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: s.dot }}
                      />
                      <span
                        className="font-mono uppercase text-[9px] tracking-[1px] shrink-0"
                        style={{ color: isCurrent ? s.dot : '#475569' }}
                      >
                        {s.status}
                      </span>
                      <span
                        className="text-[9px] truncate"
                        style={{ color: isCurrent ? '#e2e8f0' : '#64748b' }}
                      >
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mx-3 my-1 border-t border-white/5" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed / main row */}
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="w-full px-3.5 py-2.5 text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {/* Pulsing dot */}
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                backgroundColor: current.dot,
                transition: 'background-color 0.3s ease',
                animation: 'threatDotPulse 2s ease-in-out infinite',
              }}
            />

            {/* Status text with AnimatePresence */}
            <div className="relative overflow-hidden h-[14px] flex-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${activeIdx}-${transitionGlitch}`}
                  initial={{ x: 12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -12, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute font-mono uppercase text-[11px] tracking-[1.5px] whitespace-nowrap"
                  style={{ color: current.dot }}
                >
                  {displayStatus}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Section label */}
          <div className="mt-0.5 ml-4">
            <AnimatePresence mode="wait">
              <motion.span
                key={activeIdx}
                initial={{ x: 8, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -8, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="block text-[10px] truncate"
                style={{ color: '#64748b' }}
              >
                {current.label}
              </motion.span>
            </AnimatePresence>
          </div>
        </button>
      </motion.div>
    </div>
  );
}
