'use client';

import React, { useState, useEffect } from 'react';
import { X, Crown, Flame, Zap, Trophy, Award, Sparkles, Copy, Check, Share2, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FlexCertificateModal({ isOpen, onClose, userStats }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger festive celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isOpen]);

  if (!isOpen || !userStats) return null;

  const tier = userStats.tier || {
    name: 'Chiến Binh Chăm Chỉ',
    icon: '🥇',
    color: 'from-amber-400 to-yellow-500',
    textColor: 'text-amber-400',
    bgBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  };

  const handleCopyShareText = () => {
    const text = `🏆 Tôi vừa đạt thứ hạng #${userStats.rank || 1} trên Bảng Xếp Hạng Easy English (30 phút mỗi ngày)!
🔥 Chuỗi ngày liên tục: ${userStats.streak} ngày
⚡ Điểm Chăm Chỉ: ${userStats.totalPoints.toLocaleString()} XP
🎴 Danh hiệu: ${tier.icon} ${tier.name}
📖 Từ vựng đã thuộc: ${userStats.totalWordsMastered} từ

Cùng kiên trì 30 phút mỗi ngày nâng cao tiếng Anh nhé! 🚀`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border-2 border-amber-400/50 shadow-2xl shadow-amber-500/20 overflow-hidden text-center">
        {/* Glow ambient effects */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Badge & Crown */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-black tracking-widest uppercase mb-3">
            <Crown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>EASY ENGLISH 30 MIN - CHỨNG NHẬN THÀNH TÍCH</span>
          </div>

          {/* Certificate Inner Card */}
          <div className="w-full bg-gradient-to-b from-white/10 to-white/5 rounded-2xl p-5 sm:p-6 border border-white/15 backdrop-blur-lg my-3 relative overflow-hidden">
            {/* Corner Decorative Ornaments */}
            <span className="absolute top-2 left-2 text-amber-400/60 text-xs font-serif">✦</span>
            <span className="absolute top-2 right-2 text-amber-400/60 text-xs font-serif">✦</span>
            <span className="absolute bottom-2 left-2 text-amber-400/60 text-xs font-serif">✦</span>
            <span className="absolute bottom-2 right-2 text-amber-400/60 text-xs font-serif">✦</span>

            {/* Avatar with glowing ring */}
            <div className="relative mx-auto mb-3 w-20 h-20 sm:w-24 sm:h-24">
              <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-1 shadow-2xl ring-4 ring-amber-400/50 flex items-center justify-center">
                {userStats.photoURL ? (
                  <img
                    src={userStats.photoURL}
                    alt={userStats.displayName}
                    className="w-full h-full object-cover rounded-[20px]"
                  />
                ) : (
                  <span className="text-4xl sm:text-5xl">{userStats.avatar || '🌟'}</span>
                )}
              </div>
              {/* Rank Seal */}
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black text-xs px-2.5 py-1 rounded-full shadow-lg border border-white">
                #{userStats.rank || 1}
              </div>
            </div>

            {/* Name */}
            <h2 className="font-heading text-xl sm:text-2xl font-black text-white mb-1 tracking-tight">
              {userStats.displayName}
            </h2>

            {/* Tier Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border mb-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-400/40 shadow-inner">
              <span>{tier.icon}</span>
              <span>{tier.name}</span>
            </div>

            {/* 3 Metric Pillars */}
            <div className="grid grid-cols-3 gap-2 bg-black/30 rounded-xl p-3 border border-white/10 text-center mb-3">
              <div>
                <div className="flex items-center justify-center gap-1 text-sm sm:text-base font-black text-orange-400">
                  <Flame className="w-4 h-4 fill-orange-400" />
                  <span>{userStats.streak}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Chuỗi ngày</p>
              </div>

              <div className="border-x border-white/10">
                <div className="flex items-center justify-center gap-1 text-sm sm:text-base font-black text-amber-300">
                  <Zap className="w-4 h-4 fill-amber-300" />
                  <span>{userStats.totalPoints.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Điểm XP</p>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1 text-sm sm:text-base font-black text-emerald-300">
                  <BookOpen className="w-4 h-4" />
                  <span>{userStats.totalWordsMastered}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Từ vựng</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 italic">
              “{userStats.quote || 'Mỗi ngày 30 phút – Kiên trì tạo nên sự khác biệt lớn!'}”
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 w-full mt-2">
            <button
              type="button"
              onClick={handleCopyShareText}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã sao chép lời chia sẻ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao chép thành tích để Flex 🚀</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
