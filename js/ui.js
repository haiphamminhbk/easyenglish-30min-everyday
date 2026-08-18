/**
 * UI Components, Modals, and Grid Rendering
 */

import { getTodayString, formatDatePretty, calculateStreak, getMonthCalendar, stripFormatting } from './tracker.js';
import { setupWordEditor, updateWordCount } from './editor.js';

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
    noteEditorToolbar: document.getElementById('noteEditorToolbar'),
    noteWordCounter: document.getElementById('noteWordCounter'),
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
let isEditorInitialized = false;

// ==================== Note Modal ====================

/**
 * Initializes the editor toolbar for Note Modal
 */
export function initNoteEditor() {
    if (!isEditorInitialized && elements.dailyNote && elements.noteEditorToolbar) {
        setupWordEditor(elements.dailyNote, elements.noteEditorToolbar, elements.noteWordCounter);
        isEditorInitialized = true;
    }
}

/**
 * Opens the note modal
 * @param {string|null} dateToEdit - Date string (YYYY-MM-DD) if editing past note, or null for new check-in
 * @param {Record<string, string>} studyNotes 
 */
export function openNoteModal(dateToEdit = null, studyNotes = {}) {
    initNoteEditor();
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
    updateWordCount(elements.dailyNote, elements.noteWordCounter);
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
 * Renders the monthly tracker grid
 * @param {Object} options
 * @param {number} options.currentPeriodOffset
 * @param {string[]} options.studyDates
 * @param {Record<string, string>} options.studyNotes
 * @param {Function} options.onBoxClickToday
 * @param {Function} options.onBoxClickCompleted
 * @param {Function} options.onBoxClickReview
 */
export function renderGrid({
    currentPeriodOffset = 0,
    studyDates = [],
    studyNotes = {},
    onBoxClickToday = () => {},
    onBoxClickCompleted = () => {},
    onBoxClickReview = () => {}
}) {
    elements.trackerGrid.innerHTML = '';
    const todayStr = getTodayString();
    
    const monthData = getMonthCalendar(currentPeriodOffset);
    const completedInMonth = monthData.days.filter((d) => studyDates.includes(d.dateStr)).length;
    
    if (elements.periodDisplay) {
        elements.periodDisplay.textContent = `${monthData.monthStr} (${completedInMonth}/${monthData.daysInMonth} ngày)`;
    }

    // Blank padding cells before day 1
    for (let p = 0; p < monthData.startDayIndex; p++) {
        const pad = document.createElement('div');
        pad.className = 'aspect-square opacity-0 pointer-events-none';
        elements.trackerGrid.appendChild(pad);
    }

    for (let i = 0; i < monthData.days.length; i++) {
        const { day, dateStr } = monthData.days[i];

        const box = document.createElement('div');
        box.className = 'day-box';
        box.innerText = day; 
        
        let tooltipText = formatDatePretty(dateStr);
        const hasNote = Boolean(studyNotes[dateStr] && studyNotes[dateStr].trim());

        if (studyDates.includes(dateStr)) {
            box.classList.add('completed');
            
            if (hasNote) {
                box.classList.add('has-note');
                const dot = document.createElement('span');
                dot.className = 'note-dot';
                box.appendChild(dot);
            }

            tooltipText += ' - Đã học: ';
            if (hasNote) {
                tooltipText += `\n${stripFormatting(studyNotes[dateStr])}`;
            }
            if (dateStr < todayStr) {
                tooltipText += `\n(Nhấn để mở trang ôn tập bài học 📖)`;
            }

            box.style.cursor = 'pointer';
            if (dateStr < todayStr) {
                // All completed past days open lesson review page (read-only)
                box.addEventListener('click', () => onBoxClickReview(dateStr));
            } else if (dateStr === todayStr && currentPeriodOffset === 0) {
                // Only current date can open note editor modal
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

    // Trailing blank padding cells to guarantee exact 42-slot (6-row) fixed height
    const trailingPaddingCount = Math.max(0, 42 - monthData.startDayIndex - monthData.daysInMonth);
    for (let t = 0; t < trailingPaddingCount; t++) {
        const pad = document.createElement('div');
        pad.className = 'aspect-square opacity-0 pointer-events-none';
        elements.trackerGrid.appendChild(pad);
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
 * @param {Function} state.onBoxClickReview
 */
export function updateUI(state) {
    const {
        studyDates = [],
        studyNotes = {},
        savedUserName = "bạn",
        currentPeriodOffset = 0,
        onBoxClickToday,
        onBoxClickCompleted,
        onBoxClickReview
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
        onBoxClickCompleted,
        onBoxClickReview
    });
}
