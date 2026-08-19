/**
 * Tracker Logic & Date Helpers for Next.js (powered by date-fns)
 */

import {
  format,
  parseISO,
  isValid,
  subDays,
  addMonths,
  startOfMonth,
  getDaysInMonth,
  getDay,
} from 'date-fns';

export const NUMBER_OF_DAYS_TO_SHOW = 28;

/**
 * Returns today's date formatted as YYYY-MM-DD in client local time
 * @param {Date} [date]
 * @returns {string}
 */
export function getTodayString(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return format(d, 'yyyy-MM-dd');
}

/**
 * Formats a YYYY-MM-DD date string to DD/MM/YYYY
 * @param {string|Date} dateString
 * @returns {string}
 */
export function formatDatePretty(dateString) {
  if (!dateString) return '';
  if (dateString instanceof Date) {
    return isValid(dateString) ? format(dateString, 'dd/MM/yyyy') : '';
  }
  if (typeof dateString !== 'string') return '';
  
  const parts = dateString.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  const parsed = parseISO(dateString);
  return isValid(parsed) ? format(parsed, 'dd/MM/yyyy') : dateString;
}

/**
 * Calculates current consecutive streak count
 * @param {string[]} studyDates - Array of dates formatted as YYYY-MM-DD
 * @param {string} [todayStr] - Current today date string (YYYY-MM-DD)
 * @returns {number}
 */
export function calculateStreak(studyDates = [], todayStr = getTodayString()) {
  if (!studyDates || studyDates.length === 0) return 0;

  let streak = 0;
  let checkDate = parseISO(todayStr || getTodayString());
  if (!isValid(checkDate)) {
    checkDate = new Date();
  }

  if (studyDates.includes(todayStr)) {
    streak = 1;
    checkDate = subDays(checkDate, 1);
  } else {
    checkDate = subDays(checkDate, 1);
  }

  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    if (studyDates.includes(dateStr)) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Returns month details and all days of the target month for calendar view
 * @param {number} monthOffset - 0 for current month, -1 for previous month, +1 for next month
 * @param {Date} [baseDate]
 * @returns {{
 *   year: number,
 *   month: number,
 *   monthStr: string,
 *   daysInMonth: number,
 *   startDayIndex: number,
 *   days: Array<{ day: number, dateStr: string }>
 * }}
 */
export function getMonthCalendar(monthOffset = 0, baseDate = new Date()) {
  const targetDate = addMonths(startOfMonth(baseDate), monthOffset);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const monthPad = String(month).padStart(2, '0');

  const daysInMonth = getDaysInMonth(targetDate);
  const firstDay = getDay(targetDate);
  const startDayIndex = (firstDay + 6) % 7; // Monday = 0, ..., Sunday = 6

  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayPad = String(d).padStart(2, '0');
    days.push({
      day: d,
      dateStr: `${year}-${monthPad}-${dayPad}`,
    });
  }

  const monthStr = `Tháng ${monthPad}/${year}`;

  return {
    year,
    month,
    monthStr,
    daysInMonth,
    startDayIndex,
    days,
  };
}

/**
 * Returns the start and end dates for a given period offset
 * @param {number} currentPeriodOffset 
 * @param {number} daysToShow 
 * @returns {{ startDate: Date, endDate: Date, startStr: string, endStr: string }}
 */
export function getPeriodRange(currentPeriodOffset = 0, daysToShow = NUMBER_OF_DAYS_TO_SHOW) {
  const base = new Date();
  const startDate = subDays(base, (daysToShow - 1) - (currentPeriodOffset * daysToShow));
  const endDate = subDays(startDate, -(daysToShow - 1));
  
  const startStr = formatDatePretty(format(startDate, 'yyyy-MM-dd'));
  const endStr = formatDatePretty(format(endDate, 'yyyy-MM-dd'));

  return { startDate, endDate, startStr, endStr };
}

/**
 * Strips HTML tags and markdown formatting to return clean plain text for hover tooltips
 * @param {string} raw
 * @returns {string}
 */
export function stripFormatting(raw) {
  if (!raw || typeof raw !== 'string') return '';

  let text = raw;

  // 1. Normalize linebreaks from HTML block elements and bullet list items
  text = text
    .replace(/<\/(p|div|h[1-6]|blockquote)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<[^>]+>/g, ''); // strip remaining tags

  // 2. Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // 3. Strip markdown formatting symbols
  text = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/==(.*?)==/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/~~(.*?)~~/g, '$1');

  // 4. Clean up whitespace and empty lines
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  text = lines.join('\n');

  // Limit tooltip preview length to keep UI crisp
  if (text.length > 200) {
    text = text.substring(0, 197) + '...';
  }

  return text.trim();
}

/**
 * Returns a time-based greeting in Vietnamese based on the current hour of day
 * @param {Date} [date]
 * @returns {string}
 */
export function getTimeBasedGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 4 && hour < 11) {
    return 'Chào buổi sáng!';
  } else if (hour >= 11 && hour < 14) {
    return 'Chào buổi trưa!';
  } else if (hour >= 14 && hour < 18) {
    return 'Chào buổi chiều!';
  } else {
    return 'Chào buổi tối!';
  }
}
