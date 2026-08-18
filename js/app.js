/**
 * Application Entry Point & Controller
 */

import { init3DBackground } from './background3d.js';
import { createCongratulationsEffect } from './effects.js';
import { initStorage, saveStudyData, saveUsername } from './storage.js';
import { getTodayString } from './tracker.js';
import {
    elements,
    openNoteModal,
    closeNoteModal,
    getEditingDate,
    getNoteInputValue,
    openNameModal,
    closeNameModal,
    getNameInputValue,
    updateUI,
    updateAuthStatus,
    renderGrid
} from './ui.js';

// Application State
let studyDates = [];
let studyNotes = {};
let savedUserName = "bạn";
let currentPeriodOffset = 0;

/**
 * Refreshes UI with latest application state
 */
function refreshUI() {
    updateUI({
        studyDates,
        studyNotes,
        savedUserName,
        currentPeriodOffset,
        onBoxClickToday: handleCheckIn,
        onBoxClickCompleted: (date) => openNoteModal(date, studyNotes)
    });
}

/**
 * Handles main check-in button click or clicking today's box
 */
function handleCheckIn() {
    const today = getTodayString();
    if (!studyDates.includes(today)) {
        openNoteModal(null, studyNotes);
    }
}

/**
 * Handles confirming note modal (either new check-in or editing existing date's note)
 */
async function handleConfirmNote() {
    const editingDate = getEditingDate();
    const noteText = getNoteInputValue();

    if (editingDate) {
        // Editing existing date note
        if (noteText) {
            studyNotes[editingDate] = noteText;
        } else {
            delete studyNotes[editingDate];
        }
        closeNoteModal();
        renderGrid({
            currentPeriodOffset,
            studyDates,
            studyNotes,
            onBoxClickToday: handleCheckIn,
            onBoxClickCompleted: (date) => openNoteModal(date, studyNotes)
        });
        await saveStudyData(studyDates, studyNotes);
    } else {
        // New Check-in
        const today = getTodayString();
        createCongratulationsEffect();

        if (!studyDates.includes(today)) {
            studyDates.push(today);
            studyDates.sort();

            if (noteText) {
                studyNotes[today] = noteText;
            }

            elements.checkInBtn.innerText = "Tuyệt vời! Đã hoàn thành 🎉";
            elements.checkInBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700', 'pulse-btn');
            elements.checkInBtn.classList.add('bg-green-500', 'hover:bg-green-600', 'scale-105');

            setTimeout(() => {
                elements.checkInBtn.classList.remove('scale-105');
            }, 200);

            closeNoteModal();
            refreshUI();
            await saveStudyData(studyDates, studyNotes);
        }
    }
}

/**
 * Handles confirming name edit
 */
async function handleConfirmName() {
    const newName = getNameInputValue();
    if (newName) {
        savedUserName = newName;
        await saveUsername(savedUserName);
        refreshUI();
    }
    closeNameModal();
}

/**
 * Set up all DOM event listeners
 */
function setupEventListeners() {
    // Check-in button
    elements.checkInBtn.addEventListener('click', handleCheckIn);

    // Note Modal
    elements.cancelNoteBtn.addEventListener('click', closeNoteModal);
    elements.confirmNoteBtn.addEventListener('click', handleConfirmNote);

    // Name Modal
    elements.userNameDisplay.addEventListener('click', () => openNameModal(savedUserName));
    elements.cancelNameBtn.addEventListener('click', closeNameModal);
    elements.confirmNameBtn.addEventListener('click', handleConfirmName);

    // Pagination
    elements.prevBtn.addEventListener('click', () => {
        currentPeriodOffset--;
        renderGrid({
            currentPeriodOffset,
            studyDates,
            studyNotes,
            onBoxClickToday: handleCheckIn,
            onBoxClickCompleted: (date) => openNoteModal(date, studyNotes)
        });
    });

    elements.nextBtn.addEventListener('click', () => {
        currentPeriodOffset++;
        renderGrid({
            currentPeriodOffset,
            studyDates,
            studyNotes,
            onBoxClickToday: handleCheckIn,
            onBoxClickCompleted: (date) => openNoteModal(date, studyNotes)
        });
    });
}

/**
 * Initializes application on page load
 */
async function initApp() {
    init3DBackground();
    setupEventListeners();

    await initStorage(
        (data) => {
            if (data.studyDates) studyDates = data.studyDates;
            if (data.studyNotes) studyNotes = data.studyNotes;
            if (data.savedUserName) savedUserName = data.savedUserName;
            refreshUI();
        },
        (statusHtml) => {
            updateAuthStatus(statusHtml);
        }
    );
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
