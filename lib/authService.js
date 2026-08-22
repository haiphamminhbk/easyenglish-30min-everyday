'use client';

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseInstance } from './firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle() {
  const { auth, db, isConfigured } = getFirebaseInstance();
  if (!isConfigured || !auth) {
    throw new Error('Firebase chưa được cấu hình. Vui lòng thêm khóa cấu hình Firebase trong tệp .env.local.');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Upsert profile in Firestore
    if (db && user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(
          userDocRef,
          {
            uid: user.uid,
            displayName: user.displayName || 'Học viên chăm chỉ',
            email: user.email || '',
            photoURL: user.photoURL || '',
            isAnonymous: false,
            lastLoginAt: serverTimestamp(),
          },
          { merge: true }
        );

        if (user.displayName && typeof window !== 'undefined') {
          localStorage.setItem('english_30min_username', user.displayName);
        }

        // Immediately sync user leaderboard entry to cloud
        import('./leaderboardService')
          .then(({ syncUserLeaderboardToFirestore }) => syncUserLeaderboardToFirestore())
          .catch((e) => console.warn('Leaderboard sync on login error:', e));
      } catch (err) {
        console.warn('Profile sync warning:', err);
      }
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, cancelled: true };
    }
    throw error;
  }
}

/**
 * Sign in as temporary anonymous guest
 */
export async function signInAsGuest() {
  const { auth, db, isConfigured } = getFirebaseInstance();
  if (!isConfigured || !auth) {
    throw new Error('Firebase chưa được cấu hình.');
  }

  try {
    const result = await signInAnonymously(auth);
    const user = result.user;

    if (db && user) {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(
        userDocRef,
        {
          uid: user.uid,
          displayName: 'Khách',
          isAnonymous: true,
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function logoutUser() {
  const { auth, isConfigured } = getFirebaseInstance();
  if (!isConfigured || !auth) return;

  try {
    const { clearAllLocalData } = await import('./storage');
    clearAllLocalData();
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Subscribe to realtime authentication state changes
 * @param {Function} callback - ({ user, isConfigured, loading }) => void
 * @returns {Function} unsubscribe
 */
export function subscribeToAuthState(callback) {
  if (typeof window === 'undefined') {
    callback({ user: null, isConfigured: false, loading: false });
    return () => {};
  }

  const { auth, isConfigured } = getFirebaseInstance();
  if (!isConfigured || !auth) {
    callback({ user: null, isConfigured: false, loading: false });
    return () => {};
  }

  callback({ user: auth.currentUser, isConfigured: true, loading: true });

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    callback({
      user,
      isConfigured: true,
      loading: false,
    });
  });

  return unsubscribe;
}
