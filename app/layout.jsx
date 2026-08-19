import './globals.css';
import Background3D from '@/components/Background3D';
import { Inter, Be_Vietnam_Pro } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata = {
  title: '⏰ Easy English - Mỗi ngày 30 phút',
  description: 'Dành 30 phút mỗi ngày để nâng cao trình độ tiếng Anh. Theo dõi chuỗi ngày học, ghi chú từ vựng, ngữ pháp và cấu trúc câu.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('english_theme');
                  if (stored === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${beVietnamPro.variable} font-sans flex items-center justify-center min-h-screen p-4 sm:p-8 antialiased`}>
        <Background3D />
        {children}
      </body>
    </html>
  );
}
