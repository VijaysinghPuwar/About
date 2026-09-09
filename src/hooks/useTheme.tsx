import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { runThemeSweep } from '@/lib/theme-transition';

/**
 * Two operating modes, one accent.
 *
 * `security` is the defensive posture (green accent), `pentest` the offensive
 * one (red). The surface ramp is identical in both, so the switch reads as a
 * change of stance rather than a different site.
 *
 * The mode is not only a palette. Sections read `mode` to pick which copy they
 * render: the terminal changes host and transcript, the hero schematic draws a
 * detection loop or an attack chain. That is why the value is exposed as
 * `mode` and not just as the `isPentest` boolean it used to be.
 *
 * `setTheme` swaps the class immediately, which is the honest primitive and
 * what any programmatic caller wants. `toggleTheme` is the one the visible
 * control uses, and it routes the same swap through the shutter in
 * `@/lib/theme-transition`: the plates close, the class changes while nothing
 * is visible, the plates open. Under `prefers-reduced-motion` the shutter is a
 * no-op wrapper and the two paths are identical.
 */
export type Theme = 'security' | 'pentest';

/** Shared with the pre-paint guard in index.html. Change both or neither. */
const STORAGE_KEY = 'vj-mode';

/**
 * The mode used to be stored under `pentest-mode` as `default` | `pentest`.
 * A returning visitor still has that key, so it is read once and translated
 * rather than silently dropping them back to defensive mode.
 */
function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'security';
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current === 'security' || current === 'pentest') return current;
    const legacy = localStorage.getItem('pentest-mode');
    if (legacy === 'pentest') return 'pentest';
  } catch {
    /* Storage can throw outright in a locked-down browser profile. */
  }
  return 'security';
}

interface ThemeContextType {
  theme: Theme;
  /** Alias of `theme`, named for the sections that switch copy rather than colour. */
  mode: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isPentest: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  const applyThemeClass = useCallback((t: Theme) => {
    const root = document.documentElement;
    root.classList.remove('theme-security', 'theme-pentest', 'theme-default', 'theme-blue');
    root.classList.add(`theme-${t}`);
    root.dataset.mode = t;
    try {
      localStorage.setItem(STORAGE_KEY, t);
      localStorage.removeItem('pentest-mode');
    } catch {
      /* A visitor who blocks storage still gets the mode, just not the memory. */
    }
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
    const next: Theme = theme === 'security' ? 'pentest' : 'security';
    runThemeSweep(next, () => setTheme(next));
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme, mode: theme, setTheme, toggleTheme, isPentest: theme === 'pentest' }}
    >
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
