'use client';

import { useState, useEffect } from 'react';
import {
  subscribeLofiMusic,
  playLofiMusic,
  pauseLofiMusic,
  toggleLofiMusic,
  nextLofiTrack,
  setLofiVolume,
} from '@/lib/lofiMusic';

export default function LofiPlayerWidget({ mode = 'study' }) {
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    track: { title: '🌿 Chill Study Beats', subtitle: 'Nhạc thư giãn tập trung học tập' },
    volume: 0.3,
    trackIndex: 0,
  });
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isWork = mode === 'work';

  useEffect(() => {
    setMounted(true);
    const unsubscribe = subscribeLofiMusic((state) => {
      setPlayerState(state);
    });
    return () => unsubscribe();
  }, []);

  if (!mounted) return null;

  const handleTogglePlay = async () => {
    await toggleLofiMusic(playerState.volume || 0.3);
  };

  const handleNextTrack = async () => {
    await nextLofiTrack();
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setLofiVolume(0.3);
      setIsMuted(false);
    } else {
      setLofiVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div
      className={`w-full p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 shadow-md backdrop-blur-md relative overflow-hidden group ${
        isWork
          ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-amber-300/60 dark:border-amber-700/60'
          : 'bg-gradient-to-r from-emerald-500/10 via-indigo-500/5 to-transparent border-emerald-300/60 dark:border-indigo-800/60'
      }`}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        
        {/* Left: Spinning Vinyl Record + Track Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            onClick={handleTogglePlay}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full vinyl-disc flex items-center justify-center cursor-pointer relative shrink-0 transition-transform active:scale-95 shadow-md ${
              playerState.isPlaying ? 'animate-spin-slow ring-2 ring-emerald-400/50 dark:ring-emerald-400/40' : 'animate-spin-paused'
            }`}
            title={playerState.isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc Lo-fi'}
          >
            {/* Center Vinyl Label */}
            <div
              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] ${
                isWork ? 'bg-amber-400 text-amber-950' : 'bg-emerald-400 text-emerald-950'
              }`}
            >
              {playerState.isPlaying ? '🎵' : '▶'}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">
                {playerState.track?.title || '🌿 Chill Study Beats'}
              </span>
              {playerState.isPlaying && (
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-black uppercase tracking-wider shrink-0 border border-emerald-300 dark:border-emerald-800">
                  Live
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {playerState.track?.subtitle || 'Giai điệu thư giãn tập trung 30 phút'}
            </div>
          </div>
        </div>

        {/* Right: Sound Wave Visualizer + Playback Controls */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto sm:ml-0">
          
          {/* Animated Equalizer Waves */}
          {playerState.isPlaying ? (
            <div className="flex items-end gap-1 h-5 px-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="w-1 bg-emerald-500 rounded-full eq-bar-1" />
              <span className="w-1 bg-emerald-500 rounded-full eq-bar-2" />
              <span className="w-1 bg-emerald-500 rounded-full eq-bar-3" />
              <span className="w-1 bg-emerald-500 rounded-full eq-bar-4" />
            </div>
          ) : (
            <div className="flex items-end gap-1 h-5 px-2 bg-slate-100 dark:bg-slate-800/60 rounded-lg opacity-40">
              <span className="w-1 h-2 bg-slate-400 rounded-full" />
              <span className="w-1 h-1 bg-slate-400 rounded-full" />
              <span className="w-1 h-3 bg-slate-400 rounded-full" />
              <span className="w-1 h-1.5 bg-slate-400 rounded-full" />
            </div>
          )}

          {/* Next Track Button */}
          <button
            type="button"
            onClick={handleNextTrack}
            className="w-8 h-8 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs shadow-2xs active:scale-95 transition-all"
            title="Đổi bài tiếp theo"
          >
            ⏭
          </button>

          {/* Mute/Unmute Button */}
          <button
            type="button"
            onClick={handleToggleMute}
            className="w-8 h-8 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs shadow-2xs active:scale-95 transition-all"
            title={isMuted ? 'Bật âm lượng' : 'Tắt tiếng'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Play / Pause Main Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ${
              playerState.isPlaying
                ? isWork
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
            }`}
          >
            <span>{playerState.isPlaying ? '⏸' : '▶'}</span>
            <span>{playerState.isPlaying ? 'Tạm dừng' : 'Nghe Lo-fi'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
