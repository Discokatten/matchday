export const DEVELOPMENT_MOCK_TOKEN = 'development-mock-session';

export function hasAuthSession(token: string | undefined): boolean {
  return Boolean(
    token &&
      (token !== DEVELOPMENT_MOCK_TOKEN ||
        process.env.NODE_ENV === 'development'),
  );
}
