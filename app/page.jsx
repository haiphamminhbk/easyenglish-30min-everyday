'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getTodayString,
  formatDatePretty,
  calculateStreak,
  getMonthCalendar,
  stripFormatting,
} from '@/lib/tracker';
import { initStorage, saveStudyData, saveUsername, loadLocalData } from '@/lib/storage';
import NoteModal from '@/components/NoteModal';
import NameModal from '@/components/NameModal';
import ConfettiEffect from '@/components/ConfettiEffect';

export default function TrackerPage() {
  const router = useRouter();

  const [studyDates, setStudyDates] = useState([]);
  const [studyNotes, setStudyNotes] = useState({});
  const [savedUserName, setSavedUserName] = useState('bạn');
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Initial local load for instant paint
    const initial = loadLocalData();
    setStudyDates(initial.studyDates);
    setStudyNotes(initial.studyNotes);
    setSavedUserName(initial.savedUserName);
    setIsLoaded(true);

    // Sync with Firebase if available
    initStorage((data) => {
      if (data.studyDates) setStudyDates(data.studyDates);
      if (data.studyNotes) setStudyNotes(data.studyNotes);
      if (data.savedUserName) setSavedUserName(data.savedUserName);
    });
  }, []);

  const today = getTodayString();
  const isCompletedToday = studyDates.includes(today);
  const streak = calculateStreak(studyDates);

  // Check-in action
  const handleCheckInClick = () => {
    if (!isCompletedToday) {
      setIsNoteModalOpen(true);
    }
  };

  // Confirming note on check-in or editing today
  const handleConfirmNote = async (newNoteText) => {
    const updatedNotes = { ...studyNotes };
    let updatedDates = [...studyDates];

    if (!updatedDates.includes(today)) {
      updatedDates.push(today);
      updatedDates.sort();
      setShowConfetti(true);
    }

    if (newNoteText && newNoteText.trim()) {
      updatedNotes[today] = newNoteText.trim();
    } else {
      delete updatedNotes[today];
    }

    setStudyDates(updatedDates);
    setStudyNotes(updatedNotes);
    setIsNoteModalOpen(false);

    await saveStudyData(updatedDates, updatedNotes);
  };

  // Confirming name edit
  const handleSaveName = async (newName) => {
    setSavedUserName(newName);
    setIsNameModalOpen(false);
    await saveUsername(newName);
  };

  // Month data for current month offset
  const monthData = getMonthCalendar(currentMonthOffset);
  const completedInMonth = monthData.days.filter((d) => studyDates.includes(d.dateStr)).length;
  const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const TOTAL_CALENDAR_SLOTS = 42; // Always 6 rows x 7 columns for fixed, jitter-free height
  const trailingPaddingCount = Math.max(
    0,
    TOTAL_CALENDAR_SLOTS - monthData.startDayIndex - monthData.daysInMonth
  );

  const daysGrid = monthData.days.map((item) => {
    const { day, dateStr } = item;
    const isCompleted = studyDates.includes(dateStr);
    const hasNote = Boolean(studyNotes[dateStr] && studyNotes[dateStr].trim());
    const isToday = dateStr === today;
    const isPast = dateStr < today;

    let tooltip = formatDatePretty(dateStr);
    if (isCompleted) {
      tooltip += ' - Đã học: ';
      if (hasNote) tooltip += `\n${stripFormatting(studyNotes[dateStr])}`;
      if (isPast) tooltip += '\n(Nhấn để mở trang ôn tập bài học 📖)';
    } else if (isToday) {
      tooltip = 'Hôm nay - Cố lên nhé!';
    } else if (isPast) {
      tooltip += ' - Không học bài';
    } else {
      tooltip += ' - Chưa học';
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

  const handleBoxClick = (box) => {
    if (box.isCompleted && box.isPast) {
      // Past completed days route strictly to read-only review
      router.push(`/review?date=${box.dateStr}`);
    } else if (box.isToday) {
      if (box.isCompleted) {
        setIsNoteModalOpen(true);
      } else {
        handleCheckInClick();
      }
    }
  };

  return (
    <>
      {showConfetti && <ConfettiEffect onComplete={() => setShowConfetti(false)} />}

      <main className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-3xl relative z-10 mx-auto">
        <header className="text-center mb-8">
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-normal mb-2"
            style={{ fontFamily: 'Poppins, sans-serif', color: '#2d5a8c', letterSpacing: '0.5px' }}
          >
            EASY ENGLISH
          </h1>
          <h2 className="text-lg font-semibold text-indigo-600 mt-1 mb-3">
            Mỗi ngày 30 phút – Tiến bộ từng bước một
          </h2>

          <p className="text-gray-600 mt-2 text-sm leading-relaxed">
            Dành <strong>30 phút</strong> mỗi ngày để nâng cao trình độ tiếng Anh. Hôm nay bạn đã hoàn thành mục tiêu chưa?
          </p>

          <blockquote className="text-left text-sm shadow-sm">
            <p>“A journey of a thousand miles begins with a single step.”</p>
            <p>Hành trình ngàn dặm bắt đầu bằng một bước đi.</p>
          </blockquote>

          <p className="text-gray-500 mt-3 text-xs leading-relaxed italic px-2">
            Đừng chờ đến khi có nhiều thời gian mới bắt đầu học. 30 phút mỗi ngày có thể không tạo ra sự thay đổi ngay lập tức, nhưng sự kiên trì mỗi ngày sẽ tạo nên khác biệt lớn theo thời gian.
          </p>

          <div className="mt-6 text-md font-semibold text-gray-700">
            Xin chào{' '}
            <span
              onClick={() => setIsNameModalOpen(true)}
              className="text-indigo-600 cursor-pointer hover:text-indigo-800 transition-colors"
              title="Nhấn để đổi tên"
            >
              {savedUserName === 'bạn' ? 'bạn ✏️' : savedUserName}
            </span>
            ! Bạn đã kiên trì để đạt được:
          </div>
        </header>

        {/* Stats */}
        <div className="flex justify-between gap-4 mb-8">
          <div className="flex-1 bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Chuỗi ngày</p>
            <div className="text-3xl font-bold text-orange-500 flex items-center justify-center gap-1">
              <span>{streak}</span>
              <span className="text-2xl">🔥</span>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Tổng số ngày</p>
            <div className="text-3xl font-bold text-indigo-600 flex items-center justify-center gap-1">
              <span>{studyDates.length}</span>
              <span className="text-2xl">🌟</span>
            </div>
          </div>
        </div>

        {/* Check-In Button */}
        <button
          type="button"
          onClick={handleCheckInClick}
          disabled={isCompletedToday}
          className={`w-full font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform shadow-lg text-lg mb-8 ${
            isCompletedToday
              ? 'bg-green-500 text-white cursor-not-allowed opacity-90'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/30 active:scale-95 pulse-btn'
          }`}
        >
          {isCompletedToday ? 'Đã hoàn thành mục tiêu hôm nay ✔️' : 'Hoàn thành 30 phút! 🚀'}
        </button>

        {/* Monthly Calendar Section */}
        <section className="calendar-card">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="text-base">📅</span>
              <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">
                {monthData.monthStr}
              </h3>
              {currentMonthOffset !== 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentMonthOffset(0)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 px-2 py-0.5 rounded-md transition-colors"
                >
                  Tháng này
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-full text-xs font-semibold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {completedInMonth}/{monthData.daysInMonth} ngày
              </span>
            </div>
          </div>

          {/* Monthly Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
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
                  className={`py-1 rounded-md ${
                    isWeekend ? 'text-amber-600/90 bg-amber-50/60' : 'text-slate-400'
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
                className={`day-box ${box.isCompleted ? 'completed' : ''} ${
                  box.hasNote ? 'has-note' : ''
                } ${box.isToday && !box.isCompleted ? 'today' : ''} ${
                  box.isToday && box.isCompleted ? 'today completed' : ''
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
          <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-100 text-[11px] text-gray-500 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-emerald-500 shadow-2xs" />
              <span>Đã học 30p</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-white shadow-2xs" />
              <span>Có ghi chú</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md border-2 border-indigo-600 bg-indigo-50" />
              <span>Hôm nay</span>
            </span>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mt-4 gap-3">
            <button
              type="button"
              onClick={() => setCurrentMonthOffset((prev) => prev - 1)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold rounded-xl transition-all duration-200 active:scale-95 text-xs sm:text-sm border border-slate-200/70"
            >
              <span>←</span>
              <span>Tháng trước</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonthOffset((prev) => prev + 1)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold rounded-xl transition-all duration-200 active:scale-95 text-xs sm:text-sm border border-slate-200/70"
            >
              <span>Tháng sau</span>
              <span>→</span>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-gray-600 flex flex-col items-center gap-3 pt-6 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Easy English, learn English with ease!
          </p>
          <a
            href="mailto:easyenglish.mrhai@gmail.com"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span>easyenglish.mrhai@gmail.com</span>
          </a>
        </footer>
      </main>

      {/* Modals */}
      <NoteModal
        isOpen={isNoteModalOpen}
        initialNote={studyNotes[today] || ''}
        onClose={() => setIsNoteModalOpen(false)}
        onConfirm={handleConfirmNote}
      />

      <NameModal
        isOpen={isNameModalOpen}
        currentName={savedUserName}
        onClose={() => setIsNameModalOpen(false)}
        onSave={handleSaveName}
      />
    </>
  );
}
