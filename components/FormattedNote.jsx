'use client';

/**
 * Escapes HTML characters to prevent XSS (for raw markdown text)
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Formats note text (both TipTap HTML and raw Markdown) with styled badges
 */
export function formatNoteToHtml(rawContent) {
  if (!rawContent || !rawContent.trim()) return '';

  const isHtml = /<[a-z][\s\S]*>/i.test(rawContent);

  let html = isHtml ? rawContent : escapeHtml(rawContent);

  if (!isHtml) {
    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');
    // Italic: *text*
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-gray-800 dark:text-slate-200">$1</em>');
    // Underline: <u>text</u>
    html = html.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, '<u class="underline decoration-indigo-400 decoration-2 underline-offset-2">$1</u>');
    // Highlight: ==text== or <mark>text</mark>
    html = html.replace(/==(.*?)==/g, '<mark class="bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 px-1.5 py-0.5 rounded-md font-semibold shadow-xs">$1</mark>');
    html = html.replace(/&lt;mark&gt;(.*?)&lt;\/mark&gt;/gi, '<mark class="bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 px-1.5 py-0.5 rounded-md font-semibold shadow-xs">$1</mark>');
    // Inline Code / Vocab tag: `text`
    html = html.replace(/`([^`]+)`/g, '<code class="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 font-mono text-xs px-1.5 py-0.5 rounded-md">$1</code>');
  }

  // Formula Badges: (+), (-), (?)
  html = html
    .replace(/\(\+\)/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-green-100 dark:bg-emerald-950/60 text-green-800 dark:text-emerald-300 border border-green-200 dark:border-emerald-800/60 mr-1">(+) Khẳng định</span>')
    .replace(/\(-\)/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 mr-1">(-) Phủ định</span>')
    .replace(/\(\?\)/g, '<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 mr-1">(?) Nghi vấn</span>');

  if (!isHtml) {
    const lines = html.split('\n');
    const formattedLines = lines.map((line) => {
      let trimmed = line.trim();

      // Bullet list
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const content = trimmed.replace(/^[-•]\s*/, '');
        return `<div class="flex items-start gap-2 my-1 pl-2"><span class="text-indigo-500 dark:text-indigo-400 font-bold leading-relaxed">•</span><span class="flex-1">${content}</span></div>`;
      }

      // Numbered list
      if (/^\d+\.\s+/.test(trimmed)) {
        const num = trimmed.match(/^(\d+)\.\s+/)[1];
        const content = trimmed.replace(/^\d+\.\s+/, '');
        return `<div class="flex items-start gap-2 my-1 pl-2"><span class="font-bold text-indigo-600 dark:text-indigo-400 text-xs mt-0.5 min-w-[16px]">${num}.</span><span class="flex-1">${content}</span></div>`;
      }

      return trimmed ? `<p class="my-1">${trimmed}</p>` : '<div class="h-2"></div>';
    });

    html = formattedLines.join('');
  }

  return html;
}

export default function FormattedNote({ content, className = '' }) {
  if (!content || !content.trim()) {
    return <span className="text-gray-400 dark:text-slate-500 italic">Không có ghi chú nào.</span>;
  }

  return (
    <div
      className={`prose prose-sm sm:prose-base max-w-none text-gray-800 dark:text-slate-100 leading-relaxed break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: formatNoteToHtml(content) }}
    />
  );
}
