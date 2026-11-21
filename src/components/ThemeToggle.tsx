import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Modern, clean theme toggle for Nur Academy.
 * Smooth 200ms transition with high-contrast accessible feedback.
 */
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="relative flex items-center h-8 w-14 rounded-full p-1 bg-surface-muted border border-border-card hover:border-accent-blue/40 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-accent-blue shrink-0"
      aria-label={isDark ? "Yorug‘ rejimga o‘tish" : "Qorong‘i rejimga o‘tish"}
      title={isDark ? "Yorug‘ rejimga o‘tish" : "Qorong‘i rejimga o‘tish"}
    >
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 ease-out ${
          isDark
            ? 'translate-x-6 bg-accent-blue text-white'
            : 'translate-x-0 bg-white text-amber-500 border border-slate-200/60'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5" />
        ) : (
          <Sun className="w-3.5 h-3.5" />
        )}
      </span>
      <span className="sr-only">{isDark ? 'Yorug‘ rejim' : 'Qorong‘i rejim'}</span>
    </button>
  );
}
