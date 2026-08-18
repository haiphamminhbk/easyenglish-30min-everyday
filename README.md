# ⏰ Easy English Reminder (Next.js & React App)

A modern habit-tracking web application built with **Next.js 14 (App Router)**, **React.js**, **Tailwind CSS**, and **Three.js** to track daily 30-minute English learning, with interactive streak counters, rich Word Editor toolbar, and audio lesson reviews.

---

## 📁 Project Architecture

```
english_tracker_30_min/
├── app/
│   ├── layout.jsx            # Next.js Root Layout with 3D Background & Fonts
│   ├── page.jsx              # Main Dashboard (Streak, 30-Day Grid, Check-in, Modals)
│   ├── review/
│   │   └── page.jsx          # Lesson Review Page with Audio TTS & Read-Only Guard
│   └── globals.css           # Tailwind directives & glassmorphism animations
├── components/
│   ├── Background3D.jsx      # Interactive Three.js 3D Particle Constellation
│   ├── ConfettiEffect.jsx    # Celebration Falling Confetti & Banner
│   ├── FormattedNote.jsx     # Rich text renderer for notes, vocab, and grammar formulas
│   ├── WordEditor.jsx        # Formatting toolbar (Bold, Italic, Vocab, Grammar, Cấu trúc)
│   ├── NoteModal.jsx         # Check-in & Note Editor Modal
│   └── NameModal.jsx         # User Greeting Customization Modal
├── lib/
│   ├── storage.js            # Unified data layer (LocalStorage + Firebase Client Sync)
│   └── tracker.js            # Pure streak calculation, date helpers & 30-day windows
├── package.json              # Next.js, React, Three, Tailwind dependencies
├── tailwind.config.js        # Tailwind CSS theme configuration
├── postcss.config.js         # PostCSS configuration
├── next.config.js            # Next.js configuration
└── jsconfig.json             # Root @/* path aliases
```

---

## ✨ Features

- ⚡ **Next.js 14 App Router & React**: Clean component architecture and client-side routing (`/` and `/review?date=YYYY-MM-DD`).
- 🔥 **Streak & Habit Tracking**: Automatic daily streak calculation, total days counter, and 30-day period history navigation.
- 🛠️ **Word-Style Note Editor**:
  - **Styles**: Bold, Italic, Underline, Highlight.
  - **Lists**: Bullet lists (`- `) and Numbered lists (`1. `).
  - **Quick Study Templates**: 📖 Từ vựng, 💡 Cấu trúc câu, 📘 Ngữ pháp, ⚡ Công thức thì (`(+)`, `(-)`, `(?)`), ⚠️ Lưu ý.
  - **Live Word Counter**: Real-time word and character count badge.
- 🔒 **Read-Only Past Lesson Review**:
  - Days before today can only be opened for review.
  - Text-To-Speech (TTS) English pronunciation audio player.
  - One-click copy note to clipboard.
  - Prev / Next lesson navigation across saved notes.
- 🎨 **Rich Aesthetics**: Glassmorphism cards, interactive 3D particle background (Three.js), and animated celebration confetti.

---

## 🚀 How to Run the Next.js App

1. Install [Node.js (LTS)](https://nodejs.org/) if you haven't already.
2. Open terminal in the project directory:
   ```bash
   npm install
   ```
3. Start the Next.js local development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.