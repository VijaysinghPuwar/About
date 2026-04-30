import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HEX_PATH = 'M20 2 L36.66 11 L36.66 29 L20 38 L3.34 29 L3.34 11 Z';
const HEX_PERIMETER = 145;

const INIT_TEXT = 'Initializing secure connection...';

export function Preloader() {
  const [visible, setVisible] = useState(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('preloaderShown')) {
      return false;
    }
    return true;
  });
  const [typedText, setTypedText] = useState('');
  const [phase, setPhase] = useState<'init' | 'done'>('init');
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem('preloaderShown', 'true');

    const typeStart = setTimeout(() => {
      let i = 0;
      intervalRef.current = setInterval(() => {
        i++;
        setTypedText(INIT_TEXT.slice(0, i));
        if (i >= INIT_TEXT.length && intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }, 28);
    }, 700);

    const doneTimer = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPhase('done');
      setTypedText('');
    }, 1700);

    const removeTimer = setTimeout(() => setVisible(false), 2200);

    return () => {
      clearTimeout(typeStart);
      clearTimeout(doneTimer);
      clearTimeout(removeTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ backgroundColor: '#050816' }}
        >
          <div
            className="relative flex items-center justify-center"
            style={{ width: 80, height: 80 }}
          >
            <svg
              viewBox="0 0 40 40"
              width={80}
              height={80}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              shapeRendering="geometricPrecision"
              className="absolute inset-0"
            >
              <defs>
                <linearGradient id="preloader-hex-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <motion.path
                d={HEX_PATH}
                stroke="url(#preloader-hex-grad)"
                strokeWidth="1.5"
                fill="none"
                vectorEffect="non-scaling-stroke"
                strokeDasharray={HEX_PERIMETER}
                initial={{ strokeDashoffset: HEX_PERIMETER }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>

            <motion.span
              aria-hidden="true"
              className="relative z-10 select-none leading-none font-bold tracking-tight"
              style={{
                fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                fontSize: '28px',
                letterSpacing: '-0.02em',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.35, ease: 'easeOut' }}
            >
              <span style={{ color: '#3b82f6' }}>V</span>
              <span style={{ color: '#a855f7' }}>J</span>
            </motion.span>
          </div>

          <motion.div
            className="mt-6 h-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.25 }}
          >
            <span
              className="font-mono text-xs"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
              }}
            >
              {phase === 'done' ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <span style={{ color: '#64748b' }}>Connection established </span>
                  <span style={{ color: '#22d3ee' }}>✓</span>
                </motion.span>
              ) : (
                <>
                  <span style={{ color: '#64748b' }}>{typedText}</span>
                  <span className="animate-terminal-blink" style={{ color: '#64748b' }}>▌</span>
                </>
              )}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
