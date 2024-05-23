import { NextRequest, NextResponse } from 'next/server';
import { getMarketplaceSwaggerSpec } from '@v1/marketplace/swagger/config';
import { APP_URL } from '@lib/constants';
import { ActionError } from '@v1/types/api-response';

/**
 * Returns OpenAPI json file when in development
 * This serves for OpenAI GPT Plugin to access it at /openapi.yaml
 */
export async function GET(req: NextRequest) {
  const swaggerSpec = await getMarketplaceSwaggerSpec();

  if ( !swaggerSpec ) {
    throw new ActionError('error', 400, `No specifications found.`);
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
