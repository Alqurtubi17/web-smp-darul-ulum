import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN: '/admin',
  ADMIN: '/admin',
  GURU: '/guru',
  SISWA: '/siswa',
  ORANG_TUA: '/ortu',
};

const PROTECTED_ROUTES = ['/admin', '/guru', '/siswa', '/ortu'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await auth();

  // 1. Protected routes check
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // 2. Logged in user accessing login page
  if (pathname === '/auth/login' && session) {
    const role = (session.user as any)?.role;
    const home = ROLE_HOME[role] || '/';
    return NextResponse.redirect(new URL(home, req.url));
  }

  // 3. Admin guard
  if (pathname.startsWith('/admin') && session) {
    const role = (session?.user as any)?.role;
    if (!['SUPER_ADMIN', 'ADMIN'].includes(role)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
};
