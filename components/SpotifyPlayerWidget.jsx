'use client';

import { useState, useEffect } from 'react';
import { SPOTIFY_CURATED_PLAYLISTS } from '@/lib/spotifyData';

export default function SpotifyPlayerWidget({ mode = 'study' }) {
  const peacefulPiano = SPOTIFY_CURATED_PLAYLISTS.find((p) => p.id === '37i9dQZF1DX4sWSpwq3LiO') || SPOTIFY_CURATED_PLAYLISTS[0];
  const [activePlaylist, setActivePlaylist] = useState(peacefulPiano);
  const [isCompact, setIsCompact] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isWork = mode === 'work';

  useEffect(() => {
    setMounted(true);
    setActivePlaylist(peacefulPiano);
  }, []);

  if (!mounted) return null;

  const handleSelectPlaylist = (p) => {
    setActivePlaylist(p);
  };

  return (
    <div
      className={`w-full p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 shadow-md backdrop-blur-md relative overflow-hidden ${
        isWork
          ? 'bg-gradient-to-r from-amber-500/10 via-slate-900/10 to-transparent border-amber-300/60 dark:border-amber-700/60'
          : 'bg-gradient-to-r from-emerald-500/10 via-slate-900/10 to-transparent border-emerald-300/60 dark:border-emerald-800/60'
      }`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#1DB954] text-slate-950 flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">
                Spotify • {activePlaylist.title}
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-[#1DB954]/20 text-[#1DB954] dark:text-[#1ed760] text-[9px] font-black uppercase tracking-wider shrink-0 border border-[#1DB954]/40">
                Official
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {activePlaylist.description}
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
          <button
            type="button"
            onClick={() => setIsCompact(!isCompact)}
            className="w-7 h-7 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs shadow-2xs active:scale-95 transition-all"
            title={isCompact ? 'Mở rộng trình phát' : 'Thu gọn trình phát'}
          >
            {isCompact ? '↕️' : '➖'}
          </button>
        </div>
      </div>

      {/* Quick Curated Playlist Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2.5 no-scrollbar">
        {SPOTIFY_CURATED_PLAYLISTS.map((p) => {
          const isSelected = activePlaylist.id === p.id;

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPlaylist(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs ring-1 ring-emerald-500/50'
                  : 'bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.title.replace(/^[^\s]+\s/, '')}</span>
            </button>
          );
        })}
      </div>

      {/* Official Spotify Embed Player Frame */}
      <div className="w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200/60 dark:border-slate-800/80 bg-black/20">
        <iframe
          key={activePlaylist.embedUrl}
          src={activePlaylist.embedUrl}
          width="100%"
          height={isCompact ? '80' : '152'}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Spotify Focus Player"
          className="rounded-2xl w-full transition-all duration-300 block"
        />
      </div>
    </div>
  );
}
