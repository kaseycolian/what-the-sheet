import { useTheme } from '../../contexts/ThemeContext';
import type { Theme } from '../../contexts/ThemeContext';
import styles from './ThemeSelector.module.css';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'neon', label: 'Neon 90s' },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={styles.group} role="group" aria-label="Color theme">
      {THEMES.map(({ value, label }) => (
        <button
          key={value}
          className={`${styles.btn} ${theme === value ? styles.active : ''}`}
          onClick={() => setTheme(value)}
          aria-pressed={theme === value}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
