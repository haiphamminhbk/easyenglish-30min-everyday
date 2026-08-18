/**
 * Tracker Logic & Date Helpers for Next.js
 */

export const NUMBER_OF_DAYS_TO_SHOW = 30;

/**
 * Returns today's date formatted as YYYY-MM-DD
 * @returns {string}
 */
export function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a YYYY-MM-DD date string to DD/MM/YYYY
 * @param {string} dateString
 * @returns {string}
 */
export function formatDatePretty(dateString) {
  if (!dateString || typeof dateString !== 'string') return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Calculates current consecutive streak count
 * @param {string[]} studyDates - Array of dates formatted as YYYY-MM-DD
 * @returns {number}
 */
export function calculateStreak(studyDates = []) {
  if (!studyDates || studyDates.length === 0) return 0;
  
  let streak = 0;
  const checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);
  
  const todayStr = getTodayString();

  if (studyDates.includes(todayStr)) {
    streak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const year = checkDate.getFullYear();
    const month = String(checkDate.getMonth() + 1).padStart(2, '0');
    const day = String(checkDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    if (studyDates.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Returns the start and end dates for a given period offset
 * @param {number} currentPeriodOffset 
 * @param {number} daysToShow 
 * @returns {{ startDate: Date, endDate: Date, startStr: string, endStr: string }}
 */
export function getPeriodRange(currentPeriodOffset = 0, daysToShow = NUMBER_OF_DAYS_TO_SHOW) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (daysToShow - 1) + (currentPeriodOffset * daysToShow));
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (daysToShow - 1));
  
  const startStr = formatDatePretty(`${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`);
  const endStr = formatDatePretty(`${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`);

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
