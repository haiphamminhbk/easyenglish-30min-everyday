/**
 * Oxford 3000 Vocabulary & Practice Games Type Definitions
 */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'ALL';

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  vietnamese: string;
  definition?: string;
  example?: string;
  exampleVi?: string;
  topicId: string;
  level: CEFRLevel;
  isCustom?: boolean;
}

export interface Topic {
  id: string;
  nameVi: string;
  nameEn: string;
  icon: string;
  color: string;
  description?: string;
}

export interface QuizHistoryEntry {
  id: string;
  date: string;
  topicId?: string;
  level?: string;
  score: number;
  totalQuestions: number;
  accuracyPercent?: number;
  mode?: 'quiz' | 'spelling' | 'matching' | 'flashcards';
  wrongWordIds?: string[];
  createdAt?: string;
}

export interface VocabProgress {
  masteredIds: string[];
  starredIds: string[];
  quizHistory: QuizHistoryEntry[];
  lastTopic: string;
  voiceAccent: 'us' | 'uk';
}

export interface VocabularyStats {
  totalWords: number;
  masteredCount: number;
  starredCount: number;
  masteredPercentage: number;
  byLevel: Record<string, { total: number; mastered: number }>;
}
