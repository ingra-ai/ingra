/**
 * OpenAI support
 *  - After user clicks 'Sign in' on Custom ChatGPT, it will bring it in this route;
 * 
 * Example hit:
 * https://auth.ingra.ai/api/v1/oauth2/token
 * 
 * Example request body:
 * {
 *   'grant_type': 'authorization_code',
 *   'client_id': '123',
 *   'client_secret': '123',
 *   'code': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRjMTU1ZmU3LWExOWUtNGNjMi04MjJkLWY3YzdhNmU0MTIwMCIsImVtYWlsIjoidmFkaUBiYWthYml0LmNvbSIsImNsaWVudElkIjoiMTIzIiwic2NvcGUiOiJjaGF0Z3B0IiwidHlwZSI6ImlkIiwiaWF0IjoxNzMzNjI1MDg4LCJleHAiOjE3MzM3MTE0ODh9.notL5CBjHchfMYd7RkvaN9eYlz222ranukjTuax0vlk',
 *   'redirect_uri': 'https://chat.openai.com/aip/g-0635bc4d3822cb8e34e6970c89332f8fe4fbd28b/oauth/callback'
 * }
 */
'use server';
import { getOAuthTokenByCode } from '@repo/shared/data/oauthToken';
import { mixpanel } from '@repo/shared/lib/analytics';
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

  /**
   * Analytics & Logging
   */
  mixpanel.track('OAuth2 - Token', {
    distinct_id: requestArgs.client_id,
    ...analyticsObject,
    requestArgs
  });

  if ( requestArgs.grant_type === 'authorization_code' && requestArgs.code ) {
    const oAuthToken = await getOAuthTokenByCode(requestArgs.code);

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
    const oAuthToken = await getOAuthTokenByCode(requestArgs.refresh_token);

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
    status: 400,
    code: 'BAD_REQUEST',
    message: 'Missing required parameters'
  } as ApiError, {
    status: 400
  });
};

export async function POST(req: NextRequest, context: ContextShape) {


  return handleRequest<ContextShape['params'], HandlerArgs>('POST', req, (context.params), handlerFn);
}

