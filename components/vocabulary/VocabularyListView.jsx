'use client';

import React, { useState } from 'react';
import {
  Volume2,
  Star,
  CheckCircle2,
  Search,
  Filter,
  Sparkles,
  BookOpen,
  X,
} from 'lucide-react';
import { speakWord } from '@/lib/vocabularyStorage';
import { getTopicById } from '@/lib/vocabularyData';

export default function VocabularyListView({
  words = [],
  masteredIds = [],
  starredIds = [],
  onToggleMastered,
  onToggleStarred,
}) {
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [filterStarredOnly, setFilterStarredOnly] = useState(false);
  const [filterMasteredOnly, setFilterMasteredOnly] = useState(false);

  const [visibleCount, setVisibleCount] = useState(30);

  const starSet = useMemo(() => new Set(starredIds), [starredIds]);
  const masterSet = useMemo(() => new Set(masteredIds), [masteredIds]);

  const filtered = useMemo(() => {
    return words.filter((w) => {
      if (selectedLevel !== 'ALL' && w.level !== selectedLevel) return false;
      if (filterStarredOnly && !starSet.has(w.id)) return false;
      if (filterMasteredOnly && !masterSet.has(w.id)) return false;

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const inWord = w.word.toLowerCase().includes(q);
        const inMeaning = w.meaning.toLowerCase().includes(q);
        const inExample = w.example && w.example.toLowerCase().includes(q);
        const inExampleVi = w.exampleVi && w.exampleVi.toLowerCase().includes(q);
        return inWord || inMeaning || inExample || inExampleVi;
      }
      return true;
    });
  }, [words, selectedLevel, filterStarredOnly, filterMasteredOnly, starSet, masterSet, search]);

  // Reset pagination when filter criteria change
  React.useEffect(() => {
    setVisibleCount(30);
  }, [search, selectedLevel, filterStarredOnly, filterMasteredOnly]);

  const displayedWords = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 30, filtered.length));
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col space-y-4">
      {/* Search & Filter Bar */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tra cứu từ vựng, phiên âm, ví dụ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Level Pills & Filter Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['ALL', 'A1', 'A2', 'B1', 'B2'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedLevel === lvl
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {lvl === 'ALL' ? 'Tất cả' : lvl}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          <button
            onClick={() => setFilterStarredOnly((prev) => !prev)}
            className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
              filterStarredOnly
                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 text-amber-600 dark:text-amber-400'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
            title="Chỉ hiện từ đã đánh dấu sao"
          >
            <Star className={`w-4 h-4 ${filterStarredOnly ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => setFilterMasteredOnly((prev) => !prev)}
            className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
              filterMasteredOnly
                ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
            title="Chỉ hiện từ đã thuộc"
          >
            <CheckCircle2 className={`w-4 h-4 ${filterMasteredOnly ? 'fill-emerald-500 text-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Word Count Indicator */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
        <span>Hiển thị {filtered.length} từ vựng</span>
        <span>
          Đã thuộc: {filtered.filter((w) => masterSet.has(w.id)).length} / {filtered.length}
        </span>
      </div>

      {/* Word Cards List */}
      <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
        {displayedWords.length === 0 ? (
          <div className="p-12 text-center bg-white/60 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Không tìm thấy từ vựng nào khớp với bộ lọc hiện tại.
            </p>
          </div>
        ) : (
          <>
            {displayedWords.map((w) => {
              const isMastered = masterSet.has(w.id);
              const isStarred = starSet.has(w.id);
              const topic = getTopicById(w.topicId);

              return (
                <div
                  key={w.id}
                  className={`p-4 rounded-2xl border transition-all duration-200 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-850 backdrop-blur-md shadow-sm hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isMastered
                      ? 'border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {/* Left: Word, Phonetic, Meaning */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => speakWord(w.word)}
                        title="Nghe phát âm chuẩn US"
                        className="p-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:scale-110 active:scale-95 transition-transform"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                        {w.word}
                      </h4>

                      <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        {w.phonetic}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          w.level === 'A1'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : w.level === 'A2'
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                            : w.level === 'B1'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        }`}
                      >
                        {w.level}
                      </span>

                      {w.pos && (
                        <span className="text-[10px] italic text-slate-400 font-medium">
                          {w.pos}
                        </span>
                      )}

                      {topic && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                          {topic.icon} {topic.nameVi}
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400 pl-8">
                      {w.meaning}
                    </p>

                    {/* Bilingual Oxford Example */}
                    {w.example && (
                      <div className="pl-8 pt-1 text-xs text-slate-600 dark:text-slate-300">
                        <p className="italic font-medium leading-relaxed">&ldquo;{w.example}&rdquo;</p>
                        {w.exampleVi && (
                          <p className="text-[11px] text-slate-400 mt-0.5">👉 {w.exampleVi}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center pl-8 sm:pl-0 flex-shrink-0">
                    <button
                      onClick={() => onToggleStarred(w.id)}
                      title={isStarred ? 'Bỏ sao' : 'Gắn sao'}
                      className={`p-2 rounded-xl transition-all ${
                        isStarred
                          ? 'bg-amber-100 text-amber-500 dark:bg-amber-950/60 dark:text-amber-400 scale-110'
                          : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => onToggleMastered(w.id)}
                      title={isMastered ? 'Đã thuộc' : 'Chưa thuộc'}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isMastered
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isMastered ? 'Đã thuộc' : 'Học từ này'}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Progressive Pagination Load More */}
            {visibleCount < filtered.length && (
              <div className="pt-2 pb-1 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:bg-indigo-500/20 dark:hover:bg-indigo-600 dark:text-indigo-300 dark:hover:text-white text-xs font-bold transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Tải thêm từ vựng ({visibleCount}/{filtered.length})
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
