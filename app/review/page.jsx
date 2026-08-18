'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getTodayString, formatDatePretty } from '@/lib/tracker';
import { initStorage, saveStudyData, loadLocalData } from '@/lib/storage';
import FormattedNote from '@/components/FormattedNote';
import RichWordEditor from '@/components/RichWordEditor';

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [studyDates, setStudyDates] = useState([]);
  const [studyNotes, setStudyNotes] = useState({});
  const [currentDate, setCurrentDate] = useState(getTodayString());

  const [isEditing, setIsEditing] = useState(false);
  const [editNoteText, setEditNoteText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync date from URL search param ?date=YYYY-MM-DD
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      setCurrentDate(dateParam);
    } else {
      setCurrentDate(getTodayString());
    }
  }, [searchParams]);

  // Load storage data
  useEffect(() => {
    const initial = loadLocalData();
    setStudyDates(initial.studyDates);
    setStudyNotes(initial.studyNotes);

    initStorage((data) => {
      if (data.studyDates) setStudyDates(data.studyDates);
      if (data.studyNotes) setStudyNotes(data.studyNotes);
    });
  }, []);

  const today = getTodayString();
  const isPastDate = currentDate < today;
  const isCompleted = studyDates.includes(currentDate);
  const rawNote = studyNotes[currentDate]?.trim() || '';

  // Dates with notes for Prev/Next navigation
  const datesWithNotes = Object.keys(studyNotes)
    .filter((d) => studyNotes[d] && studyNotes[d].trim().length > 0)
    .sort();

  const currentIndex = datesWithNotes.indexOf(currentDate);

  const navigateToDate = (targetDate) => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
    setIsEditing(false);
    router.push(`/review?date=${targetDate}`);
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

  // Text-to-Speech (TTS)
  const handleTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt không hỗ trợ Text-to-Speech.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!rawNote) return;

    const utterance = new SpeechSynthesisUtterance(rawNote);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
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
      alert('Không thể chỉnh sửa ghi chú của những ngày trước đó. Ghi chú chỉ dùng để ôn tập.');
      setIsEditing(false);
      return;
    }

    const updatedNotes = { ...studyNotes };
    let updatedDates = [...studyDates];

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

    await saveStudyData(updatedDates, updatedNotes);
  };

  return (
    <main className="glass-panel w-full max-w-xl p-6 sm:p-8 rounded-3xl relative z-10 mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 hover:bg-white text-indigo-600 font-semibold text-sm shadow-sm transition-all duration-200 hover:-translate-x-0.5 border border-indigo-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Quay lại Tracker</span>
        </Link>

        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${
            isCompleted
              ? 'bg-green-100 text-green-700 border-green-200'
              : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}
        >
          <span>{isCompleted ? '🌟 Đã học 30 phút' : '⏳ Chưa đánh dấu học'}</span>
        </div>
      </div>

      {/* Lesson Header */}
      <header className="text-center mb-6">
        <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full uppercase tracking-wider mb-2">
          Bài học ngày
        </div>
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {formatDatePretty(currentDate)}
        </h1>
        <p className="text-gray-500 text-xs mt-1">Xem lại kiến thức và từ vựng bạn đã ghi chú</p>
      </header>

      {/* Lesson Note Card */}
      <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md mb-6">
        {/* Actions Toolbar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTTS}
              disabled={!rawNote}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-xs rounded-lg transition-colors shadow-sm ${
                isSpeaking
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title="Nghe phát âm tiếng Anh"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
              <span>{isSpeaking ? 'Dừng đọc ⏹️' : 'Nghe đọc (TTS)'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!rawNote}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-xs rounded-lg transition-colors ${
                copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
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
              <span>{copied ? 'Đã sao chép! ✔️' : 'Sao chép'}</span>
            </button>
          </div>

          {/* Read-Only Badge for Past Dates or Edit Button for Today */}
          {isPastDate ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-500 font-medium text-xs rounded-lg border border-gray-200">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Chỉ xem ôn tập</span>
            </div>
          ) : !isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs rounded-lg transition-colors"
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
            <RichWordEditor value={editNoteText} onChange={setEditNoteText} minHeight="260px" />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-md"
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
          className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          ← Bài trước
        </button>
        <button
          type="button"
          onClick={handleNextLesson}
          disabled={
            currentIndex >= datesWithNotes.length - 1 ||
            (!datesWithNotes.length || currentDate >= datesWithNotes[datesWithNotes.length - 1])
          }
          className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          Bài tiếp theo →
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-gray-600 flex flex-col items-center gap-2 pt-6 border-t border-gray-200">
        <p className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Easy English, learn English with ease!
        </p>
        <a
          href="mailto:easyenglish.mrhai@gmail.com"
          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <span>easyenglish.mrhai@gmail.com</span>
        </a>
      </footer>
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
