# ⏰ Easy English & Workflow Tracker (Next.js 14 App Router)

A modern habit-tracking and productivity web application built with **Next.js 14 (App Router)**, **React.js**, **Tailwind CSS**, **Three.js**, and **Firebase Firestore** to track daily 30-minute English learning and deep work sessions.

---

## 📁 Next.js Project Architecture

```text
english_tracker_30_min/
├── app/                        # Next.js App Router (Routes & Special Files)
│   ├── api/                    # Route Handlers / API Endpoints
│   │   └── spotify/route.js
│   ├── diary/page.jsx          # Diary Archive & 3D FlipBook
│   ├── leaderboard/page.jsx    # Diligence Gamification & Leaderboard
│   ├── review/page.jsx         # Lesson & Note Review with TTS Audio
│   ├── vocabulary/page.jsx     # Oxford 3000 Flashcards, Quizzes & Games
│   ├── error.jsx               # Global Next.js Client Error Boundary
│   ├── globals.css             # Tailwind CSS directives & custom design tokens
│   ├── layout.jsx              # Root Layout with Font Optimization & 3D Backdrop
│   ├── loading.jsx             # Route transition loading state
│   ├── not-found.jsx           # Custom 404 Not Found Page
│   └── page.jsx                # Main Tracker Dashboard
├── components/                 # Reusable UI Components
│   ├── leaderboard/            # Leaderboard, Quests, Podium & Tier Badges
│   ├── vocabulary/             # Flashcards, Oxford Dictionary, Spelling & Matching
│   ├── AuthButton.jsx          # Firebase Google Sign-In & Profile Modal
│   ├── Background3D.jsx        # Three.js 3D Particle Constellation
│   ├── ConfettiEffect.jsx      # Canvas-confetti celebration animations
│   ├── DiaryFlipBook.jsx       # 3D FlipBook diary component
│   ├── FormattedNote.jsx       # Note formatter & highlight renderer
│   ├── ModeToggle.jsx          # Study / Work Mode switch
│   ├── NameModal.jsx           # User Profile customization modal
│   ├── NoteModal.jsx           # Check-in & TipTap Rich Note Editor
│   ├── RichWordEditor.jsx      # TipTap WYSIWYG Rich Editor with Word count
│   ├── SpotifyPlayerWidget.jsx # Embedded Spotify Lo-Fi background player
│   └── ThemeToggle.jsx         # Dark / Light mode toggle
├── lib/                        # Services, Data Layers & Business Logic
│   ├── vocabData/              # Oxford 3000 dataset (split into parts 1-4)
│   ├── audioPlayer.js          # SpeechSynthesis TTS Audio helper
│   ├── authService.js          # Firebase Auth service
│   ├── firebase.js             # Firebase client SDK initialization
│   ├── firestoreService.js     # Firestore sync & cloud backup service
│   ├── leaderboardService.js   # Gamification XP, Quests & Tier engine
│   ├── lofiMusic.js            # Ambient soundscape audio player
│   ├── spotifyData.js          # Spotify curated playlists
│   ├── storage.js              # LocalStorage + Firestore unified persistence
│   ├── tracker.js              # Pure streak calculation & date helpers
│   ├── vocabularyData.js       # Oxford 3000 search & topic aggregation
│   └── vocabularyStorage.js    # Vocabulary progress & quiz history storage
├── public/                     # Static Assets
│   ├── icon.svg                # Application SVG logo
│   └── manifest.json           # Web App Manifest
├── scripts/                    # Maintenance & dataset generation scripts
│   ├── buildVocabPart1.js
│   ├── compileFullVocab.js
│   ├── generateAllTopics.js
│   └── generateAllVocab.js
├── types/                      # TypeScript definitions & interfaces
│   ├── index.ts
│   ├── leaderboard.ts
│   ├── tracker.ts
│   └── vocabulary.ts
├── firestore.rules             # Secure Firestore Security Rules
├── next.config.js              # Next.js build configuration
├── package.json                # Project dependencies & scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Tailwind CSS theme extension
└── tsconfig.json               # TypeScript compiler options & @/* path aliases
```

---

## ✨ Key Features

- ⚡ **Next.js 14 App Router**: Clean component architecture, SEO metadata, and client-side routing.
- 🔥 **Diligence Gamification & Leaderboard**: Tiers (Mythic, Master, Elite, Dedicated, Novice), XP rewards, daily quests, and real-time rankings.
- 🎴 **Oxford 3000 Vocabulary Suite**: 60 topic categories, 3D Flashcards, Multiple-choice Quizzes, Spelling Practice, and Word-Definition Matching.
- 📖 **3D FlipBook Diary**: Interactive page-flip book to read and reflect on daily study/work entries.
- 🛠️ **TipTap Rich Note Editor**: Full WYSIWYG editor with highlighting, study formula tags, and live word counter.
- ☁️ **Cloud Synchronization**: Real-time sync with Google Firebase Authentication & Cloud Firestore.
- 🎧 **Focus Audio**: Lo-fi background soundscapes, Spotify integration, and English Text-To-Speech pronunciation.
- 🎨 **Visual Excellence**: Dark/Light mode, Three.js 3D starry backdrop, and celebration confetti.

---

## 🚀 How to Run

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start development server**:
   ```bash
   npm run dev
   ```
3. **Build for production**:
   ```bash
   npm run build
   ```