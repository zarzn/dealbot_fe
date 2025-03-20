import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { metadata } from './metadata';
import { ClientProviders } from './client-providers';

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

// Server component root layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.className} font-plus-jakarta`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
} 