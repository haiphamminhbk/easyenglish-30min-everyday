'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Gift, ChevronRight, Zap, Flame, Award } from 'lucide-react';
import Link from 'next/link';
import { getDailyQuests, claimDailyQuestReward } from '@/lib/leaderboardService';

export default function DailyQuestsCard({ onQuestClaimed }) {
  const [quests, setQuests] = useState([]);
  const [claimingId, setClaimingId] = useState(null);

  const refreshQuests = () => {
    const qList = getDailyQuests();
    setQuests(qList);
  };

  useEffect(() => {
    refreshQuests();
  }, []);

  const handleClaim = (quest) => {
    if (!quest.isCompleted || quest.isClaimed) return;

    setClaimingId(quest.id);
    const success = claimDailyQuestReward(quest.id, quest.xpReward);

    if (success) {
      setTimeout(() => {
        refreshQuests();
        setClaimingId(null);
        if (onQuestClaimed) onQuestClaimed(quest);
      }, 400);
    } else {
      setClaimingId(null);
    }
  };

  const totalRewardsPossible = quests.reduce((acc, q) => acc + q.xpReward, 0);
  const completedCount = quests.filter((q) => q.isCompleted).length;

  return (
    <div className="w-full rounded-3xl p-5 sm:p-6 bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-md backdrop-blur-md mb-8">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 dark:bg-amber-400/10 flex items-center justify-center text-xl shadow-inner">
            🎁
          </div>
          <div>
            <h3 className="font-heading text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>Nhiệm Vụ Rèn Luyện Hôm Nay</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Hoàn thành các mục tiêu để tích lũy thêm XP thăng hạng nhanh chóng!
            </p>
          </div>
        </div>

        {/* Completed tracker counter */}
        <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 px-3 py-1 rounded-full text-xs font-black">
          <Zap className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
          <span>
            {completedCount}/{quests.length} Hoàn thành (+{totalRewardsPossible} XP)
          </span>
        </div>
      </div>

      {/* Quests List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {quests.map((quest) => {
          const isDone = quest.isCompleted;
          const isClaimed = quest.isClaimed;

          return (
            <div
              key={quest.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                isClaimed
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60 opacity-90'
                  : isDone
                  ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/80 shadow-xs'
                  : 'bg-slate-50/70 dark:bg-slate-850/60 border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              {/* Left: Icon & Description */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                    isClaimed
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : isDone
                      ? 'bg-amber-400/20 text-amber-600 dark:text-amber-400 animate-pulse'
                      : 'bg-slate-200/70 dark:bg-slate-700/70 text-slate-500'
                  }`}
                >
                  {isClaimed ? '✔️' : quest.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-heading font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                      {quest.title}
                    </h4>
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-900/40 px-1.5 py-0.2 rounded-md whitespace-nowrap">
                      +{quest.xpReward} XP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {quest.description}
                  </p>
                </div>
              </div>

              {/* Right: Action / Status button */}
              <div className="flex-shrink-0">
                {isClaimed ? (
                  <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/40 px-2.5 py-1.5 rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã nhận</span>
                  </span>
                ) : isDone ? (
                  <button
                    type="button"
                    onClick={() => handleClaim(quest)}
                    disabled={claimingId === quest.id}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-transform flex items-center gap-1 animate-bounce"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Nhận XP</span>
                  </button>
                ) : (
                  <Link
                    href={quest.id === 'quest_words' || quest.id === 'quest_quiz' ? '/vocabulary' : '/'}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    <span>Làm ngay</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
