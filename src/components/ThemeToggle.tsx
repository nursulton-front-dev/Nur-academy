import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Animated light/dark theme switch. Shared by the public Layout topbar and the
 * internal AppTopbar so both surfaces stay visually identical.
 */
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`w-[60px] h-[30px] rounded-full p-[3px] transition-all duration-500 relative flex items-center flex-shrink-0 overflow-hidden cursor-pointer ${
        isDark
          ? 'bg-gradient-to-r from-[#0f172a] to-[#1e1b4b] shadow-[inset_0_2px_6px_rgba(0,0,0,0.7)]'
          : 'bg-gradient-to-r from-[#38bdf8] to-[#7dd3fc] shadow-[inset_0_2px_6px_rgba(0,0,0,0.08)]'
      }`}
      aria-label="Toggle theme"
    >
      {/* Light mode clouds */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-0' : 'opacity-40'}`}>
        <div className="absolute top-[4px] right-[6px] w-3 h-1.5 bg-white rounded-full" />
        <div className="absolute top-[10px] right-[14px] w-5 h-2 bg-white rounded-full" />
      </div>

      {/* Dark mode stars */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-70' : 'opacity-0'}`}>
        <div className="absolute top-[5px] left-[7px] w-[2px] h-[2px] bg-white rounded-full animate-pulse" />
        <div className="absolute top-[14px] left-[12px] w-[3px] h-[3px] bg-yellow-200 rounded-full opacity-80" />
      </div>

      {/* Knob */}
      <div
        className={`w-[24px] h-[24px] rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.68,-0.15,0.27,1.35)] ${
          isDark
            ? 'translate-x-[29px] bg-gradient-to-br from-[#e2e8f0] to-[#cbd5e1] shadow-[0_0_10px_rgba(203,213,225,0.4),0_2px_4px_rgba(0,0,0,0.2)]'
            : 'translate-x-0 bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] shadow-[0_0_10px_rgba(251,191,36,0.5),0_2px_4px_rgba(0,0,0,0.1)]'
        }`}
      >
        {isDark ? (
          <svg className="w-[12px] h-[12px] text-[#475569]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.52.32-1.79z"/>
          </svg>
        ) : (
          <svg className="w-[12px] h-[12px] text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        )}
      </div>
    </button>
  );
}
