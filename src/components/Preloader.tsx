import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HEX_PATH = 'M20 2 L36.66 11 L36.66 29 L20 38 L3.34 29 L3.34 11 Z';
const HEX_GLOW_PATH = 'M20 0.5 L37.86 10.25 L37.86 29.75 L20 39.5 L2.14 29.75 L2.14 10.25 Z';
const HEX_PERIMETER = 145; // approximate path length

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

    // Type out init text from 0.8s to 1.4s (600ms for ~30 chars ≈ 20ms/char)
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

    // Switch to done text at 1.4s
    const doneTimer = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPhase('done');
      setTypedText(DONE_TEXT);
    }, 1400);

    // Start exit at 1.7s
    const exitTimer = setTimeout(() => setPhase('exit'), 1700);

    // Remove at 2.0s
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
          {/* Logo SVG with draw-on animation */}
          <div className="relative" style={{ width: 80, height: 80 }}>
            <svg viewBox="0 0 40 40" width={80} height={80} fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="preloader-hex-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>

              {/* Glow hexagon - pulses at 0.8s */}
              <motion.path
                d={HEX_GLOW_PATH}
                stroke="url(#preloader-hex-grad)"
                strokeWidth="0.8"
                fill="none"
                initial={{ opacity: 0, scale: 1 }}
                animate={{
                  opacity: [0, 0, 0.3, 0],
                  scale: [1, 1, 1.3, 1.3],
                }}
                transition={{
                  duration: 1.2,
                  times: [0, 0.67, 0.83, 1],
                  ease: 'easeOut',
                }}
                style={{ transformOrigin: '20px 20px' }}
              />

              {/* Inner hexagon - stroke draw on 0-0.4s */}
              <motion.path
                d={HEX_PATH}
                stroke="url(#preloader-hex-grad)"
                strokeWidth="1.2"
                fill="none"
                strokeDasharray={HEX_PERIMETER}
                initial={{ strokeDashoffset: HEX_PERIMETER }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />

              {/* V letter - fades in 0.4-0.7s */}
              <motion.text
                x="14.5"
                y="26"
                fontFamily="'Space Grotesk', system-ui, sans-serif"
                fontWeight="700"
                fontSize="15"
                fill="#00e5ff"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3, ease: 'easeOut' }}
              >
                V
              </motion.text>

              {/* P letter - fades in 0.5-0.8s */}
              <motion.text
                x="22"
                y="26"
                fontFamily="'Space Grotesk', system-ui, sans-serif"
                fontWeight="700"
                fontSize="15"
                fill="#a855f7"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3, ease: 'easeOut' }}
              >
                P
              </motion.text>
            </svg>
          </div>

          {/* Typing text */}
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
