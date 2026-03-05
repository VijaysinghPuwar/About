import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'default' | 'pentest';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isPentest: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('pentest-mode') as Theme) || 'default';
    }
    return 'default';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-default', 'theme-pentest');
    root.classList.add(`theme-${theme}`);
    localStorage.setItem('pentest-mode', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'default' ? 'pentest' : 'default');
  };

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
