import { NextResponse } from 'next/server';

const backendUrl = (process.env.API_URL ?? 'http://localhost:8080').replace(
  /\/$/,
  '',
);

export async function postToAuthApi(
  endpoint: 'login' | 'register',
  payload: Record<string, string>,
): Promise<{ response: Response; data: unknown } | NextResponse> {
  let response: Response;

  try {
    response = await fetch(`${backendUrl}/api/v1/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      { message: 'Autentiseringstjänsten kan inte nås.' },
      { status: 502 },
    );
  }

  const responseText = await response.text();
  let data: unknown = null;
  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof data.message === 'string'
        ? data.message
        : 'Autentiseringen misslyckades.';
    return NextResponse.json({ message }, { status: response.status });
  }

  return { response, data };
}

export function isNextResponse(
  result: { response: Response; data: unknown } | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
