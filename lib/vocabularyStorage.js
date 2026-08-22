'use client';

const STORAGE_KEYS = {
  MASTERED_WORDS: 'vocab_mastered_ids',
  STARRED_WORDS: 'vocab_starred_ids',
  QUIZ_HISTORY: 'vocab_quiz_history',
  LAST_TOPIC: 'vocab_last_topic',
  VOICE_ACCENT: 'vocab_voice_accent', // 'us' | 'uk'
};

// Safe localStorage access
function getStoredJson(key, defaultValue) {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setStoredJson(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

// Load all vocabulary tracking progress
export function loadVocabProgress() {
  const masteredIds = getStoredJson(STORAGE_KEYS.MASTERED_WORDS, []);
  const starredIds = getStoredJson(STORAGE_KEYS.STARRED_WORDS, []);
  const quizHistory = getStoredJson(STORAGE_KEYS.QUIZ_HISTORY, []);
  const lastTopic = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.LAST_TOPIC) || 'school_supplies' : 'school_supplies';
  const voiceAccent = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.VOICE_ACCENT) || 'us' : 'us';

  return {
    masteredIds: Array.isArray(masteredIds) ? masteredIds : [],
    starredIds: Array.isArray(starredIds) ? starredIds : [],
    quizHistory: Array.isArray(quizHistory) ? quizHistory : [],
    lastTopic,
    voiceAccent,
  };
}

// Toggle or set mastered status of a word
export function toggleMasteredWord(wordId) {
  const mastered = getStoredJson(STORAGE_KEYS.MASTERED_WORDS, []);
  const set = new Set(mastered);
  if (set.has(wordId)) {
    set.delete(wordId);
  } else {
    set.add(wordId);
  }
  const updated = Array.from(set);
  setStoredJson(STORAGE_KEYS.MASTERED_WORDS, updated);
  return updated;
}

// Toggle or set starred/favorite status of a word
export function toggleStarredWord(wordId) {
  const starred = getStoredJson(STORAGE_KEYS.STARRED_WORDS, []);
  const set = new Set(starred);
  if (set.has(wordId)) {
    set.delete(wordId);
  } else {
    set.add(wordId);
  }
  const updated = Array.from(set);
  setStoredJson(STORAGE_KEYS.STARRED_WORDS, updated);
  return updated;
}

// Save last active topic
export function saveLastTopic(topicId) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_TOPIC, topicId);
  } catch (e) {
    console.error('Error saving last topic:', e);
  }
}

// Accent preference
export function getStoredAccent() {
  if (typeof window === 'undefined') return 'us';
  return localStorage.getItem(STORAGE_KEYS.VOICE_ACCENT) || 'us';
}

export function saveStoredAccent(accent) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.VOICE_ACCENT, accent);
}

// Save a completed quiz session
export function saveQuizResult(result) {
  const history = getStoredJson(STORAGE_KEYS.QUIZ_HISTORY, []);
  const newEntry = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    ...result, // { topicId, level, score, totalQuestions, mode }
  };
  const updated = [newEntry, ...history].slice(0, 50); // Keep last 50
  setStoredJson(STORAGE_KEYS.QUIZ_HISTORY, updated);
  return updated;
}

// ==========================================================================
// High-Definition Studio Audio Pronunciation Engine with Instant Preload Cache
// ==========================================================================

let activeAudioElement = null;
const audioCache = new Map();
const MAX_CACHE_SIZE = 80;

/**
 * Builds standard studio stream URL
 */
function getAudioUrl(cleanText, accent = 'us') {
  const typeCode = accent === 'uk' ? 1 : 2;
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&type=${typeCode}`;
}

/**
 * Preload an audio clip into browser cache in the background
 * @param {string} text 
 * @param {string} accent 
 */
export function preloadWordAudio(text, accent = 'us') {
  if (typeof window === 'undefined' || !text) return;
  const cleanText = text.trim();
  if (!cleanText) return;

  const key = `${accent}:${cleanText.toLowerCase()}`;
  if (audioCache.has(key)) return;

  try {
    const url = getAudioUrl(cleanText, accent);
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = url;

    // Keep cache bounded
    if (audioCache.size >= MAX_CACHE_SIZE) {
      const firstKey = audioCache.keys().next().value;
      audioCache.delete(firstKey);
    }
    audioCache.set(key, audio);
  } catch (e) {
    // Ignore preload errors silently
  }
}

/**
 * Play high-fidelity human studio audio pronunciation
 * Supports:
 * - Layer 0: Memory cache (Instant 0ms latency)
 * - Layer 1: Oxford/Youdao Studio English Audio stream (type=2 US, type=1 UK)
 * - Layer 2: Google Speech TTS stream
 * - Layer 3: Web Speech API (window.speechSynthesis)
 *
 * @param {string} text - The English word or phrase
 * @param {number} rate - Playback speed (0.7 to 1.0)
 * @param {string} accent - 'us' (American) or 'uk' (British)
 */
export function speakWord(text, rate = 0.9, accent = 'us') {
  if (typeof window === 'undefined' || !text) return;

  const cleanText = text.trim();
  if (!cleanText) return;

  // Stop any currently playing audio or speech
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch (e) {}
    activeAudioElement = null;
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  const primaryUrl = getAudioUrl(cleanText, accent);
  const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${accent === 'uk' ? 'en-GB' : 'en-US'}&q=${encodeURIComponent(cleanText)}`;
  const key = `${accent}:${cleanText.toLowerCase()}`;

  const playbackRate = rate <= 0.8 ? 0.75 : 1.0;

  // Fallback to Web Speech API if network audio fails
  const fallbackToWebSpeech = () => {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = accent === 'uk' ? 'en-GB' : 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        (accent === 'uk' ? v.lang.startsWith('en-GB') : v.lang.startsWith('en-US') || v.lang.startsWith('en_US')) &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David') || v.name.includes('Jenny'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  let audio;
  if (audioCache.has(key)) {
    audio = audioCache.get(key);
    try {
      audio.currentTime = 0;
    } catch (e) {}
  } else {
    audio = new Audio(primaryUrl);
    if (audioCache.size < MAX_CACHE_SIZE) {
      audioCache.set(key, audio);
    }
  }

  activeAudioElement = audio;
  audio.playbackRate = playbackRate;

  let hasFallenBack = false;

  audio.onerror = () => {
    if (!hasFallenBack) {
      hasFallenBack = true;
      const secondaryAudio = new Audio(fallbackUrl);
      activeAudioElement = secondaryAudio;
      secondaryAudio.playbackRate = playbackRate;
      secondaryAudio.onerror = () => fallbackToWebSpeech();
      secondaryAudio.play().catch(() => fallbackToWebSpeech());
    } else {
      fallbackToWebSpeech();
    }
  };

  audio.play().catch(() => {
    // If browser blocks audio or network fails, gracefully fallback
    fallbackToWebSpeech();
  });
}
