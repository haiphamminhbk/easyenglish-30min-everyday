'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Flame,
  Zap,
  ArrowLeft,
  Search,
  Sparkles,
  Calendar,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import ThemeToggle from '@/components/ThemeToggle';
import AuthButton from '@/components/AuthButton';
import PodiumTop3 from '@/components/leaderboard/PodiumTop3';
import LeaderboardRow from '@/components/leaderboard/LeaderboardRow';
import MyRankCard from '@/components/leaderboard/MyRankCard';
import DailyQuestsCard from '@/components/leaderboard/DailyQuestsCard';
import TierRoadmapSection from '@/components/leaderboard/TierRoadmapSection';
import {
  getCurrentUserDiligenceStats,
  getUnifiedLeaderboard,
  subscribeLeaderboard,
  syncUserLeaderboardToFirestore,
} from '@/lib/leaderboardService';
import { subscribeToAuthState } from '@/lib/authService';

const FlexCertificateModal = dynamic(
  () => import('@/components/leaderboard/FlexCertificateModal'),
  { ssr: false }
);

export default function LeaderboardPage() {
  const [cloudLearners, setCloudLearners] = useState([]);
  const [timeFrame, setTimeFrame] = useState('all'); // 'all' | 'month' | 'week'
  const [searchQuery, setSearchQuery] = useState('');
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen to auth changes and sync leaderboard to Firestore
  useEffect(() => {
    const unsubAuth = subscribeToAuthState(({ user }) => {
      if (user) {
        syncUserLeaderboardToFirestore();
        setRefreshKey((prev) => prev + 1);
      }
    });

    syncUserLeaderboardToFirestore();

    const unsubLeaderboard = subscribeLeaderboard((learners) => {
      setCloudLearners(learners);
      setIsLoaded(true);
    });

    setIsLoaded(true);
    return () => {
      unsubAuth();
      if (typeof unsubLeaderboard === 'function') {
        unsubLeaderboard();
      }
    };
  }, [refreshKey]);

  // Compute unified leaderboard with priority: Streak -> Total Days -> Diligence XP
  const unifiedList = useMemo(() => {
    return getUnifiedLeaderboard(cloudLearners, timeFrame);
  }, [cloudLearners, timeFrame, refreshKey]);

  // Current user's stats inside ranked list
  const currentUserStats = useMemo(() => {
    const found = unifiedList.find((l) => l.isCurrentUser);
    return found || getCurrentUserDiligenceStats();
  }, [unifiedList]);

  // Filter list by search query
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return unifiedList;
    const q = searchQuery.toLowerCase().trim();
    return unifiedList.filter((item) =>
      item.displayName?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q)
    );
  }, [unifiedList, searchQuery]);

  // Top 3 for Podium
  const top3Learners = useMemo(() => {
    return unifiedList.slice(0, 3);
  }, [unifiedList]);

  const handleQuestClaimed = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const [displayLimit, setDisplayLimit] = useState(50);

  // Visible sliced list
  const visibleList = useMemo(() => {
    return filteredList.slice(0, displayLimit);
  }, [filteredList, displayLimit]);

  return (
    <main className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800 flex-wrap">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200/80 dark:border-slate-700/80 shadow-xs active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trang chủ</span>
          </Link>

          <Link
            href="/vocabulary"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 font-bold text-xs sm:text-sm border border-indigo-200/60 dark:border-indigo-800/60 active:scale-95 transition-all"
          >
            <span>🎴</span>
            <span>Từ vựng Oxford</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>

      {/* Hero Header */}
      <header className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-400/30 text-amber-600 dark:text-amber-300 text-xs font-black tracking-wider uppercase mb-3 shadow-inner">
          <Trophy className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>Vinh Danh Kỷ Luật & Sự Kiên Trì</span>
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 dark:from-amber-300 dark:via-orange-400 dark:to-indigo-300 mb-2">
          BẢNG XẾP HẠNG HỌC VIÊN
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          Mỗi ngày <strong className="text-indigo-600 dark:text-indigo-400 font-bold">30 phút</strong> không chỉ nâng cao trình độ mà còn tôi luyện tinh thần bền bỉ. Ai đang dẫn đầu đường đua hôm nay?
        </p>
      </header>

      {/* My Rank Sticky Status Card */}
      <MyRankCard
        currentUserStats={currentUserStats}
        fullLeaderboard={unifiedList}
        onOpenCertificate={() => setIsCertificateOpen(true)}
      />

      {/* Daily Diligence Quests Card */}
      <DailyQuestsCard onQuestClaimed={handleQuestClaimed} />

      {/* Top 3 Podium */}
      <PodiumTop3 topLearners={top3Learners} />

      {/* Categories & Search Controls */}
      <div className="bg-white/80 dark:bg-slate-800/80 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-md backdrop-blur-md mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Tabs: Toàn bộ | Tháng này | Tuần này */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-700/60 rounded-2xl">
            <button
              type="button"
              onClick={() => setTimeFrame('all')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                timeFrame === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-600/50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Toàn bộ</span>
            </button>

            <button
              type="button"
              onClick={() => setTimeFrame('month')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                timeFrame === 'month'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-600/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Tháng này</span>
            </button>

            <button
              type="button"
              onClick={() => setTimeFrame('week')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                timeFrame === 'week'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-600/50'
              }`}
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>Tuần này</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên học viên hoặc địa điểm..."
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-100 dark:bg-slate-700/60 border border-transparent focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Priority & Live Count Badge */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-750/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Thứ tự xếp hạng:</span>
            <span className="inline-flex items-center gap-1 font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
              <Flame className="w-3 h-3 fill-orange-500" /> 1. Chuỗi ngày
            </span>
            <span className="text-slate-400">➔</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
              <Calendar className="w-3 h-3" /> 2. Tổng ngày
            </span>
            <span className="text-slate-400">➔</span>
            <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
              <Zap className="w-3 h-3 fill-indigo-500" /> 3. XP Chăm chỉ
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-slate-500 dark:text-slate-400">
              Hiển thị <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{visibleList.length}</strong> / {filteredList.length}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">
              ● Realtime
            </span>
          </div>
        </div>
      </div>

      {/* Leaderboard Learners List */}
      <div className="space-y-2.5 mb-8">
        {visibleList.length > 0 ? (
          visibleList.map((learner) => (
            <LeaderboardRow
              key={learner.id || learner.userId}
              learner={learner}
              onCheerSuccess={() => {}}
            />
          ))
        ) : (
          <div className="p-12 text-center bg-white/60 dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Không tìm thấy học viên nào phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;.
            </p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {filteredList.length > visibleList.length && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-12 animate-fadeIn">
          <button
            type="button"
            onClick={() => setDisplayLimit((prev) => prev + 25)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold border border-slate-200/80 dark:border-slate-700/80 shadow-md active:scale-95 transition-all"
          >
            <span>Xem thêm 25 học viên nữa...</span>
          </button>
          <button
            type="button"
            onClick={() => setDisplayLimit(filteredList.length)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold shadow-md shadow-indigo-500/25 active:scale-95 transition-all"
          >
            <span>Hiển thị tất cả ({filteredList.length} học viên)</span>
          </button>
        </div>
      )}

      {/* Professional Tier Progression Roadmap & Scoring Breakdown Section */}
      <TierRoadmapSection currentUserStats={currentUserStats} />

      {/* Flex Certificate Modal */}
      <FlexCertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        userStats={currentUserStats}
      />
    </main>
  );
}
