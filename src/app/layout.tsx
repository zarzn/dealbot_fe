import { Plus_Jakarta_Sans } from 'next/font/google';
import { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Agentic Deals System',
  description: 'AI-powered deal monitoring system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.className} font-plus-jakarta`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 