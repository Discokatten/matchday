import type { LoginFormValues } from '../lib/schemas/loginSchema';
import type { RegisterUserFormValues } from '../lib/schemas/registerUserSchema';

const JSON_CONTENT_TYPE = 'application/json';
const DEFAULT_AUTH_ERROR_MESSAGE = 'Autentiseringen misslyckades.';
const LOGOUT_ERROR_MESSAGE = 'Det gick inte att logga ut.';

type AuthRequestBody = Record<string, unknown>;

function getErrorMessage(result: unknown, fallbackMessage: string): string {
  if (typeof result === 'object' && result !== null && 'message' in result) {
    const { message } = result;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return fallbackMessage;
}

// Shared POST helper for auth endpoints. Keeps request handling and error parsing
// consistent across login, registration and logout.
async function postAuthRequest(
  path: string,
  body?: AuthRequestBody,
  fallbackMessage = DEFAULT_AUTH_ERROR_MESSAGE,
): Promise<void> {
  const response = await fetch(path, {
    method: 'POST',
    headers: body ? { 'Content-Type': JSON_CONTENT_TYPE } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(result, fallbackMessage));
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

export function logoutUser(): Promise<void> {
  return postAuthRequest('/api/auth/logout', undefined, LOGOUT_ERROR_MESSAGE);
}
