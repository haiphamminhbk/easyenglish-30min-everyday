'use client';

import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { getFirebaseInstance } from './firebase';

/**
 * =========================================================================
 * 1. User Profile & Preferences Service
 * =========================================================================
 */

/**
 * Upserts user profile information
 * @param {string} userId 
 * @param {Object} profileData 
 */
export async function saveUserProfile(userId, profileData) {
  const { db } = getFirebaseInstance();
  if (!db || !userId) return;

  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        ...profileData,
        uid: userId,
        lastLoginAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving user profile to Firestore:', error);
  }
}

/**
 * Gets user profile
 * @param {string} userId 
 */
export async function getUserProfile(userId) {
  const { db } = getFirebaseInstance();
  if (!db || !userId) return null;

  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Update user app preferences
 * @param {string} userId 
 * @param {Object} preferences 
 */
export async function updateUserPreferences(userId, preferences) {
  const { db } = getFirebaseInstance();
  if (!db || !userId) return;

  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        preferences,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating user preferences:', error);
  }
}

/**
 * =========================================================================
 * 2. Daily Check-in & Rich Diary Service (Subcollection: checkins)
 * =========================================================================
 */

/**
 * Saves a detailed daily checkin with rich HTML/markdown notes
 * @param {string} userId 
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @param {Object} checkinData 
 */
export async function saveDailyCheckin(userId, dateStr, checkinData) {
  const { db } = getFirebaseInstance();
  if (!db || !userId || !dateStr) return;

  try {
    const checkinRef = doc(db, 'users', userId, 'checkins', dateStr);
    await setDoc(
      checkinRef,
      {
        ...checkinData,
        date: dateStr,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error(`Error saving checkin for ${dateStr}:`, error);
  }
}

/**
 * Gets a single day's check-in
 * @param {string} userId 
 * @param {string} dateStr 
 */
export async function getDailyCheckin(userId, dateStr) {
  const { db } = getFirebaseInstance();
  if (!db || !userId || !dateStr) return null;

  try {
    const checkinRef = doc(db, 'users', userId, 'checkins', dateStr);
    const snap = await getDoc(checkinRef);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error(`Error getting checkin for ${dateStr}:`, error);
    return null;
  }
}

/**
 * Subscribes to realtime check-ins list for diary view
 * @param {string} userId 
 * @param {Function} callback 
 * @returns {Function} unsubscribe
 */
export function subscribeDailyCheckins(userId, callback) {
  const { db } = getFirebaseInstance();
  if (!db || !userId) return () => {};

  const colRef = collection(db, 'users', userId, 'checkins');
  const q = query(colRef, orderBy('date', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const checkins = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(checkins);
    },
    (error) => {
      console.warn('Error subscribing to checkins:', error);
    }
  );
}

/**
 * =========================================================================
 * 3. Custom Vocabulary & Personalized Flashcards Service
 * =========================================================================
 */

/**
 * Creates or updates a user custom flashcard word
 * @param {string} userId 
 * @param {Object} wordData 
 * @returns {Promise<string|null>} wordId
 */
export async function saveCustomWord(userId, wordData) {
  const { db } = getFirebaseInstance();
  if (!db || !userId) return null;

  try {
    const wordId = wordData.id || `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const wordRef = doc(db, 'users', userId, 'custom_words', wordId);
    
    await setDoc(
      wordRef,
      {
        ...wordData,
        id: wordId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return wordId;
  } catch (error) {
    console.error('Error saving custom word:', error);
    return null;
  }
}

/**
 * Deletes a custom flashcard word
 * @param {string} userId 
 * @param {string} wordId 
 */
export async function deleteCustomWord(userId, wordId) {
  const { db } = getFirebaseInstance();
  if (!db || !userId || !wordId) return;

  try {
    const wordRef = doc(db, 'users', userId, 'custom_words', wordId);
    await deleteDoc(wordRef);
  } catch (error) {
    console.error('Error deleting custom word:', error);
  }
}

/**
 * Subscribes to custom words collection
 * @param {string} userId 
 * @param {Function} callback 
 * @returns {Function} unsubscribe
 */
export function subscribeCustomWords(userId, callback) {
  const { db } = getFirebaseInstance();
  if (!db || !userId) return () => {};

  const colRef = collection(db, 'users', userId, 'custom_words');
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const words = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(words);
    },
    (error) => {
      console.warn('Error subscribing to custom words:', error);
    }
  );
}

/**
 * =========================================================================
 * 4. Quiz History & Learning Practice Analytics
 * =========================================================================
 */

/**
 * Records a completed quiz or game session into subcollection
 * @param {string} userId 
 * @param {Object} sessionData 
 */
export async function recordQuizSession(userId, sessionData) {
  const { db } = getFirebaseInstance();
  if (!db || !userId) return;

  try {
    const sessionId = sessionData.id || `session_${Date.now()}`;
    const sessionRef = doc(db, 'users', userId, 'quiz_history', sessionId);
    
    await setDoc(sessionRef, {
      ...sessionData,
      id: sessionId,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error recording quiz session:', error);
  }
}

/**
 * Subscribes to recent quiz history records
 * @param {string} userId 
 * @param {Function} callback 
 * @param {number} [limitCount=20] 
 */
export function subscribeQuizHistory(userId, callback, limitCount = 20) {
  const { db } = getFirebaseInstance();
  if (!db || !userId) return () => {};

  const colRef = collection(db, 'users', userId, 'quiz_history');
  const q = query(colRef, orderBy('createdAt', 'desc'), limit(limitCount));

  return onSnapshot(
    q,
    (snapshot) => {
      const sessions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(sessions);
    },
    (error) => {
      console.warn('Error subscribing to quiz history:', error);
    }
  );
}
