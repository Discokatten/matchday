import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as login } from '../api/auth/login/route';
import { POST as register } from '../api/auth/register/route';
import { POST as logout } from '../api/auth/logout/route';
import { GET as backendGet } from '../api/backend/[...path]/route';
import { proxy } from '../../proxy';
import { DEVELOPMENT_MOCK_TOKEN } from '../lib/authSession';

const fetchMock = vi.fn<typeof fetch>();

function request(
  path: string,
  body?: unknown,
  cookie?: string,
): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

describe('frontend auth route handlers', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  describe('login', () => {
    it('creates a mock session in development without calling the backend', async () => {
      vi.stubEnv('NODE_ENV', 'development');

      const response = await login(
        request('/api/auth/login', {
          email: 'fan@example.com',
          password: 'correct-horse-battery',
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        authenticated: true,
        mock: true,
      });
      expect(response.cookies.get('token')?.value).toBe(
        DEVELOPMENT_MOCK_TOKEN,
      );
      expect(response.headers.get('set-cookie')).toMatch(/HttpOnly/i);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects invalid input without calling the backend', async () => {
      const response = await login(
        request('/api/auth/login', { email: 'not-an-email', password: '' }),
      );

      expect(response.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('stores the backend token in an HttpOnly cookie', async () => {
      fetchMock.mockResolvedValue(
        Response.json({ token: 'signed-token' }, { status: 200 }),
      );

      const response = await login(
        request('/api/auth/login', {
          email: 'fan@example.com',
          password: 'correct-horse-battery',
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ authenticated: true });
      expect(response.cookies.get('token')?.value).toBe('signed-token');
      expect(response.headers.get('set-cookie')).toMatch(/HttpOnly/i);
      expect(response.headers.get('set-cookie')).toMatch(/SameSite=Strict/i);
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/auth/login',
        expect.objectContaining({
          method: 'POST',
          cache: 'no-store',
          body: JSON.stringify({
            email: 'fan@example.com',
            password: 'correct-horse-battery',
          }),
        }),
      );
    });

    it('returns a gateway error if the backend omits the token', async () => {
      fetchMock.mockResolvedValue(Response.json({ userId: 'user-1' }));

      const response = await login(
        request('/api/auth/login', {
          email: 'fan@example.com',
          password: 'correct-horse-battery',
        }),
      );

      expect(response.status).toBe(502);
      expect(response.cookies.get('token')).toBeUndefined();
    });

    it('passes through backend authentication errors', async () => {
      fetchMock.mockResolvedValue(
        Response.json({ message: 'Felaktiga uppgifter.' }, { status: 401 }),
      );

      const response = await login(
        request('/api/auth/login', {
          email: 'fan@example.com',
          password: 'wrong-password',
        }),
      );

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        message: 'Felaktiga uppgifter.',
      });
    });

    it('reports when the backend cannot be reached', async () => {
      fetchMock.mockRejectedValue(new Error('Connection refused'));

      const response = await login(
        request('/api/auth/login', {
          email: 'fan@example.com',
          password: 'correct-horse-battery',
        }),
      );

      expect(response.status).toBe(502);
      expect(await response.json()).toEqual({
        message: 'Autentiseringstjänsten kan inte nås.',
      });
    });
  });

  describe('registration', () => {
    it('accepts registration in development without creating a backend user', async () => {
      vi.stubEnv('NODE_ENV', 'development');

      const response = await register(
        request('/api/auth/register', {
          email: 'fan@example.com',
          password: 'correct-horse-battery',
          confirmPassword: 'correct-horse-battery',
        }),
      );

      expect(response.status).toBe(201);
      expect(await response.json()).toEqual({ registered: true, mock: true });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects mismatched passwords without calling the backend', async () => {
      const response = await register(
        request('/api/auth/register', {
          email: 'fan@example.com',
          password: 'correct-horse-battery',
          confirmPassword: 'different-password',
        }),
      );

      expect(response.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('sends only email and password to the backend', async () => {
      fetchMock.mockResolvedValue(
        Response.json({ id: 'user-1' }, { status: 201 }),
      );

      const response = await register(
        request('/api/auth/register', {
          email: 'fan@example.com',
          password: 'correct-horse-battery',
          confirmPassword: 'correct-horse-battery',
        }),
      );

      expect(response.status).toBe(201);
      expect(await response.json()).toEqual({ registered: true });
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/auth/register',
        expect.objectContaining({
          body: JSON.stringify({
            email: 'fan@example.com',
            password: 'correct-horse-battery',
          }),
        }),
      );
    });

    it('preserves registration conflicts from the backend', async () => {
      fetchMock.mockResolvedValue(
        Response.json({ message: 'E-postadressen används redan.' }, {
          status: 409,
        }),
      );

      const response = await register(
        request('/api/auth/register', {
          email: 'fan@example.com',
          password: 'correct-horse-battery',
          confirmPassword: 'correct-horse-battery',
        }),
      );

      expect(response.status).toBe(409);
      expect(await response.json()).toEqual({
        message: 'E-postadressen används redan.',
      });
    });
  });

  it('clears the auth cookie on logout', async () => {
    const response = await logout();

    expect(response.status).toBe(200);
    expect(response.cookies.get('token')?.value).toBe('');
    expect(response.headers.get('set-cookie')).toMatch(/Max-Age=0/i);
    expect(response.headers.get('set-cookie')).toMatch(/HttpOnly/i);
  });
});

describe('protected route proxy', () => {
  it('allows the development mock session only in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const developmentResponse = proxy(
      request('/dashboard', undefined, `token=${DEVELOPMENT_MOCK_TOKEN}`),
    );
    vi.stubEnv('NODE_ENV', 'production');
    const productionResponse = proxy(
      request('/dashboard', undefined, `token=${DEVELOPMENT_MOCK_TOKEN}`),
    );

    expect(developmentResponse.headers.get('x-middleware-next')).toBe('1');
    expect(productionResponse.status).toBe(307);
    expect(productionResponse.headers.get('location')).toContain('/login');
  });

  it('redirects unauthenticated users and preserves path plus query', () => {
    const response = proxy(
      request('/conversation/match-123?tab=messages&page=2'),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost/login?redirect=%2Fconversation%2Fmatch-123%3Ftab%3Dmessages%26page%3D2',
    );
  });

  it('allows access when an auth cookie exists', () => {
    const response = proxy(
      request('/dashboard', undefined, 'token=signed-token'),
    );

    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('does not treat a similar but unprotected path as protected', () => {
    const response = proxy(request('/dashboard-old'));

    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('redirects authenticated users away from login and registration', () => {
    const response = proxy(request('/register', undefined, 'token=signed-token'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/dashboard');
  });
});

describe('backend API proxy with mock auth', () => {
  it('never forwards a development mock session to the backend', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const response = await backendGet(
      request('/api/backend/matches', undefined, `token=${DEVELOPMENT_MOCK_TOKEN}`),
      { params: Promise.resolve({ path: ['matches'] }) },
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      message: 'Backend-anrop är inte tillgängliga med utvecklingsinloggning.',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
