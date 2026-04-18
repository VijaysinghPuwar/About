import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Theme = 'default' | 'pentest';
type TransitionDirection = 'to-pentest' | 'to-default' | null;
type TransitionOrigin = { x: number; y: number } | null;

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: (origin?: { x: number; y: number }) => void;
  isPentest: boolean;
  isTransitioning: boolean;
  transitionDirection: TransitionDirection;
  transitionOrigin: TransitionOrigin;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const SWAP_DELAY = 400;
const TOTAL_DURATION = 1100;

// Synthesized cyber click — short FM-ish sweep + noise burst
function playCyberClick(toPentest: boolean) {
  try {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('theme-sound') === 'off') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    if (!AC) return;
    const ctx = new AC();
    const now = ctx.currentTime;
    const dur = 0.14;

    // Tone sweep
    const osc = ctx.createOscillator();
    const oGain = ctx.createGain();
    osc.type = toPentest ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(toPentest ? 900 : 700, now);
    osc.frequency.exponentialRampToValueAtTime(toPentest ? 180 : 260, now + dur);
    oGain.gain.setValueAtTime(0.0001, now);
    oGain.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
    oGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(oGain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);

    // Noise burst
    const bufSize = Math.floor(ctx.sampleRate * 0.05);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const nGain = ctx.createGain();
    nGain.gain.value = 0.06;
    noise.connect(nGain).connect(ctx.destination);
    noise.start(now);

    setTimeout(() => ctx.close(), 400);
  } catch {
    // ignore
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('pentest-mode') as Theme) || 'default';
    }
    return 'default';
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>(null);
  const [transitionOrigin, setTransitionOrigin] = useState<TransitionOrigin>(null);

  const applyThemeClass = useCallback((t: Theme) => {
    const root = document.documentElement;
    root.classList.remove('theme-default', 'theme-pentest');
    root.classList.add(`theme-${t}`);
    localStorage.setItem('pentest-mode', t);
  }, []);

  useEffect(() => {
    applyThemeClass(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyThemeClass(t);
  }, [applyThemeClass]);

  const toggleTheme = useCallback((origin?: { x: number; y: number }) => {
    if (isTransitioning) return;

    const nextTheme: Theme = theme === 'default' ? 'pentest' : 'default';
    const direction: TransitionDirection = nextTheme === 'pentest' ? 'to-pentest' : 'to-default';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setThemeState(nextTheme);
      applyThemeClass(nextTheme);
      return;
    }

    // Default to screen center
    setTransitionOrigin(
      origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    );
    setIsTransitioning(true);
    setTransitionDirection(direction);
    document.documentElement.classList.add('theme-shifting');

    playCyberClick(nextTheme === 'pentest');

    setTimeout(() => {
      setThemeState(nextTheme);
      applyThemeClass(nextTheme);
    }, SWAP_DELAY);

    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionDirection(null);
      setTransitionOrigin(null);
      document.documentElement.classList.remove('theme-shifting');
    }, TOTAL_DURATION);
  }, [theme, isTransitioning, applyThemeClass]);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      isPentest: theme === 'pentest',
      isTransitioning,
      transitionDirection,
      transitionOrigin,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
