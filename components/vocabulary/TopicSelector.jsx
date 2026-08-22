'use client';

import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, ChevronDown, Grid, Layers, Sparkles, X } from 'lucide-react';
import { TOPICS } from '@/lib/vocabularyData';

export default function TopicSelector({ selectedTopicId, onSelectTopic, topicStats = [], isModal = false, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState('all'); // all, beginner, daily, advanced

  // Create lookup for topic stats
  const statsMap = useMemo(() => {
    const map = {};
    topicStats.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [topicStats]);

  // Filter topics by search query
  const filteredTopics = useMemo(() => {
    return TOPICS.filter((topic) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        topic.nameVi.toLowerCase().includes(q) ||
        topic.nameEn.toLowerCase().includes(q) ||
        topic.id.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const selectedTopic = useMemo(() => {
    if (selectedTopicId === 'all') {
      return {
        id: 'all',
        nameVi: 'Tất cả 60 chủ đề',
        nameEn: 'All Topics (Oxford 3000)',
        icon: '📚',
        color: 'from-indigo-500 to-purple-600',
      };
    }
    return TOPICS.find((t) => t.id === selectedTopicId) || TOPICS[0];
  }, [selectedTopicId]);

  return (
    <div className="w-full">
      {/* Search & Topic Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm chủ đề (VD: Biển, Phim, Bank...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 text-sm bg-white/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 backdrop-blur-md shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => onSelectTopic('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
              selectedTopicId === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/30'
                : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
            }`}
          >
            <span>📚</span>
            <span>Tất cả (60 Chủ đề)</span>
          </button>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            ({filteredTopics.length} chủ đề)
          </span>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
        {filteredTopics.map((topic) => {
          const isSelected = selectedTopicId === topic.id;
          const stat = statsMap[topic.id] || { total: 0, mastered: 0, percentage: 0 };

          return (
            <button
              key={topic.id}
              onClick={() => {
                onSelectTopic(topic.id);
                if (onClose) onClose();
              }}
              className={`relative group flex flex-col p-3 rounded-2xl text-left border transition-all duration-300 text-xs ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/50 dark:to-slate-900 border-indigo-500/80 dark:border-indigo-500/80 shadow-lg shadow-indigo-500/15 ring-2 ring-indigo-500/30 scale-[1.02]'
                  : 'bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md'
              }`}
            >
              {/* Header: Icon & Progress */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl transform group-hover:scale-110 transition-transform duration-200">
                  {topic.icon}
                </span>
                {stat.total > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      stat.percentage === 100
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : stat.percentage > 0
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {stat.percentage === 100 ? '✓ 100%' : `${stat.percentage}%`}
                  </span>
                )}
              </div>

              {/* Names & Intro text */}
              <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-[13px] leading-tight mb-0.5" title={topic.title || topic.nameVi}>
                {topic.nameVi}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mb-1">
                {topic.nameEn}
              </p>
              {topic.introText && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 italic line-clamp-2 leading-tight mb-2">
                  {topic.introText}
                </p>
              )}

              {/* Progress bar */}
              <div className="mt-auto w-full">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>{stat.total || topic.wordCount || 0} từ</span>
                  <span>{stat.mastered || 0} đã thuộc</span>
                </div>
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-700/70 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      stat.percentage === 100
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                    }`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>

              {/* Selected checkmark indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
