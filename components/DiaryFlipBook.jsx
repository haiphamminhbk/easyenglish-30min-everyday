'use client';

import React, { useState, useEffect, useRef, forwardRef, useMemo } from 'react';
import HTMLFlipBook from 'react-pageflip';
import FormattedNote from './FormattedNote';
import { formatDatePretty } from '@/lib/tracker';

const VIETNAMESE_DAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function getEntryDateDetails(dateStr) {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return {
        dayOfWeek: VIETNAMESE_DAYS[d.getDay()] || 'Ngày',
        formatted: `${parts[2]}/${parts[1]}/${parts[0]}`,
        dayNum: parts[2],
        monthYear: `Tháng ${parseInt(parts[1], 10)}/${parts[0]}`,
      };
    }
  } catch (e) {}
  return { dayOfWeek: 'Ngày', formatted: dateStr, dayNum: '--', monthYear: '' };
}

function playPageFlipSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const bufferSize = Math.floor(ctx.sampleRate * 0.12);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1400;
    filter.Q.value = 1.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.11);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch (e) {}
}

/* Aesthetic Teenager Cover Component */
const PageCover = forwardRef(({ children, className = '', isFront = true }, ref) => {
  return (
    <div
      ref={ref}
      className={`teen-diary-cover w-full h-full p-6 sm:p-8 flex flex-col justify-between select-none shadow-2xl ${className}`}
      data-density="hard"
    >
      <div className="teen-cover-border w-full h-full p-6 sm:p-7 flex flex-col justify-between text-center rounded-2xl relative shadow-inner">
        {children}
      </div>
    </div>
  );
});
PageCover.displayName = 'PageCover';

/* Aesthetic Ruled Paper Leaf Component */
const PageLeaf = forwardRef(({ children, number }, ref) => {
  return (
    <div
      ref={ref}
      className="diary-page-sheet w-full h-full p-6 sm:p-8 flex flex-col justify-between select-none border border-slate-200/80 dark:border-slate-800 relative overflow-hidden"
    >
      {/* Brushed Rose-Gold Paper Clip */}
      <div className="teen-paper-clip" />

      {/* Aesthetic Muted Washi Tape */}
      <div className="absolute top-2 left-6 z-10 opacity-80">
        <span className="teen-washi-tape text-[9px] font-bold text-stone-600 dark:text-stone-300 tracking-wider">
          ★ DAILY NOTES ★
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1.5 pb-2 pt-3 teen-notebook-margin">
        {children}
      </div>

      {/* Page Footer */}
      <div className="pt-3 mt-2 border-t border-dashed border-stone-300/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-stone-400 font-semibold shrink-0">
        <span className="flex items-center gap-1 text-stone-500 dark:text-stone-400 font-medium">
          <span>🌿</span> <span>Focus & Progress</span>
        </span>
        <span className="bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300 px-2.5 py-0.5 rounded-full font-bold border border-stone-200 dark:border-slate-700">
          - {number} -
        </span>
      </div>
    </div>
  );
});
PageLeaf.displayName = 'PageLeaf';

export default function DiaryFlipBook({ entries = [], userName = 'bạn', isOpen = false, onClose }) {
  const flipBookRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'study' | 'work'

  const filteredEntries = useMemo(() => {
    if (filterMode === 'study') {
      return entries.filter((e) => e.hasStudy && e.studyNote);
    }
    if (filterMode === 'work') {
      return entries.filter((e) => e.hasWork && e.workNote);
    }
    return entries;
  }, [entries, filterMode]);

  // Handle keydown for left/right page flip or Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      } else if (e.key === 'Escape') {
        if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrevPage = () => {
    if (flipBookRef.current) {
      playPageFlipSound();
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const handleNextPage = () => {
    if (flipBookRef.current) {
      playPageFlipSound();
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const handleJumpToPage = (targetPageIndex) => {
    if (flipBookRef.current) {
      playPageFlipSound();
      flipBookRef.current.pageFlip().flip(targetPageIndex);
    }
  };

  const onFlip = (e) => {
    setCurrentPage(e.data);
    playPageFlipSound();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      {/* Minimalist Frosted Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center text-base z-50 backdrop-blur-md transition-all shadow-xl hover:scale-105 active:scale-95 border border-white/15"
        title="Đóng sổ (Esc)"
        aria-label="Đóng sổ"
      >
        ✕
      </button>

      {/* 3D Physical Book Stack Container */}
      <div className="relative w-full max-w-xl h-[88vh] max-h-[760px] flex items-center justify-center mx-auto teen-book-stack">
        <div className="w-full h-full flex items-center justify-center flipbook-container">
          <HTMLFlipBook
            width={480}
            height={640}
            size="stretch"
            minWidth={300}
            maxWidth={560}
            minHeight={420}
            maxHeight={740}
            maxShadowOpacity={0.4}
            usePortrait={true}
            showCover={true}
            mobileScrollSupport={true}
            className="rounded-2xl w-full mx-auto"
            ref={flipBookRef}
            onFlip={onFlip}
          >
            {/* FRONT COVER (Aesthetic Muted Palette) */}
            <PageCover isFront={true}>
              <div className="w-full pt-1">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">🌿</span>
                  <span className="text-3xl">☕</span>
                  <span className="text-2xl">📖</span>
                </div>
                
                <div className="inline-block px-3 py-0.5 rounded-full bg-stone-800/70 text-stone-300 text-[10px] font-bold uppercase tracking-widest border border-stone-700/80 mb-2">
                  ★ DAILY BULLET JOURNAL ★
                </div>
                
                <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-stone-100 tracking-tight leading-tight">
                  NHẬT KÍ CỦA TÔI
                </h2>
                <p className="text-xs text-stone-300/90 mt-1.5 font-medium">
                  Easy English & Workflow • 30 Phút Mỗi Ngày
                </p>
              </div>

              {/* Owner Sticker Badge */}
              <div className="my-4 p-4 rounded-2xl bg-slate-900/75 border border-stone-700/70 text-left shadow-lg relative transform -rotate-1 hover:rotate-0 transition-transform">
                <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-md bg-stone-700 text-stone-200 font-bold text-[9px] uppercase border border-stone-600">
                  ★ Owner ★
                </div>
                <div className="text-[11px] text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span>🐾</span> <span>Cuốn sổ của:</span>
                </div>
                <div className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
                  <span>{userName || 'Bạn'}</span>
                  <span className="text-base">✨</span>
                </div>
                <div className="text-xs text-stone-300 mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800 font-medium">
                  <span>Số ngày đã lưu lại:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-200 font-bold border border-stone-700">
                    {filteredEntries.length} ngày 🎯
                  </span>
                </div>
              </div>

              {/* Motivational Tag & Flip Button */}
              <div className="w-full pb-1">
                <div className="text-[11px] italic text-stone-300/80 mb-3 font-normal">
                  “Small daily improvements over time lead to stunning results 🌿”
                </div>
                <button
                  type="button"
                  onClick={handleNextPage}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-stone-900 bg-gradient-to-r from-stone-200 via-amber-100 to-stone-200 hover:from-stone-100 hover:to-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Lật mở sổ tay</span>
                  <span>📖 →</span>
                </button>
              </div>
            </PageCover>

            {/* PAGE 1: TABLE OF CONTENTS (Aesthetic Index) */}
            <PageLeaf number={1}>
              <div className="pb-3 mb-3.5 border-b border-dashed border-stone-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span className="text-lg">📑</span>
                    <span>MỤC LỤC SỔ TAY</span>
                  </h3>
                  <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                    {filteredEntries.length} ngày
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Nhấn vào ngày để lật thẳng tới trang đó:
                </p>

                {/* Aesthetic Filter Tabs */}
                <div className="flex items-center gap-1.5 mt-3">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      filterMode === 'all'
                        ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-xs'
                        : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200/80'
                    }`}
                  >
                    🌱 Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('study')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      filterMode === 'study'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/80 border border-emerald-200/60 dark:border-emerald-900/60'
                    }`}
                  >
                    📚 Học tập
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('work')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      filterMode === 'work'
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100/80 border border-amber-200/60 dark:border-amber-900/60'
                    }`}
                  >
                    💼 Công việc
                  </button>
                </div>
              </div>

              {/* Table of Contents List or Empty State */}
              {filteredEntries.length === 0 ? (
                <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-slate-800 flex items-center justify-center text-2xl mb-3 shadow-inner">
                    ✍️
                  </div>
                  <h4 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                    Chưa có bài ghi chép nào
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs leading-relaxed">
                    Hãy hoàn thành phiên 30 phút hôm nay để viết trang nhật kí đầu tiên nhé!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredEntries.map((entry, idx) => {
                    const details = getEntryDateDetails(entry.dateStr);
                    const targetPageNumber = idx + 2;

                    return (
                      <button
                        key={entry.dateStr}
                        type="button"
                        onClick={() => handleJumpToPage(targetPageNumber)}
                        className="w-full p-3 rounded-2xl bg-white/90 dark:bg-slate-800/80 hover:bg-stone-50 dark:hover:bg-slate-700/80 border border-stone-200/80 dark:border-slate-700/70 transition-all text-left flex items-center justify-between group shadow-2xs hover:shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-stone-300 flex items-center justify-center font-bold text-sm">
                            {idx % 3 === 0 ? '🌿' : idx % 3 === 1 ? '☕' : '📖'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {details.dayOfWeek}, {details.formatted}
                            </div>
                            <div className="text-[10px] text-stone-400 font-medium mt-0.5">
                              {entry.studyNote ? 'Học tiếng Anh' : ''}
                              {entry.studyNote && entry.workNote ? ' • ' : ''}
                              {entry.workNote ? 'Công việc' : ''}
                            </div>
                          </div>
                        </div>

                        <div className="text-xs font-bold text-stone-600 dark:text-stone-300 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          <span>Trang {targetPageNumber}</span>
                          <span>→</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </PageLeaf>

            {/* ENTRIES PAGES OR EMPTY STATE LEAF */}
            {filteredEntries.length === 0 ? (
              <PageLeaf number={2}>
                <div className="h-full flex flex-col items-center justify-center text-center py-10 px-4">
                  <div className="w-16 h-16 rounded-3xl bg-stone-100 dark:bg-slate-800 flex items-center justify-center text-3xl mb-4 shadow-inner">
                    🌿
                  </div>
                  <h3 className="font-heading font-bold text-base text-slate-800 dark:text-slate-200 mb-1.5">
                    Trang nhật kí đầu tiên đang chờ bạn
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs leading-relaxed mb-4">
                    Dành 30 phút tập trung mỗi ngày là bước đệm vững chắc cho sự tiến bộ vượt bậc.
                  </p>
                  <div className="px-3.5 py-1.5 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300 text-xs font-bold border border-stone-200 dark:border-slate-700">
                    ✨ Bắt đầu phiên học hoặc làm việc hôm nay
                  </div>
                </div>
              </PageLeaf>
            ) : (
              filteredEntries.map((entry, idx) => {
                const details = getEntryDateDetails(entry.dateStr);
                const pageNum = idx + 2;

                return (
                  <PageLeaf key={entry.dateStr} number={pageNum}>
                    {/* Postmark Header */}
                    <div className="pb-3 mb-3 border-b border-dashed border-stone-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-slate-800 text-stone-800 dark:text-stone-100 flex flex-col items-center justify-center font-bold border border-stone-200 dark:border-slate-700 shadow-2xs">
                            <span className="text-[8px] uppercase leading-none font-bold tracking-wider text-stone-500 dark:text-stone-400">
                              {details.dayOfWeek.slice(0, 3)}
                            </span>
                            <span className="text-sm font-extrabold leading-none mt-0.5">
                              {details.dayNum}
                            </span>
                          </div>
                          <div>
                            <div className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                              <span>{details.dayOfWeek}, {details.formatted}</span>
                            </div>
                            <div className="text-[11px] text-stone-400 font-medium">{details.monthYear}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {entry.studyNote && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                              📚 Học tập
                            </span>
                          )}
                          {entry.workNote && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                              💼 Công việc
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Note Contents */}
                    <div className="space-y-4 text-xs sm:text-sm">
                      {/* Study Notes */}
                      {entry.studyNote && (filterMode === 'all' || filterMode === 'study') && (
                        <div className="bg-white/85 dark:bg-slate-800/70 p-4 rounded-2xl border border-stone-200/80 dark:border-slate-700/60 shadow-2xs">
                          {entry.workNote && filterMode === 'all' && (
                            <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-1.5 pb-1.5 border-b border-emerald-100 dark:border-emerald-900/40">
                              <span>📚</span> <span>Bài học tiếng Anh hôm nay:</span>
                            </div>
                          )}
                          <FormattedNote content={entry.studyNote} />
                        </div>
                      )}

                      {/* Work Notes */}
                      {entry.workNote && (filterMode === 'all' || filterMode === 'work') && (
                        <div className="bg-white/85 dark:bg-slate-800/70 p-4 rounded-2xl border border-stone-200/80 dark:border-slate-700/60 shadow-2xs">
                          {entry.studyNote && filterMode === 'all' && (
                            <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-1.5 pb-1.5 border-b border-amber-100 dark:border-amber-900/40">
                              <span>💼</span> <span>Nhiệm vụ công việc hoàn thành:</span>
                            </div>
                          )}
                          <FormattedNote content={entry.workNote} />
                        </div>
                      )}
                    </div>
                  </PageLeaf>
                );
              })
            )}

            {/* BACK COVER */}
            <PageCover isFront={false}>
              <div className="w-full pt-3">
                <div className="text-3xl mb-2">🌿</div>
                <div className="inline-block px-3 py-0.5 rounded-full bg-stone-800/70 text-stone-300 text-[10px] font-bold uppercase tracking-widest border border-stone-700/80 mb-2">
                  ★ KEEP GOING ★
                </div>
                <h3 className="font-heading text-2xl font-bold text-white">
                  BẠN ĐANG LÀM RẤT TỐT!
                </h3>
                <p className="text-xs text-stone-300 mt-1 font-normal">
                  Believe you can and you are halfway there
                </p>
              </div>

              <div className="my-5 p-4 sm:p-5 rounded-2xl bg-slate-900/75 border border-stone-700/70 text-xs text-stone-200 text-left space-y-2 shadow-inner">
                <div className="flex items-center gap-1.5 text-stone-300 font-bold">
                  <span>💡</span> <span>Lời nhắn cho bạn:</span>
                </div>
                <p className="leading-relaxed text-stone-300 font-normal">
                  30 phút mỗi ngày tuy nhỏ nhưng sau 365 ngày bạn sẽ có <strong>182.5 giờ</strong> rèn luyện chuyên sâu. Hãy giữ vững ngọn lửa này nhé!
                </p>
              </div>

              <div className="w-full pb-2">
                <button
                  type="button"
                  onClick={() => handleJumpToPage(0)}
                  className="w-full py-3 px-5 rounded-xl font-bold text-xs text-stone-900 bg-stone-200 hover:bg-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>↺ Về trang bìa đầu tiên</span>
                </button>
              </div>
            </PageCover>
          </HTMLFlipBook>
        </div>
      </div>
    </div>
  );
}
