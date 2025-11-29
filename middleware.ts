import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/lib/auth';

type JwtUser = {
  userId: string;
  email: string;
};


// Routes yang memerlukan authentication
const protectedRoutes = ['/cart', '/checkout', '/orders', '/profile'];

// Routes yang hanya bisa diakses jika belum login
const authRoutes = ['/login', '/register'];

// Routes API yang memerlukan authentication
const protectedApiRoutes = ['/api/auth/profile', '/api/cart', '/api/orders'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware untuk static files dan API routes yang tidak perlu auth
  if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/auth/login') ||
      pathname.startsWith('/api/auth/register') ||
      pathname.includes('. ') // static files
  ) {
    return NextResponse.next();
  }

  // Get token from cookies (lebih secure dari localStorage untuk SSR)
  const token = request.cookies.get('auth-token')?.value;

  let isValidToken = false;
  let user = null;

  if (token) {
    try {
      user = verifyToken(token);
      isValidToken = !!user;
    } catch (error) {
      isValidToken = false;
    }
  }

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isValidToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle auth routes (login/register)
  if (authRoutes.some(route => pathname. startsWith(route))) {
    if (isValidToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Handle protected API routes
  if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
    if (!isValidToken) {
      return NextResponse.json(
          { success: false, message: 'Unauthorized', error: 'UNAUTHORIZED' },
          { status: 401 }
      );
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user!.id);
    requestHeaders.set('x-user-email', user!.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};