import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import Header from './components/Header';
import AuthSessionHandler from './components/AuthSessionHandler';
import {
  DEVELOPMENT_BASIC_TOKEN_PREFIX,
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
  const isDevelopmentBasic =
    process.env.NODE_ENV === 'development' &&
    token?.startsWith(DEVELOPMENT_BASIC_TOKEN_PREFIX);

  return (
    <html
      lang='sv'
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <AuthSessionHandler />
        <Header isAuthenticated={isAuthenticated} />
        {isDevelopmentBasic && (
          <p
            role='status'
            className='mx-auto max-w-3xl px-4 text-center text-sm text-error'
          >
            Utvecklingsinloggning: backend-anrop använder Basic Auth från
            inloggningsformuläret.
          </p>
        )}
        {children}
      </body>
    </html>
  );
}
