'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('App runtime error caught:', error);
  }, [error]);

  return (
    <main className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10 mx-auto text-center dark:text-slate-100 shadow-2xl border border-rose-500/20 dark:border-rose-900/40 animate-fadeIn">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-3xl border border-rose-500/30">
        ⚠️
      </div>

      <h1 className="text-xl sm:text-2xl font-black mb-2 text-rose-600 dark:text-rose-400">
        Đã xảy ra sự cố
      </h1>

      <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
        {error?.message || 'Hệ thống gặp lỗi không mong muốn trong quá trình xử lý.'}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
        >
          🔄 Thử lại
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 transition-all border border-slate-200 dark:border-slate-700"
        >
          🏠 Trang chủ
        </Link>
      </div>
    </main>
  );
}
