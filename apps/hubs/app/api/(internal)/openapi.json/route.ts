import { HUBS_APP_URL } from '@repo/shared/lib/constants';
import { NextRequest, NextResponse } from 'next/server';

import { getBaseSwaggerSpec } from '../swagger/getBaseSwaggerSpec';

export const dynamic = 'force-dynamic';

/**
 * Returns OpenAPI yaml file when in production
 * Returns OpenAPI json file when in development
 * This serves for OpenAI GPT Plugin to access it at /openapi.yaml
 */
export async function GET(request: NextRequest) {
  const swaggerSpec = await getBaseSwaggerSpec();

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
