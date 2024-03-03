import { APP_SESSION_COOKIE_NAME } from '@lib/constants';
import { NextResponse, type NextRequest } from 'next/server';

const authRoutes = [
  '/api/auth/callback',
  '/api/auth/status',
  '/auth/login',
];

const protectedRoutes = [
  "/",
  // Populate more from NavRoutes
];


async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-pathname', request.nextUrl.pathname);

  if ( request.nextUrl.pathname.includes('api/v1') ) {
    console.info({ 
      pathname: request.nextUrl.pathname,
      requestHeaders: { ...requestHeaders } 
    });
  }


  return NextResponse.next({
      request: {
          headers: requestHeaders,
      },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - static (static files)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     */
    '/((?!api|static|_next/static|_next/image|favicon.ico).*)',
  ],
}

export default middleware;