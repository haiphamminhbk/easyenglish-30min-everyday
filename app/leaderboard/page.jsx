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
  Crown,
  Share2,
  Filter,
  Calendar,
  Layers,
  BookOpen,
  HelpCircle,
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
  TIERS,
} from '@/lib/leaderboardService';

const FlexCertificateModal = dynamic(
  () => import('@/components/leaderboard/FlexCertificateModal'),
  { ssr: false }
);

export default function LeaderboardPage() {
  const [cloudLearners, setCloudLearners] = useState([]);
  const [sortBy, setSortBy] = useState('xp'); // 'xp' | 'streak' | 'days' | 'vocab'
  const [timeFrame, setTimeFrame] = useState('all'); // 'all' | 'month' | 'week'
  const [searchQuery, setSearchQuery] = useState('');
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sync current user stats to Firestore and subscribe to cloud updates
  useEffect(() => {
    syncUserLeaderboardToFirestore();

    const unsubscribe = subscribeLeaderboard((learners) => {
      setCloudLearners(learners);
      setIsLoaded(true);
    });

    setIsLoaded(true);
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [refreshKey]);

  // Compute unified leaderboard
  const unifiedList = useMemo(() => {
    return getUnifiedLeaderboard(cloudLearners, sortBy, timeFrame);
  }, [cloudLearners, sortBy, timeFrame, refreshKey]);

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

      {/* Controls & Filter Section */}
      <div className="bg-white/80 dark:bg-slate-800/80 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-md backdrop-blur-md mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Sorting Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setSortBy('xp')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
                sortBy === 'xp'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/40'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Điểm Chăm Chỉ (XP)</span>
            </button>

            <button
              type="button"
              onClick={() => setSortBy('streak')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
                sortBy === 'streak'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400/40'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Chuỗi Ngày (Streak)</span>
            </button>

            <button
              type="button"
              onClick={() => setSortBy('days')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
                sortBy === 'days'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/40'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Tổng Ngày Học</span>
            </button>

            <button
              type="button"
              onClick={() => setSortBy('vocab')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
                sortBy === 'vocab'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400/40'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Từ Vựng Đã Thuộc</span>
            </button>
          </div>

          {/* Timeframe & Search Bar */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Timeframe Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-700/60 p-1 rounded-2xl text-xs font-bold flex-shrink-0">
              <button
                type="button"
                onClick={() => setTimeFrame('all')}
                className={`px-2.5 py-1.5 rounded-xl transition-all ${
                  timeFrame === 'all'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Toàn bộ
              </button>
              <button
                type="button"
                onClick={() => setTimeFrame('month')}
                className={`px-2.5 py-1.5 rounded-xl transition-all ${
                  timeFrame === 'month'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Tháng này
              </button>
              <button
                type="button"
                onClick={() => setTimeFrame('week')}
                className={`px-2.5 py-1.5 rounded-xl transition-all ${
                  timeFrame === 'week'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Tuần này
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm học viên..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-2xl bg-slate-100 dark:bg-slate-700/60 border border-transparent focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Learners List */}
      <div className="space-y-2.5 mb-12">
        {filteredList.length > 0 ? (
          filteredList.map((learner) => (
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
