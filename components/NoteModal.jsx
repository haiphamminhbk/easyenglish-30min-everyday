'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const RichWordEditor = dynamic(() => import('./RichWordEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full border border-gray-200 dark:border-slate-700 rounded-2xl p-6 min-h-[180px] bg-slate-50/60 dark:bg-slate-800/60 animate-pulse flex items-center justify-center text-slate-400 text-xs font-semibold">
      Đang tải trình soạn thảo...
    </div>
  ),
});

export default function NoteModal({ isOpen, initialNote, mode = 'study', onClose, onConfirm }) {
  const [note, setNote] = useState('');
  const isWork = mode === 'work';

  useEffect(() => {
    if (isOpen) {
      setNote(initialNote || '');
    }
  }, [isOpen, initialNote]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm z-50 overflow-y-auto p-3 pt-3 pb-16 sm:p-4 sm:pb-6 flex items-start sm:items-center justify-center">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 rounded-2xl p-4 sm:p-6 w-full max-w-xl shadow-2xl transform transition-all duration-200 my-2 sm:my-auto">
        {/* Textintro: Title & Description */}
        <div className="mb-3">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
            <span>{isWork ? '💼' : '🎉'}</span>
            <span>{isWork ? 'Ghi chú công việc & nhiệm vụ hôm nay' : 'Ghi chú bài học hôm nay'}</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {isWork
              ? 'Bạn đã hoàn thành những gì trong 30 phút tập trung qua? Ghi lại danh sách nhiệm vụ, kết quả cuộc họp, sự kiện hoặc ghi chú bàn giao.'
              : 'Bạn đã học gì trong 30 phút qua? Sử dụng trình soạn thảo để định dạng và ghi chú từ vựng, cấu trúc & ngữ pháp.'}
          </p>
        </div>

        {/* Textarea / RichWordEditor */}
        <RichWordEditor
          value={note}
          onChange={setNote}
          mode={mode}
          placeholder={
            isWork
              ? 'Ví dụ: Đã hoàn thành báo cáo tuần, xử lý 5 ticket khách hàng, chốt kế hoạch dự án sprint mới...'
              : 'Ví dụ: Đã học 10 từ vựng chủ đề du lịch, luyện phát âm /θ/ và /ð/, làm bài tập thì hiện tại đơn...'
          }
          minHeight="160px"
        />

        {/* Action Buttons */}
        <div className="mt-4 pt-1 flex justify-end gap-3 pb-2">
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
            className={`px-5 py-2 text-sm font-bold text-white rounded-xl transition-all shadow-md active:scale-95 ${
              isWork
                ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 shadow-amber-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-indigo-500/20'
            }`}
          >
            Xác nhận & Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
