/**
 * Leaderboard & Diligence Gamification Type Definitions
 */

export type TierId = 'mythic' | 'master' | 'elite' | 'dedicated' | 'novice';

export interface TierConfig {
  id: TierId;
  name: string;
  icon: string;
  color: string;
  border?: string;
  glow?: string;
  textColor?: string;
  bgBadge: string;
  minXp: number;
  minStreak: number;
}

export interface DiligenceStats {
  userId: string;
  displayName: string;
  photoURL?: string;
  avatar?: string;
  streak: number;
  totalStudyDays: number;
  totalWordsMastered: number;
  totalWordsStarred: number;
  totalQuizSessions: number;
  quizAverageAccuracy: number;
  totalNotesCount: number;
  totalPoints: number;
  tier: TierConfig;
  isCurrentUser?: boolean;
  cheersCount?: number;
  quote?: string;
}

export interface RankedLearner extends DiligenceStats {
  rank: number;
  location?: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  icon: string;
  isCompleted: boolean;
  isClaimed: boolean;
  progress: number;
  target: number;
}

export type SortByOption = 'xp' | 'streak' | 'days' | 'vocab';

export type TimeFrameOption = 'all' | 'month' | 'week';

export interface XpRuleItem {
  icon: string;
  action: string;
  reward: string;
  desc: string;
  badgeClass: string;
}
