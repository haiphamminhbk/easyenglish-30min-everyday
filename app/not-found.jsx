import Link from 'next/link';

export const metadata = {
  title: '404 - Không tìm thấy trang | Easy English',
  description: 'Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.',
};

export default function NotFound() {
  return (
    <main className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10 mx-auto text-center dark:text-slate-100 shadow-2xl border border-white/20 dark:border-slate-800/80 animate-fadeIn">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center border border-indigo-500/30">
        <span className="text-4xl">🧭</span>
      </div>

      <span className="inline-block px-3 py-1 mb-3 text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-full border border-indigo-200 dark:border-indigo-800">
        Lỗi 404
      </span>

      <h1 className="text-2xl sm:text-3xl font-black mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-300 dark:to-pink-400 bg-clip-text text-transparent">
        Trang không tồn tại
      </h1>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
        Đường dẫn bạn truy cập có thể bị sai hoặc nội dung này đã được cập nhật sang vị trí mới.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
        >
          <span>🏠 Về trang chủ</span>
        </Link>
        <Link
          href="/vocabulary"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 transition-all border border-slate-200 dark:border-slate-700"
        >
          <span>🎴 Học từ vựng</span>
        </Link>
      </div>
    </main>
  );
}
