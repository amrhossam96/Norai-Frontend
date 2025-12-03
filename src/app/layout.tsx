import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Geist } from 'next/font/google';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

// Keep Geist as a fallback
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

// Add Gellix font from public directory
const gellix = localFont({
  src: [
    {
      path: '../../public/fonts/Gellix-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Gellix-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Gellix-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Gellix-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-gellix',
  display: 'swap',
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${gellix.variable} ${geist.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen font-gellix">
        <RootProvider>{children}</RootProvider>
        <Toaster />
      </body>
    </html>
  );
}
