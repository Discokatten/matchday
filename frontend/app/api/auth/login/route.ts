import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '../../../lib/schemas/loginSchema';
import { DEVELOPMENT_MOCK_TOKEN } from '../../../lib/authSession';
import { isNextResponse, postToAuthApi } from '../authApi';

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Ange en giltig e-postadress och ett lösenord.' },
      { status: 400 },
    );
  }

  if (process.env.NODE_ENV === 'development') {
    const response = NextResponse.json({
      authenticated: true,
      mock: true,
    });
    response.cookies.set('token', DEVELOPMENT_MOCK_TOKEN, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    return response;
  }

  const result = await postToAuthApi('login', parsed.data);
  if (isNextResponse(result)) {
    return result;
  }

  const token =
    typeof result.data === 'object' &&
    result.data !== null &&
    'token' in result.data &&
    typeof result.data.token === 'string'
      ? result.data.token
      : null;
  if (!token) {
    return NextResponse.json(
      { message: 'Inloggningssvaret saknar en giltig token.' },
      { status: 502 },
    );
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  return response;
}
