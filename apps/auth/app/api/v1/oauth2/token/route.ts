/**
 * OAuth2 Token Endpoint
 * 
 * This endpoint handles the OAuth2 token exchange process. It supports both the 
 * `authorization_code` and `refresh_token` grant types.
 * 
 * Example endpoint:
 * ```
 * POST https://auth.ingra.ai/api/v1/oauth2/token
 * ```
 * 
 * Example request body for `authorization_code` grant type:
 * ```json
 * {
 *   "grant_type": "authorization_code",
 *   "client_id": "123",
 *   "client_secret": "123",
 *   "code": "<redacted>",
 *   "redirect_uri": "https://chat.openai.com/aip/g-0635bc4d3822cb8e34e6970c89332f8fe4fbd28b/oauth/callback"
 * }
 * ```
 * 
 * Example request body for `refresh_token` grant type:
 * ```json
 * {
 *   "grant_type": "refresh_token",
 *   "client_id": "123",
 *   "client_secret": "123",
 *   "refresh_token": "<redacted>"
 * }
 * ```
 * 
 * @param req - The incoming request object.
 * @param context - The context object containing route parameters.
 * 
 * @returns A JSON response containing the access token, token type, expiration time, and refresh token.
 * 
 * @throws {ApiError} If the credentials are invalid or missing.
 */
'use server';
import { getAppOAuthTokenByIdOrRefreshToken } from '@repo/shared/data/oauthToken';
import { mixpanel } from '@repo/shared/lib/analytics';
import { Logger } from '@repo/shared/lib/logger';
import { getAnalyticsObject } from '@repo/shared/lib/utils/getAnalyticsObject';
import { ApiError } from '@repo/shared/types';
import { handleRequest } from '@repo/shared/utils/handleRequest';
import { NextRequest, NextResponse } from 'next/server';

type ContextShape = {
  params: Promise<{}>;
};

type HandlerArgs = ContextShape & {
  requestArgs: {
    client_id: string;
    client_secret: string;
    grant_type: 'authorization_code' | 'refresh_token';
    code?: string; // idToken
    refresh_token?: string;
  };
  requestHeaders: Headers;
  analyticsObject: ReturnType<typeof getAnalyticsObject>;
};

async function handlerFn(args: HandlerArgs) {
  const { params, requestArgs, requestHeaders, analyticsObject } = args;

  Logger.withTag('oauth2|token').info('OAuth2 Token Request', { requestArgs });

  /**
   * Analytics & Logging
   */
  mixpanel.track('OAuth2 - Token', {
    distinct_id: requestArgs.client_id,
    ...analyticsObject,
    requestArgs
  });

  if ( requestArgs.grant_type === 'authorization_code' && requestArgs.code ) {
    const oAuthToken = await getAppOAuthTokenByIdOrRefreshToken(requestArgs.code);

    // Calculate expires in seconds
    const expiresIn = oAuthToken?.expiryDate ? Math.floor((oAuthToken.expiryDate.getTime() - Date.now()) / 1000) : 3600;

    if ( oAuthToken ) {
      return NextResponse.json({
        access_token: oAuthToken.accessToken,
        token_type: oAuthToken.tokenType.toLocaleLowerCase(),
        expires_in: expiresIn,
        refresh_token: oAuthToken.refreshToken
      }, {
        status: 200
      });
    }
  }
  else if ( requestArgs.grant_type === 'refresh_token' && requestArgs.refresh_token ) {
    /**
     * We're not actually refreshing, just getting the token by refresh token.
     */
    const oAuthToken = await getAppOAuthTokenByIdOrRefreshToken(requestArgs.refresh_token);

    // Calculate expires in seconds
    const expiresIn = oAuthToken?.expiryDate ? Math.floor((oAuthToken.expiryDate.getTime() - Date.now()) / 1000) : 3600;

    if ( oAuthToken ) {
      return NextResponse.json({
        access_token: oAuthToken.accessToken,
        token_type: oAuthToken.tokenType.toLocaleLowerCase(),
        expires_in: expiresIn,
        refresh_token: oAuthToken.refreshToken
      }, {
        status: 200
      });
    }
  }

  return NextResponse.json({
    status: 401,
    code: 'UNAUTHORIZED',
    message: 'Invalid or missing credentials'
  } as ApiError, {
    status: 401
  });
};

export async function POST(req: NextRequest, context: ContextShape) {
  return handleRequest<ContextShape['params'], HandlerArgs>('POST', req, (context.params), handlerFn);
}
