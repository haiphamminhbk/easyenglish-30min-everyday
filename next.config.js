/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-highlight',
      '@tiptap/extension-placeholder',
      '@tiptap/extension-underline',
      'three',
    ],
  },
};

module.exports = nextConfig;

