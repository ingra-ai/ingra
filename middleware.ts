import { NextResponse, type NextRequest } from 'next/server';

async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-pathname', request.nextUrl.pathname);

  if (request.nextUrl.pathname.includes('/api/v1')) {
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
     * - static (static files)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     */
    '/((?!static|_next/static|_next/image|favicon.ico).*)',

    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - static (static files)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     */
    // '/((?!api|static|_next/static|_next/image|favicon.ico).*)',
  ],
}

export default middleware;