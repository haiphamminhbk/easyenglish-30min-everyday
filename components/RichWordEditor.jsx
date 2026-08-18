'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

export default function RichWordEditor({
  value,
  onChange,
  placeholder = 'Nhập ghi chú bài học, từ vựng và cấu trúc...',
  minHeight = '220px',
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base max-w-none focus:outline-none p-3.5 leading-relaxed text-gray-800 focus:ring-0',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Sync external value changes if needed
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      if (!editor.isFocused) {
        editor.commands.setContent(value || '', false);
      }
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="w-full border border-gray-300 rounded-xl p-4 min-h-[220px] bg-gray-50/50 animate-pulse text-gray-400 text-sm">
        Đang tải trình soạn thảo...
      </div>
    );
  }

  // Calculate live word and character count
  const text = editor.getText().trim();
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const charCount = text.length;

  const insertTemplate = (htmlContent) => {
    editor.chain().focus().insertContent(htmlContent).run();
  };

  return (
    <div className="w-full border border-gray-300 rounded-2xl bg-white shadow-xs overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
      {/* Top Header & Counter */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-gray-50/90 border-b border-gray-200 text-xs">
        <span className="font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
          <span>📝</span>
          <span>Trình soạn thảo văn bản</span>
        </span>
        <span className="font-medium text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full shadow-2xs">
          {wordCount} từ • {charCount} ký tự
        </span>
      </div>

      {/* Word-Style Toolbar Ribbon */}
      <div className="flex items-center gap-1 flex-wrap p-2 bg-gray-50/50 border-b border-gray-200 text-xs">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="editor-btn px-2 py-1 rounded-lg hover:bg-gray-200 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Hoàn tác (Undo) Ctrl+Z"
        >
          ↩️
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="editor-btn px-2 py-1 rounded-lg hover:bg-gray-200 text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Làm lại (Redo) Ctrl+Y"
        >
          ↪️
        </button>

        <div className="h-4 w-px bg-gray-300 mx-1" />

        {/* Text Styles */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`editor-btn font-bold px-2.5 py-1 rounded-lg transition-colors ${
            editor.isActive('bold')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="In đậm (Bold)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`editor-btn italic px-2.5 py-1 rounded-lg font-serif transition-colors ${
            editor.isActive('italic')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="In nghiêng (Italic)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`editor-btn underline px-2.5 py-1 rounded-lg transition-colors ${
            editor.isActive('underline')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="Gạch chân (Underline)"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`editor-btn line-through px-2.5 py-1 rounded-lg transition-colors ${
            editor.isActive('strike')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="Gạch ngang (Strikethrough)"
        >
          S
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
          className={`editor-btn px-2.5 py-1 rounded-lg transition-colors ${
            editor.isActive('highlight')
              ? 'bg-amber-400 text-amber-950 font-bold shadow-xs'
              : 'hover:bg-amber-100 text-amber-900 bg-amber-50 border border-amber-200'
          }`}
          title="Highlight từ vựng / cấu trúc"
        >
          🖍️ Highlight
        </button>

        <div className="h-4 w-px bg-gray-300 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`editor-btn px-2 py-1 font-bold rounded-lg transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="Tiêu đề chính H2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`editor-btn px-2 py-1 font-semibold rounded-lg transition-colors ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="Tiêu đề phụ H3"
        >
          H3
        </button>

        <div className="h-4 w-px bg-gray-300 mx-1" />

        {/* Lists & Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`editor-btn px-2 py-1 rounded-lg transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="Danh sách dấu chấm"
        >
          • Danh sách
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`editor-btn px-2 py-1 rounded-lg transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="Danh sách đánh số"
        >
          1. Đánh số
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`editor-btn px-2 py-1 rounded-lg transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'hover:bg-gray-200 text-gray-700'
          }`}
          title="Trích dẫn (Quote)"
        >
          ❝ Trích dẫn
        </button>

        <div className="h-4 w-px bg-gray-300 mx-1" />

        {/* Quick English Templates */}
        <button
          type="button"
          onClick={() =>
            insertTemplate(
              `<p><strong>📌 Từ vựng:</strong></p><ul><li><mark><strong>Word</strong></mark>: /phonetics/ - Nghĩa tiếng Việt (<em>Ví dụ: ...</em>)</li></ul>`
            )
          }
          className="editor-btn px-2.5 py-1 rounded-lg hover:bg-indigo-100 text-indigo-700 bg-indigo-50 border border-indigo-100 font-medium transition-colors"
          title="Chèn mẫu ghi chú từ vựng"
        >
          📖 Từ vựng
        </button>
        <button
          type="button"
          onClick={() =>
            insertTemplate(
              `<p><strong>💡 Cấu trúc câu:</strong></p><ul><li>Cấu trúc: <mark><strong>It takes + [sb] + [time] + to V</strong></mark> (Mất bao lâu để làm gì)</li><li>Viết lại: <mark><strong>S + spend + [time] + V-ing</strong></mark></li><li><em>Ví dụ: It takes me 30 minutes to study English every day.</em></li></ul>`
            )
          }
          className="editor-btn px-2.5 py-1 rounded-lg hover:bg-emerald-100 text-emerald-800 bg-emerald-50 border border-emerald-200 font-medium transition-colors"
          title="Chèn mẫu cấu trúc câu tiếng Anh"
        >
          💡 Cấu trúc
        </button>
        <button
          type="button"
          onClick={() =>
            insertTemplate(
              `<p><strong>📘 Ngữ pháp: <mark>Tên chủ điểm</mark></strong></p><ul><li>Định nghĩa: ...</li><li>Cách dùng: ...</li><li><em>Ví dụ: ...</em></li></ul>`
            )
          }
          className="editor-btn px-2.5 py-1 rounded-lg hover:bg-purple-100 text-purple-700 bg-purple-50 border border-purple-100 font-medium transition-colors"
          title="Chèn mẫu chủ điểm ngữ pháp"
        >
          📘 Ngữ pháp
        </button>
        <button
          type="button"
          onClick={() =>
            insertTemplate(
              `<p><strong>⚡ Công thức: <mark>Thì hiện tại đơn (Present Simple)</mark></strong></p><ul><li><strong>(+) Khẳng định:</strong> S + V(s/es) + O</li><li><strong>(-) Phủ định:</strong> S + do/does not + V-inf + O</li><li><strong>(?) Nghi vấn:</strong> Do/Does + S + V-inf + O?</li><li>Dấu hiệu: always, usually, every day...</li><li><em>Ví dụ: I study English for 30 minutes every day.</em></li></ul>`
            )
          }
          className="editor-btn px-2.5 py-1 rounded-lg hover:bg-blue-100 text-blue-700 bg-blue-50 border border-blue-100 font-medium transition-colors"
          title="Chèn mẫu công thức thì"
        >
          ⚡ Công thức thì
        </button>
        <button
          type="button"
          onClick={() =>
            insertTemplate(
              `<p><strong>⚠️ Lưu ý ngữ pháp:</strong></p><ul><li>Không dùng: [Lỗi sai phổ biến]</li><li>Thay bằng: <mark><strong>[Cách dùng đúng]</strong></mark></li><li>Giải thích: ...</li></ul>`
            )
          }
          className="editor-btn px-2.5 py-1 rounded-lg hover:bg-amber-100 text-amber-700 bg-amber-50 border border-amber-100 font-medium transition-colors"
          title="Chèn lưu ý ngữ pháp"
        >
          ⚠️ Lưu ý
        </button>
      </div>

      {/* TipTap Editor Content */}
      <div style={{ minHeight }} className="overflow-y-auto max-h-[50vh] p-2 bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
