import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import Header from './components/Header';
import AuthSessionHandler from './components/AuthSessionHandler';
import {
  DEVELOPMENT_MOCK_TOKEN,
  hasAuthSession,
} from './lib/authSession';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Matchday',
  description:
    'Kalendarium för fotbollsmatcher där du även kan diskutera matcherna',
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const isAuthenticated = hasAuthSession(token);
  const isDevelopmentMock =
    process.env.NODE_ENV === 'development' &&
    token === DEVELOPMENT_MOCK_TOKEN;

  return (
    <html
      lang='sv'
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <AuthSessionHandler />
        <Header isAuthenticated={isAuthenticated} />
        {isDevelopmentMock && (
          <p
            role='status'
            className='mx-auto max-w-3xl px-4 text-center text-sm text-error'
          >
            Utvecklingsinloggning: detta är en tillfällig mock, inte riktig
            autentisering. Backend-anrop kräver fungerande backend-auth.
          </p>
        )}
        {children}
      </body>
    </html>
  );
}
