// ===============================
// MikroMile — Root Layout
// ===============================

import type { Metadata } from 'next';
import { Inter, Bricolage_Grotesque, Fraunces } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

// Display face for headings/stats — characterful startup grotesque.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
});

// Warm serif for accent moments (DESIGN.md's serif rule; SoDoSans/Lander stand-ins).
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'MikroMile — Community Commerce & Convenience',
  description:
    'Group buy your hostel’s essentials at bulk prices from local stores, and get last-minute items carried by someone in your community who’s already heading out.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${bricolage.variable} ${fraunces.variable}`}>
      <body className="antialiased min-h-screen">
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
