import { NextRequest, NextResponse } from 'next/server';
import { getAuthSwaggerSpec } from '../swagger/config';
import { APP_AUTH_LOGIN_URL, APP_URL } from '@lib/constants';
import { ActionError } from '@lib/api-response';
import { getAuthSession } from '@app/auth/session';
import { RedirectType, redirect } from 'next/navigation';

/**
 * Returns OpenAPI yaml file when in production
 * Returns OpenAPI json file when in development
 * This serves for OpenAI GPT Plugin to access it at /openapi.yaml
 */
export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  const { username } = params;
  const authSession = await getAuthSession();

  if (!authSession || authSession.expiresAt < new Date()) {
    redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
  }

  const swaggerSpec = await getAuthSwaggerSpec(authSession);

  if ( !swaggerSpec ) {
    throw new ActionError('error', 400, `No Swagger Spec Found`);
  }

  /**
   * Extras for swaggerSpec that if I add in the swagger/config, it will throw an error and the swagger UI won't load
   * @todo find a way to add these in the swagger/config
   */
  Object.assign(swaggerSpec, {
    servers: [
      {
        url: APP_URL,
      },
    ],
  });

  return NextResponse.json(swaggerSpec, {
    status: 200,
  });
}
