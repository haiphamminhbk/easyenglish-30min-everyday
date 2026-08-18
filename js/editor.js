/**
 * Word Editor Toolbar & Rich Text Formatter
 */

/**
 * Escapes HTML characters to prevent XSS
 * @param {string} text 
 * @returns {string}
 */
export function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Converts markdown-style and template formatting into clean, beautiful HTML
 * @param {string} rawText 
 * @returns {string}
 */
export function renderFormattedText(rawText) {
    if (!rawText || !rawText.trim()) return '';

    let html = escapeHtml(rawText);

    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');

    // Italic: *text*
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>');

    // Underline: &lt;u&gt;text&lt;/u&gt;
    html = html.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, '<u class="underline decoration-indigo-400 decoration-2 underline-offset-2">$1</u>');

    // Highlight: ==text== or &lt;mark&gt;text&lt;/mark&gt;
    html = html.replace(/==(.*?)==/g, '<mark class="bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded-md font-semibold shadow-xs">$1</mark>');
    html = html.replace(/&lt;mark&gt;(.*?)&lt;\/mark&gt;/gi, '<mark class="bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded-md font-semibold shadow-xs">$1</mark>');

    // Inline Code / Vocab tag: `text`
    html = html.replace(/`([^`]+)`/g, '<code class="bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono text-xs px-1.5 py-0.5 rounded-md">$1</code>');

    // Parse lines for lists, headers, grammar formulas, and templates
    const lines = html.split('\n');
    const formattedLines = lines.map(line => {
        let trimmed = line.trim();
        
        // Grammar Formula Badges: (+) Khẳng định, (-) Phủ định, (?) Nghi vấn
        trimmed = trimmed
            .replace(/\(\+\)/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-800 border border-green-200 mr-1">(+) Khẳng định</span>')
            .replace(/\(-\)/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 mr-1">(-) Phủ định</span>')
            .replace(/\(\?\)/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 mr-1">(?) Nghi vấn</span>');

        // Bullet list: - item or • item
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            const content = trimmed.replace(/^[-•]\s*/, '');
            return `<div class="flex items-start gap-2 my-1 pl-2"><span class="text-indigo-500 font-bold leading-relaxed">•</span><span class="flex-1">${content}</span></div>`;
        }
        
        // Numbered list: 1. item
        if (/^\d+\.\s+/.test(trimmed)) {
            const num = trimmed.match(/^(\d+)\.\s+/)[1];
            const content = trimmed.replace(/^\d+\.\s+/, '');
            return `<div class="flex items-start gap-2 my-1 pl-2"><span class="font-bold text-indigo-600 text-xs mt-0.5 min-w-[16px]">${num}.</span><span class="flex-1">${content}</span></div>`;
        }

        // Vocabulary Section Banner
        if (trimmed.includes('📌 Từ vựng') || trimmed.includes('📌 Vocabulary')) {
            return `<div class="font-bold text-indigo-800 bg-indigo-50 border-l-4 border-indigo-500 px-3 py-1.5 rounded-r-lg my-2.5 text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-2xs"><span>📖</span><span>${trimmed}</span></div>`;
        }

        // Sentence Structure Banner (Cấu trúc câu)
        if (trimmed.includes('💡 Cấu trúc') || trimmed.includes('💡 Structure') || trimmed.includes('💡 Pattern')) {
            return `<div class="font-bold text-emerald-900 bg-emerald-50 border-l-4 border-emerald-500 px-3 py-1.5 rounded-r-lg my-2.5 text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-2xs"><span>💡</span><span>${trimmed}</span></div>`;
        }

        // Grammar Section Banner
        if (trimmed.includes('📌 Ngữ pháp') || trimmed.includes('📌 Grammar')) {
            return `<div class="font-bold text-purple-900 bg-purple-50 border-l-4 border-purple-500 px-3 py-1.5 rounded-r-lg my-2.5 text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-2xs"><span>📘</span><span>${trimmed}</span></div>`;
        }

        // Tense Formula Banner
        if (trimmed.includes('⚡ Công thức') || trimmed.includes('⚡ Tense Formula')) {
            return `<div class="font-bold text-blue-900 bg-blue-50 border-l-4 border-blue-500 px-3 py-1.5 rounded-r-lg my-2.5 text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-2xs"><span>⚡</span><span>${trimmed}</span></div>`;
        }

        // Grammar Note / Warning Banner
        if (trimmed.includes('⚠️ Lưu ý') || trimmed.includes('⚠️ Warning') || trimmed.includes('⚠️ Note')) {
            return `<div class="font-bold text-amber-900 bg-amber-50 border-l-4 border-amber-500 px-3 py-1.5 rounded-r-lg my-2.5 text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-2xs"><span>⚠️</span><span>${trimmed}</span></div>`;
        }

        return trimmed ? `<p class="my-1">${trimmed}</p>` : '<div class="h-2"></div>';
    });

    return formattedLines.join('');
}

/**
 * Inserts or wraps text around current cursor selection in a textarea
 * @param {HTMLTextAreaElement} textarea 
 * @param {string} prefix 
 * @param {string} suffix 
 * @param {string} defaultText 
 */
function wrapSelection(textarea, prefix, suffix = '', defaultText = '') {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;

    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    
    const newCursorPos = start + prefix.length + selected.length;
    textarea.selectionStart = start + prefix.length;
    textarea.selectionEnd = newCursorPos;
    textarea.focus();

    textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Prefixes each selected line (for bullet / numbered lists)
 * @param {HTMLTextAreaElement} textarea 
 * @param {'bullet'|'number'} type 
 */
function prefixLines(textarea, type = 'bullet') {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);

    const lines = (selected || 'Mục ghi chú mới').split('\n');
    const prefixed = lines.map((line, index) => {
        if (type === 'bullet') {
            return line.startsWith('- ') ? line : `- ${line}`;
        } else {
            return /^\d+\.\s+/.test(line) ? line : `${index + 1}. ${line}`;
        }
    }).join('\n');

    textarea.value = before + prefixed + after;
    textarea.selectionStart = start;
    textarea.selectionEnd = start + prefixed.length;
    textarea.focus();

    textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Updates live word and character count
 * @param {HTMLTextAreaElement} textarea 
 * @param {HTMLElement} counterElement 
 */
export function updateWordCount(textarea, counterElement) {
    if (!counterElement || !textarea) return;
    const text = textarea.value.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = textarea.value.length;
    counterElement.textContent = `${words} từ • ${chars} ký tự`;
}

/**
 * Initializes formatting toolbar for a given textarea
 * @param {HTMLTextAreaElement} textarea 
 * @param {HTMLElement} toolbarContainer 
 * @param {HTMLElement} counterElement 
 */
export function setupWordEditor(textarea, toolbarContainer, counterElement) {
    if (!textarea || !toolbarContainer) return;

    toolbarContainer.innerHTML = `
        <div class="flex items-center gap-1 flex-wrap p-1.5 bg-gray-50/90 border border-gray-200 rounded-xl mb-2 text-xs shadow-xs">
            <!-- Text Styles -->
            <button type="button" data-action="bold" class="editor-btn font-bold px-2.5 py-1 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors" title="In đậm (Bold) **text**">
                B
            </button>
            <button type="button" data-action="italic" class="editor-btn italic px-2.5 py-1 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors font-serif" title="In nghiêng (Italic) *text*">
                I
            </button>
            <button type="button" data-action="underline" class="editor-btn underline px-2.5 py-1 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors" title="Gạch chân <u>text</u>">
                U
            </button>
            <button type="button" data-action="highlight" class="editor-btn px-2.5 py-1 rounded-lg hover:bg-amber-100 text-amber-800 transition-colors bg-amber-50 border border-amber-200" title="Highlight từ vựng / cấu trúc ==text==">
                🖍️ Highlight
            </button>
            
            <div class="h-4 w-px bg-gray-300 mx-1"></div>

            <!-- Lists -->
            <button type="button" data-action="bullet" class="editor-btn px-2 py-1 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors" title="Danh sách dấu chấm (- item)">
                • Danh sách
            </button>
            <button type="button" data-action="number" class="editor-btn px-2 py-1 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors" title="Danh sách đánh số (1. item)">
                1. Đánh số
            </button>

            <div class="h-4 w-px bg-gray-300 mx-1"></div>

            <!-- Vocabulary Template -->
            <button type="button" data-action="template-vocab" class="editor-btn px-2.5 py-1 rounded-lg hover:bg-indigo-100 text-indigo-700 bg-indigo-50 border border-indigo-100 font-medium transition-colors" title="Chèn mẫu ghi chú từ vựng">
                📖 Từ vựng
            </button>

            <!-- Structure Template (Cấu trúc câu) -->
            <button type="button" data-action="template-structure" class="editor-btn px-2.5 py-1 rounded-lg hover:bg-emerald-100 text-emerald-800 bg-emerald-50 border border-emerald-200 font-medium transition-colors" title="Chèn mẫu cấu trúc câu tiếng Anh">
                💡 Cấu trúc
            </button>

            <!-- Grammar Templates -->
            <button type="button" data-action="template-grammar" class="editor-btn px-2.5 py-1 rounded-lg hover:bg-purple-100 text-purple-700 bg-purple-50 border border-purple-100 font-medium transition-colors" title="Chèn mẫu chủ điểm ngữ pháp">
                📘 Ngữ pháp
            </button>
            <button type="button" data-action="template-tense" class="editor-btn px-2.5 py-1 rounded-lg hover:bg-blue-100 text-blue-700 bg-blue-50 border border-blue-100 font-medium transition-colors" title="Chèn mẫu công thức thì">
                ⚡ Công thức thì
            </button>
            <button type="button" data-action="template-grammar-note" class="editor-btn px-2.5 py-1 rounded-lg hover:bg-amber-100 text-amber-700 bg-amber-50 border border-amber-100 font-medium transition-colors" title="Chèn lưu ý ngữ pháp">
                ⚠️ Lưu ý
            </button>
        </div>
    `;

    toolbarContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.editor-btn');
        if (!btn) return;
        e.preventDefault();

        const action = btn.dataset.action;
        switch (action) {
            case 'bold':
                wrapSelection(textarea, '**', '**', 'từ khóa');
                break;
            case 'italic':
                wrapSelection(textarea, '*', '*', 'từ nhấn mạnh');
                break;
            case 'underline':
                wrapSelection(textarea, '<u>', '</u>', 'nội dung gạch chân');
                break;
            case 'highlight':
                wrapSelection(textarea, '==', '==', 'từ vựng / cấu trúc mới');
                break;
            case 'bullet':
                prefixLines(textarea, 'bullet');
                break;
            case 'number':
                prefixLines(textarea, 'number');
                break;
            case 'template-vocab':
                wrapSelection(textarea, '\n📌 Từ vựng:\n- ==Word==: /phonetics/ - Nghĩa tiếng Việt (Ví dụ: ...)\n', '');
                break;
            case 'template-structure':
                wrapSelection(textarea, '\n💡 Cấu trúc câu:\n- Cấu trúc: ==It takes + [sb] + [time] + to V== (Mất bao lâu để ai làm gì)\n- Viết lại: ==S + spend + [time] + V-ing==\n- Ví dụ 1: It takes me 30 minutes to study English every day.\n- Ví dụ 2: I spend 30 minutes studying English every day.\n', '');
                break;
            case 'template-grammar':
                wrapSelection(textarea, '\n📌 Ngữ pháp: ==Tên chủ điểm / Cấu trúc==\n- Định nghĩa: ...\n- Cách dùng: ...\n- Ví dụ: ...\n', '');
                break;
            case 'template-tense':
                wrapSelection(textarea, '\n⚡ Công thức: ==Thì hiện tại đơn / Present Simple==\n- (+) S + V(s/es) + O\n- (-) S + do/does not + V-inf + O\n- (?) Do/Does + S + V-inf + O?\n- Dấu hiệu: always, usually, every day...\n- Ví dụ: I study English for 30 minutes every day.\n', '');
                break;
            case 'template-grammar-note':
                wrapSelection(textarea, '\n⚠️ Lưu ý ngữ pháp:\n- Không dùng: [Lỗi sai thường gặp]\n- Thay bằng: ==[Cách dùng đúng]==\n- Giải thích: ...\n', '');
                break;
        }

        updateWordCount(textarea, counterElement);
    });

    // Listen to typing for live word count
    textarea.addEventListener('input', () => {
        updateWordCount(textarea, counterElement);
    });

    // Initial count
    updateWordCount(textarea, counterElement);
}
