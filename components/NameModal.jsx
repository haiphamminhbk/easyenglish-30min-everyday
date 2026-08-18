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
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-xl font-bold text-gray-800 mb-2">👋 Xin chào!</h3>
        <p className="text-sm text-gray-600 mb-4">Bạn tên là gì nhỉ?</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên của bạn..."
          className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          autoFocus
        />
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-md"
          >
            Lưu tên
          </button>
        </div>
      </div>
    </div>
  );
}
