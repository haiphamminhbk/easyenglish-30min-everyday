import './globals.css';
import dynamic from 'next/dynamic';
import { Inter, Be_Vietnam_Pro } from 'next/font/google';

const Background3D = dynamic(() => import('@/components/Background3D'), {
  ssr: false,
});

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

export const viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: 'Easy English & Workflow - Mỗi ngày 30 phút',
  description: 'Dành 30 phút mỗi ngày để nâng cao trình độ tiếng Anh & làm việc tập trung cao độ. Theo dõi chuỗi ngày học, 3000 từ vựng Oxford và bảng xếp hạng.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Easy English - 30 Phút Mỗi Ngày',
    description: 'Theo dõi chuỗi ngày học tiếng Anh, từ vựng Oxford và nhật ký học tập.',
    type: 'website',
  },
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
