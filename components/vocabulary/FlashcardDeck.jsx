'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Volume2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  Shuffle,
  Play,
  Pause,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { speakWord, preloadWordAudio } from '@/lib/vocabularyStorage';
import { getTopicById } from '@/lib/vocabularyData';

const LEVEL_CONFIG = {
  A1: {
    label: 'A1 - Beginner',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-500',
    badge: 'from-emerald-500 to-teal-600',
  },
  A2: {
    label: 'A2 - Elementary',
    bg: 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30',
    dot: 'bg-sky-500',
    badge: 'from-sky-500 to-blue-600',
  },
  B1: {
    label: 'B1 - Intermediate',
    bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
    dot: 'bg-amber-500',
    badge: 'from-amber-500 to-orange-600',
  },
  B2: {
    label: 'B2 - Upper Intermediate',
    bg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
    dot: 'bg-purple-500',
    badge: 'from-purple-500 to-pink-600',
  },
};

export default function FlashcardDeck({
  words = [],
  masteredIds = [],
  starredIds = [],
  onToggleMastered,
  onToggleStarred,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [deck, setDeck] = useState(words);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9); // 0.75 for slow, 0.9 for normal
  const [accent, setAccent] = useState('us'); // 'us' | 'uk'
  const [autoFlip, setAutoFlip] = useState(true);

  // Sync deck when input words change
  useEffect(() => {
    setDeck(words);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsPlaying(false);
  }, [words]);

  // Preload audio for current and upcoming cards into instant cache
  useEffect(() => {
    if (deck.length > 0) {
      const current = deck[currentIndex];
      if (current?.word) {
        preloadWordAudio(current.word, accent);
      }
      const nextIndex = (currentIndex + 1) % deck.length;
      const nextWord = deck[nextIndex];
      if (nextWord?.word) {
        preloadWordAudio(nextWord.word, accent);
      }
    }
  }, [currentIndex, deck, accent]);

  const currentWord = deck[currentIndex] || null;
  const isMastered = currentWord ? masteredIds.includes(currentWord.id) : false;
  const isStarred = currentWord ? starredIds.includes(currentWord.id) : false;

  const currentTopic = useMemo(() => {
    if (!currentWord) return null;
    return getTopicById(currentWord.topicId);
  }, [currentWord]);

  // Flip card
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Pronounce word with HD native audio engine
  const handlePronounce = useCallback(
    (e, rate = speechRate, acc = accent) => {
      if (e) e.stopPropagation();
      if (currentWord) {
        speakWord(currentWord.word, rate, acc);
      }
    },
    [currentWord, speechRate, accent]
  );

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (deck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  }, [deck.length]);

  const handlePrev = useCallback(() => {
    if (deck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  }, [deck.length]);

  // Shuffle deck
  const handleShuffle = useCallback(() => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [deck]);

  // Auto-play slideshow effect
  useEffect(() => {
    let interval;
    if (isPlaying && deck.length > 0) {
      interval = setInterval(() => {
        if (autoFlip && !isFlipped) {
          setIsFlipped(true);
        } else {
          setIsFlipped(false);
          setCurrentIndex((prev) => (prev + 1) % deck.length);
        }
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isFlipped, autoFlip, deck.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        handlePronounce();
      } else if (e.key.toLowerCase() === 'm' && currentWord) {
        e.preventDefault();
        onToggleMastered(currentWord.id);
      } else if (e.key.toLowerCase() === 'f' && currentWord) {
        e.preventDefault();
        onToggleStarred(currentWord.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handlePronounce, currentWord, onToggleMastered, onToggleStarred]);

  if (!currentWord || deck.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-3xl mb-4">
          🎴
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Không tìm thấy từ vựng nào
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Hãy thử điều chỉnh bộ lọc độ khó (A1 - B2) hoặc chọn chủ đề khác để tiếp tục học.
        </p>
      </div>
    );
  }

  const levelInfo = LEVEL_CONFIG[currentWord.level] || LEVEL_CONFIG.A1;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-1">
      {/* Top Deck Info & Quick Controls */}
      <div className="w-full flex items-center justify-between gap-2 mb-3 px-1">
        {/* Progress pill & Topic name */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="px-2.5 py-1 bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs backdrop-blur-md whitespace-nowrap">
            {currentIndex + 1} / {deck.length}
          </span>
          {currentTopic && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/50 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-xs min-w-0"
              title={currentTopic.introText || currentTopic.title}
            >
              <span>{currentTopic.icon}</span>
              <span className="font-bold truncate max-w-[120px] sm:max-w-[200px]">
                {currentTopic.title || currentTopic.nameVi}
              </span>
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setAccent((prev) => (prev === 'us' ? 'uk' : 'us'))}
            title={`Giọng phát âm: ${accent === 'us' ? '🇺🇸 Tiếng Anh Mỹ (US)' : '🇬🇧 Tiếng Anh Anh (UK)'}`}
            className="px-2 py-1 rounded-xl text-xs font-bold bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 transition-all shadow-xs flex items-center gap-1"
          >
            <span>{accent === 'us' ? '🇺🇸' : '🇬🇧'}</span>
            <span className="text-[10px] font-extrabold uppercase">{accent}</span>
          </button>

          <button
            onClick={() => setSpeechRate((prev) => (prev === 0.9 ? 0.7 : 0.9))}
            title={`Tốc độ đọc: ${speechRate === 0.9 ? 'Bình thường (1.0x)' : 'Chậm (0.75x)'}`}
            className={`px-2 py-1 rounded-xl text-xs font-semibold border transition-all ${
              speechRate < 0.9
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-600 dark:text-amber-400'
                : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {speechRate < 0.9 ? '🐢 0.7x' : '🐇 1.0x'}
          </button>

          <button
            onClick={handleShuffle}
            title="Xáo trộn thứ tự thẻ"
            className="p-1.5 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-600 dark:text-slate-300 transition-all shadow-xs"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsPlaying((prev) => !prev)}
            title={isPlaying ? 'Tạm dừng tự động chạy' : 'Tự động chạy Flashcard'}
            className={`p-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 shadow-xs ${
              isPlaying
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-transparent ring-2 ring-emerald-400/30 animate-pulse'
                : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D Flip Card Container with flexible height for mobile */}
      <div
        className="w-full min-h-[380px] sm:min-h-[400px] h-auto perspective-1000 cursor-pointer select-none group"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full min-h-[380px] sm:min-h-[400px] h-full duration-500 transform-style-3d transition-transform ease-out shadow-2xl rounded-3xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT SIDE (English Word & IPA) */}
          <div className="absolute inset-0 w-full h-full rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-white/95 via-white/90 to-indigo-50/70 dark:from-slate-850 dark:via-slate-900 dark:to-indigo-950/40 backdrop-blur-2xl border border-white/60 dark:border-slate-700/80 flex flex-col justify-between backface-hidden shadow-xl">
            {/* Top Row: Level Badge & Quick Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${levelInfo.bg}`}
                >
                  <span className={`w-2 h-2 rounded-full ${levelInfo.dot}`} />
                  {currentWord.level} · Oxford 3000
                </span>
                {currentWord.pos && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 italic">
                    {currentWord.pos}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onToggleStarred(currentWord.id)}
                  title={isStarred ? 'Bỏ đánh dấu' : 'Đánh dấu từ yêu thích'}
                  className={`p-2 rounded-xl transition-all ${
                    isStarred
                      ? 'bg-amber-100 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400 scale-110 shadow-xs'
                      : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${isStarred ? 'fill-amber-400' : ''}`} />
                </button>

                <button
                  onClick={() => onToggleMastered(currentWord.id)}
                  title={isMastered ? 'Đã thuộc (nhấn để hủy)' : 'Đánh dấu đã thuộc từ này'}
                  className={`p-2 rounded-xl transition-all ${
                    isMastered
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 scale-110 shadow-xs'
                      : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 ${isMastered ? 'fill-emerald-500 text-white' : ''}`} />
                </button>
              </div>
            </div>

            {/* Center Content: Big Word & Phonetic & Audio */}
            <div className="flex flex-col items-center justify-center my-auto text-center py-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-50 tracking-tight mb-2 drop-shadow-xs">
                {currentWord.word}
              </h2>

              <div className="flex items-center gap-3">
                <span className="text-sm sm:text-base md:text-lg font-mono text-indigo-600 dark:text-indigo-400 font-medium px-3 py-1 bg-indigo-50/80 dark:bg-indigo-950/50 rounded-xl border border-indigo-200/50 dark:border-indigo-900/50">
                  {currentWord.phonetic}
                </span>

                <button
                  onClick={(e) => handlePronounce(e)}
                  title="Nghe phát âm chuẩn (Studio HD)"
                  className="p-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/30 hover:scale-110 active:scale-95 transition-all"
                >
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Bottom Hint */}
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-2.5 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-500" />
                Nhấp thẻ để xem nghĩa
              </span>
              <span className="text-[11px] font-medium hidden sm:inline">
                Phím tắt: Space, ←, →, S (Nghe), M (Đã thuộc)
              </span>
            </div>
          </div>

          {/* BACK SIDE (Vietnamese Meaning & Bilingual Example) */}
          <div className="absolute inset-0 w-full h-full rounded-3xl p-5 sm:p-7 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white border border-indigo-500/30 flex flex-col justify-between backface-hidden rotate-y-180 shadow-2xl overflow-y-auto no-scrollbar">
            {/* Top Row: Word Recall & Audio */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-indigo-200 tracking-wide">
                  {currentWord.word}
                </span>
                <span className="text-xs text-indigo-300/80 font-mono">
                  {currentWord.phonetic}
                </span>
              </div>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => handlePronounce(e)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-200 transition-colors"
                  title="Nghe lại phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Meaning */}
            <div className="my-auto py-1 text-center">
              <p className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-indigo-400 mb-1">
                Nghĩa tiếng Việt
              </p>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-amber-300 drop-shadow mb-3 leading-snug">
                {currentWord.meaning}
              </h3>

              {/* Example Sentences */}
              {currentWord.example && (
                <div className="p-3 sm:p-4 rounded-2xl bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/10 text-left space-y-1">
                  <p className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-indigo-300/90 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Ví dụ ứng dụng Oxford
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-slate-100 italic leading-relaxed">
                    &ldquo;{currentWord.example}&rdquo;
                  </p>
                  {currentWord.exampleVi && (
                    <p className="text-[11px] sm:text-xs text-indigo-200/90 leading-normal pt-1 border-t border-white/5">
                      👉 {currentWord.exampleVi}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions on Card (Clean single-toggle on mobile) */}
            <div
              className="flex items-center justify-between pt-2.5 border-t border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onToggleMastered(currentWord.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isMastered
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-white/15 text-slate-200 hover:bg-white/25'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isMastered ? '✓ Đã thuộc' : 'Chưa thuộc'}</span>
              </button>

              <span className="text-[11px] text-indigo-300/70 italic">
                Chạm thẻ để quay lại
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar Below Deck - Mobile Optimized */}
      <div className="w-full flex items-center justify-between gap-2 sm:gap-3 mt-5 px-1">
        {/* Prev Button */}
        <button
          onClick={handlePrev}
          disabled={deck.length <= 1}
          className="px-3.5 sm:px-5 py-3 rounded-2xl bg-white/85 dark:bg-slate-800/85 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4 flex-shrink-0" />
          <span>Trước</span>
        </button>

        {/* Flip Button */}
        <button
          onClick={handleFlip}
          className="flex-1 min-w-0 px-3 sm:px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
        >
          <RotateCw className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{isFlipped ? 'Mặt trước' : 'Xem nghĩa'}</span>
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={deck.length <= 1}
          className="px-3.5 sm:px-5 py-3 rounded-2xl bg-white/85 dark:bg-slate-800/85 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40"
        >
          <span>Tiếp<span className="hidden sm:inline"> theo</span></span>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
        </button>
      </div>

      {/* Mini Indicator dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3.5 max-w-full overflow-x-auto py-1 no-scrollbar">
        {deck.slice(0, 30).map((w, idx) => (
          <button
            key={w.id}
            onClick={() => {
              setCurrentIndex(idx);
              setIsFlipped(false);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'w-6 bg-indigo-600 dark:bg-indigo-400'
                : masteredIds.includes(w.id)
                ? 'w-1.5 bg-emerald-400'
                : 'w-1.5 bg-slate-300 dark:bg-slate-700'
            }`}
          />
        ))}
        {deck.length > 30 && (
          <span className="text-[10px] text-slate-400 font-semibold pl-1">
            +{deck.length - 30}
          </span>
        )}
      </div>
    </div>
  );
}
