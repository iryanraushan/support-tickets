import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '');
  const { pathname } = request.nextUrl;

  console.log('[Middleware] Path:', pathname, 'Has Token:', !!token, 'Cookies:', request.cookies.getAll());

  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);
  console.log('ticket is this ', token)
  if (!token && !isPublicRoute) {
    console.log('[Middleware] Redirecting to login - no token');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/tickets', request.url));
  }

  const response = NextResponse.next();

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_API_URL || '*');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};