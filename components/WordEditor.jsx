'use client';

import { useRef } from 'react';

export default function WordEditor({ value, onChange, mode = 'study', placeholder, rows = 8 }) {
  const textareaRef = useRef(null);
  const isWork = mode === 'work';
  const defaultPlaceholder = isWork
    ? 'Nhập ghi chú công việc, nhiệm vụ đã hoàn thành, cuộc họp & sự kiện...'
    : 'Nhập ghi chú bài học...';

  // Wrap or insert text around current selection
  const wrapSelection = (prefix, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = start + prefix.length + selected.length;
    }, 0);
  };

  // Prefix lines for bullet / numbered lists
  const prefixLines = (type = 'bullet') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

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

    const newValue = before + prefixed + after;
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start;
      textarea.selectionEnd = start + prefixed.length;
    }, 0);
  };

  // Word and character counts
  const wordCount = value?.trim() ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = value?.length || 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          {isWork ? 'Soạn thảo công việc' : 'Soạn thảo bài học'}
        </span>
        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {wordCount} từ • {charCount} ký tự
        </span>
      </div>

      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 flex-wrap p-1.5 bg-gray-50/90 border border-gray-200 rounded-xl mb-2 text-xs shadow-xs">
        <button
          type="button"
          onClick={() => wrapSelection('**', '**', 'từ khóa')}
          className="editor-btn font-bold px-2.5 py-1 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
          title="In đậm (Bold) **text**"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => wrapSelection('*', '*', 'từ nhấn mạnh')}
          className="editor-btn italic px-2.5 py-1 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors font-serif"
          title="In nghiêng (Italic) *text*"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => wrapSelection('<u>', '</u>', 'nội dung gạch chân')}
          className="editor-btn underline px-2.5 py-1 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
          title="Gạch chân <u>text</u>"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => wrapSelection('==', '==', isWork ? 'đầu việc quan trọng' : 'từ vựng / cấu trúc mới')}
          className="editor-btn px-2.5 py-1 rounded-lg hover:bg-amber-100 text-amber-800 transition-colors bg-amber-50 border border-amber-200"
          title="Highlight ==text=="
        >
          🖍️ Highlight
        </button>

        <div className="h-4 w-px bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => prefixLines('bullet')}
          className="editor-btn px-2 py-1 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
          title="Danh sách dấu chấm (- item)"
        >
          • Danh sách
        </button>
        <button
          type="button"
          onClick={() => prefixLines('number')}
          className="editor-btn px-2 py-1 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
          title="Danh sách đánh số (1. item)"
        >
          1. Đánh số
        </button>

        <div className="h-4 w-px bg-gray-300 mx-1" />

        {/* Templates */}
        {!isWork ? (
          <>
            <button
              type="button"
              onClick={() => wrapSelection('\n📌 Từ vựng:\n- ==Word==: /phonetics/ - Nghĩa tiếng Việt (Ví dụ: ...)\n', '')}
              className="editor-btn px-2.5 py-1 rounded-lg hover:bg-indigo-100 text-indigo-700 bg-indigo-50 border border-indigo-100 font-medium transition-colors"
              title="Chèn mẫu ghi chú từ vựng"
            >
              📖 Từ vựng
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('\n💡 Cấu trúc câu:\n- Cấu trúc: ==It takes + [sb] + [time] + to V== (Mất bao lâu để ai làm gì)\n- Viết lại: ==S + spend + [time] + V-ing==\n- Ví dụ 1: It takes me 30 minutes to study English every day.\n- Ví dụ 2: I spend 30 minutes studying English every day.\n', '')}
              className="editor-btn px-2.5 py-1 rounded-lg hover:bg-emerald-100 text-emerald-800 bg-emerald-50 border border-emerald-200 font-medium transition-colors"
              title="Chèn mẫu cấu trúc câu tiếng Anh"
            >
              💡 Cấu trúc
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('\n📌 Ngữ pháp: ==Tên chủ điểm / Cấu trúc==\n- Định nghĩa: ...\n- Cách dùng: ...\n- Ví dụ: ...\n', '')}
              className="editor-btn px-2.5 py-1 rounded-lg hover:bg-purple-100 text-purple-700 bg-purple-50 border border-purple-100 font-medium transition-colors"
              title="Chèn mẫu chủ điểm ngữ pháp"
            >
              📘 Ngữ pháp
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('\n⚡ Công thức: ==Thì hiện tại đơn / Present Simple==\n- (+) S + V(s/es) + O\n- (-) S + do/does not + V-inf + O\n- (?) Do/Does + S + V-inf + O?\n- Dấu hiệu: always, usually, every day...\n- Ví dụ: I study English for 30 minutes every day.\n', '')}
              className="editor-btn px-2.5 py-1 rounded-lg hover:bg-blue-100 text-blue-700 bg-blue-50 border border-blue-100 font-medium transition-colors"
              title="Chèn mẫu công thức thì"
            >
              ⚡ Công thức thì
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('\n⚠️ Lưu ý ngữ pháp:\n- Không dùng: [Lỗi sai thường gặp]\n- Thay bằng: ==[Cách dùng đúng]==\n- Giải thích: ...\n', '')}
              className="editor-btn px-2.5 py-1 rounded-lg hover:bg-amber-100 text-amber-700 bg-amber-50 border border-amber-100 font-medium transition-colors"
              title="Chèn lưu ý ngữ pháp"
            >
              ⚠️ Lưu ý
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => wrapSelection('\n📌 Danh sách nhiệm vụ (To-Do List):\n- ==[Hoàn thành]== Xử lý báo cáo tuần & gửi email đối tác (100%)\n- ==[Đang làm]== Rà soát hợp đồng & tài liệu kỹ thuật\n- ==[Chờ duyệt]== Chuẩn bị slide thuyết trình cho cuộc họp\n', '')}
              className="editor-btn px-2.5 py-1 rounded-lg hover:bg-emerald-100 text-emerald-800 bg-emerald-50 border border-emerald-200 font-medium transition-colors"
              title="Chèn mẫu danh sách nhiệm vụ"
            >
              📋 Nhiệm vụ
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('\n📅 Cuộc họp / Sự kiện: ==Tên cuộc họp==\n- Thời gian & Thành phần: 30 phút • Team Dự án / Khách hàng\n- Nội dung chính: Thống nhất yêu cầu & kế hoạch tuần tới\n- Hành động tiếp theo (Action Items): Phân công cụ thể trước 17:00\n', '')}
              className="editor-btn px-2.5 py-1 rounded-lg hover:bg-indigo-100 text-indigo-700 bg-indigo-50 border border-indigo-100 font-medium transition-colors"
              title="Chèn mẫu biên bản họp"
            >
              📅 Sự kiện & Họp
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('\n🎯 Mục tiêu 30 phút tập trung: ==Tên mục tiêu==\n- Mục tiêu: Giải quyết dứt điểm công việc trọng tâm\n- Tiến độ đạt được: Hoàn thành 100%\n- Đánh giá hiệu suất: ⭐⭐⭐⭐⭐ (Tập trung tối đa)\n', '')}
              className="editor-btn px-2.5 py-1 rounded-lg hover:bg-purple-100 text-purple-700 bg-purple-50 border border-purple-100 font-medium transition-colors"
              title="Chèn mẫu mục tiêu & tiến độ"
            >
              🎯 Mục tiêu
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('\n⚡ Nhật ký công việc (Daily Log):\n- 09:00 - 09:30: Lên kế hoạch ngày và xử lý email ưu tiên\n- 14:00 - 14:30: Focus time - Giải quyết tồn đọng & rà soát dữ liệu\n- Kết quả: Đúng hạn, chất lượng tốt\n', '')}
              className="editor-btn px-2.5 py-1 rounded-lg hover:bg-blue-100 text-blue-700 bg-blue-50 border border-blue-100 font-medium transition-colors"
              title="Chèn mẫu nhật ký làm việc"
            >
              ⚡ Nhật ký
            </button>
            <button
              type="button"
              onClick={() => wrapSelection('\n⚠️ Rủi ro & Lưu ý khẩn cấp:\n- Vấn đề (Blocker): ==Đang chờ phản hồi kỹ thuật / phê duyệt==\n- Người phối hợp: Trưởng bộ phận liên quan\n- Hạn chót (Deadline): Hôm nay 17:30\n', '')}
              className="editor-btn px-2.5 py-1 rounded-lg hover:bg-amber-100 text-amber-700 bg-amber-50 border border-amber-100 font-medium transition-colors"
              title="Chèn mẫu rủi ro & lưu ý khẩn"
            >
              ⚠️ Rủi ro / Lưu ý
            </button>
          </>
        )}
      </div>

      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || defaultPlaceholder}
        className="w-full min-h-[220px] max-h-[60vh] border border-gray-300 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y leading-relaxed"
      />
    </div>
  );
}
