import type { Metadata } from 'next';
import { IBM_Plex_Serif, Mona_Sans } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import Navbar from '@/components/ui/Navbar';

const ibmPlexSerif = IBM_Plex_Serif({
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-serif',
  subsets: ['latin'],
  display: 'swap',
});

const monSans = Mona_Sans({
  variable: '--font-mona-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bookified',
  description:
    'Transform your books into AI conversations. Upload PDFs and chat with your books using your voice.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSerif.variable} ${monSans.variable} relative font-sans antialiased`}
      >
        <ClerkProvider>
          <Navbar />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
