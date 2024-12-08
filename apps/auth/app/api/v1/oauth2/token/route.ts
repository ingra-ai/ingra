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
import { ApiError } from '@repo/shared/types';
import { handleRequest } from '@repo/shared/utils/handleRequest';
import { headers } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

type ContextShape = {
  params: Promise<{}>;
};

type HandlerArgs = ContextShape & {
  requestArgs: {
    client_id: string;
    client_secret: string;
    grant_type: string;
    refresh_token: string;
  };
  requestHeaders: Headers;
  analyticsObject: ReturnType<typeof getAnalyticsObject>;
};

async function handlerFn(args: HandlerArgs) {
  const { params, requestArgs, requestHeaders, analyticsObject } = args;
  return NextResponse.json({
    status: 400,
    code: 'BAD_REQUEST',
    message: 'Missing required parameters',
    ...args
  } as ApiError, {
    status: 400
  });
};

export async function POST(req: NextRequest, context: ContextShape) {
  console.log({ params: await context.params });
  return handleRequest<ContextShape['params'], HandlerArgs>('POST', req, (context.params), handlerFn);
}

