import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'neon' | 'classic';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'neon',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem('wts-theme') as Theme) ?? 'classic',
  );

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem('wts-theme', t);
    document.documentElement.dataset.theme = t;
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
