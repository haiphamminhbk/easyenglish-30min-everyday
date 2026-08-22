'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getTodayString, formatDatePretty, calculateStreak } from '@/lib/tracker';
import {
  initStorage,
  saveStudyData,
  loadLocalData,
  getStoredMode,
  setStoredMode,
  loadAllDiaryEntries,
} from '@/lib/storage';
import FormattedNote from '@/components/FormattedNote';
import RichWordEditor from '@/components/RichWordEditor';
import ThemeToggle from '@/components/ThemeToggle';
import ModeToggle from '@/components/ModeToggle';
import ConfettiEffect from '@/components/ConfettiEffect';
import DiaryFlipBook from '@/components/DiaryFlipBook';

const VIETNAMESE_DAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDiaryDateDetails(dateStr) {
  if (!dateStr) return { dayOfWeekVi: '', dayOfWeekEn: '', dayNum: '--', monthYearVi: '', formatted: '' };
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const dayOfWeekVi = VIETNAMESE_DAYS[d.getDay()] || 'Ngày';
      const dayOfWeekEn = ENGLISH_DAYS[d.getDay()] || '';
      const dayNum = parts[2];
      const monthYearVi = `Tháng ${parseInt(parts[1], 10)}, ${parts[0]}`;
      const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
      return { dayOfWeekVi, dayOfWeekEn, dayNum, monthYearVi, formatted };
    }
  } catch (e) {}
  return { dayOfWeekVi: 'Ngày', dayOfWeekEn: '', dayNum: '--', monthYearVi: '', formatted: dateStr };
}

function getNoteStats(rawNote) {
  if (!rawNote) return { words: 0, bullets: 0, readTime: 1 };
  const textOnly = rawNote.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = textOnly ? textOnly.split(/\s+/).length : 0;
  const bullets = (rawNote.match(/<li>|<p>|•|- /gi) || []).length;
  const readTime = Math.max(1, Math.ceil(words / 120));
  return { words, bullets, readTime };
}

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState('study'); // 'study' | 'work'
  const [studyDates, setStudyDates] = useState([]);
  const [studyNotes, setStudyNotes] = useState({});
  const [currentDate, setCurrentDate] = useState('');
  const [today, setToday] = useState('');
  const [mounted, setMounted] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editNoteText, setEditNoteText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(1);
  const [isDiaryFlipBookOpen, setIsDiaryFlipBookOpen] = useState(false);
  const [allDiaryEntries, setAllDiaryEntries] = useState([]);

  const isWork = mode === 'work';

  // Sync mode and date from URL search param
  useEffect(() => {
    const todayStr = getTodayString();
    setToday(todayStr);
    setMounted(true);

    const modeParam = searchParams.get('mode');
    const activeMode = modeParam === 'work' ? 'work' : modeParam === 'study' ? 'study' : getStoredMode();
    setMode(activeMode);
    setStoredMode(activeMode);

    const dateParam = searchParams.get('date');
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      setCurrentDate(dateParam);
    } else {
      setCurrentDate(todayStr);
    }
  }, [searchParams]);

  // Load storage data
  useEffect(() => {
    const currentMode = getStoredMode();
    const initial = loadLocalData(currentMode);
    setStudyDates(initial.studyDates);
    setStudyNotes(initial.studyNotes);

    initStorage((data) => {
      const m = getStoredMode();
      if (m === 'work') {
        if (data.workDates) setStudyDates(data.workDates);
        if (data.workNotes) setStudyNotes(data.workNotes);
      } else {
        if (data.studyDates) setStudyDates(data.studyDates);
        if (data.studyNotes) setStudyNotes(data.studyNotes);
      }
    });
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setStoredMode(newMode);

    const loaded = loadLocalData(newMode);
    setStudyDates(loaded.studyDates);
    setStudyNotes(loaded.studyNotes);
    setIsEditing(false);

    router.push(`/review?date=${currentDate || today}&mode=${newMode}`);
  };

  const activeToday = today || (mounted ? getTodayString() : '');
  const activeDate = currentDate || activeToday;
  const isPastDate = Boolean(mounted && activeToday && activeDate && activeDate < activeToday);
  const isFutureDate = Boolean(mounted && activeToday && activeDate && activeDate > activeToday);
  const isCompleted = studyDates.includes(activeDate);
  const rawNote = studyNotes[activeDate]?.trim() || '';

  const dateDetails = useMemo(() => getDiaryDateDetails(activeDate), [activeDate]);
  const noteStats = useMemo(() => getNoteStats(rawNote), [rawNote]);

  // Dates with notes for Prev/Next navigation & Quick Jump
  const datesWithNotes = useMemo(() => {
    return Object.keys(studyNotes)
      .filter((d) => studyNotes[d] && studyNotes[d].trim().length > 0)
      .sort();
  }, [studyNotes]);

  const currentIndex = datesWithNotes.indexOf(activeDate);
  const totalEntries = datesWithNotes.length;

  const navigateToDate = (targetDate) => {
    setIsEditing(false);
    router.push(`/review?date=${targetDate}&mode=${mode}`);
  };

  const handlePrevLesson = () => {
    if (currentIndex > 0) {
      navigateToDate(datesWithNotes[currentIndex - 1]);
    } else if (datesWithNotes.length > 0) {
      const prevDates = datesWithNotes.filter((d) => d < activeDate);
      if (prevDates.length > 0) {
        navigateToDate(prevDates[prevDates.length - 1]);
      }
    }
  };

  const handleNextLesson = () => {
    if (currentIndex >= 0 && currentIndex < datesWithNotes.length - 1) {
      navigateToDate(datesWithNotes[currentIndex + 1]);
    } else if (datesWithNotes.length > 0) {
      const nextDates = datesWithNotes.filter((d) => d > activeDate);
      if (nextDates.length > 0) {
        navigateToDate(nextDates[0]);
      }
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!rawNote) return;
    try {
      await navigator.clipboard.writeText(rawNote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Không thể sao chép:', e);
    }
  };

  // Start editing (Only permitted for today)
  const handleStartEdit = () => {
    if (isPastDate) return;
    setEditNoteText(rawNote);
    setIsEditing(true);
  };

  // Save edited note (Only permitted for today)
  const handleSaveEdit = async () => {
    if (isPastDate) {
      alert(
        isWork
          ? 'Không thể chỉnh sửa nhật kí của những ngày trước đó. Nhật kí chỉ dùng để xem lại lịch sử.'
          : 'Không thể chỉnh sửa nhật kí của những ngày trước đó. Nhật kí chỉ dùng để ôn tập.'
      );
      setIsEditing(false);
      return;
    }

    const updatedNotes = { ...studyNotes };
    let updatedDates = [...studyDates];
    const isFirstTimeToday = activeDate === activeToday && !studyDates.includes(activeDate) && Boolean(editNoteText.trim());

    const trimmed = editNoteText.trim();
    if (trimmed) {
      updatedNotes[activeDate] = trimmed;
      if (!updatedDates.includes(activeDate)) {
        updatedDates.push(activeDate);
        updatedDates.sort();
      }
    } else {
      delete updatedNotes[activeDate];
    }

    setStudyNotes(updatedNotes);
    setStudyDates(updatedDates);
    setIsEditing(false);

    if (isFirstTimeToday) {
      setCelebrationStreak(calculateStreak(updatedDates, activeToday));
      setShowCelebration(true);
    }

    await saveStudyData(updatedDates, updatedNotes, mode);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <main className="w-full max-w-2xl mx-auto py-2 sm:py-6 px-3 sm:px-4 relative z-10">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3 no-print">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-x-1 border border-slate-200/80 dark:border-slate-700/80"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Quay lại</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          {mode !== 'work' && (
            <Link
              href="/vocabulary"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-md shadow-indigo-500/25 active:scale-95 transition-all ring-2 ring-indigo-400/30"
              title="Học 3000 từ vựng theo 60 chủ đề & Flashcards 3D"
            >
              <span>🎴</span>
              <span>Học từ vựng</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => {
              const data = loadAllDiaryEntries();
              setAllDiaryEntries(data.entries);
              setIsDiaryFlipBookOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/80 hover:bg-amber-100 dark:hover:bg-amber-900/80 text-amber-800 dark:text-amber-300 shadow-sm border border-amber-200/80 dark:border-amber-800/80 active:scale-95 transition-all"
            title="Mở sổ nhật kí 3D (Lật trang bằng chuột)"
          >
            <span>📖</span>
            <span>Sổ 3D</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200/80 dark:border-slate-700/80 transition-all"
            title="In hoặc Lưu trang nhật kí dưới dạng PDF"
          >
            <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span className="hidden sm:inline">In trang</span>
          </button>

          <ModeToggle mode={mode} onModeChange={handleModeChange} />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Diary Folio Notebook */}
      <article className="diary-folio relative p-5 sm:p-8 overflow-hidden transition-all duration-300">
        {/* Washi Tape decorative sticker at top */}
        <div className="washi-tape" />

        {/* Bookmark Ribbon on top right */}
        <div className="bookmark-ribbon" />

        {/* Diary Header Section */}
        <header className="relative pt-2 pb-6 border-b border-dashed border-slate-200 dark:border-slate-700/80 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Left: Vintage / Modern Date Stamp Box */}
            <div className="diary-stamp px-4 py-3 min-w-[130px] flex items-center gap-3 sm:gap-3.5 shadow-xs">
              <div className="text-center border-r border-indigo-200 dark:border-indigo-800/80 pr-3">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  {dateDetails.dayOfWeekEn || 'DAY'}
                </div>
                <div className="font-heading text-3xl font-black leading-none text-slate-800 dark:text-slate-100 my-0.5">
                  {dateDetails.dayNum}
                </div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {dateDetails.dayOfWeekVi}
                </div>
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {dateDetails.monthYearVi}
                </div>
                <div className="mt-1">
                  {activeDate === activeToday ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Hôm nay
                    </span>
                  ) : isPastDate ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      Lịch sử ôn tập
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      Kế hoạch sắp tới
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Journal Entry Title & Status Metadata */}
            <div className="flex-1 sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border shadow-xs transition-colors duration-200">
                {isCompleted ? (
                  isWork ? (
                    <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
                      <span>💼</span> 30 Phút Công Việc Hoàn Thành
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                      <span>🌟</span> 30 Phút Học Hoàn Thành
                    </span>
                  )
                ) : (
                  <span className="text-slate-500 dark:text-slate-400">
                    ⏳ Chưa hoàn thành mục tiêu
                  </span>
                )}
              </div>

              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                {isWork ? 'Nhật kí công việc' : 'Nhật kí học tập'}
              </h1>
              
              <div className="flex items-center sm:justify-end gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <span>📖</span> {noteStats.words} từ
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <span>⏱️</span> ~{noteStats.readTime} phút đọc
                </span>
                {totalEntries > 0 && currentIndex >= 0 && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                      <span>📌</span> Trang {currentIndex + 1}/{totalEntries}
                    </span>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Quick Date Entry Switcher Dropdown */}
          {datesWithNotes.length > 1 && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                <span>📑 Chuyển nhanh trang:</span>
                <select
                  value={activeDate}
                  onChange={(e) => navigateToDate(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold outline-none border border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {datesWithNotes.map((d) => (
                    <option key={d} value={d}>
                      {d === activeToday ? `⭐ ${formatDatePretty(d)} (Hôm nay)` : `📅 ${formatDatePretty(d)}`}
                    </option>
                  ))}
                </select>
              </div>

              {activeDate !== activeToday && (
                <button
                  type="button"
                  onClick={() => navigateToDate(activeToday)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold transition-colors"
                >
                  <span>→ Về nhật kí hôm nay</span>
                </button>
              )}
            </div>
          )}
        </header>

        {/* Diary Paper Sheet Card */}
        <section className="diary-paper p-5 sm:p-7 border border-slate-200/90 dark:border-slate-700/80 shadow-md relative min-h-[300px]">
          
          {/* Paper Toolbar */}
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200/70 dark:border-slate-700/70 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!rawNote}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-xs rounded-xl shadow-xs transition-all ${
                  copied
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-400'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                title="Sao chép nội dung trang nhật kí"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                <span>{copied ? 'Đã sao chép! ✨' : 'Sao chép ghi chú'}</span>
              </button>
            </div>

            {/* Read-Only Badge for Past Dates or Edit Button for Today */}
            {isPastDate ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100/90 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700">
                <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>{isWork ? 'Trang đã lưu (Chỉ xem)' : 'Trang đã khóa (Chỉ ôn tập)'}</span>
              </div>
            ) : !isEditing ? (
              <button
                type="button"
                onClick={handleStartEdit}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800/80 transition-all shadow-xs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>{rawNote ? 'Chỉnh sửa nhật kí' : 'Viết nhật kí hôm nay'}</span>
              </button>
            ) : null}
          </div>

          {/* Note Content View / Edit Mode */}
          {isEditing ? (
            <div>
              <div className="mb-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <span>✍️</span>
                <span>Đang soạn thảo nhật ký ngày hôm nay ({dateDetails.formatted}):</span>
              </div>
              <RichWordEditor value={editNoteText} onChange={setEditNoteText} mode={mode} minHeight="260px" />
              <div className="mt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className={`px-5 py-2 text-xs font-extrabold text-white rounded-xl transition-all shadow-md active:scale-95 ${
                    isWork ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                  }`}
                >
                  Lưu trang nhật ký ✨
                </button>
              </div>
            </div>
          ) : rawNote ? (
            <div className="diary-margin-line min-h-[220px]">
              <FormattedNote content={rawNote} />
            </div>
          ) : (
            /* Elegant Empty Diary Page */
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl mb-3 shadow-inner">
                ✍️
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                Trang nhật kí ngày này còn để trống
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5 leading-relaxed">
                {activeDate === activeToday
                  ? isWork
                    ? 'Bạn đã hoàn thành 30 phút công việc hôm nay chưa? Hãy ghi lại các mục tiêu và nhiệm vụ đã xong.'
                    : 'Hãy hoàn thành 30 phút học hôm nay và lưu lại những từ vựng, ngữ pháp bạn vừa học nhé!'
                  : 'Không có ghi chú nào được lưu lại trong ngày này.'}
              </p>

              {activeDate === activeToday && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md active:scale-95 transition-all ${
                    isWork
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                  }`}
                >
                  <span>Viết nhật kí hôm nay</span>
                  <span>✍️</span>
                </button>
              )}
            </div>
          )}
        </section>

        {/* Lesson Navigation (Page-Turning Feel) */}
        <nav className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-700/80 no-print" aria-label="Page Navigation">
          <button
            type="button"
            onClick={handlePrevLesson}
            disabled={currentIndex <= 0 && (!datesWithNotes.length || activeDate <= datesWithNotes[0])}
            className="flex-1 px-3 sm:px-4 py-2.5 bg-slate-100 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs"
          >
            <span>←</span>
            <span>{isWork ? 'Trang trước' : 'Bài trước'}</span>
          </button>

          <button
            type="button"
            onClick={handleNextLesson}
            disabled={
              currentIndex >= datesWithNotes.length - 1 ||
              (!datesWithNotes.length || activeDate >= datesWithNotes[datesWithNotes.length - 1])
            }
            className="flex-1 px-3 sm:px-4 py-2.5 bg-slate-100 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs"
          >
            <span>{isWork ? 'Trang sau' : 'Bài tiếp theo'}</span>
            <span>→</span>
          </button>
        </nav>

        {/* Diary Quotation Footer */}
        <footer className="mt-7 text-center pt-5 border-t border-dashed border-slate-200 dark:border-slate-800">
          <blockquote className="m-0 p-0 bg-transparent border-0 italic text-xs text-slate-500 dark:text-slate-400">
            <p className="mb-1">
              {isWork
                ? '“Productivity is being able to do things that you were never able to do before.”'
                : '“Learning is a treasure that will follow its owner everywhere.”'}
            </p>
            <p className="font-semibold not-italic text-[11px] text-indigo-600 dark:text-indigo-400">
              {isWork
                ? 'Năng suất là làm được những điều mà trước đây bạn chưa từng nghĩ mình có thể làm.'
                : 'Học tập là một kho báu sẽ luôn đi theo người sở hữu nó ở khắp mọi nơi.'}
            </p>
          </blockquote>
        </footer>
      </article>

      {showCelebration && (
        <ConfettiEffect
          mode={mode}
          streak={celebrationStreak}
          onComplete={() => setShowCelebration(false)}
        />
      )}

      {/* 3D FlipBook Diary Modal */}
      {isDiaryFlipBookOpen && (
        <DiaryFlipBook
          isOpen={isDiaryFlipBookOpen}
          entries={allDiaryEntries}
          onClose={() => setIsDiaryFlipBookOpen(false)}
        />
      )}
    </main>
  );
}

export default function LessonReviewPage() {
  return (
    <Suspense fallback={<div className="text-white text-center py-20">Đang mở sổ nhật kí...</div>}>
      <ReviewContent />
    </Suspense>
  );
}
