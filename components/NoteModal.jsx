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
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl transform transition-all duration-200">
        <h3 className="text-xl font-bold text-gray-800 mb-1">🎉 Ghi chú bài học hôm nay</h3>
        <p className="text-xs text-gray-500 mb-3">
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
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirm(note)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-md"
          >
            Xác nhận & Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
