'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Keyboard,
  Trophy,
} from 'lucide-react';
import { speakWord } from '@/lib/vocabularyStorage';

export default function SpellingPractice({ words = [], onToggleMastered, masteredIds = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const inputRef = useRef(null);

  const currentWord = words[currentIndex] || null;

  // Setup current word
  useEffect(() => {
    if (currentWord) {
      setInputVal('');
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);

      // Create scrambled letters for assistance
      const cleanLetters = currentWord.word
        .toLowerCase()
        .replace(/[^a-z]/g, '')
        .split('')
        .sort(() => Math.random() - 0.5);
      setScrambledLetters(cleanLetters);

      // Auto pronounce word on load
      speakWord(currentWord.word);

      // Focus input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [currentWord, currentIndex]);

  // Handle submit answer
  const handleCheck = useCallback(
    (e) => {
      if (e) e.preventDefault();
      if (!currentWord || isAnswered) return;

      const userText = inputVal.trim().toLowerCase();
      const targetText = currentWord.word.trim().toLowerCase();

      const correct = userText === targetText;
      setIsCorrect(correct);
      setIsAnswered(true);

      if (correct) {
        setScore((prev) => prev + 1);
        speakWord(currentWord.word);
      }
    },
    [currentWord, inputVal, isAnswered]
  );

  // Next word
  const handleNext = () => {
    if (currentIndex + 1 < words.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  // Click on scrambled letter tile
  const handleLetterClick = (letter) => {
    if (isAnswered) return;
    setInputVal((prev) => prev + letter);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (!currentWord || words.length === 0) {
    return (
      <div className="p-8 text-center bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500">Vui lòng chọn danh sách có ít nhất 1 từ vựng.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <span className="px-3 py-1 bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm">
          Từ {currentIndex + 1} / {words.length}
        </span>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
          ✓ {score} Đúng
        </span>
      </div>

      {/* Main Card */}
      <div className="p-6 sm:p-8 bg-white/90 dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-2xl shadow-xl text-center mb-6">
        {/* Audio Button */}
        <div className="flex flex-col items-center justify-center mb-6">
          <button
            onClick={() => speakWord(currentWord.word)}
            className="p-5 rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 font-bold text-base mb-3 group"
          >
            <Volume2 className="w-6 h-6 group-hover:animate-pulse" />
            <span>Nghe phát âm chuẩn Mỹ (US)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => speakWord(currentWord.word, 0.65)}
              className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            >
              🐢 Nghe chậm (0.65x)
            </button>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
              {currentWord.level}
            </span>
          </div>
        </div>

        {/* Meaning Prompt */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Gợi ý nghĩa tiếng Việt
          </p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-amber-500 dark:text-amber-400">
            {currentWord.meaning}
          </h3>
          {currentWord.pos && (
            <span className="text-xs text-slate-400 italic">({currentWord.pos})</span>
          )}
        </div>

        {/* Letter Hint if requested */}
        {showHint && !isAnswered && (
          <div className="mb-4 text-center animate-fadeIn">
            <p className="text-xs font-bold text-indigo-500 mb-1">Ký tự gợi ý:</p>
            <div className="flex items-center justify-center gap-1 font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {currentWord.word.split('').map((char, i) => (
                <span
                  key={i}
                  className="w-7 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center"
                >
                  {i === 0 || i === currentWord.word.length - 1 || char === ' ' ? char : '_'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleCheck} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Gõ từ tiếng Anh bạn vừa nghe..."
              value={inputVal}
              disabled={isAnswered}
              onChange={(e) => setInputVal(e.target.value)}
              className={`w-full py-4 px-5 text-center text-lg sm:text-xl font-bold rounded-2xl border-2 transition-all outline-none ${
                isAnswered
                  ? isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-400/30'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-400/30'
                  : 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-slate-700 focus:border-indigo-500 text-slate-800 dark:text-slate-100 shadow-inner'
              }`}
            />
          </div>

          {/* Letter click tiles for easy mobile typing */}
          {!isAnswered && scrambledLetters.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {scrambledLetters.map((letter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleLetterClick(letter)}
                  className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-sm shadow-sm transition-all active:scale-95"
                >
                  {letter}
                </button>
              ))}
            </div>
          )}

          {/* Controls Bar */}
          {!isAnswered ? (
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowHint(true)}
                disabled={showHint}
                className="px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Gợi ý ký tự</span>
              </button>

              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Kiểm tra chính tả</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div
                className={`p-4 rounded-2xl text-left border ${
                  isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-base flex items-center gap-1.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    )}
                    {isCorrect ? 'Chính xác 100%!' : 'Chưa chính xác!'}
                  </span>
                  <span className="font-mono text-xs">{currentWord.phonetic}</span>
                </div>
                <p className="text-sm font-bold">
                  Từ đúng: <span className="text-indigo-600 dark:text-indigo-400">{currentWord.word}</span>
                </p>
                {currentWord.example && (
                  <p className="text-xs italic text-slate-600 dark:text-slate-300 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    &ldquo;{currentWord.example}&rdquo;
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
              >
                <span>Từ tiếp theo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
