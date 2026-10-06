import { NextRequest, NextResponse } from 'next/server';
import { DEVELOPMENT_MOCK_TOKEN } from '../../../lib/authSession';

const backendUrl = (process.env.API_URL ?? 'http://localhost:8080').replace(
  /\/$/,
  '',
);

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function forwardRequest(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json(
      { message: 'Inloggning krävs.' },
      { status: 401 },
    );
  }
  if (token === DEVELOPMENT_MOCK_TOKEN) {
    return NextResponse.json(
      { message: 'Backend-anrop är inte tillgängliga med utvecklingsinloggning.' },
      { status: 503 },
    );
  }

  const { path } = await context.params;
  const backendPath = path.map(encodeURIComponent).join('/');
  const target = new URL(
    `/api/v1/${backendPath}${request.nextUrl.search}`,
    backendUrl,
  );
  const headers = new Headers({
    Authorization: `Bearer ${token}`,
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
    const response = new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
    if (upstream.status === 401) {
      response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
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
