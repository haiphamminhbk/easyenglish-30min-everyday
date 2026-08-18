'use client';

import { useEffect, useState } from 'react';

const CONFETTI_COLORS = ['#FF6B6B', '#FFA94D', '#FFD93D', '#6BCB77', '#4D96FF', '#9D84B7'];

export default function ConfettiEffect({ onComplete }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generated = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 0.5 + 's',
      duration: 3 + Math.random() * 2 + 's',
    }));
    setParticles(generated);

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="congratulations-container">
      <div className="congratulations-text">🎉 Excellent! 🎉</div>
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}
