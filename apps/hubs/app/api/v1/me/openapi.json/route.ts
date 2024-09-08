import { NextRequest, NextResponse } from 'next/server';
import { getAuthSwaggerSpec } from '../swagger/config';
import { APP_AUTH_LOGIN_URL, HUBS_APP_URL } from '@repo/shared/lib/constants';
import { ActionError } from '@v1/types/api-response';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { RedirectType, redirect } from 'next/navigation';
import { headers } from 'next/headers';

/**
 * Returns OpenAPI json file when in development
 * This serves for OpenAI GPT Plugin to access it at /openapi.yaml
 */
export async function GET(req: NextRequest) {
  const authSession = await getAuthSession();
  const headersList = headers(),
    headerUrl = headersList.get('X-URL') || '',
    redirectToQuery = headerUrl ? `?redirectTo=${encodeURIComponent(headerUrl)}` : '';

  if (!authSession) {
    redirect(APP_AUTH_LOGIN_URL + redirectToQuery, RedirectType.replace);
  }

  const swaggerSpec = await getAuthSwaggerSpec(authSession);

  if (!swaggerSpec) {
    throw new ActionError('error', 400, `No specifications found.`);
  }

  /**
   * Extras for swaggerSpec that if I add in the swagger/config, it will throw an error and the swagger UI won't load
   * @todo find a way to add these in the swagger/config
   */
  Object.assign(swaggerSpec, {
    servers: [
      {
        url: HUBS_APP_URL,
      },
    ],
  });

  return NextResponse.json(swaggerSpec, {
    status: 200,
  });
}
