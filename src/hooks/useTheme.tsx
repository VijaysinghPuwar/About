import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

/**
 * Two operating modes, one accent.
 *
 * `default` is the defensive posture (green accent), `pentest` the offensive
 * one (red). The surface ramp is identical in both — only the accent token
 * moves — so the switch reads as a change of stance rather than a different
 * site.
 *
 * The previous implementation wrapped this in a 1.1s cinematic: a full-screen
 * scan line, RGB-shift glitch layers, an expanding energy pulse and a
 * synthesized WebAudio click, with the actual class swap delayed 400ms behind
 * it. All of that has been removed. The class swaps immediately and CSS
 * transitions cross-fade the colours in 250ms.
 */
type Theme = 'default' | 'pentest';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isPentest: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('pentest-mode') as Theme) || 'default';
    }
    return 'default';
  });

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

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'default' ? 'pentest' : 'default');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isPentest: theme === 'pentest' }}>
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
