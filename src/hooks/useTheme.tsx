import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Theme = 'default' | 'pentest';
type TransitionDirection = 'to-pentest' | 'to-default' | null;

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isPentest: boolean;
  isTransitioning: boolean;
  transitionDirection: TransitionDirection;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const SWAP_DELAY = 400;
const TOTAL_DURATION = 1100;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('pentest-mode') as Theme) || 'default';
    }
    return 'default';
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>(null);

  // Apply theme class (used both on init and mid-transition)
  const applyThemeClass = useCallback((t: Theme) => {
    const root = document.documentElement;
    root.classList.remove('theme-default', 'theme-pentest');
    root.classList.add(`theme-${t}`);
    localStorage.setItem('pentest-mode', t);
  }, []);

  // Initial mount — apply class without transition
  useEffect(() => {
    applyThemeClass(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyThemeClass(t);
  }, [applyThemeClass]);

  const toggleTheme = useCallback(() => {
    if (isTransitioning) return;

    const nextTheme: Theme = theme === 'default' ? 'pentest' : 'default';
    const direction: TransitionDirection = nextTheme === 'pentest' ? 'to-pentest' : 'to-default';

    // Check reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setThemeState(nextTheme);
      applyThemeClass(nextTheme);
      return;
    }

    setIsTransitioning(true);
    setTransitionDirection(direction);

    // Swap theme class at midpoint
    setTimeout(() => {
      setThemeState(nextTheme);
      applyThemeClass(nextTheme);
    }, SWAP_DELAY);

    // End transition
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionDirection(null);
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
