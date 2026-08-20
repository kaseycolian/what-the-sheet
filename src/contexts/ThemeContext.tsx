import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

/* Theme ids come from src/theme/themes.index.json (theme-service v1.2.0).
   '' means "Auto": no data-theme attribute, so theme.css renders the default
   (Rink Classic) — dark, or light under prefers-color-scheme: light. */
export type ThemeId = string;

const THEME_KEY = 'theme';
const MOTION_KEY = 'motion';
/* Key used by this app's previous, hand-rolled neon/classic theme system. */
const LEGACY_KEY = 'wts-theme';

type ThemeContextValue = {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  motionOff: boolean;
  setMotionOff: (off: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  themeId: '',
  setThemeId: () => {},
  motionOff: false,
  setMotionOff: () => {},
});

const root = () => document.documentElement;

export function ThemeProvider({ children }: { children: ReactNode }) {
  /* public/theme-init.js already applied the saved (or ?theme=) value before first
     paint. Read it back off <html> rather than re-deriving it, so we never clobber
     the pre-paint choice on mount. */
  const [themeId, setThemeIdState] = useState<ThemeId>(
    () => root().getAttribute('data-theme') ?? '',
  );
  const [motionOff, setMotionOffState] = useState<boolean>(
    () => root().getAttribute('data-motion') === 'off',
  );

  useEffect(() => {
    localStorage.removeItem(LEGACY_KEY);
  }, []);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    if (id) {
      root().setAttribute('data-theme', id);
      localStorage.setItem(THEME_KEY, id);
    } else {
      root().removeAttribute('data-theme');
      localStorage.removeItem(THEME_KEY);
    }
  }, []);

  const setMotionOff = useCallback((off: boolean) => {
    setMotionOffState(off);
    if (off) {
      root().setAttribute('data-motion', 'off');
      localStorage.setItem(MOTION_KEY, 'off');
    } else {
      root().removeAttribute('data-motion');
      localStorage.removeItem(MOTION_KEY);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, motionOff, setMotionOff }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
