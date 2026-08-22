'use client';

import React, { useState } from 'react';
import { Flame, Zap, Trophy, Award, Heart, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import { cheerLearner } from '@/lib/leaderboardService';

export default function LeaderboardRow({ learner, onCheerSuccess }) {
  const [cheers, setCheers] = useState(learner.cheersCount || 10);
  const [hasCheered, setHasCheered] = useState(false);
  const [cheerPop, setCheerPop] = useState(false);

  const handleCheer = (e) => {
    e.stopPropagation();
    if (hasCheered) return;

    const ok = cheerLearner(learner.id || learner.userId);
    if (ok) {
      setCheers((prev) => prev + 1);
      setHasCheered(true);
      setCheerPop(true);
      setTimeout(() => setCheerPop(false), 1000);
      if (onCheerSuccess) onCheerSuccess(learner);
    }
  };

  const isTop1 = learner.rank === 1;
  const isTop2 = learner.rank === 2;
  const isTop3 = learner.rank === 3;
  const isMe = Boolean(learner.isCurrentUser);

  const tier = learner.tier || {
    name: 'Mầm Non Nỗ Lực',
    icon: '🌱',
    textColor: 'text-slate-400',
    bgBadge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  };

  return (
    <div
      className={`relative w-full rounded-2xl p-3 sm:p-4 transition-all duration-300 border ${
        isMe
          ? 'bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-indigo-500/5 dark:from-indigo-900/40 dark:via-purple-900/30 dark:to-slate-900/60 border-indigo-400 dark:border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-400/30 dark:ring-indigo-500/30 scale-[1.01]'
          : isTop1
          ? 'bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent dark:from-amber-950/30 dark:via-slate-900/60 dark:to-slate-900/60 border-amber-300/80 dark:border-amber-700/80 shadow-md'
          : 'bg-white/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-750/90 border-slate-200/80 dark:border-slate-700/80 shadow-xs'
      }`}
    >
      {/* ========================================================================= */}
      {/* DESKTOP & TABLET LAYOUT (>= sm: 640px) */}
      {/* ========================================================================= */}
      <div className="hidden sm:flex items-center justify-between gap-3 sm:gap-4">
        {/* Left Side: Rank, Avatar, Name & Badges */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Rank Badge */}
          <div className="flex-shrink-0 w-8 text-center flex items-center justify-center">
            {isTop1 ? (
              <span className="text-2xl" title="Quán Quân">🥇</span>
            ) : isTop2 ? (
              <span className="text-2xl" title="Á Quân">🥈</span>
            ) : isTop3 ? (
              <span className="text-2xl" title="Hạng Ba">🥉</span>
            ) : (
              <span className="font-heading font-black text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/70 px-2 py-1 rounded-xl">
                #{learner.rank}
              </span>
            )}
          </div>

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md overflow-hidden bg-gradient-to-tr ${
                isTop1
                  ? 'from-amber-400 to-yellow-300 ring-2 ring-amber-400'
                  : isTop2
                  ? 'from-slate-300 to-slate-100 dark:from-slate-700 dark:to-slate-600 ring-2 ring-slate-400'
                  : isTop3
                  ? 'from-amber-700 to-orange-500 ring-2 ring-orange-500'
                  : 'from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 ring-1 ring-slate-200 dark:ring-slate-700'
              }`}
            >
              {learner.photoURL ? (
                <img
                  src={learner.photoURL}
                  alt={learner.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">{learner.avatar || '🎓'}</span>
              )}
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
          </div>

          {/* Name & Tier Badge & Quote */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4
                className={`font-heading font-extrabold text-sm truncate ${
                  isMe
                    ? 'text-indigo-600 dark:text-indigo-300'
                    : 'text-slate-800 dark:text-slate-100'
                }`}
              >
                {learner.displayName}
              </h4>

              {isMe && (
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-indigo-600 text-white shadow-2xs">
                  BẠN
                </span>
              )}

              {learner.location && (
                <span className="text-[10px] text-slate-400 font-medium">
                  • {learner.location}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border whitespace-nowrap ${tier.bgBadge}`}
              >
                <span>{tier.icon}</span>
                <span>{tier.name}</span>
              </span>

              {learner.quote && (
                <span className="text-[10px] text-slate-400 italic truncate max-w-[180px] hidden md:inline">
                  “{learner.quote}”
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Streak, XP & Cheer Button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Streak Flame */}
          <div className="flex flex-col items-center justify-center bg-orange-50 dark:bg-orange-950/40 border border-orange-200/70 dark:border-orange-800/70 px-2.5 py-1 rounded-xl min-w-[56px]">
            <div className="flex items-center gap-1 text-xs font-black text-orange-600 dark:text-orange-400">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
              <span>{learner.streak}</span>
            </div>
            <span className="text-[9px] font-semibold text-orange-600/80 dark:text-orange-400/80 uppercase">
              ngày
            </span>
          </div>

          {/* XP Points */}
          <div className="flex flex-col items-end justify-center min-w-[75px]">
            <div className="flex items-center gap-1 text-xs font-black text-indigo-600 dark:text-indigo-400">
              <Zap className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
              <span>{learner.totalPoints.toLocaleString()}</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              XP Chăm chỉ
            </span>
          </div>

          {/* Cheer Button */}
          <button
            type="button"
            onClick={handleCheer}
            title={hasCheered ? 'Bạn đã cổ vũ học viên này!' : 'Nhấn để thả tim cổ vũ!'}
            className={`relative p-2 rounded-xl transition-all active:scale-90 flex items-center gap-1 text-xs font-bold ${
              hasCheered
                ? 'bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 cursor-default'
                : 'bg-slate-100 dark:bg-slate-700/60 hover:bg-pink-50 dark:hover:bg-pink-950/40 text-slate-500 hover:text-pink-500 dark:text-slate-400'
            }`}
          >
            <span className={`text-sm ${cheerPop ? 'scale-150 transition-transform' : ''}`}>
              👏
            </span>
            <span className="text-[11px] font-extrabold">{cheers}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE-OPTIMIZED LAYOUT (< sm: under 640px) */}
      {/* ========================================================================= */}
      <div className="flex sm:hidden flex-col gap-2">
        {/* Row 1: Rank, Avatar, Name & Top Stats */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Rank Badge */}
            <div className="flex-shrink-0 w-6 text-center flex items-center justify-center">
              {isTop1 ? (
                <span className="text-xl" title="Quán Quân">🥇</span>
              ) : isTop2 ? (
                <span className="text-xl" title="Á Quân">🥈</span>
              ) : isTop3 ? (
                <span className="text-xl" title="Hạng Ba">🥉</span>
              ) : (
                <span className="font-heading font-black text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/70 px-1.5 py-0.5 rounded-lg">
                  #{learner.rank}
                </span>
              )}
            </div>

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs overflow-hidden bg-gradient-to-tr ${
                  isTop1
                    ? 'from-amber-400 to-yellow-300 ring-2 ring-amber-400'
                    : isTop2
                    ? 'from-slate-300 to-slate-100 dark:from-slate-700 dark:to-slate-600 ring-2 ring-slate-400'
                    : isTop3
                    ? 'from-amber-700 to-orange-500 ring-2 ring-orange-500'
                    : 'from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 ring-1 ring-slate-200 dark:ring-slate-700'
                }`}
              >
                {learner.photoURL ? (
                  <img
                    src={learner.photoURL}
                    alt={learner.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg">{learner.avatar || '🎓'}</span>
                )}
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
            </div>

            {/* Name */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4
                  className={`font-heading font-black text-xs truncate ${
                    isMe
                      ? 'text-indigo-600 dark:text-indigo-300'
                      : 'text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {learner.displayName}
                </h4>

                {isMe && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-indigo-600 text-white shadow-2xs">
                    BẠN
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Top Right: XP and Streak Pills */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Streak Pill */}
            <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200/70 dark:border-orange-800/70 text-[11px] font-black text-orange-600 dark:text-orange-400">
              <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
              <span>{learner.streak}d</span>
            </div>

            {/* XP Pill */}
            <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/70 text-[11px] font-black text-indigo-600 dark:text-indigo-400">
              <Zap className="w-3 h-3 fill-indigo-500 text-indigo-500" />
              <span>{learner.totalPoints.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Tier Badge on left + Cheer Button on right */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-750/60">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${tier.bgBadge}`}
          >
            <span>{tier.icon}</span>
            <span>{tier.name}</span>
          </span>

          {/* Cheer Button */}
          <button
            type="button"
            onClick={handleCheer}
            title={hasCheered ? 'Đã cổ vũ!' : 'Cổ vũ học viên!'}
            className={`px-2.5 py-1 rounded-xl transition-all active:scale-90 flex items-center gap-1 text-[11px] font-bold ${
              hasCheered
                ? 'bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400'
                : 'bg-slate-100 dark:bg-slate-700/60 hover:bg-pink-50 text-slate-500 hover:text-pink-500 dark:text-slate-400'
            }`}
          >
            <span className={`text-xs ${cheerPop ? 'scale-150 transition-transform' : ''}`}>
              👏
            </span>
            <span>{cheers}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
