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
  ...VOCAB_PART_4
];

export { TOPICS, DIFFICULTY_LEVELS };

// Helper: Get topic by ID
export function getTopicById(topicId) {
  return TOPICS.find((t) => t.id === topicId) || null;
}

// Helper: Get words by topic
export function getWordsByTopic(topicId) {
  if (!topicId || topicId === 'all') {
    return VOCABULARY_LIST;
  }
  return VOCABULARY_LIST.filter((w) => w.topicId === topicId);
}

// Helper: Get words by CEFR difficulty level
export function getWordsByLevel(level) {
  if (!level || level === 'ALL') {
    return VOCABULARY_LIST;
  }
  return VOCABULARY_LIST.filter((w) => w.level === level);
}

// Helper: Filter words by multiple criteria
export function filterVocabulary({ topicId = 'all', level = 'ALL', searchQuery = '', onlyStarred = false, onlyMastered = false, starredIds = [], masteredIds = [] }) {
  let list = VOCABULARY_LIST;

  if (topicId && topicId !== 'all') {
    list = list.filter((w) => w.topicId === topicId);
  }

  if (level && level !== 'ALL') {
    list = list.filter((w) => w.level === level);
  }

  if (onlyStarred) {
    const starSet = new Set(starredIds);
    list = list.filter((w) => starSet.has(w.id));
  }

  if (onlyMastered) {
    const masterSet = new Set(masteredIds);
    list = list.filter((w) => masterSet.has(w.id));
  }

  if (searchQuery && searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q) ||
        (w.example && w.example.toLowerCase().includes(q)) ||
        (w.exampleVi && w.exampleVi.toLowerCase().includes(q))
    );
  }

  return list;
}

// Helper: Overall vocabulary statistics
export function getVocabularyStats(masteredIds = [], starredIds = []) {
  const totalWords = VOCABULARY_LIST.length;
  const masterSet = new Set(masteredIds);
  const starSet = new Set(starredIds);

  const masteredCount = VOCABULARY_LIST.filter((w) => masterSet.has(w.id)).length;
  const starredCount = VOCABULARY_LIST.filter((w) => starSet.has(w.id)).length;

  const countByLevel = {
    A1: VOCABULARY_LIST.filter((w) => w.level === 'A1').length,
    A2: VOCABULARY_LIST.filter((w) => w.level === 'A2').length,
    B1: VOCABULARY_LIST.filter((w) => w.level === 'B1').length,
    B2: VOCABULARY_LIST.filter((w) => w.level === 'B2').length,
  };

  const topicStats = TOPICS.map((topic) => {
    const wordsInTopic = VOCABULARY_LIST.filter((w) => w.topicId === topic.id);
    const masteredInTopic = wordsInTopic.filter((w) => masterSet.has(w.id)).length;
    return {
      id: topic.id,
      nameVi: topic.nameVi,
      nameEn: topic.nameEn,
      icon: topic.icon,
      color: topic.color,
      total: wordsInTopic.length,
      mastered: masteredInTopic,
      percentage: wordsInTopic.length > 0 ? Math.round((masteredInTopic / wordsInTopic.length) * 100) : 0,
    };
  });

  return {
    totalWords,
    masteredCount,
    starredCount,
    masteredPercentage: totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0,
    countByLevel,
    topicStats,
  };
}
