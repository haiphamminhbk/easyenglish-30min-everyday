'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export default function ConfettiEffect({ mode = 'study', streak = 1, onComplete }) {
  const [visible, setVisible] = useState(true);
  const isWork = mode === 'work';

  const triggerConfetti = () => {
    // 1. Initial Side Cannons
    const count = 180;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio, opts) {
      try {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      } catch (err) {
        console.error('Confetti error:', err);
      }
    }

    // Left cannon
    fire(0.25, {
      spread: 45,
      startVelocity: 55,
      origin: { x: 0.15, y: 0.75 },
      colors: isWork
        ? ['#f59e0b', '#d97706', '#fbbf24', '#3b82f6', '#60a5fa']
        : ['#6366f1', '#4f46e5', '#10b981', '#f59e0b', '#ec4899'],
    });

    // Right cannon
    fire(0.25, {
      spread: 45,
      startVelocity: 55,
      origin: { x: 0.85, y: 0.75 },
      colors: isWork
        ? ['#f59e0b', '#d97706', '#fbbf24', '#3b82f6', '#60a5fa']
        : ['#6366f1', '#4f46e5', '#10b981', '#f59e0b', '#ec4899'],
    });

    // Center burst with stars & ribbons
    fire(0.2, {
      spread: 80,
      origin: { x: 0.5, y: 0.6 },
    });

    fire(0.2, {
      spread: 120,
      decay: 0.92,
      scalar: 1.2,
      shapes: ['star'],
      colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA3A', '#8AC926'],
      origin: { x: 0.5, y: 0.5 },
    });

    // Second wave 450ms later for fireworks feel
    const waveTimer = setTimeout(() => {
      try {
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 60,
          origin: { x: 0.05, y: 0.6 },
          zIndex: 9999,
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#a855f7'],
        });
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 60,
          origin: { x: 0.95, y: 0.6 },
          zIndex: 9999,
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#a855f7'],
        });
      } catch (e) {}
    }, 450);

    return waveTimer;
  };

  useEffect(() => {
    const waveTimer = triggerConfetti();

    // Auto dismiss after 5.5s
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, 5500);

    return () => {
      clearTimeout(waveTimer);
      clearTimeout(dismissTimer);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 200);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-all duration-300 animate-fadeIn"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-700/80 shadow-2xl text-center transform transition-all duration-300 scale-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect background inside modal */}
        <div
          className={`absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-60 pointer-events-none ${
            isWork ? 'bg-amber-400' : 'bg-indigo-500'
          }`}
        />

        {/* Top Trophy / Badge Icon */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 dark:from-amber-500 dark:via-yellow-400 dark:to-amber-300 shadow-lg shadow-amber-500/30 ring-4 ring-white dark:ring-slate-800 animate-bounce">
          <span className="text-4xl select-none">{isWork ? '🏆' : '🎉'}</span>
        </div>

        {/* Title */}
        <h3
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r ${
            isWork
              ? 'from-amber-600 via-orange-500 to-amber-700 dark:from-amber-400 dark:via-orange-300 dark:to-yellow-200'
              : 'from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300'
          }`}
        >
          {isWork ? 'Xuất Sắc Hoàn Thành!' : 'Chúc Mừng Hoàn Thành!'}
        </h3>

        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-5">
          {isWork
            ? 'Bạn đã hoàn thành mục tiêu công việc & nhiệm vụ hôm nay.'
            : 'Bạn đã hoàn thành trọn vẹn 30 phút rèn luyện tiếng Anh hôm nay.'}
        </p>

        {/* Streak Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-700/60 shadow-inner mb-5">
          <span className="text-2xl animate-pulse">🔥</span>
          <div className="text-left">
            <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">Chuỗi kiên trì hiện tại</div>
            <div className="text-lg font-bold text-amber-900 dark:text-amber-100">
              {streak} ngày liên tục!
            </div>
          </div>
        </div>

        {/* Motivational quote */}
        <div className="text-xs italic text-slate-500 dark:text-slate-400 mb-6 px-3">
          {isWork
            ? '“Sự tập trung và kiên trì mỗi ngày là chìa khóa mở ra những thành tựu lớn.”'
            : '“A journey of a thousand miles begins with a single step.”'}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleClose}
          className={`w-full py-3 px-6 rounded-xl font-bold text-white text-sm shadow-lg transform transition-all duration-150 active:scale-95 ${
            isWork
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25'
          }`}
        >
          Tuyệt vời! Tiếp tục phát huy ✨
        </button>
      </div>
    </div>
  );
}
