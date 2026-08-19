'use client';

import { useState, useEffect } from 'react';
import RichWordEditor from './RichWordEditor';

export default function NoteModal({ isOpen, initialNote, onClose, onConfirm }) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNote(initialNote || '');
    }
  }, [isOpen, initialNote]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 rounded-2xl p-6 w-full max-w-xl shadow-2xl transform transition-all duration-200">
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
          <span>🎉</span>
          <span>Ghi chú bài học hôm nay</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
          Bạn đã học gì trong 30 phút qua? Sử dụng trình soạn thảo Word để định dạng và ghi chú từ vựng & cấu trúc.
        </p>

        <RichWordEditor
          value={note}
          onChange={setNote}
          placeholder="Ví dụ: Đã học 10 từ vựng chủ đề du lịch, luyện phát âm /θ/ và /ð/, làm bài tập thì hiện tại đơn..."
          minHeight="220px"
        />

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirm(note)}
            className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl transition-all shadow-md active:scale-95"
          >
            Xác nhận & Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
