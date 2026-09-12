import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { Providers } from './providers';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'BrickSetu | Brick Kiln Management System',
    template: '%s | BrickSetu',
  },
  description:
    'BrickSetu (ब्रिकसेतू) is a simple and comprehensive management platform for brick kiln operations. Digitize piece-rate labor tracking, advance balance ledgers, moulding-to-firing kiln batch workflows, raw material inventory, transport logistics, and financial analytics.',
  keywords: [
    'BrickSetu',
    'Brick Kiln Management',
    'Kiln Operations',
    'Brick Kiln Software',
    'Piece Rate Labor Tracking',
    'Peshgi Wage Advance Ledger',
    'Kiln Batch Production',
    'Brick Moulding Settlement',
    'Raw Material Inventory',
    'ईट भट्टी व्यवस्थापन',
    'कामगार नोंदवही',
  ],
  authors: [{ name: 'BrickSetu Team' }],
  creator: 'BrickSetu',
  publisher: 'BrickSetu',
  applicationName: 'BrickSetu',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'BrickSetu | Brick Kiln Management System',
    description:
      'Digitize brick kiln operations, piece-rate labor wages, advance ledgers, production batches, and party accounts with BrickSetu.',
    siteName: 'BrickSetu',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BrickSetu | Brick Kiln Management System',
    description:
      'Digitize brick kiln operations, piece-rate labor wages, advance ledgers, production batches, and party accounts with BrickSetu.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#D9531E' },
    { media: '(prefers-color-scheme: dark)', color: '#18181B' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`h-full ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body className={`${ibmPlexSans.className} min-h-full bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
          </Providers>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
