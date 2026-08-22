'use client';

import React from 'react';
import {
  Crown,
  Flame,
  Zap,
  Sparkles,
  Award,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronRight,
  BookOpen,
  Calendar,
  PenTool,
  Trophy,
} from 'lucide-react';
import { TIERS } from '@/lib/leaderboardService';

export default function TierRoadmapSection({ currentUserStats }) {
  const currentTierId = currentUserStats?.tier?.id || 'novice';
  const userXp = currentUserStats?.totalPoints || 0;
  const userStreak = currentUserStats?.streak || 0;

  const TIER_DETAILS = [
    {
      ...TIERS.MYTHIC,
      levelLabel: 'CẤP ĐỘ V · HUYỀN THOẠI',
      subtitle: 'Đỉnh cao của sự kiên trì & Kỷ luật thép',
      perks: 'Khung viền Vàng Kim Cương 3D, Hào quang vinh danh toàn hệ thống, Chứng nhận danh dự vĩnh viễn.',
      themeBg: 'from-amber-500/10 via-yellow-500/5 to-transparent',
      themeBorder: 'border-amber-400/50 dark:border-amber-500/50',
      badgeBg: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
      iconBoxBg: 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-amber-950 shadow-amber-500/30',
      tagColor: 'text-amber-500 dark:text-amber-400',
    },
    {
      ...TIERS.MASTER,
      levelLabel: 'CẤP ĐỘ IV · CAO THỦ',
      subtitle: 'Thói quen học tập đã hòa vào lối sống',
      perks: 'Khung viền Tím Sapphire Neon, Hiệu ứng tia sáng tím rực rỡ, Vinh danh trong Top 5% học viên.',
      themeBg: 'from-purple-500/10 via-indigo-500/5 to-transparent',
      themeBorder: 'border-purple-400/50 dark:border-purple-500/50',
      badgeBg: 'bg-purple-400/20 text-purple-300 border-purple-400/40',
      iconBoxBg: 'bg-gradient-to-tr from-purple-500 via-indigo-400 to-pink-500 text-white shadow-purple-500/30',
      tagColor: 'text-purple-500 dark:text-purple-400',
    },
    {
      ...TIERS.ELITE,
      levelLabel: 'CẤP ĐỘ III · CHIẾN BINH',
      subtitle: 'Vượt qua ngưỡng 7 ngày đầu tiên đầy thử thách',
      perks: 'Khung viền Lục Bảo Tinh Anh, Huy hiệu chiến binh kiên cường, Mở khóa thẻ vinh danh tuần.',
      themeBg: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      themeBorder: 'border-emerald-400/50 dark:border-emerald-500/50',
      badgeBg: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
      iconBoxBg: 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 text-white shadow-emerald-500/30',
      tagColor: 'text-emerald-500 dark:text-emerald-400',
    },
    {
      ...TIERS.DEDICATED,
      levelLabel: 'CẤP ĐỘ II · QUYẾT TÂM',
      subtitle: 'Khởi đầu vững chắc với 3 ngày học liên tiếp',
      perks: 'Khung viền Bạch Kim sáng, Đánh dấu sự cam kết nghiêm túc với mục tiêu tiếng Anh.',
      themeBg: 'from-cyan-500/10 via-blue-500/5 to-transparent',
      themeBorder: 'border-cyan-400/50 dark:border-cyan-500/50',
      badgeBg: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
      iconBoxBg: 'bg-gradient-to-tr from-cyan-500 via-blue-400 to-indigo-500 text-white shadow-cyan-500/30',
      tagColor: 'text-cyan-500 dark:text-cyan-400',
    },
    {
      ...TIERS.NOVICE,
      levelLabel: 'CẤP ĐỘ I · MẦM NON',
      subtitle: 'Hành trình vạn dặm bắt đầu từ bước chân đầu tiên',
      perks: 'Khung viền Hy Vọng, Khởi động bộ theo dõi 30 ngày và mở khóa học từ vựng Oxford 3000.',
      themeBg: 'from-slate-500/10 via-slate-400/5 to-transparent',
      themeBorder: 'border-slate-300 dark:border-slate-700',
      badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
      iconBoxBg: 'bg-gradient-to-tr from-slate-400 to-slate-600 text-white shadow-slate-500/20',
      tagColor: 'text-slate-500 dark:text-slate-400',
    },
  ];

  const XP_RULES = [
    {
      icon: '🚀',
      action: 'Điểm danh 30 phút',
      reward: '+50 XP',
      desc: 'Hoàn thành buổi học mỗi ngày',
      badgeClass: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    },
    {
      icon: '🔥',
      action: 'Thưởng chuỗi Streak',
      reward: '+10 XP / ngày',
      desc: 'Cộng dồn mỗi ngày liên tiếp',
      badgeClass: 'bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800',
    },
    {
      icon: '🎴',
      action: 'Thuộc từ Oxford 3000',
      reward: '+15 XP / từ',
      desc: 'Đánh dấu thuộc trên Flashcards',
      badgeClass: 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    },
    {
      icon: '🎯',
      action: 'Làm Quiz & Ghép Thẻ',
      reward: '+20 - 50 XP',
      desc: 'Theo độ chính xác câu trả lời',
      badgeClass: 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    },
    {
      icon: '✍️',
      action: 'Ghi nhật ký bài học',
      reward: '+20 XP / bài',
      desc: 'Ghi chú ngữ pháp, câu hay',
      badgeClass: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    },
  ];

  return (
    <section className="w-full rounded-3xl p-5 sm:p-7 bg-white/85 dark:bg-slate-900/85 border border-slate-200/90 dark:border-slate-800 shadow-xl backdrop-blur-xl mb-8 relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-purple-500/15 border border-amber-400/30 text-amber-600 dark:text-amber-300 text-[10px] sm:text-[11px] font-black tracking-widest uppercase mb-2 shadow-inner">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>ROADMAP & PRIVILEGES · HỆ THỐNG DANH HIỆU</span>
          <Sparkles className="w-3 h-3 text-indigo-400" />
        </div>

        <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Hệ Thống Cấp Bậc & Danh Hiệu Chăm Chỉ
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
          Mỗi phút rèn luyện đều được ghi nhận xứng đáng. Vươn lên các cấp bậc cao hơn để mở khóa khung viền danh dự và khẳng định kỷ luật bản thân.
        </p>
      </div>

      {/* 5-Tier Cards Showcase */}
      <div className="space-y-3 sm:space-y-3.5 mb-8">
        {TIER_DETAILS.map((t) => {
          const isUserCurrent = t.id === currentTierId;
          const isUnlocked = userXp >= t.minXp || userStreak >= t.minStreak;

          return (
            <div
              key={t.id}
              className={`relative rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border transition-all duration-300 ${
                isUserCurrent
                  ? `bg-gradient-to-r ${t.themeBg} ${t.themeBorder} shadow-md ring-2 ring-indigo-500/40 dark:ring-amber-400/40 scale-[1.01]`
                  : isUnlocked
                  ? `bg-slate-50/70 dark:bg-slate-850/70 border-slate-200/80 dark:border-slate-750/80 hover:border-slate-300 dark:hover:border-slate-700`
                  : `bg-slate-50/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-80 hover:opacity-100`
              }`}
            >
              {/* Highlight ribbon if this is current tier */}
              {isUserCurrent && (
                <div className="absolute -top-2.5 right-3 sm:right-6 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black text-[9px] sm:text-[11px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-white/60 animate-pulse">
                  <Sparkles className="w-2.5 h-2.5 text-amber-950" />
                  <span>CẤP ĐỘ HIỆN TẠI CỦA BẠN</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                {/* Left: Icon Emblem & Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Emblem Icon Box */}
                  <div
                    className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-md flex-shrink-0 ${t.iconBoxBg} ring-2 ring-white/20`}
                  >
                    <span>{t.icon}</span>
                  </div>

                  {/* Texts */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-400">
                        {t.levelLabel}
                      </span>
                      {isUnlocked && !isUserCurrent && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.2 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Đã mở khóa</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                      <span>{t.name}</span>
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">Đặc quyền:</strong> {t.perks}
                    </p>
                  </div>
                </div>

                {/* Right: Requirements Pillar */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-750/60 flex-shrink-0">
                  <div className="flex items-center sm:justify-end gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-800/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>≥ {t.minStreak}d</span>
                    </span>

                    <span className="text-[10px] font-bold text-slate-400">hoặc</span>

                    <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl">
                      <Zap className="w-3 h-3 fill-current" />
                      <span>≥ {t.minXp.toLocaleString()} XP</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* XP Earning Mechanics Table / Grid - COMPACT & CLEAN */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            ⚡
          </div>
          <div>
            <h3 className="font-heading font-black text-xs sm:text-sm text-slate-900 dark:text-white">
              Bảng Quy Chuẩn Tích Lũy Điểm Chăm Chỉ (XP)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Các phương thức rèn luyện giúp gia tăng điểm số và thăng hạng liên tục
            </p>
          </div>
        </div>

        {/* Compact, clean horizontal items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
          {XP_RULES.map((rule) => (
            <div
              key={rule.action}
              className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-2.5 hover:bg-white dark:hover:bg-slate-750 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="text-xl flex-shrink-0">{rule.icon}</span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-heading font-extrabold text-xs text-slate-800 dark:text-slate-100 truncate">
                    {rule.action}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.2">
                    {rule.desc}
                  </p>
                </div>
              </div>

              <span
                className={`font-black text-[11px] px-2 py-0.5 rounded-lg border flex-shrink-0 whitespace-nowrap ${rule.badgeClass}`}
              >
                {rule.reward}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
