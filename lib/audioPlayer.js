/**
 * Google Translate Natural Voice Player with Multi-Language Detection
 */

import { stripFormatting } from './tracker';

// Vietnamese diacritics and common words detector
const VIETNAMESE_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/i;
const VIETNAMESE_COMMON_WORDS = /\b(từ vựng|cấu trúc|ngữ pháp|công thức|ví dụ|khẳng định|phủ định|nghi vấn|lưu ý|định nghĩa|cách dùng|tiếng việt|nghĩa|không dùng|thay bằng|bài học|hôm nay|đã học)\b/i;

/**
 * Detects whether a text segment is Vietnamese ('vi') or English ('en')
 * @param {string} text
 * @returns {'vi' | 'en'}
 */
export function detectLanguage(text) {
  if (!text) return 'en';
  if (VIETNAMESE_REGEX.test(text) || VIETNAMESE_COMMON_WORDS.test(text)) {
    return 'vi';
  }
  return 'en';
}

/**
 * Splits text into natural language segments (separating English phrases from Vietnamese explanations)
 * @param {string} rawText
 * @returns {Array<{ text: string, lang: 'vi' | 'en' }>}
 */
export function parseSpeechSegments(rawText) {
  if (!rawText || !rawText.trim()) return [];

  const plainText = stripFormatting(rawText);
  const rawLines = plainText.split('\n').map((l) => l.trim()).filter(Boolean);
  const segments = [];

  for (const line of rawLines) {
    // Check if line contains a mix of English and Vietnamese (e.g., "Word: /phonetics/ - Nghĩa tiếng Việt")
    // Split by delimiters like ' - ', ' (', '): ', ': '
    const parts = line.split(/(\s*[-–—:]\s*|\s*[\(]\s*|\s*[\)]\s*)/).filter(Boolean);

    let currentText = '';
    let currentLang = null;

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed || trimmed === '-' || trimmed === '–' || trimmed === '—' || trimmed === ':' || trimmed === '(' || trimmed === ')') {
        if (currentText) currentText += ' ' + part;
        continue;
      }

      const lang = detectLanguage(trimmed);
      if (currentLang === null) {
        currentLang = lang;
        currentText = trimmed;
      } else if (currentLang === lang) {
        currentText += ' ' + trimmed;
      } else {
        if (currentText.trim()) {
          segments.push({ text: currentText.trim(), lang: currentLang });
        }
        currentLang = lang;
        currentText = trimmed;
      }
    }

    if (currentText.trim() && currentLang) {
      segments.push({ text: currentText.trim(), lang: currentLang });
    }
  }

  // Chunk any segment that exceeds 180 characters to adhere to Google TTS limits
  const chunkedSegments = [];
  for (const seg of segments) {
    if (seg.text.length <= 180) {
      chunkedSegments.push(seg);
    } else {
      const sentences = seg.text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [seg.text];
      for (const s of sentences) {
        if (s.trim()) {
          chunkedSegments.push({ text: s.trim(), lang: seg.lang });
        }
      }
    }
  }

  return chunkedSegments;
}

/**
 * Builds Google Translate TTS Audio URL
 * @param {string} text
 * @param {'vi' | 'en'} lang
 * @returns {string}
 */
export function getGoogleTtsUrl(text, lang = 'en') {
  const encoded = encodeURIComponent(text.trim());
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encoded}`;
}

class GoogleVoicePlayer {
  constructor() {
    this.audio = null;
    this.queue = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.onStateChange = null;
  }

  /**
   * Plays note with natural language detection using Google Translation voice
   * @param {string} rawNote - Raw HTML or text note
   * @param {Function} [onStateChange] - callback(boolean isPlaying, number currentSegment, number totalSegments)
   */
  play(rawNote, onStateChange = null) {
    this.stop();
    this.onStateChange = onStateChange;

    const segments = parseSpeechSegments(rawNote);
    if (!segments || segments.length === 0) return;

    this.queue = segments;
    this.currentIndex = 0;
    this.isPlaying = true;

    this._notifyState(true);
    this._playNext();
  }

  _playNext() {
    if (!this.isPlaying || this.currentIndex >= this.queue.length) {
      this.stop();
      return;
    }

    const { text, lang } = this.queue[this.currentIndex];
    const url = getGoogleTtsUrl(text, lang);

    this.audio = new Audio(url);

    this.audio.onended = () => {
      this.currentIndex++;
      this._notifyState(true);
      this._playNext();
    };

    this.audio.onerror = (e) => {
      console.warn('Google Audio playback fallback to SpeechSynthesis:', e);
      this._fallbackWebSpeech(text, lang, () => {
        this.currentIndex++;
        this._notifyState(true);
        this._playNext();
      });
    };

    this.audio.play().catch((err) => {
      console.warn('Audio play exception, fallback to SpeechSynthesis:', err);
      this._fallbackWebSpeech(text, lang, () => {
        this.currentIndex++;
        this._notifyState(true);
        this._playNext();
      });
    });
  }

  _fallbackWebSpeech(text, lang, onEnd) {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'vi' ? 'vi-VN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  _notifyState(playing) {
    if (this.onStateChange) {
      this.onStateChange(playing, this.currentIndex, this.queue.length);
    }
  }

  /**
   * Stops current playback immediately
   */
  stop() {
    this.isPlaying = false;
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.queue = [];
    this.currentIndex = 0;
    this._notifyState(false);
  }
}

// Global Singleton Player
export const voicePlayer = new GoogleVoicePlayer();
