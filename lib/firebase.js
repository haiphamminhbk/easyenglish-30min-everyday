'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Retrieve Firebase Configuration from environment variables
 * Supports both individual variables or unified NEXT_PUBLIC_FIREBASE_CONFIG JSON
 */
function getFirebaseConfig() {
  if (typeof window === 'undefined') return null;

  // Option 1: Unified JSON string (e.g. from Firebase console or hosting)
  if (process.env.NEXT_PUBLIC_FIREBASE_CONFIG) {
    try {
      return JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
    } catch (e) {
      console.warn('Failed to parse NEXT_PUBLIC_FIREBASE_CONFIG:', e);
    }
  }

  // Option 2: Individual standard environment variables
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  }

  // Option 3: Global window object injection (if hosted in certain webview/sandbox environments)
  if (window.__firebase_config) {
    try {
      return typeof window.__firebase_config === 'string'
        ? JSON.parse(window.__firebase_config)
        : window.__firebase_config;
    } catch (e) {}
  }

  return null;
}

let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;

export function getFirebaseInstance() {
  if (typeof window === 'undefined') {
    return { app: null, auth: null, db: null, isConfigured: false };
  }

  if (firebaseApp && firebaseAuth && firestoreDb) {
    return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb, isConfigured: true };
  }

  const config = getFirebaseConfig();
  if (!config || !config.apiKey) {
    return { app: null, auth: null, db: null, isConfigured: false };
  }

  try {
    firebaseApp = getApps().length === 0 ? initializeApp(config) : getApp();
    firebaseAuth = getAuth(firebaseApp);
    firestoreDb = getFirestore(firebaseApp);

    return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb, isConfigured: true };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return { app: null, auth: null, db: null, isConfigured: false, error };
  }
}
