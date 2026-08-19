'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read stored theme - default to dark if not set or if set to 'dark'
    const stored = localStorage.getItem('english_theme');
    if (stored === 'light') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('english_theme', nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) {
    return <div className={`w-9 h-9 ${className}`} />;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 shadow-sm border ${
        theme === 'dark'
          ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-slate-700/80 hover:border-amber-400/50 shadow-amber-500/10'
          : 'bg-white/90 hover:bg-white text-slate-700 border-slate-200/80 hover:border-indigo-300 shadow-slate-200/50'
      } active:scale-95 ${className}`}
      title={theme === 'dark' ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <>
          <span className="text-sm">☀️</span>
          <span>Sáng</span>
        </>
      ) : (
        <>
          <span className="text-sm">🌙</span>
          <span>Tối</span>
        </>
      )}
    </button>
  );
}
