'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  Trophy,
  CheckCircle2,
  Star,
  Layers,
  ChevronDown,
  Search,
  ArrowLeft,
  Flame,
  Gamepad2,
  PenTool,
  RotateCcw,
  SlidersHorizontal,
  Bookmark,
  TrendingUp,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import FlashcardDeck from '@/components/vocabulary/FlashcardDeck';

const VocabularyQuiz = dynamic(() => import('@/components/vocabulary/VocabularyQuiz'), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-xl mx-auto p-12 bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 text-center animate-pulse text-xs font-semibold text-slate-400">
      Đang chuẩn bị bộ câu hỏi trắc nghiệm...
    </div>
  ),
});

const SpellingPractice = dynamic(() => import('@/components/vocabulary/SpellingPractice'), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-xl mx-auto p-12 bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 text-center animate-pulse text-xs font-semibold text-slate-400">
      Đang tải luyện gõ từ vựng...
    </div>
  ),
});

const MatchingGame = dynamic(() => import('@/components/vocabulary/MatchingGame'), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-xl mx-auto p-12 bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 text-center animate-pulse text-xs font-semibold text-slate-400">
      Đang tải trò chơi ghép thẻ từ vựng...
    </div>
  ),
});

const VocabularyListView = dynamic(() => import('@/components/vocabulary/VocabularyListView'), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-4xl mx-auto p-12 bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 text-center animate-pulse text-xs font-semibold text-slate-400">
      Đang tải danh sách 3000 từ vựng Oxford...
    </div>
  ),
});

const TopicSelector = dynamic(() => import('@/components/vocabulary/TopicSelector'), {
  ssr: false,
});
import {
  TOPICS,
  DIFFICULTY_LEVELS,
  VOCABULARY_LIST,
  getTopicById,
  filterVocabulary,
  getVocabularyStats,
} from '@/lib/vocabularyData';
import {
  loadVocabProgress,
  toggleMasteredWord,
  toggleStarredWord,
  saveLastTopic,
  initVocabStorage,
} from '@/lib/vocabularyStorage';

export default function VocabularyPage() {
  const [activeMode, setActiveMode] = useState('flashcards'); // flashcards, quiz, spelling, matching, list
  const [selectedTopicId, setSelectedTopicId] = useState('school_supplies');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [onlyMastered, setOnlyMastered] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Local storage state
  const [masteredIds, setMasteredIds] = useState([]);
  const [starredIds, setStarredIds] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize progress from localStorage and sync with Cloud Firestore
  useEffect(() => {
    const saved = loadVocabProgress();
    setMasteredIds(saved.masteredIds);
    setStarredIds(saved.starredIds);
    setQuizHistory(saved.quizHistory);
    if (saved.lastTopic) {
      setSelectedTopicId(saved.lastTopic);
    }
    setIsLoaded(true);

    let unsub = () => {};
    initVocabStorage((remote) => {
      setMasteredIds(remote.masteredIds || []);
      setStarredIds(remote.starredIds || []);
      setQuizHistory(remote.quizHistory || []);
      if (remote.lastTopic) {
        setSelectedTopicId(remote.lastTopic);
      }
    }).then((cleanup) => {
      if (typeof cleanup === 'function') unsub = cleanup;
    });

    return () => unsub();
  }, []);

  // Update last topic
  const handleSelectTopic = (topicId) => {
    setSelectedTopicId(topicId);
    saveLastTopic(topicId);
    setIsTopicModalOpen(false);
  };

  // Toggle mastered
  const handleToggleMastered = (wordId) => {
    const updated = toggleMasteredWord(wordId);
    setMasteredIds(updated);
  };

  // Toggle starred
  const handleToggleStarred = (wordId) => {
    const updated = toggleStarredWord(wordId);
    setStarredIds(updated);
  };

  // Filtered vocabulary list
  const filteredWords = useMemo(() => {
    return filterVocabulary({
      topicId: selectedTopicId,
      level: selectedLevel,
      searchQuery,
      onlyStarred,
      onlyMastered,
      starredIds,
      masteredIds,
    });
  }, [
    selectedTopicId,
    selectedLevel,
    searchQuery,
    onlyStarred,
    onlyMastered,
    starredIds,
    masteredIds,
  ]);

  // Overall and topic statistics
  const stats = useMemo(() => {
    return getVocabularyStats(masteredIds, starredIds);
  }, [masteredIds, starredIds]);

  const currentTopic = useMemo(() => {
    if (selectedTopicId === 'all') {
      return {
        id: 'all',
        nameVi: 'Tất cả 60 chủ đề',
        nameEn: 'All Topics (Oxford 3000)',
        icon: '📚',
        color: 'from-indigo-500 to-purple-600',
      };
    }
    return getTopicById(selectedTopicId) || TOPICS[0];
  }, [selectedTopicId]);

  return (
    <main className="min-h-screen relative overflow-x-hidden text-slate-800 dark:text-slate-100 pb-16">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/15 dark:bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Top Header Navigation */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4 sm:p-5 rounded-3xl bg-white/75 dark:bg-slate-900/75 border border-white/60 dark:border-slate-800 backdrop-blur-xl shadow-lg">
          {/* Brand & Back Button */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
            <Link
              href="/"
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-2 text-xs font-bold shadow-sm"
              title="Quay lại bảng theo dõi 30 ngày"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Theo dõi</span>
            </Link>

            <Link
              href="/leaderboard"
              className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-700/80 text-amber-700 dark:text-amber-300 transition-all flex items-center gap-1.5 text-xs font-black shadow-sm group"
              title="Xem Bảng Xếp Hạng học viên chăm chỉ"
            >
              <span className="text-sm group-hover:scale-120 transition-transform animate-bounce">🏆</span>
              <span className="hidden sm:inline">Bảng Xếp Hạng</span>
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎴</span>
                <h1 className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-300 dark:to-pink-400">
                  Học Từ Vựng Oxford 3000
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                60 Chủ đề giao tiếp · Phân cấp CEFR (A1 - B2) · Phát âm chuẩn Anh - Mỹ
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>
                {stats.masteredCount}/{stats.totalWords} từ đã thuộc ({stats.masteredPercentage}%)
              </span>
            </div>
          </div>
        </header>

        {/* Topic Selector Bar & Difficulty Filter Controls */}
        <section className="mb-6 p-4 sm:p-5 rounded-3xl bg-white/75 dark:bg-slate-900/75 border border-white/60 dark:border-slate-800 backdrop-blur-xl shadow-lg">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Active Topic Card Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsTopicModalOpen(true)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/80 dark:border-indigo-800/80 hover:border-indigo-400 text-left transition-all group shadow-sm"
              >
                <span className="text-2xl transform group-hover:scale-110 transition-transform">
                  {currentTopic.icon}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Chủ đề hiện tại
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-y-0.5 transition-transform" />
                  </div>
                  <p className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100">
                    {currentTopic.nameVi}{' '}
                    <span className="text-xs font-normal text-slate-400 font-sans">
                      ({currentTopic.nameEn})
                    </span>
                  </p>
                </div>
              </button>

              <span className="text-xs text-slate-400 font-semibold hidden md:inline">
                {filteredWords.length} từ khả dụng
              </span>
            </div>

            {/* CEFR Difficulty Level Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold uppercase text-slate-400 mr-1 hidden sm:inline">
                Độ khó:
              </span>
              {DIFFICULTY_LEVELS.map((lvl) => {
                const isActive = selectedLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedLevel(lvl.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/30'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80'
                      }`}
                  >
                    <span>{lvl.label}</span>
                    {lvl.id !== 'ALL' && (
                      <span className="text-[10px] opacity-75 font-mono">
                        ({stats.countByLevel[lvl.id] || 0})
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

              {/* Starred filter */}
              <button
                onClick={() => setOnlyStarred((prev) => !prev)}
                title="Chỉ xem từ đã gắn sao"
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${onlyStarred
                  ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-500 hover:bg-slate-100'
                  }`}
              >
                <Star className={`w-3.5 h-3.5 ${onlyStarred ? 'fill-amber-400 text-amber-500' : ''}`} />
                <span className="hidden sm:inline">Đã sao</span>
                <span className="text-[10px]">({stats.starredCount})</span>
              </button>

              {/* Mastered filter */}
              <button
                onClick={() => setOnlyMastered((prev) => !prev)}
                title="Chỉ xem từ đã thuộc"
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${onlyMastered
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-500 hover:bg-slate-100'
                  }`}
              >
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${onlyMastered ? 'fill-emerald-500 text-white' : ''}`}
                />
                <span className="hidden sm:inline">Đã thuộc</span>
                <span className="text-[10px]">({stats.masteredCount})</span>
              </button>
            </div>
          </div>

          {/* Topic Intro Text from Document 1 */}
          {currentTopic.introText && (
            <div className="mt-4 pt-3.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 italic">
                  <strong className="text-slate-800 dark:text-slate-100 not-italic font-bold">
                    {currentTopic.title || currentTopic.nameVi}:
                  </strong>{' '}
                  {currentTopic.introText}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-0.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60">
                Nguồn: 3000 từ vựng theo chủ đề (Oxford)
              </span>
            </div>
          )}
        </section>


        {/* Learning Mode Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'flashcards', label: '🎴 Thẻ 3D Flashcards', desc: 'Lật thẻ và nghe phát âm' },
            { id: 'quiz', label: '🏆 Trắc nghiệm (Quiz)', desc: 'Kiểm tra 4 lựa chọn' },
            { id: 'spelling', label: '✍️ Luyện chính tả', desc: 'Nghe và gõ từ vựng' },
            { id: 'matching', label: '🧩 Trò chơi ghép thẻ', desc: 'Nối từ Anh - Việt' },
            { id: 'list', label: '📖 Tra cứu từ điển', desc: 'Danh sách và tìm kiếm' },
          ].map((mode) => {
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex flex-col items-start border shadow-sm ${isActive
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/30 scale-[1.02]'
                  : 'bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800'
                  }`}
              >
                <span>{mode.label}</span>
                <span
                  className={`text-[10px] font-normal ${isActive ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                >
                  {mode.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area Based on Active Mode */}
        <section className="animate-fadeIn">
          {activeMode === 'flashcards' && (
            <FlashcardDeck
              words={filteredWords}
              masteredIds={masteredIds}
              starredIds={starredIds}
              onToggleMastered={handleToggleMastered}
              onToggleStarred={handleToggleStarred}
            />
          )}

          {activeMode === 'quiz' && (
            <VocabularyQuiz
              words={filteredWords}
              topicName={currentTopic.nameVi}
              masteredIds={masteredIds}
              onToggleMastered={handleToggleMastered}
            />
          )}

          {activeMode === 'spelling' && (
            <SpellingPractice
              words={filteredWords}
              masteredIds={masteredIds}
              onToggleMastered={handleToggleMastered}
            />
          )}

          {activeMode === 'matching' && (
            <MatchingGame
              words={filteredWords}
              onToggleMastered={handleToggleMastered}
            />
          )}

          {activeMode === 'list' && (
            <VocabularyListView
              words={filteredWords}
              masteredIds={masteredIds}
              starredIds={starredIds}
              onToggleMastered={handleToggleMastered}
              onToggleStarred={handleToggleStarred}
            />
          )}
        </section>

        {/* Topic Selection Modal */}
        {isTopicModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-4xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>📚</span>
                    <span>Chọn Chủ Đề Từ Vựng (60 Chủ đề)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Khám phá toàn bộ 3000 từ vựng chia theo chủ đề thực tiễn
                  </p>
                </div>

                <button
                  onClick={() => setIsTopicModalOpen(false)}
                  className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto">
                <TopicSelector
                  selectedTopicId={selectedTopicId}
                  onSelectTopic={handleSelectTopic}
                  topicStats={stats.topicStats}
                  onClose={() => setIsTopicModalOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
