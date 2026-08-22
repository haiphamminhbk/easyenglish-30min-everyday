'use client';

import React from 'react';
import { Flame, Zap, Trophy, Award, Sparkles, Share2, BookOpen, CheckCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function MyRankCard({ currentUserStats, fullLeaderboard = [], onOpenCertificate }) {
  if (!currentUserStats) return null;

  const currentRank = currentUserStats.rank || 1;
  const isTop3 = currentRank <= 3;
  const tier = currentUserStats.tier || {
    name: 'Mầm Non Nỗ Lực',
    icon: '🌱',
    color: 'from-slate-400 to-slate-600',
    textColor: 'text-slate-400',
    bgBadge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  };

  // Find person ahead of me to show distance
  const nextTargetPerson = fullLeaderboard.find((l) => l.rank === currentRank - 1);
  const xpDifference = nextTargetPerson ? Math.max(0, (nextTargetPerson.totalPoints || 0) - currentUserStats.totalPoints) : 0;

  return (
    <div className="w-full rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-indigo-900/90 via-slate-900/95 to-purple-950/90 text-white shadow-2xl border border-indigo-400/30 relative overflow-hidden mb-8 backdrop-blur-xl group">
      {/* Ambient background glow effects */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left Side: Avatar & Name & Tier */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-xl ring-4 ring-indigo-400/40 flex items-center justify-center">
              {currentUserStats.photoURL ? (
                <img
                  src={currentUserStats.photoURL}
                  alt={currentUserStats.displayName}
                  className="w-full h-full object-cover rounded-[14px] sm:rounded-[20px]"
                />
              ) : (
                <span className="text-3xl sm:text-4xl">{currentUserStats.avatar || '🌟'}</span>
              )}
            </div>

            {/* Rank Chip */}
            <div className="absolute -bottom-2 -right-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 px-2 py-0.5 rounded-full text-xs font-black shadow-md border border-white/40">
              #{currentRank}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">
                Thứ Hạng Của Bạn
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            </div>

            <h3 className="font-heading text-lg sm:text-2xl font-black text-white flex items-center gap-2 mt-0.5 truncate">
              <span>{currentUserStats.displayName}</span>
              {isTop3 && <Sparkles className="w-4 h-4 text-amber-400 animate-spin flex-shrink-0" />}
            </h3>

            {/* Tier Pill */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border whitespace-nowrap ${tier.bgBadge}`}
              >
                <span>{tier.icon}</span>
                <span>{tier.name}</span>
              </span>

              <span className="text-xs text-slate-300 font-medium whitespace-nowrap">
                Vị trí <strong className="text-amber-400 font-black">#{currentRank}</strong> toàn hệ thống
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Stats Badges & Flex Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 text-center">
            {/* Streak */}
            <div className="px-2">
              <div className="flex items-center justify-center gap-1 text-sm sm:text-base font-black text-orange-400">
                <Flame className="w-4 h-4 fill-orange-400" />
                <span>{currentUserStats.streak}</span>
              </div>
              <p className="text-[10px] text-slate-300 font-bold uppercase">Chuỗi ngày</p>
            </div>

            {/* Total XP */}
            <div className="px-2 border-x border-white/10">
              <div className="flex items-center justify-center gap-1 text-sm sm:text-base font-black text-amber-300">
                <Zap className="w-4 h-4 fill-amber-300" />
                <span>{currentUserStats.totalPoints.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-slate-300 font-bold uppercase">Tổng XP</p>
            </div>

            {/* Mastered Vocab */}
            <div className="px-2">
              <div className="flex items-center justify-center gap-1 text-sm sm:text-base font-black text-emerald-300">
                <BookOpen className="w-4 h-4" />
                <span>{currentUserStats.totalWordsMastered}</span>
              </div>
              <p className="text-[10px] text-slate-300 font-bold uppercase">Từ vựng</p>
            </div>
          </div>

          {/* Flex Certificate Action Button */}
          <button
            type="button"
            onClick={onOpenCertificate}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all group/btn flex-shrink-0"
          >
            <Share2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
            <span>Thẻ Vinh Danh ✨</span>
          </button>
        </div>
      </div>

      {/* Progress to next rank notification */}
      {nextTargetPerson && (
        <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-indigo-200">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">⚡</span>
            <span>
              Cần thêm <strong className="text-white font-black">{xpDifference} XP</strong> để vượt lên{' '}
              <strong className="text-amber-300">#{currentRank - 1} ({nextTargetPerson.displayName})</strong>!
            </span>
          </div>

          <Link
            href="/vocabulary"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline"
          >
            <span>Luyện từ vựng để nhận XP</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
