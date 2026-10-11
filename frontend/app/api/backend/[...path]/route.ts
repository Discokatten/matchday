import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  DEVELOPMENT_BASIC_TOKEN_PREFIX,
  getAuthCookieOptions,
} from '../../../lib/authSession';
import { isApplicationIdentityRequiredProblem } from '../../../lib/authErrors';

const backendUrl = (process.env.API_URL ?? 'http://localhost:8080').replace(
  /\/$/,
  '',
);

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function buildAuthorizationHeader(token: string): string {
  if (token.startsWith(DEVELOPMENT_BASIC_TOKEN_PREFIX)) {
    return `Basic ${Buffer.from(
      token.slice(DEVELOPMENT_BASIC_TOKEN_PREFIX.length),
      'base64url',
    ).toString('base64')}`;
  }

  return `Bearer ${token}`;
}

async function forwardRequest(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { message: 'Inloggning krävs.' },
      { status: 401 },
    );
  }

  const isDevelopmentBasicToken = token.startsWith(
    DEVELOPMENT_BASIC_TOKEN_PREFIX,
  );

  if (isDevelopmentBasicToken && process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { message: 'Utvecklingsinloggning är endast tillgänglig i development.' },
      { status: 401 },
    );
  }

  const authorization = buildAuthorizationHeader(token);
  const { path } = await context.params;
  const backendPath = path.map(encodeURIComponent).join('/');
  const target = new URL(
    `/api/v1/${backendPath}${request.nextUrl.search}`,
    backendUrl,
  );

  const headers = new Headers({
    Authorization: authorization,
  });

  const contentType = request.headers.get('content-type');
  const accept = request.headers.get('accept');
  if (contentType) headers.set('Content-Type', contentType);
  if (accept) headers.set('Accept', accept);

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body:
        request.method === 'GET' || request.method === 'HEAD'
          ? undefined
          : await request.arrayBuffer(),
      cache: 'no-store',
    });

    const responseHeaders = new Headers();
    const upstreamContentType = upstream.headers.get('content-type');
    if (upstreamContentType) {
      responseHeaders.set('Content-Type', upstreamContentType);
    }

    const isApplicationIdentityError =
      upstream.status === 401 &&
      (await upstream
        .clone()
        .json()
        .then((body: unknown) => isApplicationIdentityRequiredProblem(body))
        .catch(() => false));

    const response = new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });

    if (upstream.status === 401 && !isApplicationIdentityError) {
      response.cookies.set(AUTH_COOKIE_NAME, '', {
        ...getAuthCookieOptions(process.env.NODE_ENV === 'production'),
        maxAge: 0,
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { message: 'Backend-API:t kan inte nås.' },
      { status: 502 },
    );
  }
}

export const GET = forwardRequest;
export const POST = forwardRequest;
export const PUT = forwardRequest;
export const PATCH = forwardRequest;
export const DELETE = forwardRequest;