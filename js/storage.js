/**
 * Storage & Sync Layer (Firebase Firestore + LocalStorage Fallback)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const LOCAL_DATES_KEY = 'english_30min_v2';
const LOCAL_NOTES_KEY = 'english_30min_notes_v2';
const LOCAL_USER_KEY = 'english_30min_username';

let app = null;
let auth = null;
let db = null;
let currentUser = null;
let onDataChangeCallback = null;
let onAuthStatusCallback = null;

const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'english-tracker-v1';
const firebaseConfig = typeof window.__firebase_config !== 'undefined' ? JSON.parse(window.__firebase_config) : null;

/**
 * Loads data from LocalStorage
 * @returns {{ studyDates: string[], studyNotes: Record<string, string>, savedUserName: string }}
 */
export function loadLocalData() {
    const studyDates = JSON.parse(localStorage.getItem(LOCAL_DATES_KEY)) || [];
    const studyNotes = JSON.parse(localStorage.getItem(LOCAL_NOTES_KEY)) || {};
    const savedUserName = localStorage.getItem(LOCAL_USER_KEY) || "bạn";
    return { studyDates, studyNotes, savedUserName };
}

/**
 * Initializes Firebase auth and remote listeners or falls back to localStorage
 * @param {Function} onDataChange - callback({ studyDates, studyNotes, savedUserName })
 * @param {Function} onAuthStatus - callback(statusHtml)
 */
export async function initStorage(onDataChange, onAuthStatus) {
    onDataChangeCallback = onDataChange;
    onAuthStatusCallback = onAuthStatus;

    if (firebaseConfig) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        
        await initAuth();
        setupAuthObserver();
    } else {
        // Offline / LocalStorage mode
        const localData = loadLocalData();
        if (onDataChangeCallback) {
            onDataChangeCallback(localData);
        }
        if (onAuthStatusCallback) {
            onAuthStatusCallback('<span class="w-2 h-2 rounded-full bg-gray-400"></span> Lưu trữ trên trình duyệt');
        }
    }
}

async function initAuth() {
    try {
        if (typeof window.__initial_auth_token !== 'undefined') {
            await signInWithCustomToken(auth, window.__initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }
    } catch (error) {
        console.error("Lỗi đăng nhập Firebase:", error);
        if (onAuthStatusCallback) {
            onAuthStatusCallback('<span class="w-2 h-2 rounded-full bg-red-500"></span> Lỗi kết nối');
        }
    }
}

function setupAuthObserver() {
    if (!auth) return;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            if (onAuthStatusCallback) {
                const statusHtml = user.isAnonymous 
                    ? '<span class="w-2 h-2 rounded-full bg-yellow-500"></span> Đang dùng Ẩn danh (Không lưu chéo thiết bị)' 
                    : '<span class="w-2 h-2 rounded-full bg-green-500"></span> Đã đồng bộ tài khoản ☁️';
                onAuthStatusCallback(statusHtml);
            }

            let initialUserName = user.displayName || localStorage.getItem(LOCAL_USER_KEY) || "bạn";
            if (onDataChangeCallback) {
                const localData = loadLocalData();
                onDataChangeCallback({
                    ...localData,
                    savedUserName: initialUserName
                });
            }

            setupFirestoreListener();
        } else {
            currentUser = null;
        }
    });
}

function setupFirestoreListener() {
    if (!currentUser || !db) return;
    const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'trackingData', 'history');
    
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
        
        if (onDataChangeCallback) {
            onDataChangeCallback({ studyDates, studyNotes, savedUserName });
        }
    }, (error) => {
        console.error("Lỗi tải dữ liệu Firestore:", error);
        if (onAuthStatusCallback) {
            onAuthStatusCallback('<span class="w-2 h-2 rounded-full bg-red-500"></span> Lỗi tải dữ liệu');
        }
    });
}

/**
 * Saves tracking dates and notes to remote Firestore or localStorage
 * @param {string[]} dates 
 * @param {Record<string, string>} notes 
 */
export async function saveStudyData(dates, notes) {
    if (currentUser && db) {
        try {
            const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'trackingData', 'history');
            await setDoc(docRef, { dates, notes }, { merge: true });
        } catch (error) {
            console.error("Lỗi khi đồng bộ Firestore:", error);
        }
    } else {
        localStorage.setItem(LOCAL_DATES_KEY, JSON.stringify(dates));
        localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(notes));
    }
}

/**
 * Saves updated username to remote Firestore or localStorage
 * @param {string} username 
 */
export async function saveUsername(username) {
    localStorage.setItem(LOCAL_USER_KEY, username);
    
    if (currentUser && db) {
        try {
            const docRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'trackingData', 'history');
            await setDoc(docRef, { username }, { merge: true });
        } catch (error) {
            console.error("Lỗi lưu tên lên Firestore:", error);
        }
    }
}
