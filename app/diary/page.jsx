'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { loadAllDiaryEntries } from '@/lib/storage';
import DiaryFlipBook from '@/components/DiaryFlipBook';

function DiaryPageContent() {
  const [diaryData, setDiaryData] = useState({ entries: [], savedUserName: 'bạn' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const data = loadAllDiaryEntries();
    setDiaryData(data);
  }, []);

  if (!mounted) {
    return <div className="text-white text-center py-20">Đang mở sổ nhật kí 3D...</div>;
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-2 sm:p-4">
      <DiaryFlipBook
        entries={diaryData.entries}
        userName={diaryData.savedUserName}
        isOpen={true}
        onClose={() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }}
      />
    </div>
  );
}

export default function DiaryPage() {
  return (
    <Suspense fallback={<div className="text-white text-center py-20">Đang tải nhật kí...</div>}>
      <DiaryPageContent />
    </Suspense>
  );
}
