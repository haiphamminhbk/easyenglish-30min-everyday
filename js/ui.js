/**
 * UI Components, Modals, and Grid Rendering
 */

import { NUMBER_OF_DAYS_TO_SHOW, getTodayString, formatDatePretty, calculateStreak, getPeriodRange } from './tracker.js';

// DOM Selectors Cache
export const elements = {
    checkInBtn: document.getElementById('checkInBtn'),
    streakCount: document.getElementById('streakCount'),
    totalDays: document.getElementById('totalDays'),
    trackerGrid: document.getElementById('trackerGrid'),
    authStatus: document.getElementById('authStatus'),
    greetingMessage: document.getElementById('greetingMessage'),
    userNameDisplay: document.getElementById('userNameDisplay'),
    periodDisplay: document.getElementById('periodDisplay'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    
    // Note Modal
    noteModal: document.getElementById('noteModal'),
    noteModalContent: document.getElementById('noteModalContent'),
    dailyNote: document.getElementById('dailyNote'),
    cancelNoteBtn: document.getElementById('cancelNoteBtn'),
    confirmNoteBtn: document.getElementById('confirmNoteBtn'),
    
    // Name Modal
    nameModal: document.getElementById('nameModal'),
    nameModalContent: document.getElementById('nameModalContent'),
    userNameInput: document.getElementById('userNameInput'),
    cancelNameBtn: document.getElementById('cancelNameBtn'),
    confirmNameBtn: document.getElementById('confirmNameBtn'),
};

let editingDate = null;

// ==================== Note Modal ====================

/**
 * Opens the note modal
 * @param {string|null} dateToEdit - Date string (YYYY-MM-DD) if editing past note, or null for new check-in
 * @param {Record<string, string>} studyNotes 
 */
export function openNoteModal(dateToEdit = null, studyNotes = {}) {
    editingDate = dateToEdit;
    elements.noteModal.classList.remove('hidden');
    
    // Trigger reflow for transition
    void elements.noteModal.offsetWidth;
    elements.noteModal.classList.remove('opacity-0');
    elements.noteModalContent.classList.remove('scale-95');

    if (dateToEdit && studyNotes[dateToEdit]) {
        elements.dailyNote.value = studyNotes[dateToEdit];
    } else {
        elements.dailyNote.value = '';
    }
    elements.dailyNote.focus();
}

/**
 * Closes the note modal
 */
export function closeNoteModal() {
    elements.noteModal.classList.add('opacity-0');
    elements.noteModalContent.classList.add('scale-95');
    editingDate = null;
    setTimeout(() => {
        elements.noteModal.classList.add('hidden');
    }, 300);
}

/**
 * Returns current date being edited in note modal (or null if new check-in)
 */
export function getEditingDate() {
    return editingDate;
}

/**
 * Returns note input value
 */
export function getNoteInputValue() {
    return elements.dailyNote.value.trim();
}

// ==================== Name Modal ====================

/**
 * Opens the username modal
 * @param {string} currentUserName 
 */
export function openNameModal(currentUserName = "bạn") {
    elements.nameModal.classList.remove('hidden');
    void elements.nameModal.offsetWidth;
    elements.nameModal.classList.remove('opacity-0');
    elements.nameModalContent.classList.remove('scale-95');
    elements.userNameInput.value = currentUserName === "bạn" ? "" : currentUserName;
    elements.userNameInput.focus();
}

/**
 * Closes the username modal
 */
export function closeNameModal() {
    elements.nameModal.classList.add('opacity-0');
    elements.nameModalContent.classList.add('scale-95');
    setTimeout(() => {
        elements.nameModal.classList.add('hidden');
    }, 300);
}

/**
 * Returns username input value
 */
export function getNameInputValue() {
    return elements.userNameInput.value.trim();
}

// ==================== UI Updates & Grid ====================

/**
 * Updates greeting message with user's name
 * @param {string} userName 
 */
export function updateGreeting(userName = "bạn") {
    if (elements.greetingMessage) {
        elements.greetingMessage.classList.remove('hidden');
    }
    if (elements.userNameDisplay) {
        elements.userNameDisplay.innerText = userName === "bạn" ? "bạn ✏️" : userName;
    }
}

/**
 * Updates authentication status indicator if present
 * @param {string} htmlContent 
 */
export function updateAuthStatus(htmlContent) {
    if (elements.authStatus) {
        elements.authStatus.innerHTML = htmlContent;
    }
}

/**
 * Renders the 30-day tracker grid
 * @param {Object} options
 * @param {number} options.currentPeriodOffset
 * @param {string[]} options.studyDates
 * @param {Record<string, string>} options.studyNotes
 * @param {Function} options.onBoxClickToday
 * @param {Function} options.onBoxClickCompleted
 */
export function renderGrid({
    currentPeriodOffset = 0,
    studyDates = [],
    studyNotes = {},
    onBoxClickToday = () => {},
    onBoxClickCompleted = () => {}
}) {
    elements.trackerGrid.innerHTML = '';
    const todayStr = getTodayString();
    
    const { startDate, startStr, endStr } = getPeriodRange(currentPeriodOffset, NUMBER_OF_DAYS_TO_SHOW);
    
    if (elements.periodDisplay) {
        elements.periodDisplay.textContent = `${startStr} → ${endStr}`;
    }

    for (let i = 0; i < NUMBER_OF_DAYS_TO_SHOW; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const box = document.createElement('div');
        box.className = 'day-box';
        box.innerText = day; 
        
        let tooltipText = formatDatePretty(dateStr);

        if (studyDates.includes(dateStr)) {
            box.classList.add('completed');
            tooltipText += ' - Đã học: ';
            if (studyNotes[dateStr]) {
                tooltipText += `\n${studyNotes[dateStr]}`;
            }
            // Allow editing notes for completed days in the current period
            if (currentPeriodOffset === 0) {
                box.style.cursor = 'pointer';
                box.addEventListener('click', () => onBoxClickCompleted(dateStr));
            }
        } else if (dateStr === todayStr) {
            box.classList.add('today');
            tooltipText = "Hôm nay - Cố lên nhé!";
        } else if (dateStr < todayStr) {
            tooltipText += ' - Không học bài';
        } else {
            tooltipText += ' - Chưa học';
        }

        box.dataset.title = tooltipText;

        if (dateStr === todayStr && !studyDates.includes(dateStr)) {
            box.addEventListener('click', onBoxClickToday);
        }

        elements.trackerGrid.appendChild(box);
    }
}

/**
 * Updates full UI state (check-in button, counters, grid)
 * @param {Object} state
 * @param {string[]} state.studyDates
 * @param {Record<string, string>} state.studyNotes
 * @param {string} state.savedUserName
 * @param {number} state.currentPeriodOffset
 * @param {Function} state.onBoxClickToday
 * @param {Function} state.onBoxClickCompleted
 */
export function updateUI(state) {
    const {
        studyDates = [],
        studyNotes = {},
        savedUserName = "bạn",
        currentPeriodOffset = 0,
        onBoxClickToday,
        onBoxClickCompleted
    } = state;

    const today = getTodayString();
    const isCompletedToday = studyDates.includes(today);

    if (isCompletedToday) {
        elements.checkInBtn.disabled = true;
        elements.checkInBtn.innerText = "Đã hoàn thành mục tiêu hôm nay ✔️";
        elements.checkInBtn.classList.remove('pulse-btn', 'bg-indigo-600', 'hover:bg-indigo-700');
        elements.checkInBtn.classList.add('bg-green-500', 'cursor-not-allowed', 'opacity-90');
    } else {
        elements.checkInBtn.disabled = false;
        elements.checkInBtn.innerText = "Hoàn thành 30 phút! 🚀";
        elements.checkInBtn.classList.add('pulse-btn');
        elements.checkInBtn.classList.remove('bg-green-500', 'cursor-not-allowed', 'opacity-90');
        elements.checkInBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
    }

    elements.totalDays.innerText = studyDates.length;
    elements.streakCount.innerText = calculateStreak(studyDates);
    
    updateGreeting(savedUserName);

    renderGrid({
        currentPeriodOffset,
        studyDates,
        studyNotes,
        onBoxClickToday,
        onBoxClickCompleted
    });
}
