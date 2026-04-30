import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HEX_PATH = 'M20 2 L36.66 11 L36.66 29 L20 38 L3.34 29 L3.34 11 Z';
const HEX_PERIMETER = 145;

const INIT_TEXT = 'Initializing secure connection...';
const DONE_TEXT = 'Connection established ✓';

export function Preloader() {
  const [visible, setVisible] = useState(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('preloaderShown')) {
      return false;
    }
    return true;
  });
  const [typedText, setTypedText] = useState('');
  const [phase, setPhase] = useState<'init' | 'done' | 'exit'>('init');
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
      }, 18);
    }, 800);

    const doneTimer = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPhase('done');
      setTypedText(DONE_TEXT);
    }, 1400);

    const exitTimer = setTimeout(() => setPhase('exit'), 1700);
    const removeTimer = setTimeout(() => setVisible(false), 2000);

    return () => {
      clearTimeout(typeStart);
      clearTimeout(doneTimer);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {phase !== 'exit' ? (
        <motion.div
          key="preloader"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ backgroundColor: '#050816' }}
        >
          <div className="relative" style={{ width: 80, height: 80 }}>
            <svg
              viewBox="0 0 40 40"
              width={80}
              height={80}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              shapeRendering="geometricPrecision"
            >
              <defs>
                <linearGradient id="preloader-hex-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00e5ff" />
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
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />

              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3, ease: 'easeOut' }}
              >
                <text
                  x="20"
                  y="21"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="'Space Grotesk', -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
                  fontWeight="700"
                  fontSize="14"
                >
                  <tspan fill="#00e5ff">V</tspan>
                  <tspan fill="#a855f7" dx="0.5">P</tspan>
                </text>
              </motion.g>
            </svg>
          </div>

          <motion.div
            className="mt-6 h-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.2 }}
          >
            <span
              className="font-mono text-xs"
              style={{
                color: phase === 'done' ? undefined : '#64748b',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
              }}
            >
              {phase === 'done' ? (
                <>
                  <span style={{ color: '#64748b' }}>Connection established </span>
                  <span style={{ color: '#22d3ee' }}>✓</span>
                </>
              ) : (
                typedText
              )}
              {phase === 'init' && (
                <span className="animate-terminal-blink" style={{ color: '#64748b' }}>▌</span>
              )}
            </span>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="preloader-exit"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ backgroundColor: '#050816' }}
        />
      )}
    </AnimatePresence>
  );
}
