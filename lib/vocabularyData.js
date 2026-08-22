import { TOPICS, DIFFICULTY_LEVELS } from './vocabData/topics';
import { VOCAB_PART_1 } from './vocabData/part1';
import { VOCAB_PART_2 } from './vocabData/part2';
import { VOCAB_PART_3 } from './vocabData/part3';
import { VOCAB_PART_4 } from './vocabData/part4';

// Aggregate full 60-topic Oxford 3000 vocabulary dataset
export const VOCABULARY_LIST = [
  ...VOCAB_PART_1,
  ...VOCAB_PART_2,
  ...VOCAB_PART_3,
  ...VOCAB_PART_4,
];

export { TOPICS, DIFFICULTY_LEVELS };

// Pre-indexed lookup structures for O(1) operations
const TOPICS_MAP = new Map(TOPICS.map((t) => [t.id, t]));
const WORDS_BY_TOPIC = new Map();
const WORDS_BY_LEVEL = new Map();
const STATIC_TOPIC_TOTALS = new Map();
const STATIC_LEVEL_TOTALS = { A1: 0, A2: 0, B1: 0, B2: 0 };
const WORD_BY_ID_MAP = new Map();

// Single O(N) pre-index pass at module evaluation
for (let i = 0; i < VOCABULARY_LIST.length; i++) {
  const w = VOCABULARY_LIST[i];
  WORD_BY_ID_MAP.set(w.id, w);

  let topicList = WORDS_BY_TOPIC.get(w.topicId);
  if (!topicList) {
    topicList = [];
    WORDS_BY_TOPIC.set(w.topicId, topicList);
  }
  topicList.push(w);

  if (STATIC_LEVEL_TOTALS[w.level] !== undefined) {
    STATIC_LEVEL_TOTALS[w.level]++;
  }

  let levelList = WORDS_BY_LEVEL.get(w.level);
  if (!levelList) {
    levelList = [];
    WORDS_BY_LEVEL.set(w.level, levelList);
  }
  levelList.push(w);
}

TOPICS.forEach((t) => {
  STATIC_TOPIC_TOTALS.set(t.id, (WORDS_BY_TOPIC.get(t.id) || []).length);
});

// Helper: Get topic by ID (O(1) Map lookup)
export function getTopicById(topicId) {
  return TOPICS_MAP.get(topicId) || null;
}

// Helper: Get word by ID (O(1) Map lookup)
export function getWordById(wordId) {
  return WORD_BY_ID_MAP.get(wordId) || null;
}

// Helper: Get words by topic (O(1) pre-indexed lookup)
export function getWordsByTopic(topicId) {
  if (!topicId || topicId === 'all') {
    return VOCABULARY_LIST;
  }
  return WORDS_BY_TOPIC.get(topicId) || [];
}

// Helper: Get words by CEFR difficulty level (O(1) pre-indexed lookup)
export function getWordsByLevel(level) {
  if (!level || level === 'ALL') {
    return VOCABULARY_LIST;
  }
  return WORDS_BY_LEVEL.get(level) || [];
}

// Helper: Filter words by multiple criteria (Optimized with early subset pruning)
export function filterVocabulary({
  topicId = 'all',
  level = 'ALL',
  searchQuery = '',
  onlyStarred = false,
  onlyMastered = false,
  starredIds = [],
  masteredIds = [],
}) {
  // Start from pre-indexed topic subset if specific topic selected
  let list = topicId && topicId !== 'all' ? (WORDS_BY_TOPIC.get(topicId) || []) : VOCABULARY_LIST;

  if (level && level !== 'ALL') {
    list = list.filter((w) => w.level === level);
  }

  if (onlyStarred) {
    const starSet = starredIds instanceof Set ? starredIds : new Set(starredIds);
    list = list.filter((w) => starSet.has(w.id));
  }

  if (onlyMastered) {
    const masterSet = masteredIds instanceof Set ? masteredIds : new Set(masteredIds);
    list = list.filter((w) => masterSet.has(w.id));
  }

  if (searchQuery && searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q) ||
        (w.phonetic && w.phonetic.toLowerCase().includes(q)) ||
        (w.example && w.example.toLowerCase().includes(q)) ||
        (w.exampleVi && w.exampleVi.toLowerCase().includes(q))
    );
  }

  return list;
}

// Helper: Overall vocabulary statistics (Optimized single O(N) pass)
export function getVocabularyStats(masteredIds = [], starredIds = []) {
  const totalWords = VOCABULARY_LIST.length;
  const masterSet = masteredIds instanceof Set ? masteredIds : new Set(masteredIds);
  const starSet = starredIds instanceof Set ? starredIds : new Set(starredIds);

  const topicMasteredCount = new Map();
  let masteredCount = 0;
  let starredCount = 0;

  for (let i = 0; i < VOCABULARY_LIST.length; i++) {
    const w = VOCABULARY_LIST[i];
    if (masterSet.has(w.id)) {
      masteredCount++;
      topicMasteredCount.set(w.topicId, (topicMasteredCount.get(w.topicId) || 0) + 1);
    }
    if (starSet.has(w.id)) {
      starredCount++;
    }
  }

  const topicStats = TOPICS.map((topic) => {
    const total = STATIC_TOPIC_TOTALS.get(topic.id) || 0;
    const mastered = topicMasteredCount.get(topic.id) || 0;
    return {
      id: topic.id,
      nameVi: topic.nameVi,
      nameEn: topic.nameEn,
      icon: topic.icon,
      color: topic.color,
      total,
      mastered,
      percentage: total > 0 ? Math.round((mastered / total) * 100) : 0,
    };
  });

  return {
    totalWords,
    masteredCount,
    starredCount,
    masteredPercentage: totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0,
    countByLevel: STATIC_LEVEL_TOTALS,
    topicStats,
  };
}

