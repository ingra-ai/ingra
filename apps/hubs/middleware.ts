import { NextResponse, type NextRequest } from 'next/server';

async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const pathname = request.nextUrl.pathname;
  
  requestHeaders.set('X-URL', request.url);

  if (pathname.includes('/api/v1')) {
    console.info(`:: [middleware] [api-v1] pathname: ${pathname}`);
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
};

export default middleware;
