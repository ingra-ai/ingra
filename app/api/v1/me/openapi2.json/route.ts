import { NextRequest, NextResponse } from 'next/server';
import { getAuthSwaggerSpec } from '../swagger/config';
import { APP_AUTH_LOGIN_URL, APP_URL } from '@lib/constants';
import { ActionError } from '@v1/types/api-response';
import { getAuthSession } from '@app/auth/session';
import { RedirectType, redirect } from 'next/navigation';
import { getSwaggerSpec2 } from '@app/api/(internal)/swagger/config2';

/**
 * Returns OpenAPI json file when in development
 * This serves for OpenAI GPT Plugin to access it at /openapi.yaml
 */
export async function GET(req: NextRequest) {
  const authSession = await getAuthSession();

  if ( !authSession ) {
    redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
  }

  const test = getSwaggerSpec2();

  /*
  const swaggerSpec = await getAuthSwaggerSpec(authSession);

  if ( !swaggerSpec ) {
    throw new ActionError('error', 400, `No specifications found.`);
  }

  /**
   * Extras for swaggerSpec that if I add in the swagger/config, it will throw an error and the swagger UI won't load
   * @todo find a way to add these in the swagger/config
   */
  /*
  Object.assign(swaggerSpec, {
    servers: [
      {
        url: APP_URL,
      },
    ],
  });
  */

  return NextResponse.json({
    data: test
  }, {
    status: 200,
  });
}
