import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { metadata } from './metadata';
import { ClientProviders } from './client-providers';
import HeadMetaTags from './head-meta';

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
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="AI-powered Deal Aggregator and Monitoring System"
        />
        <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${plusJakartaSans.className} font-plus-jakarta`}>
        <HeadMetaTags />
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
} 