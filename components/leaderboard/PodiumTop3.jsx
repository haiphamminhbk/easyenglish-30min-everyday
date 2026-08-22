'use client';

import React from 'react';
import { Crown, Flame, Zap, Trophy, Award, Sparkles, Heart } from 'lucide-react';

export default function PodiumTop3({ topLearners = [], onCheer }) {
  if (!topLearners || topLearners.length === 0) return null;

  const first = topLearners[0] || null;
  const second = topLearners[1] || null;
  const third = topLearners[2] || null;

  return (
    <section className="w-full mb-8 pt-2">
      {/* Podium Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-yellow-500/15 to-amber-500/15 border border-amber-400/30 text-amber-500 dark:text-amber-300 text-[11px] sm:text-xs font-black tracking-wider uppercase shadow-inner">
          <Crown className="w-3.5 h-3.5 animate-bounce text-amber-500 dark:text-amber-300" />
          <span>Bục Vinh Quang Top 3 Xuất Sắc</span>
          <Sparkles className="w-3 h-3 text-yellow-400" />
        </div>
      </div>

      {/* 3D Glass Podium Grid */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-4 items-end max-w-2xl mx-auto px-1">
        {/* RANK 2 - SILVER */}
        {second ? (
          <div className="flex flex-col items-center group min-w-0">
            {/* Learner Info */}
            <div className="flex flex-col items-center mb-2 sm:mb-3 text-center transition-transform duration-300 group-hover:-translate-y-1 w-full min-w-0 px-0.5">
              <div className="relative mb-1.5">
                <div className="w-13 h-13 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-slate-300 via-slate-100 to-slate-400 dark:from-slate-700 dark:via-slate-600 dark:to-slate-500 p-0.5 sm:p-1 shadow-lg shadow-slate-500/20 ring-2 ring-slate-300 dark:ring-slate-500 flex items-center justify-center">
                  {second.photoURL ? (
                    <img
                      src={second.photoURL}
                      alt={second.displayName}
                      className="w-full h-full object-cover rounded-[14px] sm:rounded-[20px]"
                    />
                  ) : (
                    <span className="text-xl sm:text-3xl">{second.avatar || '🥈'}</span>
                  )}
                </div>
                {/* Silver Medal Badge */}
                <div className="absolute -bottom-1.5 -right-1 sm:-right-2 bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black shadow-md border-2 border-white dark:border-slate-800">
                  2
                </div>
              </div>

              <h4 className="font-heading font-extrabold text-[11px] sm:text-sm text-slate-800 dark:text-slate-100 truncate w-full">
                {second.displayName}
              </h4>
              <div className="flex items-center justify-center gap-0.5 text-[10px] sm:text-[11px] font-bold text-orange-500 dark:text-orange-400 mt-0.5">
                <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                <span>{second.streak}d</span>
              </div>
              <div className="flex items-center justify-center gap-0.5 text-[9px] sm:text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-indigo-500" />
                <span>{second.totalPoints.toLocaleString()}</span>
              </div>
            </div>

            {/* Silver Podium Block */}
            <div className="w-full h-20 sm:h-32 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-slate-200/90 via-slate-300/80 to-slate-400/90 dark:from-slate-700/90 dark:via-slate-800/80 dark:to-slate-900/90 border-t-2 border-x-2 border-slate-300 dark:border-slate-600 shadow-xl flex flex-col items-center justify-center p-1.5 sm:p-2 text-center relative overflow-hidden backdrop-blur-md">
              <div className="text-xl sm:text-3xl font-black text-slate-400 dark:text-slate-500 tracking-wider select-none">
                #2
              </div>
              <span className="text-[9px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                Á Quân
              </span>
            </div>
          </div>
        ) : (
          <div />
        )}

        {/* RANK 1 - GOLD (CHAMPION) */}
        {first && (
          <div className="flex flex-col items-center group -mt-3 sm:-mt-4 min-w-0">
            {/* Golden Crown */}
            <div className="mb-0.5 sm:mb-1 text-amber-500 dark:text-amber-400 animate-bounce">
              <Crown className="w-6 h-6 sm:w-9 sm:h-9 fill-amber-400 stroke-amber-600" />
            </div>

            {/* Learner Info */}
            <div className="flex flex-col items-center mb-2 sm:mb-3 text-center transition-transform duration-300 group-hover:-translate-y-1 w-full min-w-0 px-0.5">
              <div className="relative mb-1.5">
                <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 p-1 sm:p-1.5 shadow-xl shadow-amber-500/35 ring-3 sm:ring-4 ring-amber-400/60 dark:ring-amber-400/40 flex items-center justify-center animate-pulse">
                  {first.photoURL ? (
                    <img
                      src={first.photoURL}
                      alt={first.displayName}
                      className="w-full h-full object-cover rounded-[14px] sm:rounded-[20px]"
                    />
                  ) : (
                    <span className="text-2xl sm:text-4xl">{first.avatar || '👑'}</span>
                  )}
                </div>
                {/* Gold Medal Badge */}
                <div className="absolute -bottom-1.5 -right-1 sm:-right-2 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 text-amber-950 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-black shadow-lg border-2 border-white dark:border-slate-800">
                  1
                </div>
              </div>

              <h4 className="font-heading font-black text-xs sm:text-base text-amber-600 dark:text-amber-300 truncate w-full">
                {first.displayName}
              </h4>
              <div className="flex items-center justify-center gap-0.5 text-[10px] sm:text-xs font-black text-orange-500 dark:text-orange-400 mt-0.5">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-orange-500 text-orange-500" />
                <span>{first.streak}d</span>
              </div>
              <div className="flex items-center justify-center gap-0.5 text-[9px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
                <Zap className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-indigo-500 text-indigo-500" />
                <span>{first.totalPoints.toLocaleString()} XP</span>
              </div>
            </div>

            {/* Gold Podium Block */}
            <div className="w-full h-28 sm:h-44 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-amber-300/95 via-amber-400/90 to-yellow-500/95 dark:from-amber-600/90 dark:via-amber-700/80 dark:to-yellow-800/90 border-t-2 border-x-2 border-amber-300 dark:border-amber-500 shadow-2xl flex flex-col items-center justify-center p-1.5 sm:p-2 text-center relative overflow-hidden backdrop-blur-md">
              <div className="text-2xl sm:text-4xl font-black text-amber-900/40 dark:text-amber-200/30 tracking-wider select-none">
                #1
              </div>
              <span className="text-[10px] sm:text-sm font-black text-amber-950 dark:text-amber-100 mt-0.5 uppercase tracking-wider">
                Quán Quân 👑
              </span>
            </div>
          </div>
        )}

        {/* RANK 3 - BRONZE */}
        {third ? (
          <div className="flex flex-col items-center group min-w-0">
            {/* Learner Info */}
            <div className="flex flex-col items-center mb-2 sm:mb-3 text-center transition-transform duration-300 group-hover:-translate-y-1 w-full min-w-0 px-0.5">
              <div className="relative mb-1.5">
                <div className="w-13 h-13 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-700 via-orange-600 to-amber-600 p-0.5 sm:p-1 shadow-lg shadow-orange-700/25 ring-2 ring-amber-600/50 flex items-center justify-center">
                  {third.photoURL ? (
                    <img
                      src={third.photoURL}
                      alt={third.displayName}
                      className="w-full h-full object-cover rounded-[14px] sm:rounded-[20px]"
                    />
                  ) : (
                    <span className="text-xl sm:text-3xl">{third.avatar || '🥉'}</span>
                  )}
                </div>
                {/* Bronze Medal Badge */}
                <div className="absolute -bottom-1.5 -right-1 sm:-right-2 bg-gradient-to-br from-amber-600 to-orange-700 text-white w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black shadow-md border-2 border-white dark:border-slate-800">
                  3
                </div>
              </div>

              <h4 className="font-heading font-extrabold text-[11px] sm:text-sm text-slate-800 dark:text-slate-100 truncate w-full">
                {third.displayName}
              </h4>
              <div className="flex items-center justify-center gap-0.5 text-[10px] sm:text-[11px] font-bold text-orange-500 dark:text-orange-400 mt-0.5">
                <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                <span>{third.streak}d</span>
              </div>
              <div className="flex items-center justify-center gap-0.5 text-[9px] sm:text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-indigo-500" />
                <span>{third.totalPoints.toLocaleString()}</span>
              </div>
            </div>

            {/* Bronze Podium Block */}
            <div className="w-full h-16 sm:h-26 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-amber-700/80 via-amber-800/80 to-amber-900/90 dark:from-amber-800/90 dark:via-amber-900/90 dark:to-slate-950 border-t-2 border-x-2 border-amber-600/70 dark:border-amber-700 shadow-xl flex flex-col items-center justify-center p-1.5 sm:p-2 text-center relative overflow-hidden backdrop-blur-md">
              <div className="text-xl sm:text-3xl font-black text-amber-500/40 dark:text-amber-400/20 tracking-wider select-none">
                #3
              </div>
              <span className="text-[9px] sm:text-xs font-bold text-amber-200 dark:text-amber-300 mt-0.5">
                Hạng Ba
              </span>
            </div>
          </div>
        ) : (
          <div />
        )}
      </div>
    </section>
  );
}
