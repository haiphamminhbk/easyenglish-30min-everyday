/**
 * 30-Min Daily Tracker & Diary Type Definitions
 */

export type AppMode = 'study' | 'work';

export interface StorageData {
  dates: string[];
  notes: Record<string, string>;
  studyDates: string[];
  studyNotes: Record<string, string>;
  workDates: string[];
  workNotes: Record<string, string>;
  savedUserName: string;
  mode: AppMode;
}

export interface DiaryEntry {
  dateStr: string;
  hasStudy: boolean;
  hasWork: boolean;
  studyNote?: string;
  workNote?: string;
}

export interface CalendarDay {
  day: number;
  dateStr: string;
  isCompleted?: boolean;
  hasNote?: boolean;
  isToday?: boolean;
  isPast?: boolean;
  tooltip?: string;
}

export interface MonthCalendarData {
  year: number;
  month: number;
  monthStr: string;
  daysInMonth: number;
  startDayIndex: number;
  days: Array<{ day: number; dateStr: string }>;
}
