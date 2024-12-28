/**
 * OAuth2 Authorization Endpoint
 * 
 * This endpoint handles the OAuth2 authorization requests. When a user clicks 'Sign in' on a client application 
 * (e.g., Custom ChatGPT), they are redirected to this route to initiate the OAuth2 authorization process.
 * 
 * Example request:
 * GET https://auth.ingra.ai/api/v1/oauth2/authorize?
 *  response_type=code&
 *  client_id=123&
 *  redirect_uri=https%3A%2F%2Fchat.openai.com%2Faip%2Fg-0635bc4d3822cb8e34e6970c89332f8fe4fbd28b%2Foauth%2Fcallback&
 *  state=019642e3-a293-4671-af0a-5b9a46d27b78
 * 
 * Query Parameters:
 * - response_type: The type of response desired, typically 'code' for authorization code flow.
 * - client_id: The client identifier issued to the client during the registration process.
 * - redirect_uri: The URI to which the response will be sent after authorization.
 * - state: An opaque value used to maintain state between the request and callback.
 */
'use server';
import { createAppCredentials } from '@repo/shared/data/auth';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { 
  createOAuthToken as dataCreateOAuthToken,
} from '@repo/shared/data/oauthToken';
import { mixpanel } from '@repo/shared/lib/analytics';
import { APP_AUTH_LOGIN_URL } from '@repo/shared/lib/constants';
import { Logger } from '@repo/shared/lib/logger';
import { getAnalyticsObject } from '@repo/shared/lib/utils/getAnalyticsObject';
import { isSafeRedirectUrl } from '@repo/shared/lib/utils/isSafeRedirectUrl';
import { ApiError } from '@repo/shared/types';
import { headers } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';



export async function GET(request: NextRequest) {
  // Parse query parameters from the request URL
  const { searchParams } = new URL(request.url);
  const redirect_uri = searchParams.get('redirect_uri'),
    response_type = searchParams.get('response_type'),
    client_id = searchParams.get('client_id'),
    scope = searchParams.get('scope'),
    state = searchParams.get('state');

  // Check if required parameters are present
  if (!response_type || !state || !redirect_uri) {
    return NextResponse.json({
      status: 400,
      code: 'BAD_REQUEST',
      message: 'Missing required parameters'
    } as ApiError, {
      status: 400
    });
  }

  // Validate if search params redirect_uri is a supported URL
  if (!isSafeRedirectUrl(redirect_uri)) {
    return NextResponse.json({
      status: 400,
      code: 'BAD_REQUEST',
      message: 'Invalid redirect_uri'
    } as ApiError, {
      status: 400
    });
  }

  // Get the current authentication session
  const authSession = await getAuthSession();

  /**
   * If no authentication session, redirect to login page
   * Once the user logs in, they will be redirected back to this route
   */
  if (!authSession) {
    const headersList = await headers(),
      headerUrl = headersList.get('X-URL') || '',
      redirectToQuery = headerUrl ? `?redirectTo=${encodeURIComponent(headerUrl)}` : '';

    return redirect(APP_AUTH_LOGIN_URL + redirectToQuery, RedirectType.replace);
  }

  // Generate URL object for redirection
  const redirectUrl = new URL(redirect_uri);

  try {
    // Validate response_type params
    if (!response_type || response_type !== 'code') {
      throw new Error('Invalid response_type');
    }

    // Get or create an OAuth token for the app
    const appCredentials = await createAppCredentials(authSession, client_id || '', scope || '', 86400);

    if ( !appCredentials ) {
      throw new Error('Failed to create app credentials');
    }

    const appOAuthToken = await dataCreateOAuthToken({
      ...appCredentials,
      primaryEmailAddress: authSession.user.email,
      service: 'ingra-oauth',
      scope: scope || '',
    }, authSession.user.id);

    if ( !appOAuthToken ) {
      throw new Error('Failed to create OAuth token');
    }

    // If there was an error or token is not found, return error
    if (
      !appOAuthToken || 
      !appOAuthToken.code || 
      !appOAuthToken.accessToken || 
      !appOAuthToken.refreshToken
    ) {
      throw new Error('Failed to authorize the request');
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


    // Add query params to the redirect URL
    redirectUrl.searchParams.append(response_type, appOAuthToken.code);
    redirectUrl.searchParams.append('state', state);
  
    // Respond with redirect
    return NextResponse.redirect(redirectUrl, {
      status: 302 // Found
    });
  }
  catch (err: any) {
    Logger.withTag('oauth2|authorize').error('Failed to authorize the request', err);

    // Add error query params to the redirect URL
    redirectUrl.searchParams.append('error', 'invalid_request');
    redirectUrl.searchParams.append('error_description', err?.message || 'Failed to authorize the request');

    // Respond with redirect
    return NextResponse.redirect(redirectUrl, {
      status: 302 // Found
    });
  }
}
