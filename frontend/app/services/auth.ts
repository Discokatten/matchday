import type { LoginFormValues } from '../lib/schemas/loginSchema';
import type { RegisterUserFormValues } from '../lib/schemas/registerUserSchema';

async function postAuthRequest(
  path: string,
  body: Record<string, string>,
): Promise<void> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      typeof result === 'object' &&
      result !== null &&
      'message' in result &&
      typeof result.message === 'string'
        ? result.message
        : 'Autentiseringen misslyckades.';
    throw new Error(message);
  }
}

export function loginUser(credentials: LoginFormValues): Promise<void> {
  return postAuthRequest('/api/auth/login', credentials);
}

export function registerUser({
  email,
  password,
}: RegisterUserFormValues): Promise<void> {
  return postAuthRequest('/api/auth/register', { email, password });
}

export async function logoutUser(): Promise<void> {
  const response = await fetch('/api/auth/logout', { method: 'POST' });
  if (!response.ok) {
    throw new Error('Det gick inte att logga ut.');
  }
}
