import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { runThemeSweep } from '@/lib/theme-transition';

/**
 * Two operating modes, one accent.
 *
 * `default` is the defensive posture (green accent), `pentest` the offensive
 * one (red). The surface ramp is identical in both — only the accent token
 * moves — so the switch reads as a change of stance rather than a different
 * site.
 *
 * `setTheme` swaps the class immediately — that is the honest primitive, and
 * what any programmatic caller wants. `toggleTheme` is the one the visible
 * control uses, and it routes the same swap through the shutter in
 * `@/lib/theme-transition`: the plates close, the class changes while nothing
 * is visible, the plates open. Under `prefers-reduced-motion` the shutter is a
 * no-op wrapper and the two paths are identical.
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
    const next: Theme = theme === 'default' ? 'pentest' : 'default';
    runThemeSweep(next, () => setTheme(next));
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
