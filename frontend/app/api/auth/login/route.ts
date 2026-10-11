import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  DEVELOPMENT_BASIC_TOKEN_PREFIX,
  getAuthCookieOptions,
} from '../../../lib/authSession';
import { loginSchema } from '../../../lib/schemas/loginSchema';
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
    if (parsed.data.email.includes(':')) {
      return NextResponse.json(
        { message: 'Användarnamnet får inte innehålla kolon.' },
        { status: 400 },
      );
    }

    const credentials = Buffer.from(
      `${parsed.data.email}:${parsed.data.password}`,
      'utf8',
    ).toString('base64url');

    const response = NextResponse.json({
      authenticated: true,
      development: true,
    });

    response.cookies.set(
      AUTH_COOKIE_NAME,
      `${DEVELOPMENT_BASIC_TOKEN_PREFIX}${credentials}`,
      getAuthCookieOptions(false),
    );

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
  response.cookies.set(
    AUTH_COOKIE_NAME,
    token,
    getAuthCookieOptions(process.env.NODE_ENV === 'production'),
  );

  return response;
}
