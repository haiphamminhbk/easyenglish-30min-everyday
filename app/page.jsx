'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  getTodayString,
  formatDatePretty,
  calculateStreak,
  getMonthCalendar,
  stripFormatting,
  getTimeBasedGreeting,
} from '@/lib/tracker';
import {
  initStorage,
  saveStudyData,
  saveUsername,
  loadLocalData,
  getStoredMode,
  setStoredMode,
  loadAllDiaryEntries,
} from '@/lib/storage';
import { syncUserLeaderboardToFirestore } from '@/lib/leaderboardService';
import ThemeToggle from '@/components/ThemeToggle';
import ModeToggle from '@/components/ModeToggle';
import AuthButton from '@/components/AuthButton';

const NoteModal = dynamic(() => import('@/components/NoteModal'), { ssr: false });
const NameModal = dynamic(() => import('@/components/NameModal'), { ssr: false });
const ConfettiEffect = dynamic(() => import('@/components/ConfettiEffect'), { ssr: false });
const DiaryFlipBook = dynamic(() => import('@/components/DiaryFlipBook'), { ssr: false });
const SpotifyPlayerWidget = dynamic(() => import('@/components/SpotifyPlayerWidget'), { ssr: false });

export default function TrackerPage() {
  const router = useRouter();

  const [mode, setMode] = useState('study'); // 'study' | 'work'
  const [studyDates, setStudyDates] = useState([]);
  const [studyNotes, setStudyNotes] = useState({});
  const [savedUserName, setSavedUserName] = useState('bạn');
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  const [greeting, setGreeting] = useState('Chào buổi sáng!');

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isDiaryFlipBookOpen, setIsDiaryFlipBookOpen] = useState(false);
  const [allDiaryEntries, setAllDiaryEntries] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [today, setToday] = useState('');
  const [mounted, setMounted] = useState(false);

  const isWork = mode === 'work';

  useEffect(() => {
    const updateDateAndGreeting = () => {
      const todayStr = getTodayString();
      setToday(todayStr);
      setGreeting(getTimeBasedGreeting());
    };

    updateDateAndGreeting();
    setMounted(true);

    const savedMode = getStoredMode();
    setMode(savedMode);

    const interval = setInterval(updateDateAndGreeting, 60000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        updateDateAndGreeting();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', updateDateAndGreeting);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', updateDateAndGreeting);
    };
  }, []);

  useEffect(() => {
    // Initial local load for instant paint
    const savedMode = getStoredMode();
    const initial = loadLocalData(savedMode);
    setStudyDates(initial.dates);
    setStudyNotes(initial.notes);
    setSavedUserName(initial.savedUserName);
    setIsLoaded(true);

    // Sync with Firebase if available
    initStorage((data) => {
      const currentMode = getStoredMode();
      if (currentMode === 'work') {
        setStudyDates(data.workDates || []);
        setStudyNotes(data.workNotes || {});
      } else {
        setStudyDates(data.studyDates || []);
        setStudyNotes(data.studyNotes || {});
      }
      if (data.savedUserName) setSavedUserName(data.savedUserName);
    });
  }, []);

  // Mode change handler
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setStoredMode(newMode);

    const loaded = loadLocalData(newMode);
    setStudyDates(loaded.dates);
    setStudyNotes(loaded.notes);
  };

  const activeToday = today || (mounted ? getTodayString() : '');
  const isCompletedToday = Boolean(activeToday && studyDates.includes(activeToday));
  const streak = calculateStreak(studyDates, activeToday || getTodayString());

  // Check-in action
  const handleCheckInClick = () => {
    if (!isCompletedToday) {
      setIsNoteModalOpen(true);
    }
  };

  // Confirming note on check-in or editing today
  const handleConfirmNote = async (newNoteText) => {
    const currentToday = activeToday || getTodayString();
    const updatedNotes = { ...studyNotes };
    let updatedDates = [...studyDates];
    const isFirstTimeToday = !updatedDates.includes(currentToday);

    if (isFirstTimeToday) {
      updatedDates.push(currentToday);
      updatedDates.sort();
    }

    if (newNoteText && newNoteText.trim()) {
      updatedNotes[currentToday] = newNoteText.trim();
    } else {
      delete updatedNotes[currentToday];
    }

    const nextStreak = calculateStreak(updatedDates, currentToday);
    setStudyDates(updatedDates);
    setStudyNotes(updatedNotes);
    setIsNoteModalOpen(false);

    if (isFirstTimeToday) {
      setCelebrationStreak(nextStreak);
      setShowCelebration(true);
    }

    await saveStudyData(updatedDates, updatedNotes, mode);
    syncUserLeaderboardToFirestore();
  };

  // Confirming name edit
  const handleSaveName = async (newName) => {
    setSavedUserName(newName);
    setIsNameModalOpen(false);
    await saveUsername(newName);
    syncUserLeaderboardToFirestore();
  };

  // Month data for current month offset (memoized)
  const monthData = useMemo(() => getMonthCalendar(currentMonthOffset), [currentMonthOffset]);

  const studyDatesSet = useMemo(() => new Set(studyDates), [studyDates]);

  const completedInMonth = useMemo(() => {
    return monthData.days.filter((d) => studyDatesSet.has(d.dateStr)).length;
  }, [monthData.days, studyDatesSet]);

  const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const TOTAL_CALENDAR_SLOTS = 42; // Always 6 rows x 7 columns for fixed, jitter-free height
  const trailingPaddingCount = Math.max(
    0,
    TOTAL_CALENDAR_SLOTS - monthData.startDayIndex - monthData.daysInMonth
  );

  const daysGrid = useMemo(() => {
    return monthData.days.map((item) => {
      const { day, dateStr } = item;
      const isCompleted = studyDatesSet.has(dateStr);
      const hasNote = Boolean(studyNotes[dateStr] && studyNotes[dateStr].trim());
      const isToday = Boolean(mounted && activeToday && dateStr === activeToday);
      const isPast = Boolean(mounted && activeToday && dateStr < activeToday);

      let tooltip = formatDatePretty(dateStr);
      if (isCompleted) {
        tooltip += isWork ? ' - Đã làm: ' : ' - Đã học: ';
        if (hasNote) tooltip += `\n${stripFormatting(studyNotes[dateStr])}`;
        if (isPast) {
          tooltip += isWork
            ? '\n(Nhấn để mở trang xem lại công việc 📋)'
            : '\n(Nhấn để mở trang ôn tập bài học 📖)';
        }
      } else if (isToday) {
        tooltip = isWork ? 'Hôm nay - Tập trung hoàn thành công việc nhé!' : 'Hôm nay - Cố lên nhé!';
      } else if (isPast) {
        tooltip += isWork ? ' - Chưa hoàn thành công việc' : ' - Không học bài';
      } else {
        tooltip += isWork ? ' - Chưa làm' : ' - Chưa học';
      }

      return {
        dateStr,
        day,
        isCompleted,
        hasNote,
        isToday,
        isPast,
        tooltip,
      };
    });
  }, [monthData.days, studyDatesSet, studyNotes, mounted, activeToday, isWork]);

  const handleBoxClick = useCallback((box) => {
    if (box.isCompleted && box.isPast) {
      // Past completed days route strictly to read-only review
      router.push(`/review?date=${box.dateStr}&mode=${mode}`);
    } else if (box.isToday) {
      if (box.isCompleted) {
        setIsNoteModalOpen(true);
      } else {
        handleCheckInClick();
      }
    }
  }, [router, mode, isCompletedToday]);

  return (
    <>
      <main className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-3xl relative z-10 mx-auto dark:text-slate-100 transition-colors duration-300">
        {/* Top Header Bar with Mode Toggle & Theme Toggle & Time-Based Greeting */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-slate-800 flex-wrap gap-2.5">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isWork ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span className="text-xs font-bold tracking-wide text-slate-700 dark:text-slate-300">
              {greeting}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ModeToggle mode={mode} onModeChange={handleModeChange} />
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>

        <header className="text-center mb-8">
          {!isWork && (
            <div className="flex justify-center items-center gap-2.5 mb-4 flex-wrap animate-fadeIn">
              <Link
                href="/vocabulary"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all ring-2 ring-indigo-400/30 group"
                title="Học 3000 từ vựng Oxford theo 60 chủ đề & Flashcards 3D"
              >
                <span className="text-sm group-hover:scale-110 transition-transform">🎴</span>
                <span>Từ vựng Oxford</span>
                <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">60 Chủ đề</span>
              </Link>

              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-amber-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all ring-2 ring-amber-400/40 group"
                title="Xem Bảng Xếp Hạng học viên chăm chỉ & thi đua chuỗi ngày"
              >
                <span className="text-sm group-hover:scale-120 transition-transform animate-bounce">🏆</span>
                <span>Bảng Xếp Hạng</span>
                <span className="text-[9px] bg-amber-900/15 px-1.5 py-0.5 rounded-full font-black">Top XP</span>
              </Link>
            </div>
          )}

          <h1
            className={`font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-2 transition-colors duration-300 ${isWork
              ? 'text-[#854d0e] dark:text-amber-300'
              : 'text-[#2d5a8c] dark:text-indigo-300'
              }`}
          >
            {isWork ? 'EASY WORKFLOW' : 'EASY ENGLISH'}
          </h1>
          <h2
            className={`text-lg font-semibold mt-1 mb-3 transition-colors duration-300 ${isWork
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-indigo-600 dark:text-indigo-400'
              }`}
          >
            {isWork
              ? 'Mỗi ngày 30 phút – Tập trung cao độ & Hiệu suất'
              : 'Mỗi ngày 30 phút – Tiến bộ từng bước một'}
          </h2>

          <p className="text-gray-600 dark:text-slate-300 mt-2 text-sm leading-relaxed">
            {isWork ? (
              <>
                Dành <strong className="text-gray-900 dark:text-white">30 phút tập trung</strong> mỗi ngày để xử lý công việc quan trọng. Hôm nay bạn đã hoàn thành mục tiêu chưa?
              </>
            ) : (
              <>
                Dành <strong className="text-gray-900 dark:text-white">30 phút</strong> mỗi ngày để nâng cao trình độ tiếng Anh. Hôm nay bạn đã hoàn thành mục tiêu chưa?
              </>
            )}
          </p>

          <blockquote className="text-left text-sm shadow-sm">
            {isWork ? (
              <>
                <p>“Focus on being productive instead of busy.”</p>
                <p>Tập trung vào hiệu suất và giá trị thay vì chỉ bận rộn.</p>
              </>
            ) : (
              <>
                <p>“A journey of a thousand miles begins with a single step.”</p>
                <p>Hành trình ngàn dặm bắt đầu bằng một bước đi.</p>
              </>
            )}
          </blockquote>

          <p className="text-gray-500 dark:text-slate-400 mt-3 text-xs leading-relaxed italic px-2">
            {isWork
              ? 'Đừng chờ đến khi có cả ngày rảnh rỗi mới bắt đầu làm. 30 phút tập trung giải quyết dứt điểm các đầu việc tồn đọng mỗi ngày sẽ tạo nên bước nhảy vọt trong sự nghiệp.'
              : 'Đừng chờ đến khi có nhiều thời gian mới bắt đầu học. 30 phút mỗi ngày có thể không tạo ra sự thay đổi ngay lập tức, nhưng sự kiên trì mỗi ngày sẽ tạo nên khác biệt lớn theo thời gian.'}
          </p>

          <div className="mt-6 text-md font-semibold text-gray-700 dark:text-slate-300">
            Xin chào{' '}
            <span
              onClick={() => setIsNameModalOpen(true)}
              className={`cursor-pointer transition-colors ${isWork
                ? 'text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300'
                : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300'
                }`}
              title="Nhấn để đổi tên"
            >
              {savedUserName === 'bạn' ? 'bạn ✏️' : savedUserName}
            </span>
            ! Bạn đã kiên trì {isWork ? 'làm việc' : 'học tập'} để đạt được:
          </div>
        </header>

        {/* Stats */}
        <div className="flex justify-between gap-4 mb-8">
          <div className="flex-1 bg-white dark:bg-slate-800/90 rounded-2xl p-4 text-center border border-gray-100 dark:border-slate-700/80 shadow-sm transition-colors duration-300">
            <p className="text-xs text-gray-400 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">
              {isWork ? 'Chuỗi ngày làm' : 'Chuỗi ngày học'}
            </p>
            <div className="text-3xl font-bold text-orange-500 dark:text-orange-400 flex items-center justify-center gap-1">
              <span>{streak}</span>
              <span className="text-2xl">🔥</span>
            </div>
          </div>
          <div className="flex-1 bg-white dark:bg-slate-800/90 rounded-2xl p-4 text-center border border-gray-100 dark:border-slate-700/80 shadow-sm transition-colors duration-300">
            <p className="text-xs text-gray-400 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">
              {isWork ? 'Tổng số ngày làm' : 'Tổng số ngày học'}
            </p>
            <div
              className={`text-3xl font-bold flex items-center justify-center gap-1 ${isWork
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-indigo-600 dark:text-indigo-400'
                }`}
            >
              <span>{studyDates.length}</span>
              <span className="text-2xl">{isWork ? '💼' : '🌟'}</span>
            </div>
          </div>
        </div>

        {/* Spotify Focus & Lo-Fi Music Player */}
        <div className="mb-6">
          <SpotifyPlayerWidget mode={mode} />
        </div>

        {/* Check-In Button */}
        <button
          type="button"
          onClick={handleCheckInClick}
          disabled={isCompletedToday}
          className={`w-full font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform shadow-lg text-lg mb-4 ${isCompletedToday
            ? 'bg-emerald-600 dark:bg-emerald-700 text-white cursor-not-allowed opacity-90'
            : isWork
              ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white hover:shadow-amber-500/30 active:scale-95 pulse-btn'
              : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white hover:shadow-indigo-500/30 active:scale-95 pulse-btn'
            }`}
        >
          {isCompletedToday
            ? isWork
              ? 'Đã hoàn thành công việc hôm nay ✔️'
              : 'Đã hoàn thành mục tiêu hôm nay ✔️'
            : isWork
              ? 'Hoàn thành 30 phút làm việc! 🚀'
              : 'Hoàn thành 30 phút! 🚀'}
        </button>

        {/* Diary 3D FlipBook Quick Action Card */}
        <button
          type="button"
          onClick={() => {
            const data = loadAllDiaryEntries();
            setAllDiaryEntries(data.entries);
            setIsDiaryFlipBookOpen(true);
          }}
          className={`w-full mb-8 p-3.5 rounded-2xl flex items-center justify-between transition-all duration-300 shadow-md hover:shadow-lg border group active:scale-98 text-left ${isWork
            ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent hover:bg-amber-500/15 border-amber-300/60 dark:border-amber-700/60 text-amber-950 dark:text-amber-200'
            : 'bg-gradient-to-r from-indigo-500/10 via-indigo-400/5 to-transparent hover:bg-indigo-500/15 border-indigo-200/80 dark:border-indigo-800/80 text-indigo-950 dark:text-indigo-200'
            }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 dark:bg-amber-400/10 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
              📖
            </div>
            <div>
              <div className="font-heading text-sm font-extrabold flex items-center gap-1.5">
                <span>Nhật kí của tôi</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-900 dark:text-amber-300 font-extrabold">Lật trang 3D ✨</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Xem toàn bộ bài học & công việc đã ghi chép
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform pr-1">
            <span>Mở sổ</span>
            <span>→</span>
          </div>
        </button>

        {/* Monthly Calendar Section */}
        <section className="calendar-card transition-colors duration-300">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="text-base">📅</span>
              <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100 tracking-wide uppercase">
                {monthData.monthStr}
              </h3>
              {currentMonthOffset !== 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentMonthOffset(0)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors border ${isWork
                    ? 'text-amber-600 dark:text-amber-300 hover:text-amber-700 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border-amber-200/60 dark:border-amber-800/60'
                    : 'text-indigo-600 dark:text-indigo-300 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border-indigo-200/60 dark:border-indigo-800/60'
                    }`}
                >
                  Tháng này
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-700/60 px-2.5 py-1 rounded-full text-xs font-semibold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {completedInMonth}/{monthData.daysInMonth} ngày
              </span>
            </div>
          </div>

          {/* Monthly Progress Bar */}
          <div className="w-full bg-gray-100 dark:bg-slate-700/80 rounded-full h-1.5 mb-4 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${isWork
                ? 'bg-gradient-to-r from-amber-500 to-emerald-500'
                : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                }`}
              style={{
                width: `${Math.round((completedInMonth / monthData.daysInMonth) * 100)}%`,
              }}
            />
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-bold tracking-wider">
            {WEEKDAYS.map((w, idx) => {
              const isWeekend = idx >= 5;
              return (
                <div
                  key={w}
                  className={`py-1 rounded-md ${isWeekend
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/40'
                    : 'text-slate-400 dark:text-slate-400'
                    }`}
                >
                  {w}
                </div>
              );
            })}
          </div>

          {/* Monthly Days Grid - Fixed 6-row (42 slots) grid to prevent height shaking */}
          <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
            {/* Blank padding cells before day 1 */}
            {Array.from({ length: monthData.startDayIndex }).map((_, idx) => (
              <div key={`lead-pad-${idx}`} className="aspect-square opacity-0 pointer-events-none" />
            ))}

            {daysGrid.map((box) => (
              <div
                key={box.dateStr}
                onClick={() => handleBoxClick(box)}
                data-title={box.tooltip}
                suppressHydrationWarning
                className={`day-box ${box.isCompleted ? 'completed' : ''} ${box.hasNote ? 'has-note' : ''
                  } ${box.isToday && !box.isCompleted ? 'today' : ''} ${box.isToday && box.isCompleted ? 'today completed' : ''
                  }`}
              >
                <span>{box.day}</span>
                {box.hasNote && <span className="note-dot" />}
              </div>
            ))}

            {/* Trailing blank padding cells to guarantee exact 42-slot (6-row) fixed height */}
            {Array.from({ length: trailingPaddingCount }).map((_, idx) => (
              <div key={`trail-pad-${idx}`} className="aspect-square opacity-0 pointer-events-none" />
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-gray-500 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-emerald-500 shadow-2xs" />
              <span>{isWork ? 'Đã làm việc 30p' : 'Đã học 30p'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-white dark:border-slate-800 shadow-2xs" />
              <span>Có ghi chú</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-md border-2 ${isWork
                  ? 'border-amber-600 dark:border-amber-400 bg-amber-50 dark:bg-amber-950/60'
                  : 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                  }`}
              />
              <span>Hôm nay</span>
            </span>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mt-4 gap-3">
            <button
              type="button"
              onClick={() => setCurrentMonthOffset((prev) => prev - 1)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-all duration-200 active:scale-95 text-xs sm:text-sm border border-slate-200/70 dark:border-slate-700/70"
            >
              <span>←</span>
              <span>Tháng trước</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonthOffset((prev) => prev + 1)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-all duration-200 active:scale-95 text-xs sm:text-sm border border-slate-200/70 dark:border-slate-700/70"
            >
              <span>Tháng sau</span>
              <span>→</span>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-gray-600 dark:text-slate-400 flex flex-col items-center gap-3 pt-6 border-t border-gray-200 dark:border-slate-800">
          <p className="font-heading text-sm font-semibold text-gray-700 dark:text-slate-200">
            {isWork
              ? 'Easy Workflow, achieve deep focus and high productivity!'
              : 'Easy English, learn English with ease!'}
          </p>
          {/* <a
            href="mailto:easyenglish.mrhai@gmail.com"
            className={`flex items-center gap-2 transition-colors ${
              isWork
                ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300'
                : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300'
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span>easyenglish.mrhai@gmail.com</span>
          </a> */}
        </footer>
      </main>

      {/* Modals */}
      <NoteModal
        isOpen={isNoteModalOpen}
        initialNote={studyNotes[today] || ''}
        mode={mode}
        onClose={() => setIsNoteModalOpen(false)}
        onConfirm={handleConfirmNote}
      />

      <NameModal
        isOpen={isNameModalOpen}
        currentName={savedUserName}
        onClose={() => setIsNameModalOpen(false)}
        onSave={handleSaveName}
      />

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
          userName={savedUserName}
          onClose={() => setIsDiaryFlipBookOpen(false)}
        />
      )}
    </>
  );
}
