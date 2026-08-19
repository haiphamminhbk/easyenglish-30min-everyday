'use client';

import { useEffect, useState } from 'react';

export default function ModeToggle({ mode = 'study', onModeChange, className = '' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`w-32 h-8 ${className}`} />;
  }

  const isWork = mode === 'work';

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-inner transition-colors duration-300 ${className}`}
      role="group"
      aria-label="Chế độ theo dõi"
    >
      <button
        type="button"
        onClick={() => onModeChange && onModeChange('study')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
          !isWork
            ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-sm border border-indigo-100/80 dark:border-indigo-500 scale-[1.02]'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
        title="Chuyển sang chế độ Học tập"
      >
        <span className="text-xs">📚</span>
        <span>Học tập</span>
      </button>

      <button
        type="button"
        onClick={() => onModeChange && onModeChange('work')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
          isWork
            ? 'bg-white dark:bg-amber-600 text-amber-700 dark:text-white shadow-sm border border-amber-200/80 dark:border-amber-500 scale-[1.02]'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
        title="Chuyển sang chế độ Công việc"
      >
        <span className="text-xs">💼</span>
        <span>Công việc</span>
      </button>
    </div>
  );
}
