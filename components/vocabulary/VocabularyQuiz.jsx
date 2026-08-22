'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Volume2,
  RotateCcw,
  Sparkles,
  Trophy,
  Flame,
  ArrowRight,
  Target,
  BookOpen,
  Keyboard,
  Send,
  Lightbulb,
} from 'lucide-react';
import { speakWord, saveQuizResult } from '@/lib/vocabularyStorage';
import { VOCABULARY_LIST } from '@/lib/vocabularyData';

export default function VocabularyQuiz({
  words = [],
  topicName = 'Chủ đề đã chọn',
  onFinish,
  onToggleMastered,
  masteredIds = [],
}) {
  const [quizLength, setQuizLength] = useState(10);
  const [quizMode, setQuizMode] = useState('en_to_vi'); // en_to_vi, vi_to_en, audio_to_en, typing_confirm
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [typedInput, setTypedInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showLetterHint, setShowLetterHint] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState([]);

  const inputRef = useRef(null);

  // Generate quiz questions with 4 unique multiple choice options
  const generateQuiz = useCallback(() => {
    if (!words || words.length === 0) return;

    // Pick random subset of words
    const shuffledPool = [...words].sort(() => Math.random() - 0.5);
    const count = Math.min(quizLength, shuffledPool.length);
    const selectedWords = shuffledPool.slice(0, count);

    // Full pool to draw distractors from (combine current topic words + global vocabulary)
    const distractorPool = VOCABULARY_LIST.length > 20 ? VOCABULARY_LIST : words;

    const generatedQuestions = selectedWords.map((targetWord) => {
      // Find 3 distinct distractors that are not the target word
      const distractors = [];
      const usedIds = new Set([targetWord.id]);

      // First try same topic
      const sameTopicOthers = words.filter((w) => w.id !== targetWord.id);
      for (const w of sameTopicOthers.sort(() => Math.random() - 0.5)) {
        if (distractors.length < 3 && !usedIds.has(w.id)) {
          distractors.push(w);
          usedIds.add(w.id);
        }
      }

      // If needed, draw from global pool
      if (distractors.length < 3) {
        for (const w of distractorPool.sort(() => Math.random() - 0.5)) {
          if (distractors.length < 3 && !usedIds.has(w.id)) {
            distractors.push(w);
            usedIds.add(w.id);
          }
        }
      }

      // Mix target and distractors and shuffle
      const allChoices = [targetWord, ...distractors].sort(() => Math.random() - 0.5);

      // Scrambled letters for typing hints
      const scrambled = targetWord.word
        .toLowerCase()
        .replace(/[^a-z]/g, '')
        .split('')
        .sort(() => Math.random() - 0.5);

      return {
        word: targetWord,
        options: allChoices,
        scrambled,
      };
    });

    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setTypedInput('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowLetterHint(false);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setIsFinished(false);
    setWrongQuestions([]);
    setIsStarted(true);
  }, [words, quizLength]);

  const currentQ = questions[currentIndex] || null;

  // Auto-play audio when in audio_to_en mode or typing_confirm mode
  useEffect(() => {
    if (isStarted && !isFinished && currentQ) {
      setTypedInput('');
      setIsAnswered(false);
      setIsCorrect(false);
      setShowLetterHint(false);

      if (quizMode === 'audio_to_en') {
        speakWord(currentQ.word.word);
      }

      if (quizMode === 'typing_confirm' && inputRef.current) {
        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
        }, 100);
      }
    }
  }, [isStarted, isFinished, currentIndex, quizMode]);

  // Handle multiple choice option selection
  const handleSelectOption = (option) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const correct = option.id === currentQ.word.id;
    setIsCorrect(correct);

    if (correct) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
      speakWord(currentQ.word.word);
    } else {
      setStreak(0);
      setWrongQuestions((prev) => [...prev, currentQ.word]);
    }
  };

  // Handle typing submission and confirmation
  const handleConfirmTyping = (e) => {
    if (e) e.preventDefault();
    if (isAnswered || !currentQ || !typedInput.trim()) return;

    const userText = typedInput.trim().toLowerCase();
    const targetText = currentQ.word.word.trim().toLowerCase();

    const correct = userText === targetText;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
      speakWord(currentQ.word.word);
    } else {
      setStreak(0);
      setWrongQuestions((prev) => [...prev, currentQ.word]);
    }
  };

  // Next question
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTypedInput('');
      setIsAnswered(false);
      setIsCorrect(false);
      setShowLetterHint(false);
    } else {
      // Quiz completed
      setIsFinished(true);
      const isLastCorrect =
        quizMode === 'typing_confirm'
          ? typedInput.trim().toLowerCase() === currentQ?.word?.word?.trim()?.toLowerCase()
          : selectedOption?.id === currentQ?.word?.id;

      const finalScore = score + (isLastCorrect && !isAnswered ? 1 : 0);
      saveQuizResult({
        topicName,
        score: finalScore,
        totalQuestions: questions.length,
        mode: quizMode,
      });
    }
  };

  // Pre-Quiz Configuration Screen
  if (!isStarted) {
    return (
      <div className="w-full max-w-xl mx-auto p-6 sm:p-8 bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto text-3xl shadow-lg shadow-amber-500/25 mb-3">
            🏆
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
            Thử thách Trắc nghiệm Từ vựng
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kiểm tra mức độ phản xạ và ghi nhớ sâu từ vựng theo chuẩn Oxford 3000
          </p>
        </div>

        {/* Options Setup */}
        <div className="space-y-4 mb-6">
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Dạng câu hỏi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setQuizMode('en_to_vi')}
                className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                  quizMode === 'en_to_vi'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-400/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="block text-sm mb-0.5">🇬🇧 ➔ 🇻🇳</span>
                <span>Từ Anh ➔ Nghĩa Việt (Trắc nghiệm)</span>
              </button>

              <button
                type="button"
                onClick={() => setQuizMode('vi_to_en')}
                className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                  quizMode === 'vi_to_en'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-400/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="block text-sm mb-0.5">🇻🇳 ➔ 🇬🇧</span>
                <span>Nghĩa Việt ➔ Từ Anh (Trắc nghiệm)</span>
              </button>

              <button
                type="button"
                onClick={() => setQuizMode('typing_confirm')}
                className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                  quizMode === 'typing_confirm'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-400/30 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="block text-sm mb-0.5">✍️ ➔ 🇬🇧</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                  Gõ từ & Xác nhận (Typing & Confirm)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setQuizMode('audio_to_en')}
                className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                  quizMode === 'audio_to_en'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-400/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="block text-sm mb-0.5">🎧 ➔ 🇬🇧</span>
                <span>Nghe phát âm ➔ Chọn từ đúng</span>
              </button>
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Số lượng câu hỏi
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, Math.min(25, words.length || 25)].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuizLength(num)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    quizLength === num
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {num} câu
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={generateQuiz}
          disabled={words.length === 0}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5" />
          <span>Bắt đầu bài kiểm tra ngay ({Math.min(quizLength, words.length)} câu)</span>
        </button>
      </div>
    );
  }

  // Quiz Finished / Result Screen
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const isPassed = percentage >= 80;

    return (
      <div className="w-full max-w-xl mx-auto p-6 sm:p-8 bg-white/85 dark:bg-slate-900/85 rounded-3xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl shadow-2xl text-center">
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-xl mb-4 ${
            isPassed
              ? 'bg-gradient-to-tr from-emerald-400 to-teal-500 text-white shadow-emerald-500/30'
              : 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-amber-500/30'
          }`}
        >
          {isPassed ? '🎉' : '💪'}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mb-1">
          {isPassed ? 'Xuất sắc! Bạn đã vượt qua!' : 'Cố lên! Hãy tiếp tục luyện tập!'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Chủ đề: <span className="font-semibold text-slate-700 dark:text-slate-200">{topicName}</span>
        </p>

        {/* Score Card */}
        <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
          <div className="p-2">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Đúng</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {score}/{questions.length}
            </span>
          </div>
          <div className="p-2 border-x border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Tỷ lệ</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {percentage}%
            </span>
          </div>
          <div className="p-2">
            <span className="text-xs text-slate-400 font-semibold block mb-1">Chuỗi đúng</span>
            <span className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 fill-amber-400" />
              {bestStreak}
            </span>
          </div>
        </div>

        {/* Missed Words List if any */}
        {wrongQuestions.length > 0 && (
          <div className="mb-6 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-500" />
              Từ vựng cần ôn luyện lại ({wrongQuestions.length})
            </h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 no-scrollbar">
              {wrongQuestions.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakWord(w.word)}
                      className="p-1 rounded bg-amber-200/50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{w.word}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{w.phonetic}</span>
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{w.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={generateQuiz}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm lại bài kiểm tra</span>
          </button>

          <button
            onClick={() => setIsStarted(false)}
            className="px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all"
          >
            Đổi cấu hình
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col">
      {/* Quiz Top Bar: Progress & Streak */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm backdrop-blur-md">
            Câu {currentIndex + 1} / {questions.length}
          </span>
          {streak >= 2 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400 animate-bounce">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              {streak} streak!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            ✓ {score} Đúng
          </span>
          <button
            onClick={() => setIsStarted(false)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline font-medium ml-2"
          >
            Thoát
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 bg-white/90 dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-2xl shadow-xl mb-5 text-center relative overflow-hidden">
        {/* Question Prompt */}
        <p className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
          {quizMode === 'en_to_vi'
            ? 'Hãy chọn nghĩa tiếng Việt chính xác:'
            : quizMode === 'vi_to_en'
            ? 'Hãy chọn từ tiếng Anh tương ứng:'
            : quizMode === 'typing_confirm'
            ? 'Hãy gõ từ tiếng Anh chính xác và bấm Xác nhận:'
            : 'Hãy nghe phát âm và chọn từ đúng:'}
        </p>

        {/* Question Content based on mode */}
        {quizMode === 'en_to_vi' && (
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-50 mb-2">
              {currentQ.word.word}
            </h3>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-slate-500 dark:text-slate-400">
                {currentQ.word.phonetic}
              </span>
              <button
                onClick={() => speakWord(currentQ.word.word)}
                className="p-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:scale-110 transition-transform"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {(quizMode === 'vi_to_en' || quizMode === 'typing_confirm') && (
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mb-1">
              &ldquo;{currentQ.word.meaning}&rdquo;
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400 font-semibold">
                Cấp độ: {currentQ.word.level} · Oxford 3000
              </span>
              {currentQ.word.pos && (
                <span className="text-xs italic text-slate-400">({currentQ.word.pos})</span>
              )}
              {quizMode === 'typing_confirm' && (
                <button
                  type="button"
                  onClick={() => speakWord(currentQ.word.word)}
                  title="Nghe phát âm gợi ý"
                  className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:scale-110 transition-transform"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {quizMode === 'audio_to_en' && (
          <div className="flex flex-col items-center justify-center py-2">
            <button
              onClick={() => speakWord(currentQ.word.word)}
              className="p-4 rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-bold text-sm mb-2"
            >
              <Volume2 className="w-6 h-6 animate-pulse" />
              <span>Nghe lại phát âm (US)</span>
            </button>
            <span className="text-xs text-slate-400">
              Nhấp vào nút trên để nghe lại giọng đọc
            </span>
          </div>
        )}
      </div>

      {/* TYPING & CONFIRM MODE VIEW */}
      {quizMode === 'typing_confirm' && (
        <div className="space-y-4 mb-5">
          {/* Letter Hint if requested */}
          {showLetterHint && !isAnswered && (
            <div className="text-center p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 animate-fadeIn">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                Ký tự gợi ý:
              </p>
              <div className="flex items-center justify-center gap-1 font-mono text-base font-bold text-indigo-700 dark:text-indigo-300">
                {currentQ.word.word.split('').map((char, i) => (
                  <span
                    key={i}
                    className="w-6 h-7 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shadow-xs"
                  >
                    {i === 0 || i === currentQ.word.word.length - 1 || char === ' ' ? char : '_'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Typing Form */}
          <form onSubmit={handleConfirmTyping} className="space-y-3">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Gõ từ tiếng Anh tại đây..."
                value={typedInput}
                disabled={isAnswered}
                onChange={(e) => setTypedInput(e.target.value)}
                className={`w-full py-4 px-5 text-center text-lg sm:text-xl font-bold rounded-2xl border-2 transition-all outline-none ${
                  isAnswered
                    ? isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-400/30'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-400/30'
                    : 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-slate-700 focus:border-indigo-500 text-slate-800 dark:text-slate-100 shadow-inner'
                }`}
              />
            </div>

            {/* Quick action buttons before confirm */}
            {!isAnswered ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLetterHint(true)}
                  disabled={showLetterHint}
                  className="px-4 py-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Gợi ý</span>
                </button>

                <button
                  type="submit"
                  disabled={!typedInput.trim()}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Xác nhận câu trả lời (Enter)</span>
                </button>
              </div>
            ) : (
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
                  <span className="font-mono text-xs">{currentQ.word.phonetic}</span>
                </div>
                <p className="text-sm font-bold">
                  Từ đúng: <span className="text-indigo-600 dark:text-indigo-400">{currentQ.word.word}</span>
                </p>
                {currentQ.word.example && (
                  <p className="text-xs italic text-slate-600 dark:text-slate-300 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    &ldquo;{currentQ.word.example}&rdquo;
                  </p>
                )}
              </div>
            )}
          </form>
        </div>
      )}

      {/* MULTIPLE CHOICE 4 OPTIONS GRID (for en_to_vi, vi_to_en, audio_to_en) */}
      {quizMode !== 'typing_confirm' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {currentQ.options.map((option, idx) => {
            const isTarget = option.id === currentQ.word.id;
            const isChosen = selectedOption?.id === option.id;

            let btnStyle =
              'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 hover:border-indigo-300 dark:hover:border-indigo-600';

            if (isAnswered) {
              if (isTarget) {
                btnStyle =
                  'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-500/30 scale-[1.02]';
              } else if (isChosen && !isTarget) {
                btnStyle =
                  'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-400/40 shadow-lg shadow-rose-500/30';
              } else {
                btnStyle = 'opacity-50 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
              }
            }

            const displayText =
              quizMode === 'en_to_vi' ? option.meaning : `${option.word} (${option.phonetic})`;

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option)}
                disabled={isAnswered}
                className={`p-4 rounded-2xl border font-bold text-left transition-all duration-200 flex items-center justify-between text-sm shadow-sm ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-mono font-bold ${
                      isAnswered && isTarget
                        ? 'bg-white/30 text-white'
                        : isAnswered && isChosen
                        ? 'bg-white/30 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{displayText}</span>
                </div>

                {isAnswered && isTarget && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                {isAnswered && isChosen && !isTarget && <XCircle className="w-5 h-5 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Answer Explanation & Next Button */}
      {isAnswered && (
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 backdrop-blur-md mb-4 animate-fadeIn flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
                {currentQ.word.word}
              </span>
              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                {currentQ.word.phonetic}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold">
                {currentQ.word.level}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              👉 {currentQ.word.meaning}
            </p>
          </div>

          <button
            onClick={handleNextQuestion}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm shadow-md shadow-indigo-500/30 flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 transition-all"
          >
            <span>{currentIndex + 1 === questions.length ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
