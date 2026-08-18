# ⏰ Easy English Reminder (30-Minute Daily Tracker)

A responsive web application to track daily 30-minute English learning habits with streak counters, daily learning notes, 3D interactive particle background, and Firebase / LocalStorage synchronization.

---

## 📁 Project Structure

```
english_tracker_30_min/
├── index.html              # Main HTML markup skeleton
├── css/
│   └── style.css           # Glassmorphism, animations, tooltips, responsive grid layout
├── js/
│   ├── app.js              # Application entry point & event orchestration
│   ├── tracker.js          # Streak calculation, date helpers & period generation
│   ├── storage.js          # Firebase Firestore sync & LocalStorage fallback
│   ├── background3d.js     # Three.js 3D interactive particle background
│   ├── effects.js          # Confetti particles & celebration banner animations
│   └── ui.js               # Modal controllers (notes & username) and grid renderer
└── README.md               # Project documentation
```

---

## 🧩 Module Breakdown

- **[`index.html`](file:///d:/CODING/english_tracker_30_min/index.html)**: Clean, semantic HTML structure using Tailwind CSS and Three.js CDN.
- **[`css/style.css`](file:///d:/CODING/english_tracker_30_min/css/style.css)**: Custom styles including glassmorphism UI card, tooltip popups, check-in pulse animations, and confetti keyframes.
- **[`js/app.js`](file:///d:/CODING/english_tracker_30_min/js/app.js)**: Initializes components upon page load, manages state reactivity, and binds event handlers.
- **[`js/tracker.js`](file:///d:/CODING/english_tracker_30_min/js/tracker.js)**: Pure calculation algorithms for streaks (`calculateStreak`), date formatting (`getTodayString`, `formatDatePretty`), and pagination periods (`getPeriodRange`).
- **[`js/storage.js`](file:///d:/CODING/english_tracker_30_min/js/storage.js)**: Handles data persistence with Firebase Auth & Cloud Firestore real-time snapshots with offline fallback to browser `localStorage`.
- **[`js/background3d.js`](file:///d:/CODING/english_tracker_30_min/js/background3d.js)**: Three.js 3D particle constellation responding to mouse movements and viewport resize.
- **[`js/effects.js`](file:///d:/CODING/english_tracker_30_min/js/effects.js)**: Celebration banner with 80 falling confetti elements triggered on daily goal completion.
- **[`js/ui.js`](file:///d:/CODING/english_tracker_30_min/js/ui.js)**: Renders the 30-day interactive history grid and manages the Note & Name modals.

---

## 🚀 How to Run

Open `index.html` in any modern web browser or run with a local web server (e.g. Live Server in VS Code / Antigravity IDE, `npx serve`, or `python -m http.server`).