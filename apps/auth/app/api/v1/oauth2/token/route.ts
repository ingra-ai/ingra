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
import { createAppCredentials } from '@repo/shared/data/auth';
import { clearAuthCaches } from '@repo/shared/data/auth/session/caches';
import { getAppOAuthTokenByCodeOrToken , 
  updateOAuthToken as dataUpdateOAuthToken,
} from '@repo/shared/data/oauthToken';
import { mixpanel } from '@repo/shared/lib/analytics';
import { Logger } from '@repo/shared/lib/logger';
import { getAnalyticsObject } from '@repo/shared/lib/utils/getAnalyticsObject';
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

  let oAuthToken: Awaited<ReturnType<typeof getAppOAuthTokenByCodeOrToken>> = null;
  
  if ( requestArgs.grant_type === 'authorization_code' && requestArgs.code ) {
    oAuthToken = await getAppOAuthTokenByCodeOrToken(requestArgs.code);
  }
  else if ( requestArgs.grant_type === 'refresh_token' && requestArgs.refresh_token ) {
    oAuthToken = await getAppOAuthTokenByCodeOrToken(requestArgs.refresh_token);

    // If oauthToken is found, update the refresh token
    if ( oAuthToken?.user?.email && oAuthToken?.userId && requestArgs.client_id ) {
        // Get or create an OAuth token for the app
        const refreshedCredentials = await createAppCredentials({
          user: oAuthToken.user,
          userId: oAuthToken.userId,
        }, requestArgs.client_id  || '', oAuthToken.scope || '', 86400);

        // Validate the refreshed credentials
        if ( refreshedCredentials?.accessToken && refreshedCredentials?.idToken && refreshedCredentials?.scope && refreshedCredentials?.tokenType ) {
          const updatedOAuth = await dataUpdateOAuthToken({
            accessToken: refreshedCredentials.accessToken,
            idToken: refreshedCredentials.idToken,
            scope: refreshedCredentials.scope,
            tokenType: refreshedCredentials.tokenType,
            expiryDate: refreshedCredentials.expiryDate,
          }, oAuthToken.id, oAuthToken.userId);

          // Clear user caches
          await clearAuthCaches({ userId: oAuthToken.userId });

          // Update existing oAuthToken with the new refreshed credentials
          oAuthToken.accessToken = refreshedCredentials.accessToken;
          oAuthToken.idToken = refreshedCredentials.idToken;
          oAuthToken.scope = refreshedCredentials.scope;
          oAuthToken.tokenType = refreshedCredentials.tokenType;
          oAuthToken.expiryDate = updatedOAuth?.expiryDate || oAuthToken.expiryDate;
        }
    }
  }
  else {
    return NextResponse.json({
      error: "invalid_grant",
      error_description: "Invalid grant type or missing code or refresh token."
    }, {
      status: 400
    });
  }

  if ( !oAuthToken ) {
    return NextResponse.json({
      error: "invalid_token",
      error_description: "The provided authorization code is invalid."
    }, {
      status: 400
    });
  }

  // Calculate expires in seconds
  const expiresIn = oAuthToken?.expiryDate ? Math.floor((oAuthToken.expiryDate.getTime() - Date.now()) / 1000) : 3600;

  // If its expired, return invalid_grant
  if ( expiresIn <= 0 ) {
    return NextResponse.json({
      error: "invalid_token",
      error_description: "The access token expired."
    }, {
      status: 401
    });
  }

  return NextResponse.json({
    access_token: oAuthToken.accessToken,
    token_type: oAuthToken.tokenType.toLocaleLowerCase(),
    expires_in: expiresIn,
    refresh_token: oAuthToken.refreshToken
  }, {
    status: 200
  });
};

export async function POST(req: NextRequest, context: ContextShape) {
  return handleRequest<ContextShape['params'], HandlerArgs>('POST', req, (context.params), handlerFn);
}
