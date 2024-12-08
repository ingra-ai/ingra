import { NextResponse, type NextRequest } from 'next/server';

async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const pathname = request.nextUrl.pathname;

  requestHeaders.set('X-URL', request.url);

  if (pathname.includes('/api/v1')) {
    console.info(`:: [hubs middleware] [api-v1] pathname: ${pathname}`);

    // Log the request headers and body
    console.info(`:: [hubs middleware] [api-v1] request headers:`, JSON.stringify({ ...Object.entries(requestHeaders) }));

    const method = request.method.toUpperCase();
    const contentType = requestHeaders.get('Content-Type');
    let requestArgs: Record<string, any> = {};

    if (method === 'GET' || method === 'DELETE') {
      const { searchParams } = new URL(request.url);
      requestArgs = Object.fromEntries(searchParams);
    } else {
      if ( contentType === 'application/x-www-form-urlencoded' ) {
        const formData = await request.formData();
        requestArgs = Object.fromEntries(formData);
      }
      else {
        requestArgs = await request.json();
      }
    }

    console.info(`:: [hubs middleware] [api-v1] request body:`, JSON.stringify(requestArgs));
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
