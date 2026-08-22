'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, RotateCcw, Trophy, CheckCircle2, Volume2 } from 'lucide-react';
import { speakWord } from '@/lib/vocabularyStorage';

export default function MatchingGame({ words = [], onToggleMastered }) {
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Initialize game board
  const initGame = useCallback(() => {
    if (!words || words.length === 0) return;

    // Pick 6 random words
    const count = Math.min(6, words.length);
    const selectedWords = [...words].sort(() => Math.random() - 0.5).slice(0, count);

    // Create English tiles and Vietnamese tiles
    const enTiles = selectedWords.map((w) => ({
      tileId: `en_${w.id}`,
      wordId: w.id,
      text: w.word,
      phonetic: w.phonetic,
      level: w.level,
      type: 'en',
    }));

    const viTiles = selectedWords.map((w) => ({
      tileId: `vi_${w.id}`,
      wordId: w.id,
      text: w.meaning,
      level: w.level,
      type: 'vi',
    }));

    // Combine and shuffle
    const gameDeck = [...enTiles, ...viTiles].sort(() => Math.random() - 0.5);

    setCards(gameDeck);
    setSelectedCards([]);
    setMatchedIds(new Set());
    setMoves(0);
    setTimerSeconds(0);
    setIsGameOver(false);
    setIsTimerRunning(true);
  }, [words]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && !isGameOver) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isGameOver]);

  // Card click handler
  const handleCardClick = (card) => {
    if (matchedIds.has(card.wordId)) return;
    if (selectedCards.some((c) => c.tileId === card.tileId)) return;
    if (selectedCards.length >= 2) return;

    if (card.type === 'en') {
      speakWord(card.text);
    }

    const newSelection = [...selectedCards, card];
    setSelectedCards(newSelection);

    if (newSelection.length === 2) {
      setMoves((prev) => prev + 1);
      const [first, second] = newSelection;

      if (first.wordId === second.wordId && first.type !== second.type) {
        // Matched!
        setTimeout(() => {
          setMatchedIds((prev) => {
            const next = new Set(prev);
            next.add(first.wordId);
            if (next.size === cards.length / 2) {
              setIsGameOver(true);
              setIsTimerRunning(false);
            }
            return next;
          });
          setSelectedCards([]);
        }, 500);
      } else {
        // Not matched
        setTimeout(() => {
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col">
      {/* Game Stats Top Bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm">
            <span>Thời gian:</span>
            <span className="font-extrabold text-slate-900 dark:text-white">{formatTime(timerSeconds)}</span>
          </span>

          <span className="px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm">
            Lượt ghép: {moves}
          </span>
        </div>

        <button
          onClick={initGame}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Ván mới</span>
        </button>
      </div>

      {/* Grid of Cards (12 tiles: 4x3 or 3x4) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {cards.map((card) => {
          const isMatched = matchedIds.has(card.wordId);
          const isSelected = selectedCards.some((c) => c.tileId === card.tileId);

          let tileClass =
            'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:shadow-md';

          if (isMatched) {
            tileClass =
              'bg-emerald-500/20 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 scale-95 opacity-80';
          } else if (isSelected) {
            tileClass =
              'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 scale-105 ring-2 ring-indigo-400';
          }

          return (
            <button
              key={card.tileId}
              onClick={() => handleCardClick(card)}
              disabled={isMatched || isSelected}
              className={`relative min-h-[90px] sm:min-h-[105px] p-3 rounded-2xl border font-bold text-center flex flex-col items-center justify-center transition-all duration-300 select-none ${tileClass}`}
            >
              {/* Type Badge */}
              <span
                className={`absolute top-2 left-2 text-[9px] uppercase font-mono px-1.5 py-0.5 rounded ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : isMatched
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                }`}
              >
                {card.type === 'en' ? 'EN' : 'VI'}
              </span>

              {/* Text */}
              <p className="text-xs sm:text-sm font-extrabold leading-snug break-words px-1">
                {card.text}
              </p>

              {card.phonetic && (
                <span
                  className={`text-[10px] font-mono mt-1 ${
                    isSelected ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {card.phonetic}
                </span>
              )}

              {isMatched && (
                <div className="absolute bottom-2 right-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Win Celebration Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto text-3xl shadow-xl shadow-amber-500/30 mb-3">
              🏆
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-1">
              Tuyệt vời! Hoàn thành ván chơi!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Bạn đã ghép đúng tất cả các cặp từ vựng!
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-0.5">Thời gian</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {formatTime(timerSeconds)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-0.5">Số lượt</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {moves} lượt
                </span>
              </div>
            </div>

            <button
              onClick={initGame}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi ván tiếp theo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
