'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTodayString, formatDatePretty, calculateStreak, getPeriodRange, NUMBER_OF_DAYS_TO_SHOW } from '@/lib/tracker';
import { initStorage, saveStudyData, saveUsername, loadLocalData } from '@/lib/storage';
import NoteModal from '@/components/NoteModal';
import NameModal from '@/components/NameModal';
import ConfettiEffect from '@/components/ConfettiEffect';

export default function TrackerPage() {
  const router = useRouter();

  const [studyDates, setStudyDates] = useState([]);
  const [studyNotes, setStudyNotes] = useState({});
  const [savedUserName, setSavedUserName] = useState('bạn');
  const [currentPeriodOffset, setCurrentPeriodOffset] = useState(0);

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

  // Date range for current 30-day window
  const { startDate, startStr, endStr } = getPeriodRange(currentPeriodOffset, NUMBER_OF_DAYS_TO_SHOW);

  const daysGrid = Array.from({ length: NUMBER_OF_DAYS_TO_SHOW }).map((_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const isCompleted = studyDates.includes(dateStr);
    const hasNote = Boolean(studyNotes[dateStr] && studyNotes[dateStr].trim());
    const isToday = dateStr === today;
    const isPast = dateStr < today;

    let tooltip = formatDatePretty(dateStr);
    if (isCompleted) {
      tooltip += ' - Đã học: ';
      if (hasNote) tooltip += `\n${studyNotes[dateStr]}`;
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

        {/* 30-Day Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tiến độ 30 ngày qua</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
              {startStr} → {endStr}
            </span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
            {daysGrid.map((box) => (
              <div
                key={box.dateStr}
                onClick={() => handleBoxClick(box)}
                data-title={box.tooltip}
                className={`day-box ${box.isCompleted ? 'completed' : ''} ${
                  box.hasNote ? 'has-note' : ''
                } ${box.isToday && !box.isCompleted ? 'today' : ''}`}
              >
                {box.day}
                {box.hasNote && <span className="note-dot" />}
              </div>
            ))}
          </div>

          {/* Period Navigation */}
          <div className="flex items-center justify-between mt-6 gap-4">
            <button
              type="button"
              onClick={() => setCurrentPeriodOffset((prev) => prev - 1)}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors duration-200 active:scale-95"
            >
              ← Trước
            </button>
            <button
              type="button"
              onClick={() => setCurrentPeriodOffset((prev) => prev + 1)}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors duration-200 active:scale-95"
            >
              Sau →
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
