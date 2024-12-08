/**
 * OpenAI support
 *  - After user clicks 'Sign in' on Custom ChatGPT, it will bring it in this route;
 * 
 * Example hit:
 * https://auth.ingra.ai/api/v1/oauth2/auth?
 *  response_type=code&
 *  client_id=123&
 *  redirect_uri=https%3A%2F%2Fchat.openai.com%2Faip%2Fg-0635bc4d3822cb8e34e6970c89332f8fe4fbd28b%2Foauth%2Fcallback&
 *  state=019642e3-a293-4671-af0a-5b9a46d27b78
 */
'use server';
import { getOrCreateAppOAuthToken } from '@repo/shared/actions/oauth';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { mixpanel } from '@repo/shared/lib/analytics';
import { APP_AUTH_LOGIN_URL } from '@repo/shared/lib/constants';
import { getAnalyticsObject } from '@repo/shared/lib/utils/getAnalyticsObject';
import { isSafeRedirectUrl } from '@repo/shared/lib/utils/isSafeRedirectUrl';
import { ApiError } from '@repo/shared/types';
import { headers } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirect_uri = searchParams.get('redirect_uri'),
    response_type = searchParams.get('response_type'),
    client_id = searchParams.get('client_id'),
    scope = searchParams.get('scope'),
    state = searchParams.get('state');

  if (!response_type || !state || !redirect_uri) {
    return NextResponse.json({
      status: 400,
      code: 'BAD_REQUEST',
      message: 'Missing required parameters'
    } as ApiError, {
      status: 400
    });
  }

  const authSession = await getAuthSession();

  if (!authSession) {
    // Redirect to login
    const headersList = await headers(),
      headerUrl = headersList.get('X-URL') || '',
      redirectToQuery = headerUrl ? `?redirectTo=${encodeURIComponent(headerUrl)}` : '';

    return redirect(APP_AUTH_LOGIN_URL + redirectToQuery, RedirectType.replace);
  }

  if (redirect_uri && isSafeRedirectUrl(redirect_uri)) {
    const result = await getOrCreateAppOAuthToken(client_id || '', scope || '', true),
      { status, message, data: appOAuthToken } = result;

    // Generate url object
    const redirectUrl = new URL(redirect_uri);

    // If appOAuthToken is still not found, return error
    if ( status === 'error' || !appOAuthToken || !authSession || !response_type || !state || !appOAuthToken.idToken ) {
      redirectUrl.searchParams.append('error', 'invalid_request');
      redirectUrl.searchParams.append('error_description', message || 'Failed to authorize the request');

      // Response with redirect
      return NextResponse.redirect(redirectUrl, {
        status: 302 // Found
      });
    }

    /**
     * Analytics & Logging
     */
    mixpanel.track('OAuth2 - Authorize', {
      distinct_id: authSession.userId,
      ...getAnalyticsObject(request),
      recordId: appOAuthToken.id,
      redirectUri: redirect_uri,
      responseType: response_type,
      clientId: client_id,
      scope: scope || '',
      state,
    });

    // Add query params
    redirectUrl.searchParams.append(response_type, appOAuthToken.idToken); // For now, `code` is id token
    redirectUrl.searchParams.append('state', state);

    // Response with redirect
    return NextResponse.redirect(redirectUrl, {
      status: 302 // Found
    });
  }

  return NextResponse.json({
    status: 400,
    code: 'BAD_REQUEST',
    message: 'We were unable to process your request' + redirect_uri
  } as ApiError, {
    status: 400
  });
}
