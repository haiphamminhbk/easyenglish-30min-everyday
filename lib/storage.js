/**
 * Storage & Sync Layer for Next.js (Firebase Client + LocalStorage Fallback)
 */

const LOCAL_DATES_KEY = 'english_30min_v2';
const LOCAL_NOTES_KEY = 'english_30min_notes_v2';
const LOCAL_USER_KEY = 'english_30min_username';

let app = null;
let auth = null;
let db = null;
let currentUser = null;

/**
 * Loads data from LocalStorage (safe for SSR)
 * @returns {{ studyDates: string[], studyNotes: Record<string, string>, savedUserName: string }}
 */
export function loadLocalData() {
  if (typeof window === 'undefined') {
    return { studyDates: [], studyNotes: {}, savedUserName: "bạn" };
  }
  const studyDates = JSON.parse(localStorage.getItem(LOCAL_DATES_KEY) || '[]');
  const studyNotes = JSON.parse(localStorage.getItem(LOCAL_NOTES_KEY) || '{}');
  const savedUserName = localStorage.getItem(LOCAL_USER_KEY) || "bạn";
  return { studyDates, studyNotes, savedUserName };
}

/**
 * Initializes Firebase auth and remote listeners or falls back to localStorage
 * @param {Function} onDataChange - callback({ studyDates, studyNotes, savedUserName })
 * @param {Function} onAuthStatus - callback(statusHtml)
 */
export async function initStorage(onDataChange, onAuthStatus) {
  if (typeof window === 'undefined') return;

  const appId = window.__app_id || process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'english-tracker-v1';
  const firebaseConfigStr = window.__firebase_config || process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
  const firebaseConfig = firebaseConfigStr ? JSON.parse(firebaseConfigStr) : null;

  if (firebaseConfig) {
    try {
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } = await import('firebase/auth');
      const { getFirestore, doc, setDoc, onSnapshot } = await import('firebase/firestore');

      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      auth = getAuth(app);
      db = getFirestore(app);

      if (window.__initial_auth_token) {
        await signInWithCustomToken(auth, window.__initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }

      onAuthStateChanged(auth, (user) => {
        if (user) {
          currentUser = user;
          if (onAuthStatus) {
            onAuthStatus(user.isAnonymous ? 'anonymous' : 'synced');
          }
          const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'trackingData', 'history');
          onSnapshot(docRef, (docSnap) => {
            let studyDates = [];
            let studyNotes = {};
            let savedUserName = localStorage.getItem(LOCAL_USER_KEY) || "bạn";

            if (docSnap.exists()) {
              const data = docSnap.data();
              studyDates = data.dates || [];
              studyNotes = data.notes || {};
              if (data.username) {
                savedUserName = data.username;
                localStorage.setItem(LOCAL_USER_KEY, savedUserName);
              }
            }
            if (onDataChange) {
              onDataChange({ studyDates, studyNotes, savedUserName });
            }
          });
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
 * Saves tracking dates and notes to remote Firestore or localStorage
 * @param {string[]} dates 
 * @param {Record<string, string>} notes 
 */
export async function saveStudyData(dates, notes) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(LOCAL_DATES_KEY, JSON.stringify(dates));
  localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(notes));

  if (currentUser && db) {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const appId = window.__app_id || process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'english-tracker-v1';
      const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'trackingData', 'history');
      await setDoc(docRef, { dates, notes }, { merge: true });
    } catch (error) {
      console.error("Lỗi khi đồng bộ Firestore:", error);
    }
  }
}

/**
 * Saves updated username to remote Firestore or localStorage
 * @param {string} username 
 */
export async function saveUsername(username) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(LOCAL_USER_KEY, username);

  if (currentUser && db) {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const appId = window.__app_id || process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'english-tracker-v1';
      const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'trackingData', 'history');
      await setDoc(docRef, { username }, { merge: true });
    } catch (error) {
      console.error("Lỗi lưu tên lên Firestore:", error);
    }
  }
}
