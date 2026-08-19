'use client';

import { useState, useEffect } from 'react';

export default function NameModal({ isOpen, currentName, onClose, onSave }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(currentName === 'bạn' ? '' : currentName);
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = name.trim() || 'bạn';
    onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
          <span>👋</span>
          <span>Xin chào!</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 font-medium">Bạn tên là gì nhỉ?</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên của bạn..."
          className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
          autoFocus
        />
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl transition-all shadow-md active:scale-95"
          >
            Lưu tên
          </button>
        </div>
      </div>
    </div>
  );
}
