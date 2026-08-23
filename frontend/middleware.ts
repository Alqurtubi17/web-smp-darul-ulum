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

  // 1. Unauthenticated users accessing protected routes -> redirect to login
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // 2. Logged in user accessing login page -> redirect to their role home
  if (pathname === '/auth/login' && session) {
    const role = (session.user as any)?.role;
    const home = ROLE_HOME[role] || '/';
    return NextResponse.redirect(new URL(home, req.url));
  }

  // 3. Strict Role Isolation Guards
  if (session) {
    const role = (session.user as any)?.role || '';
    const userHome = ROLE_HOME[role] || '/';

    // Admin Guard: Only ADMIN / SUPER_ADMIN can access /admin
    if (pathname.startsWith('/admin') && !['SUPER_ADMIN', 'ADMIN'].includes(role)) {
      return NextResponse.redirect(new URL(userHome, req.url));
    }

    // Guru Guard: Only GURU can access /guru
    if (pathname.startsWith('/guru') && role !== 'GURU') {
      return NextResponse.redirect(new URL(userHome, req.url));
    }

    // Siswa Guard: Only SISWA can access /siswa
    if (pathname.startsWith('/siswa') && role !== 'SISWA') {
      return NextResponse.redirect(new URL(userHome, req.url));
    }

    // Orang Tua Guard: Only ORANG_TUA can access /ortu
    if (pathname.startsWith('/ortu') && role !== 'ORANG_TUA') {
      return NextResponse.redirect(new URL(userHome, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
};
