import { NextRequest, NextResponse } from 'next/server';
import { getSwaggerSpec } from '../swagger/config';
import { APP_URL } from '@lib/constants';
import { apiUserTryCatch } from '@app/api/utils/apiUserTryCatch';
import { ActionError } from '@lib/api-response';

/**
 * Returns OpenAPI yaml file when in production
 * Returns OpenAPI json file when in development
 * This serves for OpenAI GPT Plugin to access it at /openapi.yaml
 */
export async function GET(req: NextRequest, { params }: { params: { username: string; paths: string[] } }) {
  const { username, paths } = params;

  return await apiUserTryCatch<any>(username, '', async (context) => {
    const swaggerSpec = await getSwaggerSpec(username);

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
  });
}
