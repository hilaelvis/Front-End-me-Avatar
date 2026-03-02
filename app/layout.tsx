import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '@/styles/globals.css';

const commitMono = localFont({
  src: [
    { path: '../fonts/CommitMono-400-Regular.otf', weight: '400', style: 'normal' },
    { path: '../fonts/CommitMono-400-Italic.otf', weight: '400', style: 'italic' },
    { path: '../fonts/CommitMono-700-Regular.otf', weight: '700', style: 'normal' },
    { path: '../fonts/CommitMono-700-Italic.otf', weight: '700', style: 'italic' },
  ],
  variable: '--font-commit-mono',
});

export const metadata: Metadata = {
  title: 'Hotel Receptionist Avatar',
  description: 'AI-powered hotel receptionist assistant',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${commitMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
