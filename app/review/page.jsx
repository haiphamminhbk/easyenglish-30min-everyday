'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getTodayString, formatDatePretty, calculateStreak } from '@/lib/tracker';
import {
  initStorage,
  saveStudyData,
  loadLocalData,
  getStoredMode,
  setStoredMode,
} from '@/lib/storage';
import FormattedNote from '@/components/FormattedNote';
import RichWordEditor from '@/components/RichWordEditor';
import ThemeToggle from '@/components/ThemeToggle';
import ModeToggle from '@/components/ModeToggle';
import ConfettiEffect from '@/components/ConfettiEffect';

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
  const isCompleted = studyDates.includes(activeDate);
  const rawNote = studyNotes[activeDate]?.trim() || '';

  // Dates with notes for Prev/Next navigation
  const datesWithNotes = Object.keys(studyNotes)
    .filter((d) => studyNotes[d] && studyNotes[d].trim().length > 0)
    .sort();

  const currentIndex = datesWithNotes.indexOf(currentDate);

  const navigateToDate = (targetDate) => {
    setIsEditing(false);
    router.push(`/review?date=${targetDate}&mode=${mode}`);
  };

  const handlePrevLesson = () => {
    if (currentIndex > 0) {
      navigateToDate(datesWithNotes[currentIndex - 1]);
    } else if (datesWithNotes.length > 0) {
      const prevDates = datesWithNotes.filter((d) => d < currentDate);
      if (prevDates.length > 0) {
        navigateToDate(prevDates[prevDates.length - 1]);
      }
    }
  };

  const handleNextLesson = () => {
    if (currentIndex >= 0 && currentIndex < datesWithNotes.length - 1) {
      navigateToDate(datesWithNotes[currentIndex + 1]);
    } else if (datesWithNotes.length > 0) {
      const nextDates = datesWithNotes.filter((d) => d > currentDate);
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
      setTimeout(() => setCopied(false), 1500);
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
          ? 'Không thể chỉnh sửa ghi chú của những ngày trước đó. Ghi chú chỉ dùng để xem lại lịch sử.'
          : 'Không thể chỉnh sửa ghi chú của những ngày trước đó. Ghi chú chỉ dùng để ôn tập.'
      );
      setIsEditing(false);
      return;
    }

    const updatedNotes = { ...studyNotes };
    let updatedDates = [...studyDates];
    const isFirstTimeToday = currentDate === activeToday && !studyDates.includes(currentDate) && Boolean(editNoteText.trim());

    const trimmed = editNoteText.trim();
    if (trimmed) {
      updatedNotes[currentDate] = trimmed;
      if (!updatedDates.includes(currentDate)) {
        updatedDates.push(currentDate);
        updatedDates.sort();
      }
    } else {
      delete updatedNotes[currentDate];
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

  return (
    <main className="glass-panel w-full max-w-xl p-6 sm:p-8 rounded-3xl relative z-10 mx-auto dark:text-slate-100 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold text-sm shadow-sm transition-all duration-200 hover:-translate-x-0.5 border border-indigo-100 dark:border-slate-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Quay lại Tracker</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${
              isCompleted
                ? isWork
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700'
            }`}
          >
            <span>
              {isCompleted
                ? isWork
                  ? '💼 Đã làm 30 phút'
                  : '🌟 Đã học 30 phút'
                : isWork
                ? '⏳ Chưa đánh dấu làm'
                : '⏳ Chưa đánh dấu học'}
            </span>
          </div>

          <ModeToggle mode={mode} onModeChange={handleModeChange} />
          <ThemeToggle />
        </div>
      </div>

      {/* Lesson Header */}
      <header className="text-center mb-6">
        <div
          className={`inline-block px-3 py-1 font-bold text-xs rounded-full uppercase tracking-wider mb-2 border ${
            isWork
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-100/60 dark:border-amber-800/60'
              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-100/60 dark:border-indigo-800/60'
          }`}
        >
          {isWork ? 'Công việc ngày' : 'Bài học ngày'}
        </div>
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {formatDatePretty(currentDate)}
        </h1>
        <p className="text-gray-500 dark:text-slate-400 text-xs mt-1">
          {isWork
            ? 'Xem lại các nhiệm vụ, tiến độ và ghi chú công việc bạn đã hoàn thành'
            : 'Xem lại kiến thức và từ vựng bạn đã ghi chú'}
        </p>
      </header>

      {/* Lesson Note Card */}
      <section className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-gray-100 dark:border-slate-700/80 shadow-md mb-6 transition-colors duration-300">
        {/* Actions Toolbar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-slate-700/80 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!rawNote}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-xs rounded-lg transition-colors ${
                copied
                  ? 'bg-green-100 dark:bg-emerald-950 text-green-700 dark:text-emerald-300'
                  : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title="Sao chép nội dung ghi chú"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
              <span>{copied ? 'Đã sao chép! ✔️' : 'Sao chép ghi chú'}</span>
            </button>
          </div>

          {/* Read-Only Badge for Past Dates or Edit Button for Today */}
          {isPastDate ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-slate-700/80 text-gray-500 dark:text-slate-400 font-medium text-xs rounded-lg border border-gray-200 dark:border-slate-600">
              <svg className="w-3.5 h-3.5 text-gray-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>{isWork ? 'Chỉ xem lại công việc' : 'Chỉ xem ôn tập'}</span>
            </div>
          ) : !isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 font-medium text-xs rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>Sửa ghi chú</span>
            </button>
          ) : null}
        </div>

        {/* Note Content View / Edit Mode */}
        {isEditing ? (
          <div>
            <RichWordEditor value={editNoteText} onChange={setEditNoteText} mode={mode} minHeight="260px" />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className={`px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors shadow-md ${
                  isWork ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        ) : (
          <div className="min-h-[220px]">
            <FormattedNote content={rawNote} />
          </div>
        )}
      </section>

      {/* Lesson Navigation (Prev / Next Lesson with Note) */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={handlePrevLesson}
          disabled={currentIndex <= 0 && (!datesWithNotes.length || currentDate <= datesWithNotes[0])}
          className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 border border-slate-200/60 dark:border-slate-700/60"
        >
          {isWork ? '← Ngày trước' : '← Bài trước'}
        </button>
        <button
          type="button"
          onClick={handleNextLesson}
          disabled={
            currentIndex >= datesWithNotes.length - 1 ||
            (!datesWithNotes.length || currentDate >= datesWithNotes[datesWithNotes.length - 1])
          }
          className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 border border-slate-200/60 dark:border-slate-700/60"
        >
          {isWork ? 'Ngày tiếp theo →' : 'Bài tiếp theo →'}
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-gray-600 dark:text-slate-400 flex flex-col items-center gap-2 pt-6 border-t border-gray-200 dark:border-slate-800">
        <p className="text-sm font-semibold text-gray-700 dark:text-slate-200" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {isWork
            ? 'Easy Workflow, achieve deep focus and high productivity!'
            : 'Easy English, learn English with ease!'}
        </p>
        <a
          href="mailto:easyenglish.mrhai@gmail.com"
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            isWork
              ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300'
              : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <span>easyenglish.mrhai@gmail.com</span>
        </a>
      </footer>

      {showCelebration && (
        <ConfettiEffect
          mode={mode}
          streak={celebrationStreak}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </main>
  );
}

export default function LessonReviewPage() {
  return (
    <Suspense fallback={<div className="text-white text-center">Đang tải bài học...</div>}>
      <ReviewContent />
    </Suspense>
  );
}

