import { NextRequest, NextResponse } from 'next/server';
import { hasAuthSession } from './app/lib/authSession';

const protectedRoutes = ['/dashboard', '/conversation'];
const authRoutes = ['/login', '/register'];

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function proxy(request: NextRequest) {
  const hasSession = hasAuthSession(request.cookies.get('token')?.value);
  const { pathname } = request.nextUrl;

  if (
    !hasSession &&
    protectedRoutes.some((route) => matchesRoute(pathname, route))
  ) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set(
      'redirect',
      `${pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  if (
    hasSession &&
    authRoutes.some((route) => matchesRoute(pathname, route))
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
