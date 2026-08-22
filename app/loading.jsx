export default function Loading() {
  return (
    <div className="glass-panel w-full max-w-lg p-8 sm:p-12 rounded-3xl relative z-10 mx-auto text-center dark:text-slate-100 flex flex-col items-center justify-center min-h-[300px]">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-950/60 animate-ping opacity-25" />
        <div className="w-16 h-16 rounded-full border-4 border-t-indigo-600 border-r-purple-600 border-b-pink-500 border-l-transparent animate-spin" />
      </div>
      <p className="text-sm font-bold text-slate-600 dark:text-slate-300 animate-pulse">
        Đang tải dữ liệu...
      </p>
    </div>
  );
}
