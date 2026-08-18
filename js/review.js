/**
 * Lesson Review Controller
 */

import { init3DBackground } from './background3d.js';
import { initStorage, saveStudyData, loadLocalData } from './storage.js';
import { formatDatePretty, getTodayString } from './tracker.js';
import { setupWordEditor, updateWordCount, renderFormattedText } from './editor.js';
import { voicePlayer } from './audioPlayer.js';

// DOM Elements
const lessonDateDisplay = document.getElementById('lessonDateDisplay');
const statusBadge = document.getElementById('statusBadge');
const noteContent = document.getElementById('noteContent');
const noteViewContainer = document.getElementById('noteViewContainer');
const noteEditContainer = document.getElementById('noteEditContainer');
const reviewEditorToolbar = document.getElementById('reviewEditorToolbar');
const reviewWordCounter = document.getElementById('reviewWordCounter');
const editNoteTextarea = document.getElementById('editNoteTextarea');
const ttsBtn = document.getElementById('ttsBtn');
const ttsBtnText = document.getElementById('ttsBtnText');
const ttsIcon = document.getElementById('ttsIcon');
const copyBtn = document.getElementById('copyBtn');
const copyBtnText = document.getElementById('copyBtnText');
const toggleEditBtn = document.getElementById('toggleEditBtn');
const readOnlyBadge = document.getElementById('readOnlyBadge');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveEditBtn = document.getElementById('saveEditBtn');
const prevLessonBtn = document.getElementById('prevLessonBtn');
const nextLessonBtn = document.getElementById('nextLessonBtn');

// State
let studyDates = [];
let studyNotes = {};
let currentDate = getTodayString();
let isSpeaking = false;
let isEditorInitialized = false;

/**
 * Gets targetDate from URL query parameter ?date=YYYY-MM-DD
 */
function getTargetDateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('date');
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        return dateParam;
    }
    return getTodayString();
}

/**
 * Gets sorted list of dates that have saved notes
 */
function getDatesWithNotes() {
    const dates = Object.keys(studyNotes).filter(d => studyNotes[d] && studyNotes[d].trim().length > 0);
    dates.sort();
    return dates;
}

/**
 * Renders the lesson review for the active date
 * @param {string} date - YYYY-MM-DD
 */
function renderLesson(date) {
    currentDate = date;
    const today = getTodayString();
    const isPastDate = date < today;
    
    // Update title
    document.title = `📖 Bài học ${formatDatePretty(date)} - Easy English`;
    lessonDateDisplay.textContent = formatDatePretty(date);

    const isCompleted = studyDates.includes(date);
    const rawNote = studyNotes[date] ? studyNotes[date].trim() : '';

    // Status Badge
    if (isCompleted) {
        statusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 shadow-sm';
        statusBadge.innerHTML = '<span>🌟 Đã học 30 phút</span>';
    } else {
        statusBadge.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 shadow-sm';
        statusBadge.innerHTML = '<span>⏳ Chưa đánh dấu học</span>';
    }

    // Read-only enforcement for past dates
    if (isPastDate) {
        if (toggleEditBtn) toggleEditBtn.classList.add('hidden');
        if (readOnlyBadge) readOnlyBadge.classList.remove('hidden');
    } else {
        if (toggleEditBtn) toggleEditBtn.classList.remove('hidden');
        if (readOnlyBadge) readOnlyBadge.classList.add('hidden');
    }

    // Note Content (Formatted with Word Editor parser)
    if (rawNote) {
        noteContent.innerHTML = renderFormattedText(rawNote);
        noteContent.classList.remove('text-gray-400', 'italic');
        noteContent.classList.add('text-gray-700');
        ttsBtn.disabled = false;
        copyBtn.disabled = false;
    } else {
        const emptyMessage = isPastDate 
            ? 'Không có ghi chú nào được lưu cho ngày này.'
            : 'Chưa có ghi chú nào cho ngày hôm nay. Bấm "Sửa ghi chú" để thêm bài học nhé!';
        noteContent.innerHTML = `<span class="text-gray-400 italic">${emptyMessage}</span>`;
        ttsBtn.disabled = true;
        copyBtn.disabled = true;
    }

    // Update Prev / Next Buttons
    const datesWithNotes = getDatesWithNotes();
    const currentIndex = datesWithNotes.indexOf(date);

    if (currentIndex === -1) {
        // Date not in list with notes
        prevLessonBtn.disabled = datesWithNotes.length === 0;
        nextLessonBtn.disabled = datesWithNotes.length === 0;
    } else {
        prevLessonBtn.disabled = currentIndex <= 0;
        nextLessonBtn.disabled = currentIndex >= datesWithNotes.length - 1;
    }

    // Reset TTS state if date changed
    if (isSpeaking) {
        voicePlayer.stop();
        setTtsButtonState(false);
    }
}

/**
 * Updates TTS button appearance
 * @param {boolean} speaking 
 */
function setTtsButtonState(speaking) {
    isSpeaking = speaking;
    if (speaking) {
        ttsBtn.classList.remove('bg-indigo-50', 'text-indigo-700');
        ttsBtn.classList.add('bg-red-50', 'text-red-600');
        ttsBtnText.textContent = 'Dừng đọc ⏹️';
    } else {
        ttsBtn.classList.remove('bg-red-50', 'text-red-600');
        ttsBtn.classList.add('bg-indigo-50', 'text-indigo-700');
        ttsBtnText.textContent = 'Đọc bài (Google Voice) 🔊';
    }
}

/**
 * Handles Google Translation voice playback with language detection
 */
function handleTTS() {
    if (isSpeaking) {
        voicePlayer.stop();
        setTtsButtonState(false);
        return;
    }

    const rawNote = studyNotes[currentDate];
    if (!rawNote || !rawNote.trim()) return;

    voicePlayer.play(rawNote, (playing) => {
        setTtsButtonState(playing);
    });
}

/**
 * Copies note content to clipboard
 */
async function handleCopy() {
    const rawNote = studyNotes[currentDate] || '';
    if (!rawNote) return;

    try {
        await navigator.clipboard.writeText(rawNote);
        const originalText = copyBtnText.textContent;
        copyBtnText.textContent = 'Đã sao chép! ✔️';
        copyBtn.classList.add('bg-green-100', 'text-green-700');
        setTimeout(() => {
            copyBtnText.textContent = originalText;
            copyBtn.classList.remove('bg-green-100', 'text-green-700');
        }, 1500);
    } catch (err) {
        console.error('Không thể sao chép:', err);
    }
}

/**
 * Toggles edit mode
 */
function handleToggleEdit() {
    noteViewContainer.classList.add('hidden');
    noteEditContainer.classList.remove('hidden');
    editNoteTextarea.value = studyNotes[currentDate] || '';

    if (!isEditorInitialized && editNoteTextarea && reviewEditorToolbar) {
        setupWordEditor(editNoteTextarea, reviewEditorToolbar, reviewWordCounter);
        isEditorInitialized = true;
    }
    updateWordCount(editNoteTextarea, reviewWordCounter);

    editNoteTextarea.focus();
}

/**
 * Cancels edit mode
 */
function handleCancelEdit() {
    noteEditContainer.classList.add('hidden');
    noteViewContainer.classList.remove('hidden');
}

/**
 * Saves edited note
 */
async function handleSaveEdit() {
    const today = getTodayString();
    if (currentDate < today) {
        alert('Không thể chỉnh sửa ghi chú của những ngày trước đó. Ghi chú chỉ dùng để ôn tập.');
        handleCancelEdit();
        return;
    }

    const newNote = editNoteTextarea.value.trim();
    if (newNote) {
        studyNotes[currentDate] = newNote;
    } else {
        delete studyNotes[currentDate];
    }

    if (!studyDates.includes(currentDate) && newNote) {
        studyDates.push(currentDate);
        studyDates.sort();
    }

    await saveStudyData(studyDates, studyNotes);
    handleCancelEdit();
    renderLesson(currentDate);
}

/**
 * Navigates to previous lesson with notes
 */
function handlePrevLesson() {
    const datesWithNotes = getDatesWithNotes();
    const currentIndex = datesWithNotes.indexOf(currentDate);
    if (currentIndex > 0) {
        const targetDate = datesWithNotes[currentIndex - 1];
        navigateToDate(targetDate);
    } else if (datesWithNotes.length > 0) {
        // If current date not in list, find first date before currentDate
        const prevDates = datesWithNotes.filter(d => d < currentDate);
        if (prevDates.length > 0) {
            navigateToDate(prevDates[prevDates.length - 1]);
        }
    }
}

/**
 * Navigates to next lesson with notes
 */
function handleNextLesson() {
    const datesWithNotes = getDatesWithNotes();
    const currentIndex = datesWithNotes.indexOf(currentDate);
    if (currentIndex >= 0 && currentIndex < datesWithNotes.length - 1) {
        const targetDate = datesWithNotes[currentIndex + 1];
        navigateToDate(targetDate);
    } else if (datesWithNotes.length > 0) {
        const nextDates = datesWithNotes.filter(d => d > currentDate);
        if (nextDates.length > 0) {
            navigateToDate(nextDates[0]);
        }
    }
}

/**
 * Updates URL search param and renders lesson
 * @param {string} date 
 */
function navigateToDate(date) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('date', date);
    window.history.pushState({}, '', newUrl.toString());
    renderLesson(date);
}

/**
 * Binds event listeners
 */
function setupEventListeners() {
    ttsBtn.addEventListener('click', handleTTS);
    copyBtn.addEventListener('click', handleCopy);
    toggleEditBtn.addEventListener('click', handleToggleEdit);
    cancelEditBtn.addEventListener('click', handleCancelEdit);
    saveEditBtn.addEventListener('click', handleSaveEdit);
    prevLessonBtn.addEventListener('click', handlePrevLesson);
    nextLessonBtn.addEventListener('click', handleNextLesson);

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        const targetDate = getTargetDateFromUrl();
        renderLesson(targetDate);
    });
}

/**
 * Initializes review page
 */
async function initReviewPage() {
    init3DBackground();
    setupEventListeners();
    currentDate = getTargetDateFromUrl();

    // Load initial local data immediately for fast render
    const local = loadLocalData();
    studyDates = local.studyDates;
    studyNotes = local.studyNotes;
    renderLesson(currentDate);

    // Sync with remote storage if available
    await initStorage(
        (data) => {
            if (data.studyDates) studyDates = data.studyDates;
            if (data.studyNotes) studyNotes = data.studyNotes;
            renderLesson(currentDate);
        },
        () => {}
    );
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReviewPage);
} else {
    initReviewPage();
}
