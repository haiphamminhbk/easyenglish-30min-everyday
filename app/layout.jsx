import './globals.css';
import Background3D from '@/components/Background3D';

export const metadata = {
  title: '⏰ Easy English - Mỗi ngày 30 phút',
  description: 'Dành 30 phút mỗi ngày để nâng cao trình độ tiếng Anh. Theo dõi chuỗi ngày học, ghi chú từ vựng, ngữ pháp và cấu trúc câu.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="flex items-center justify-center min-h-screen p-4 sm:p-8 antialiased">
        <Background3D />
        {children}
      </body>
    </html>
  );
}
