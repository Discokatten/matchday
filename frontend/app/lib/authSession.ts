export const AUTH_COOKIE_NAME = 'token';
export const DEVELOPMENT_BASIC_TOKEN_PREFIX = 'development-basic:';
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24;

export const AUTH_COOKIE_BASE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  path: '/',
};

export function getAuthCookieOptions(
  secure: boolean,
  maxAge = AUTH_COOKIE_MAX_AGE_SECONDS,
) {
  return {
    ...AUTH_COOKIE_BASE_OPTIONS,
    secure,
    maxAge,
  };
}

export function getAuthCookieClearOptions() {
  return {
    ...getAuthCookieOptions(process.env.NODE_ENV === 'production'),
    maxAge: 0,
    expires: new Date(0),
  };
}

export function hasAuthSession(token: string | undefined): boolean {
  return Boolean(
    token &&
      (!token.startsWith(DEVELOPMENT_BASIC_TOKEN_PREFIX) ||
        process.env.NODE_ENV === 'development'),
  );
}
