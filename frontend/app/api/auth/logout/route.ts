import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
} from '../../../lib/authSession';

export async function POST() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    ...getAuthCookieOptions(process.env.NODE_ENV === 'production'),
    maxAge: 0,
  });
  return response;
}
