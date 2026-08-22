/**
 * Storage & Sync Layer for Next.js (Firebase Client + LocalStorage Fallback & Multi-Device Sync)
 */

import { getFirebaseInstance } from './firebase';

const LOCAL_STUDY_DATES_KEY = 'english_30min_v2';
const LOCAL_STUDY_NOTES_KEY = 'english_30min_notes_v2';
const LOCAL_WORK_DATES_KEY = 'work_30min_v2';
const LOCAL_WORK_NOTES_KEY = 'work_30min_notes_v2';
const LOCAL_USER_KEY = 'english_30min_username';
const LOCAL_MODE_KEY = 'app_tracker_mode';

let activeUnsubscribe = null;

/**
 * Gets saved mode ('study' | 'work') from localStorage
 * @returns {'study' | 'work'}
 */
export function getStoredMode() {
  if (typeof window === 'undefined') return 'study';
  return localStorage.getItem(LOCAL_MODE_KEY) === 'work' ? 'work' : 'study';
}

/**
 * Saves current mode to localStorage
 * @param {'study' | 'work'} mode
 */
export function setStoredMode(mode) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_MODE_KEY, mode === 'work' ? 'work' : 'study');
}

/**
 * Loads data from LocalStorage for given mode (safe for SSR)
 * @param {'study' | 'work'} [mode]
 * @returns {{ studyDates: string[], studyNotes: Record<string, string>, savedUserName: string, mode: string, workDates: string[], workNotes: Record<string, string> }}
 */
export function loadLocalData(mode = 'study') {
  if (typeof window === 'undefined') {
    return {
      dates: [],
      notes: {},
      studyDates: [],
      studyNotes: {},
      workDates: [],
      workNotes: {},
      savedUserName: "bạn",
      mode: "study",
    };
  }
  const activeMode = mode || getStoredMode();

  const rawStudyDates = localStorage.getItem(LOCAL_STUDY_DATES_KEY);
  const rawStudyNotes = localStorage.getItem(LOCAL_STUDY_NOTES_KEY);
  const rawWorkDates = localStorage.getItem(LOCAL_WORK_DATES_KEY);
  const rawWorkNotes = localStorage.getItem(LOCAL_WORK_NOTES_KEY);

  const studyDates = JSON.parse(rawStudyDates || '[]');
  const studyNotes = JSON.parse(rawStudyNotes || '{}');
  const workDates = JSON.parse(rawWorkDates || '[]');
  const workNotes = JSON.parse(rawWorkNotes || '{}');
  const savedUserName = localStorage.getItem(LOCAL_USER_KEY) || "bạn";

  const dates = activeMode === 'work' ? workDates : studyDates;
  const notes = activeMode === 'work' ? workNotes : studyNotes;

  return {
    dates,
    notes,
    studyDates,
    studyNotes,
    workDates,
    workNotes,
    savedUserName,
    mode: activeMode,
  };
}

/**
 * Loads all diary entries across both Study and Work modes
 * @returns {{ entries: Array<{ dateStr: string, studyNote?: string, workNote?: string, hasStudy: boolean, hasWork: boolean }>, savedUserName: string }}
 */
export function loadAllDiaryEntries() {
  if (typeof window === 'undefined') return { entries: [], savedUserName: 'bạn' };

  const studyDates = JSON.parse(localStorage.getItem(LOCAL_STUDY_DATES_KEY) || '[]');
  const studyNotes = JSON.parse(localStorage.getItem(LOCAL_STUDY_NOTES_KEY) || '{}');
  const workDates = JSON.parse(localStorage.getItem(LOCAL_WORK_DATES_KEY) || '[]');
  const workNotes = JSON.parse(localStorage.getItem(LOCAL_WORK_NOTES_KEY) || '{}');
  const savedUserName = localStorage.getItem(LOCAL_USER_KEY) || 'bạn';

  const allDatesSet = new Set([
    ...studyDates,
    ...workDates,
    ...Object.keys(studyNotes),
    ...Object.keys(workNotes),
  ]);

  const sortedDates = Array.from(allDatesSet).sort();

  const entries = [];
  sortedDates.forEach((dateStr) => {
    const studyNote = studyNotes[dateStr]?.trim() || '';
    const workNote = workNotes[dateStr]?.trim() || '';
    const hasStudy = studyDates.includes(dateStr) || studyNote.length > 0;
    const hasWork = workDates.includes(dateStr) || workNote.length > 0;

    if (hasStudy || hasWork) {
      entries.push({
        dateStr,
        hasStudy,
        hasWork,
        studyNote,
        workNote,
      });
    }
  });

  return { entries, savedUserName };
}

/**
 * Clears all local study and work data
 */
export function clearAllLocalData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_STUDY_DATES_KEY);
  localStorage.removeItem(LOCAL_STUDY_NOTES_KEY);
  localStorage.removeItem(LOCAL_WORK_DATES_KEY);
  localStorage.removeItem(LOCAL_WORK_NOTES_KEY);
}

/**
 * Initializes Firebase auth and remote listeners or falls back to localStorage
 * @param {Function} onDataChange - callback({ studyDates, studyNotes, savedUserName, workDates, workNotes })
 * @param {Function} onAuthStatus - callback('synced' | 'anonymous' | 'local')
 */
export async function initStorage(onDataChange, onAuthStatus) {
  if (typeof window === 'undefined') return;

  const { auth, db, isConfigured } = getFirebaseInstance();

  if (isConfigured && auth && db) {
    try {
      const { onAuthStateChanged } = await import('firebase/auth');
      const { doc, onSnapshot, setDoc } = await import('firebase/firestore');

      onAuthStateChanged(auth, (user) => {
        if (activeUnsubscribe) {
          activeUnsubscribe();
          activeUnsubscribe = null;
        }

        if (user) {
          if (onAuthStatus) {
            onAuthStatus(user.isAnonymous ? 'anonymous' : 'synced');
          }

          const docRef = doc(db, 'users', user.uid, 'data', 'tracker');

          activeUnsubscribe = onSnapshot(docRef, async (docSnap) => {
            let localData = loadLocalData();

            if (docSnap.exists()) {
              const remoteData = docSnap.data();
              const studyDates = remoteData.dates || [];
              const studyNotes = remoteData.notes || {};
              const workDates = remoteData.workDates || [];
              const workNotes = remoteData.workNotes || {};
              const savedUserName = remoteData.username || user.displayName || localData.savedUserName || 'bạn';

              // Update localStorage with remote data
              localStorage.setItem(LOCAL_STUDY_DATES_KEY, JSON.stringify(studyDates));
              localStorage.setItem(LOCAL_STUDY_NOTES_KEY, JSON.stringify(studyNotes));
              localStorage.setItem(LOCAL_WORK_DATES_KEY, JSON.stringify(workDates));
              localStorage.setItem(LOCAL_WORK_NOTES_KEY, JSON.stringify(workNotes));
              if (savedUserName) localStorage.setItem(LOCAL_USER_KEY, savedUserName);

              if (onDataChange) {
                onDataChange({ studyDates, studyNotes, workDates, workNotes, savedUserName });
              }
            } else {
              // First time user logs in: upload local progress to Firestore
              const initialUserName = user.displayName || localData.savedUserName || 'bạn';
              if (localData.studyDates.length > 0 || localData.workDates.length > 0 || initialUserName) {
                try {
                  await setDoc(
                    docRef,
                    {
                      dates: localData.studyDates,
                      notes: localData.studyNotes,
                      workDates: localData.workDates,
                      workNotes: localData.workNotes,
                      username: initialUserName,
                      updatedAt: new Date().toISOString(),
                    },
                    { merge: true }
                  );
                } catch (e) {
                  console.warn('Initial sync error:', e);
                }
              }
              localStorage.setItem(LOCAL_USER_KEY, initialUserName);
              if (onDataChange) onDataChange({ ...localData, savedUserName: initialUserName });
            }
          });
        } else {
          // User logged out
          if (onAuthStatus) onAuthStatus('local');
          const localData = loadLocalData();
          if (onDataChange) onDataChange(localData);
        }
      });
      return;
    } catch (e) {
      console.warn('Firebase init fallback to local:', e);
    }
  }

  // Fallback to LocalStorage
  const localData = loadLocalData();
  if (onDataChange) onDataChange(localData);
  if (onAuthStatus) onAuthStatus('local');
}

/**
 * Saves tracking dates and notes to remote Firestore and localStorage
 * @param {string[]} dates 
 * @param {Record<string, string>} notes 
 * @param {'study' | 'work'} [mode]
 */
export async function saveStudyData(dates, notes, mode = 'study') {
  if (typeof window === 'undefined') return;

  const datesKey = mode === 'work' ? LOCAL_WORK_DATES_KEY : LOCAL_STUDY_DATES_KEY;
  const notesKey = mode === 'work' ? LOCAL_WORK_NOTES_KEY : LOCAL_STUDY_NOTES_KEY;

  localStorage.setItem(datesKey, JSON.stringify(dates));
  localStorage.setItem(notesKey, JSON.stringify(notes));

  const { auth, db, isConfigured } = getFirebaseInstance();

  if (isConfigured && auth?.currentUser && db) {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const docRef = doc(db, 'users', auth.currentUser.uid, 'data', 'tracker');
      
      const payload = mode === 'work' 
        ? { workDates: dates, workNotes: notes, updatedAt: new Date().toISOString() } 
        : { dates, notes, updatedAt: new Date().toISOString() };

      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      console.error("Lỗi khi đồng bộ Firestore:", error);
    }
  }
}

/**
 * Saves updated username to remote Firestore and localStorage
 * @param {string} username 
 */
export async function saveUsername(username) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(LOCAL_USER_KEY, username);

  const { auth, db, isConfigured } = getFirebaseInstance();

  if (isConfigured && auth?.currentUser && db) {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const docRef = doc(db, 'users', auth.currentUser.uid, 'data', 'tracker');
      await setDoc(docRef, { username, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      console.error("Lỗi lưu tên lên Firestore:", error);
    }
  }
}
