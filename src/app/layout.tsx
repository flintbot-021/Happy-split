import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from '@/providers/session-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HappySplit - Split Your Restaurant Bill',
  description: 'Easily split restaurant bills with friends using AI-powered bill scanning',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}