/**
 * Lo-fi Ambient Music Manager for Diary & Background Focus
 * Provides soft study music with Web Audio fallback
 */

let lofiAudio = null;
let audioContext = null;
let synthTimer = null;
let isPlaying = false;
let currentTrackIndex = 0;
let currentVolume = 0.3;
const listeners = new Set();

export const LOFI_PLAYLIST = [
  {
    id: 'lofi-study',
    title: '🌿 Chill Study Beats',
    subtitle: 'Nhạc thư giãn tập trung học tiếng Anh',
    src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  },
  {
    id: 'lofi-coffee',
    title: '☕ Morning Focus Flow',
    subtitle: 'Giai điệu thư thái tăng hiệu suất công việc',
    src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-chill-medium-version-159456.mp3',
  },
  {
    id: 'lofi-rain',
    title: '🌧️ Cozy Rainy Day',
    subtitle: 'Âm thanh êm dịu giải tỏa căng thẳng',
    src: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_03d6d02830.mp3?filename=lofi-rain-chill-124976.mp3',
  },
];

function notifyListeners() {
  const state = {
    isPlaying,
    track: LOFI_PLAYLIST[currentTrackIndex] || LOFI_PLAYLIST[0],
    volume: currentVolume,
    trackIndex: currentTrackIndex,
  };
  listeners.forEach((fn) => {
    try {
      fn(state);
    } catch (e) {}
  });
}

export function subscribeLofiMusic(callback) {
  listeners.add(callback);
  callback({
    isPlaying,
    track: LOFI_PLAYLIST[currentTrackIndex] || LOFI_PLAYLIST[0],
    volume: currentVolume,
    trackIndex: currentTrackIndex,
  });
  return () => listeners.delete(callback);
}

/**
 * Initializes and starts playing Lo-fi background music
 * @param {number} [volume=0.3]
 * @param {number} [trackIdx]
 * @returns {Promise<boolean>}
 */
export async function playLofiMusic(volume = 0.3, trackIdx = null) {
  if (typeof window === 'undefined') return false;

  if (trackIdx !== null && trackIdx >= 0 && trackIdx < LOFI_PLAYLIST.length) {
    currentTrackIndex = trackIdx;
  }
  currentVolume = volume;

  try {
    if (!lofiAudio) {
      lofiAudio = new Audio();
      lofiAudio.loop = true;
      lofiAudio.crossOrigin = 'anonymous';
    }

    const targetSrc = LOFI_PLAYLIST[currentTrackIndex].src;
    if (lofiAudio.src !== targetSrc) {
      lofiAudio.src = targetSrc;
    }

    lofiAudio.volume = currentVolume;
    const playPromise = lofiAudio.play();
    if (playPromise !== undefined) {
      await playPromise;
      isPlaying = true;
      notifyListeners();
      return true;
    }
  } catch (e) {
    startLofiSynth();
    isPlaying = true;
    notifyListeners();
    return true;
  }
  return false;
}

/**
 * Pauses Lo-fi background music
 */
export function pauseLofiMusic() {
  if (lofiAudio) {
    lofiAudio.pause();
  }
  stopLofiSynth();
  isPlaying = false;
  notifyListeners();
}

/**
 * Toggles Lo-fi background music
 * @param {number} [volume]
 * @returns {Promise<boolean>}
 */
export async function toggleLofiMusic(volume = null) {
  if (volume !== null) currentVolume = volume;
  if (isPlaying) {
    pauseLofiMusic();
    return false;
  } else {
    return await playLofiMusic(currentVolume);
  }
}

/**
 * Switches to next Lo-fi track
 */
export async function nextLofiTrack() {
  const nextIdx = (currentTrackIndex + 1) % LOFI_PLAYLIST.length;
  if (isPlaying) {
    pauseLofiMusic();
    await playLofiMusic(currentVolume, nextIdx);
  } else {
    currentTrackIndex = nextIdx;
    notifyListeners();
  }
}

/**
 * Sets volume (0.0 to 1.0)
 * @param {number} vol
 */
export function setLofiVolume(vol) {
  currentVolume = Math.max(0, Math.min(1, vol));
  if (lofiAudio) {
    lofiAudio.volume = currentVolume;
  }
  notifyListeners();
}

export function isLofiPlaying() {
  return isPlaying;
}

/* Offline Web Audio Lo-Fi Synth Backup (Gentle 7th Chords) */
function startLofiSynth() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioContext) {
      audioContext = new AudioCtx();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
    ];

    let chordIdx = 0;
    const playChord = () => {
      if (!audioContext || audioContext.state === 'closed') return;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;

      notes.forEach((freq) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(550, audioContext.currentTime);

        gain.gain.setValueAtTime(0.001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.03 * currentVolume, audioContext.currentTime + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 3.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);

        osc.start();
        osc.stop(audioContext.currentTime + 4.0);
      });
    };

    playChord();
    if (synthTimer) clearInterval(synthTimer);
    synthTimer = setInterval(playChord, 4000);
  } catch (e) {}
}

function stopLofiSynth() {
  if (synthTimer) {
    clearInterval(synthTimer);
    synthTimer = null;
  }
}
