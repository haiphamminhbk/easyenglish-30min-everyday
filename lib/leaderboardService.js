'use client';

import { getFirebaseInstance } from './firebase';
import { loadLocalData } from './storage';
import { loadVocabProgress } from './vocabularyStorage';
import { calculateStreak, getTodayString } from './tracker';

/**
 * Tier configurations and badges
 */
export const TIERS = {
  MYTHIC: {
    id: 'mythic',
    name: 'Huyền Thoại Kiên Trì',
    icon: '👑',
    color: 'from-amber-400 via-yellow-500 to-amber-600',
    border: 'border-amber-400/80',
    glow: 'shadow-amber-500/30',
    textColor: 'text-amber-400',
    bgBadge: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/40',
    minXp: 1500,
    minStreak: 30,
  },
  MASTER: {
    id: 'master',
    name: 'Cao Thủ Bền Bỉ',
    icon: '💎',
    color: 'from-purple-500 via-indigo-500 to-blue-500',
    border: 'border-purple-400/80',
    glow: 'shadow-purple-500/30',
    textColor: 'text-purple-400',
    bgBadge: 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/40',
    minXp: 800,
    minStreak: 14,
  },
  ELITE: {
    id: 'elite',
    name: 'Chiến Binh Chăm Chỉ',
    icon: '🥇',
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-400/80',
    glow: 'shadow-emerald-500/30',
    textColor: 'text-emerald-400',
    bgBadge: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40',
    minXp: 400,
    minStreak: 7,
  },
  DEDICATED: {
    id: 'dedicated',
    name: 'Tân Binh Quyết Tâm',
    icon: '🥈',
    color: 'from-cyan-500 to-blue-600',
    border: 'border-cyan-400/80',
    glow: 'shadow-cyan-500/30',
    textColor: 'text-cyan-400',
    bgBadge: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40',
    minXp: 150,
    minStreak: 3,
  },
  NOVICE: {
    id: 'novice',
    name: 'Mầm Non Nỗ Lực',
    icon: '🌱',
    color: 'from-slate-400 to-slate-600',
    border: 'border-slate-400/60',
    glow: 'shadow-slate-500/20',
    textColor: 'text-slate-400',
    bgBadge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    minXp: 0,
    minStreak: 0,
  },
};

/**
 * Determines tier by XP and Streak
 * @param {number} xp 
 * @param {number} streak 
 * @returns {typeof TIERS.MYTHIC}
 */
export function getTierByStats(xp = 0, streak = 0) {
  if (xp >= TIERS.MYTHIC.minXp || streak >= TIERS.MYTHIC.minStreak) return TIERS.MYTHIC;
  if (xp >= TIERS.MASTER.minXp || streak >= TIERS.MASTER.minStreak) return TIERS.MASTER;
  if (xp >= TIERS.ELITE.minXp || streak >= TIERS.ELITE.minStreak) return TIERS.ELITE;
  if (xp >= TIERS.DEDICATED.minXp || streak >= TIERS.DEDICATED.minStreak) return TIERS.DEDICATED;
  return TIERS.NOVICE;
}

/**
 * Inspirational community learners list to populate leaderboard smoothly
 */
export const COMMUNITY_LEARNERS = [
  {
    id: 'comm_01',
    displayName: 'Hoàng Minh',
    avatar: '👨‍🎓',
    location: 'Hà Nội',
    streak: 36,
    totalStudyDays: 45,
    totalWordsMastered: 420,
    totalPoints: 2680,
    cheersCount: 142,
    quote: 'Mỗi ngày 30 phút, không bỏ cuộc!',
  },
  {
    id: 'comm_02',
    displayName: 'Thu Trang',
    avatar: '👩‍💼',
    location: 'Đà Nẵng',
    streak: 31,
    totalStudyDays: 38,
    totalWordsMastered: 395,
    totalPoints: 2340,
    cheersCount: 118,
    quote: 'Kỷ luật chính là tự do.',
  },
  {
    id: 'comm_03',
    displayName: 'Tuấn Kiệt',
    avatar: '🧑‍💻',
    location: 'TP. Hồ Chí Minh',
    streak: 26,
    totalStudyDays: 32,
    totalWordsMastered: 310,
    totalPoints: 1890,
    cheersCount: 95,
    quote: '30 phút tiếng Anh trước khi ngủ.',
  },
  {
    id: 'comm_04',
    displayName: 'Hải Yến',
    avatar: '👩‍🎓',
    location: 'Cần Thơ',
    streak: 21,
    totalStudyDays: 27,
    totalWordsMastered: 265,
    totalPoints: 1540,
    cheersCount: 76,
    quote: 'Tích tiểu thành đại!',
  },
  {
    id: 'comm_05',
    displayName: 'Quốc Bảo',
    avatar: '👨‍🏫',
    location: 'Hải Phòng',
    streak: 17,
    totalStudyDays: 22,
    totalWordsMastered: 210,
    totalPoints: 1220,
    cheersCount: 64,
    quote: 'Học tiếng Anh chưa bao giờ vui thế này.',
  },
  {
    id: 'comm_06',
    displayName: 'Phương Linh',
    avatar: '👩‍🎨',
    location: 'Huế',
    streak: 13,
    totalStudyDays: 18,
    totalWordsMastered: 175,
    totalPoints: 920,
    cheersCount: 52,
    quote: 'Mỗi ngày 1 chủ đề từ vựng.',
  },
  {
    id: 'comm_07',
    displayName: 'Duy Anh',
    avatar: '🧑‍🔬',
    location: 'Quảng Ninh',
    streak: 9,
    totalStudyDays: 14,
    totalWordsMastered: 130,
    totalPoints: 710,
    cheersCount: 41,
    quote: 'Flashcard 3D đỉnh thật sự!',
  },
  {
    id: 'comm_08',
    displayName: 'Ngọc Mai',
    avatar: '👩‍🌾',
    location: 'Bình Dương',
    streak: 7,
    totalStudyDays: 11,
    totalWordsMastered: 95,
    totalPoints: 530,
    cheersCount: 33,
    quote: 'Mới bắt đầu nhưng sẽ không dừng lại.',
  },
  {
    id: 'comm_09',
    displayName: 'Thành Nam',
    avatar: '👨‍🚒',
    location: 'Nam Định',
    streak: 4,
    totalStudyDays: 8,
    totalWordsMastered: 60,
    totalPoints: 360,
    cheersCount: 21,
    quote: 'Cố gắng vào Top 5 tuần này!',
  },
  {
    id: 'comm_10',
    displayName: 'Khánh Vy',
    avatar: '👩‍🚀',
    location: 'Vũng Tàu',
    streak: 3,
    totalStudyDays: 5,
    totalWordsMastered: 45,
    totalPoints: 250,
    cheersCount: 15,
    quote: 'Let’s go! 🚀',
  },
];

/**
 * Calculates current user's complete Diligence & XP stats from local/cloud data
 */
export function getCurrentUserDiligenceStats() {
  if (typeof window === 'undefined') {
    return {
      userId: 'local_user',
      displayName: 'Bạn',
      avatar: '🌟',
      streak: 0,
      totalStudyDays: 0,
      totalWordsMastered: 0,
      totalWordsStarred: 0,
      totalQuizSessions: 0,
      quizAverageAccuracy: 0,
      totalNotesCount: 0,
      totalPoints: 0,
      tier: TIERS.NOVICE,
      isCurrentUser: true,
    };
  }

  // 1. Tracker data
  const trackerData = loadLocalData('study');
  const todayStr = getTodayString();
  const studyDates = trackerData.studyDates || trackerData.dates || [];
  const studyNotes = trackerData.studyNotes || trackerData.notes || {};
  const savedUserName = trackerData.savedUserName || 'Bạn';
  const streak = calculateStreak(studyDates, todayStr);
  const totalStudyDays = studyDates.length;
  const totalNotesCount = Object.keys(studyNotes).filter((d) => studyNotes[d]?.trim()).length;

  // 2. Vocab data
  const vocabData = loadVocabProgress();
  const totalWordsMastered = vocabData.masteredIds?.length || 0;
  const totalWordsStarred = vocabData.starredIds?.length || 0;
  const quizHistory = vocabData.quizHistory || [];
  const totalQuizSessions = quizHistory.length;

  // 3. Quiz Score Points
  let quizBonusPoints = 0;
  let totalAccuracy = 0;
  quizHistory.forEach((q) => {
    const accuracy = q.accuracyPercent || (q.score && q.totalQuestions ? Math.round((q.score / q.totalQuestions) * 100) : 100);
    totalAccuracy += accuracy;
    quizBonusPoints += Math.round((accuracy / 100) * 30) + 10;
  });
  const quizAverageAccuracy = totalQuizSessions > 0 ? Math.round(totalAccuracy / totalQuizSessions) : 0;

  // 4. Daily bonus quest points from localStorage
  const dailyQuestKey = `easy_english_quest_bonus_${todayStr}`;
  const questBonusPoints = parseInt(localStorage.getItem(dailyQuestKey) || '0', 10);

  // 5. Total Diligence Points (XP)
  // - 50 XP per study day
  // - 10 XP per streak day
  // - 15 XP per mastered word
  // - 5 XP per starred word
  // - 20 XP per rich diary note
  // - Quiz points + Quest bonus
  const totalPoints =
    totalStudyDays * 50 +
    streak * 10 +
    totalWordsMastered * 15 +
    totalWordsStarred * 5 +
    totalNotesCount * 20 +
    quizBonusPoints +
    questBonusPoints;

  const tier = getTierByStats(totalPoints, streak);

  // Firebase auth info if available
  let userId = 'local_user';
  let displayName = savedUserName !== 'bạn' ? savedUserName : 'Bạn';
  let photoURL = '';

  const { auth } = getFirebaseInstance();
  if (auth?.currentUser) {
    userId = auth.currentUser.uid;
    if (auth.currentUser.displayName) displayName = auth.currentUser.displayName;
    if (auth.currentUser.photoURL) photoURL = auth.currentUser.photoURL;
  }

  return {
    userId,
    displayName,
    photoURL,
    avatar: '🔥',
    streak,
    totalStudyDays,
    totalWordsMastered,
    totalWordsStarred,
    totalQuizSessions,
    quizAverageAccuracy,
    totalNotesCount,
    totalPoints,
    tier,
    isCurrentUser: true,
    cheersCount: parseInt(localStorage.getItem('my_cheers_count') || '12', 10),
    quote: localStorage.getItem('my_leaderboard_quote') || 'Chăm chỉ mỗi ngày, thành công mỗi bước!',
  };
}

/**
 * Saves or updates user leaderboard document in Firestore
 */
export async function syncUserLeaderboardToFirestore() {
  if (typeof window === 'undefined') return;

  try {
    const { getFirebaseInstance } = await import('./firebase');
    const { auth, db, isConfigured } = getFirebaseInstance();

    if (!isConfigured || !auth?.currentUser || !db) return;

    const stats = getCurrentUserDiligenceStats();
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

    const leaderboardRef = doc(db, 'leaderboard', auth.currentUser.uid);
    await setDoc(
      leaderboardRef,
      {
        userId: auth.currentUser.uid,
        displayName: stats.displayName,
        photoURL: stats.photoURL || '',
        streak: stats.streak,
        totalStudyDays: stats.totalStudyDays,
        totalWordsMastered: stats.totalWordsMastered,
        totalQuizSessions: stats.totalQuizSessions,
        totalPoints: stats.totalPoints,
        badgeTier: stats.tier.id,
        quote: stats.quote,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Leaderboard sync notice:', error);
  }
}

/**
 * Subscribes to realtime Leaderboard from Firestore with fallback merging
 * @param {Function} callback 
 * @returns {Function} unsubscribe
 */
export function subscribeLeaderboard(callback) {
  if (typeof window === 'undefined') return () => {};

  const { db, isConfigured } = getFirebaseInstance();

  let isCancelled = false;
  let activeUnsubscribe = null;

  if (isConfigured && db) {
    import('firebase/firestore')
      .then(({ collection, query, orderBy, limit, onSnapshot }) => {
        if (isCancelled) return;

        const colRef = collection(db, 'leaderboard');
        const q = query(colRef, orderBy('totalPoints', 'desc'), limit(50));

        activeUnsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (isCancelled) return;
            const cloudLearners = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
              tier: getTierByStats(doc.data().totalPoints || 0, doc.data().streak || 0),
            }));
            callback(cloudLearners);
          },
          (err) => {
            console.warn('Leaderboard realtime subscription fallback:', err);
            callback([]);
          }
        );
      })
      .catch((err) => {
        console.warn('Firestore load failed:', err);
        callback([]);
      });

    return () => {
      isCancelled = true;
      if (typeof activeUnsubscribe === 'function') {
        activeUnsubscribe();
      }
    };
  } else {
    callback([]);
    return () => {};
  }
}

/**
 * Merges Cloud learners, Community simulated benchmark learners, and current user
 * into a single unified, ranked list
 * @param {Array} cloudLearners 
 * @param {'xp' | 'streak' | 'days' | 'vocab'} [sortBy='xp'] 
 * @param {'all' | 'month' | 'week'} [timeFrame='all'] 
 * @returns {Array} Sorted and ranked learners list
 */
export function getUnifiedLeaderboard(cloudLearners = [], sortBy = 'xp', timeFrame = 'all') {
  const currentUser = getCurrentUserDiligenceStats();

  // Create a map to avoid duplicates
  const learnerMap = new Map();

  // 1. Add community benchmark learners
  COMMUNITY_LEARNERS.forEach((learner) => {
    let points = learner.totalPoints;
    let streak = learner.streak;
    let days = learner.totalStudyDays;

    if (timeFrame === 'month') {
      points = Math.round(points * 0.55);
      streak = Math.min(streak, 28);
      days = Math.min(days, 28);
    } else if (timeFrame === 'week') {
      points = Math.round(points * 0.2);
      streak = Math.min(streak, 7);
      days = Math.min(days, 7);
    }

    learnerMap.set(learner.id, {
      ...learner,
      totalPoints: points,
      streak,
      totalStudyDays: days,
      tier: getTierByStats(points, streak),
      isCurrentUser: false,
    });
  });

  // 2. Add/Override with real cloud users
  cloudLearners.forEach((cloudUser) => {
    if (!cloudUser.id) return;
    const isMe = currentUser.userId === cloudUser.id;
    learnerMap.set(cloudUser.id, {
      ...cloudUser,
      isCurrentUser: isMe,
      tier: getTierByStats(cloudUser.totalPoints || 0, cloudUser.streak || 0),
      avatar: cloudUser.photoURL ? undefined : (isMe ? '🔥' : '⭐'),
    });
  });

  // 3. Ensure current user is present
  learnerMap.set(currentUser.userId, currentUser);

  // Convert to array
  let list = Array.from(learnerMap.values());

  // Sorting
  list.sort((a, b) => {
    if (sortBy === 'streak') {
      if (b.streak !== a.streak) return b.streak - a.streak;
      return b.totalPoints - a.totalPoints;
    }
    if (sortBy === 'days') {
      if (b.totalStudyDays !== a.totalStudyDays) return b.totalStudyDays - a.totalStudyDays;
      return b.totalPoints - a.totalPoints;
    }
    if (sortBy === 'vocab') {
      if (b.totalWordsMastered !== a.totalWordsMastered) return (b.totalWordsMastered || 0) - (a.totalWordsMastered || 0);
      return b.totalPoints - a.totalPoints;
    }
    // Default XP
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return b.streak - a.streak;
  });

  // Assign ranks
  return list.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}

/**
 * Daily Diligence Quests status
 */
export function getDailyQuests() {
  if (typeof window === 'undefined') return [];

  const todayStr = getTodayString();
  const trackerData = loadLocalData('study');
  const vocabData = loadVocabProgress();

  const studyDates = trackerData.studyDates || trackerData.dates || [];
  const studyNotes = trackerData.studyNotes || trackerData.notes || {};

  const isCheckedInToday = studyDates.includes(todayStr);
  const hasNoteToday = Boolean(studyNotes[todayStr] && studyNotes[todayStr].trim());
  const wordsMasteredCount = vocabData.masteredIds?.length || 0;
  const quizHistory = vocabData.quizHistory || [];

  // Check if completed a quiz today
  const todayQuiz = quizHistory.find((q) => q.date === todayStr || (q.createdAt && q.createdAt.startsWith(todayStr)));
  const hasQuizToday = Boolean(todayQuiz);

  const claimedQuests = JSON.parse(localStorage.getItem(`easy_english_claimed_quests_${todayStr}`) || '[]');

  const quests = [
    {
      id: 'quest_checkin',
      title: 'Điểm danh 30 phút hôm nay',
      description: 'Hoàn thành mục tiêu rèn luyện tiếng Anh trong ngày',
      xpReward: 50,
      icon: '🚀',
      isCompleted: isCheckedInToday,
      isClaimed: claimedQuests.includes('quest_checkin'),
      progress: isCheckedInToday ? 1 : 0,
      target: 1,
    },
    {
      id: 'quest_words',
      title: 'Học 5 từ vựng Oxford',
      description: 'Đánh dấu đã thuộc từ mới trên Flashcards 3D',
      xpReward: 35,
      icon: '🎴',
      isCompleted: wordsMasteredCount >= 5,
      isClaimed: claimedQuests.includes('quest_words'),
      progress: Math.min(wordsMasteredCount, 5),
      target: 5,
    },
    {
      id: 'quest_quiz',
      title: 'Hoàn thành 1 bài Quiz trắc nghiệm',
      description: 'Thử sức kiểm tra độ nhớ từ vựng với kết quả xuất sắc',
      xpReward: 30,
      icon: '🎯',
      isCompleted: hasQuizToday,
      isClaimed: claimedQuests.includes('quest_quiz'),
      progress: hasQuizToday ? 1 : 0,
      target: 1,
    },
    {
      id: 'quest_diary',
      title: 'Ghi nhật ký bài học',
      description: 'Lưu lại điểm ngữ pháp hoặc câu nói hay đã học hôm nay',
      xpReward: 25,
      icon: '✍️',
      isCompleted: hasNoteToday,
      isClaimed: claimedQuests.includes('quest_diary'),
      progress: hasNoteToday ? 1 : 0,
      target: 1,
    },
  ];

  return quests;
}

/**
 * Claims reward for a daily quest
 * @param {string} questId 
 * @param {number} xpReward 
 */
export function claimDailyQuestReward(questId, xpReward) {
  if (typeof window === 'undefined') return false;

  const todayStr = getTodayString();
  const storageKey = `easy_english_claimed_quests_${todayStr}`;
  const claimed = JSON.parse(localStorage.getItem(storageKey) || '[]');

  if (claimed.includes(questId)) return false;

  claimed.push(questId);
  localStorage.setItem(storageKey, JSON.stringify(claimed));

  // Add bonus XP to local storage for today
  const bonusKey = `easy_english_quest_bonus_${todayStr}`;
  const currentBonus = parseInt(localStorage.getItem(bonusKey) || '0', 10);
  localStorage.setItem(bonusKey, String(currentBonus + xpReward));

  // Sync to Firestore in background
  syncUserLeaderboardToFirestore();

  return true;
}

/**
 * Increment cheers for a learner
 * @param {string} learnerId 
 */
export function cheerLearner(learnerId) {
  if (typeof window === 'undefined') return;

  const cheeredKey = `cheered_learners_${learnerId}`;
  const alreadyCheered = localStorage.getItem(cheeredKey);
  if (alreadyCheered) return false;

  localStorage.setItem(cheeredKey, 'true');

  if (learnerId === 'local_user') {
    const current = parseInt(localStorage.getItem('my_cheers_count') || '12', 10);
    localStorage.setItem('my_cheers_count', String(current + 1));
  }
  return true;
}
